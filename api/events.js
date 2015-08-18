	
	var _          = require('lodash'),
		eventUtils = require('../pushevents/eventUtils'),
		Event      = require('../models/EventModel'),
		moment     = require('moment');


	var createEvent = function( req, res ) {
	       
	    var data = req.event_data;
	    
	    var new_event = {};

	    	/* set by client */
	    	new_event.hosts 		  = data.hosts;
	    	new_event.begins_at 	  = moment( data.begins_at, 'DD/MM/YY' );
	    	new_event.address 		  = data.address;
	    	new_event.ambiance 		  = data.ambiance;
	    	new_event.agerange 		  = data.agerange;
	    	new_event.mixity   		  = data.mixity;
	    	new_event.scheduled_party = data.scheduled_party;

	    	/* set by server */
	    	new_event.created_at = moment();
	    	new_event.askers 	 = [];
	    	new_event.status 	 = 'open';
	    	new_event.type       = 'before';
	    	new_event.meta 		 = [];

	    var new_event = new Event( new_event );
	    new_event.save(function( err, new_event ){

	    	if( err )
	    		return eventUtils.raiseError({ err: err, res: res, toClient: "Error saving event"});

	    	console.log('Event created!!');
	    	eventUtils.sendSuccess( res, new_event );

	    });

	};

	var fetchEvents = function( req, res ){

		var start_date = req.query.start_date;

		Event
			.find({}) // 'begins_at': { $gte: moment( start_date, 'DD/MM/YY' ).toISOString() } })
			.limit( 10 )
			.sort({ 'begins_at': -1 })
			.exec( function( err, events ){

				if( err )
					return eventUtils.raiseError({ err: err, res: res,
						toClient: "Erreur de l'API"
					});

				 eventUtils.sendSuccess( res, events );

			});

	};

	var fetchEventById = function( req, res ){

	};

	var updateEvent = function( req, res ){

	};

	var fetchAskers = function( req, res ){

	};

	module.exports = {
		createEvent: createEvent,
		fetchEvents: fetchEvents,
		fetchEventById: fetchEventById,
		updateEvent: updateEvent,
		fetchAskers: fetchAskers
	};