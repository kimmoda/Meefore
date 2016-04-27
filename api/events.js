	
		var _          = require('lodash'),
		eventUtils     = require('../pushevents/eventUtils'),
		User           = require('../models/UserModel'),
		Event          = require('../models/EventModel'),
		moment         = require('moment'),
		rd             = require('../services/rd'),
		alerts_watcher = require('../middlewares/alerts_watcher'),
		mailer         = require('../services/mailer');

	var mongoose = require('mongoose');
	var pusher   = require('../services/pusher');


	var handleErr = function( req, res, namespace, err ){

		var params = {
			error   : err,
			call_id : req.sent.call_id
		};

		eventUtils.raiseApiError( req, res, namespace, params );

	};


	var createEvent = function( req, res, next ) {
	    
	    var err_ns    = "creating_event";

		var data         = req.sent.event_data;	    
	    var new_event = {};

    	// Sent by the client
		new_event.hosts     = data.hosts;
		new_event.begins_at = moment( data.begins_at );
		new_event.timezone  = data.timezone;
		new_event.address   = data.address;

    	new_event.created_at = moment();
    	new_event.groups 	 = [];
    	new_event.status 	 = 'open';

    	// GeoJSON to create an MongoDB 2dpshere Index, for $geoNear queries
    	new_event.geojson = {
    		"type"        : "Point",
    		"coordinates" : [ data.address.lng, data.address.lat ] 
    	};

	    var new_event = new Event( new_event );

	    new_event.save(function( err, new_event ){

	    	if( err ) return handleErr( req, res, err_ns, err );

	    	var event_item = {
				status    : 'hosting',
				timezone  : parseFloat( data.timezone ),
				event_id  : new_event._id,
				begins_at : new_event.begins_at
	    	};

	    	var hosts_ns = 'event/' + new_event._id + '/hosts';
	    	/* Cache hosts ids for chat performance */
	    	rd.sadd( hosts_ns, _.pluck( new_event.hosts, 'facebook_id' ), function( err ){

		    	User.update({'facebook_id': { $in: _.pluck( data.hosts, 'facebook_id') } },
		    				{ $push: { 'events': event_item }},
		    				{ multi: true },

					function( err, users ){

						if( err ){
							return eventUtils.raiseError({ err: err, res: res, toClient: "Error updating users"});
						}

				    	console.log('Event created!');
				    	req.sent.expose.before = new_event;

				    	return next();

					});

		    	});

	    	});



	};

	var fetchEvents = function( req, res, next ){

		var start_date = req.sent.start_date;

		Event
			.find(
				{ 
					//'begins_at': { $gte: moment( start_date, 'DD/MM/YY' ).toISOString() },
					'status' : { $in : ['open','suspended'] } 
				}
			)
			//.limit( 10 ) no limit needed
			.sort({ 'begins_at': -1 })
			.exec( function( err, events ){

				if( err ){
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});
				}

				var filtered_events = [];
				events.forEach(function( evt ){

					evt.n_groups = evt.groups.length;
					delete evt.groups;
					filtered_events.push( evt );

				});

				 eventUtils.sendSuccess( res, filtered_events );

			});

	};

	var request = function( req, res, next ){
		
		var groups       = req.sent.groups;
		var event_id     = req.sent.event_id;
		var socket_id    = req.sent.socket_id;
		var evt          = req.sent.evt;
		var notification = req.sent.notification;

		var new_group           = req.sent.new_group;
		var group_id            = req.sent.new_group.group_id;
		// var members 			= req.sent.new_group.members;
		var members_facebook_id = req.sent.new_group.members_facebook_id;

		console.log('Requesting in with event_id = ' + event_id );

		Event.findByIdAndUpdate( event_id, { groups: groups }, { new: true }, function( err, evt ){

			if( err ){
				return eventUtils.raiseError({ err: err, res: res, toClient: "api error fetching event" });
			}

			var event_to_push = {
				event_id    : event_id,
				begins_at   : evt.begins_at,
				timezone	: evt.timezone,
				//group_id	: group_id,
				status 		: 'pending'
			};

			/* Mise à jour de l'event array dans chaque user impliqué */
			User
				.update(
					{ 'facebook_id': { $in: members_facebook_id } },
					{ $push: { 'events' : event_to_push } },
					{ multi: true, new: true },
					function( w ){

						if( err ){
							return eventUtils.raiseError({ err: err, res: res, toClient: "api error fetching event" });
						}

						var data = {
							event_id          : event_id,
							hosts_facebook_id : _.pluck( evt.hosts, 'facebook_id' ),
							group             : new_group,
							notification      : notification 
						};

						eventUtils.sendSuccess( res, data );
					
						/* Envoyer une notification aux hosts, et aux users déja présent */
						if( eventUtils.oSize( data ) > pusher_max_size ){
							console.log('Max size reached : ' + eventUtils.oSize( data ) );
				    		pusher.trigger( event_id, 'new oversize message', {} );
					    } else {

					    	/* Envoyer une notification aux hosts */
					    	console.log('Notifying new request has been issued');
					    	console.log('Host channel: ' + evt.getHostsChannel() );
							pusher.trigger( 'presence-' + evt.getHostsChannel() , 'new request host', data, socket_id );

							/* Envoyer une notification aux amis au courant de rien à priori */
							req.sent.members.forEach(function( user ){
								pusher.trigger( user.channels.me, 'new request group', data, socket_id );
							});	
						}

					});
				});
	};

	var changeEventStatus = function( req, res, next ){

		var evt       = req.sent.evt;
		var status    = req.sent.status;
		var event_id  = req.sent.event_id;
		var socket_id = req.sent.socket_id;

		console.log('Changing event status, new status : ' + status + ' for event: ' + event_id );

		evt.status = status;
		evt.save(function( err, evt ){

			if( err ){
				return eventUtils.raiseError({
					 err: err,
					 res: res,
					 toClient: "api error"
				});
			}

			var hosts_facebook_id = _.pluck( evt.hosts, 'facebook_id' )

			var data = {
				event_id          : event_id,
				hosts_facebook_id : hosts_facebook_id,
				status            : evt.status
			};

			eventUtils.sendSuccess( res, data );

			if( eventUtils.oSize( data ) > pusher_max_size ){
	    		pusher.trigger('app', 'new oversize message' );
			} else {
				pusher.trigger('app', 'new event status', data, socket_id );
			}

			// If the status is canceled, all events need to be removed from users array
			// To allow them to recreate event the same day
			if( status == "canceled" ){
				
				var query = {
					facebook_id: { $in: hosts_facebook_id }
				};

				var update = {
					$pull: {
						events: { 'event_id': mongoose.Types.ObjectId( event_id ) }
					}
				};

				var options = {
					multi: true
				};

				User.update( query, update, options, function( err, res ){
					if( err ){
						console.log('Cant remove canceled events from users collection : ' + err );
					}
				});


			}

		});


	};

	var changeGroupStatus = function( req, res, next ){
		
		var evt       = req.sent.evt;
		var groups    = evt.groups;
		var event_id  = req.sent.event_id;
		var group_id  = req.sent.group_id;
		var chat_id   = req.sent.chat_id;
		var status    = req.sent.group_status;
		var socket_id = req.sent.socket_id;

		console.log('Changing group status, new status : ' + status );

		// Notification variable, to be displayed and saved;
		var notification = req.sent.notification;

		groups.forEach(function( group, i ){

			if( group.group_id == group_id ){

				groups[i].status = status;

				rd.set('event/' + event_id + '/' + 'group/' + group_id + '/status', status, function( err ){

					if( status == 'accepted' ){
						groups[i].accepted_at = new Date();
						groups[i].members_facebook_id.forEach(function( facebook_id ){

							alerts_watcher.allowSendAlert( facebook_id, "accepted_in", function( allowed, alerts ){

								if( allowed && alerts.email ){
									mailer.sendAlertEmail_RequestAccepted( alerts.email );
								}

							});

						});
					} else {
						groups[i].kicked_at = new Date();
					}
					
				});
			}
		});

		evt.groups = groups;
		evt.markModified('groups');

		evt.save(function( err, evt ){

			if( err || !evt ) 
				return eventUtils.raiseError({
					err: err,
					res: res,
					toClient: "api error"
				});

			var group = evt.getGroupById( group_id );


			console.log( eventUtils.oSize( group ) );

			var data = {
				event_id          : evt._id,
				hosts_facebook_id : _.pluck( evt.hosts, 'facebook_id' ),
				group             : group,
				chat_id			  : chat_id,
				notification      : notification
			};

			eventUtils.sendSuccess( res, data );

			if( eventUtils.oSize( data ) > pusher_max_size ){
	    		pusher.trigger( event_id, 'new oversize message' );
	    	} else {
				console.log('Pushing new group status to clients in eventid: ' + event_id );
				pusher.trigger( 'presence-' + chat_id, 'new group status', data, socket_id );
			}


		});


	};

	var fetchEventById = function( req, res, next ){

		var event_id = req.sent.event_id;

		console.log('Requesting event by id : ' + event_id	);

		Event.findById( event_id, function( err, evt ){

			if( err || !evt ){
				eventUtils.raiseError({ err: err, toClient: "api error" });
			}

			res.json( evt ).end();

		});

	};

	var updateEvent = function( req, res, next ){

	};

	var fetchGroups = function( req, res, next ){

	};
	
	var fetchNearestEvents = function( req, res, next ){

		console.log('Fetching nearest events...');

		var err_ns = "fetching_nearest_events";
		var earth_radius_in_meters = 6371000;

		// Default, only fetch the events in a 5km radius 
		// more here : https://docs.mongodb.org/manual/reference/operator/aggregation/geoNear/
		var maxDistance = req.sent.max_distance || 5000 

		// GeoJSON specification
		// coordinates array must start with longitude
		var near = {
			"type"        : "Point",
			"coordinates" : [ req.sent.latlng.lng, req.sent.latlng.lat ]
		};

		console.log('Maximum distance is : ' + maxDistance );
		Event.aggregate([
			{ 
				$geoNear: {
					spherical          : true,
					near               : near,
					distanceField      : 'distance',
					distanceMultiplier : earth_radius_in_meters,
					maxDistance 	   : maxDistance
				}
			}
		])
		.exec(function( err, response ){

			if( err ) return handleErr( req, res, err_ns, err );

			req.sent.expose.befores = response;
			next();

		});

	};

	module.exports = {
		createEvent        : createEvent,
		request            : request,
		changeEventStatus  : changeEventStatus,
		changeGroupStatus  : changeGroupStatus,
		fetchEvents        : fetchEvents,
		fetchEventById     : fetchEventById,
		updateEvent        : updateEvent,
		fetchGroups        : fetchGroups,
		fetchNearestEvents : fetchNearestEvents
	};