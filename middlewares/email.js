
	eventUtils  = require('../pushevents/eventUtils'),
	config      = require('../config/config'),
	_     	    = require('lodash'),
	mailer      = require('../services/mailer');


	var subscribeMailchimpUser = function( req, res, next ){

		// If exists, user has been populated by previous mdw 
		if( req.sent.user ){
			console.log('User already exists, skipping mailchimp subscription...');
			return next();
		}

		var email_address = req.sent.facebookProfile.email;

		console.log('Subscribing user to mailchimp with email adresse: ' + email_address );
		mailer.subscribeUserToMailchimp( email_address, function( err, response ){

			if( err ){
				return eventUtils.raiseError({
					res: res,
					err: err,
					toClient: "Error calling mailchimp api"
				});
			}

			// Saving the mailchimp id for later api calls to modify newsletter preferences (PATCH) 
			req.sent.mailchimp_id = response.id;
			next();

		});

	};

	var updateMailchimpUser = function( req, res, next ){

		var user = req.sent.user;

		var new_preferences = req.sent.app_preferences;
		var old_preferences = user.app_preferences;

		console.log( 'old_preferences : ' + JSON.stringify( old_preferences.email ) );
		console.log( 'new_preferences : ' + JSON.stringify( new_preferences.email ) );

		var need_to_update = false,
			update = { interests: {} };

		_.keys( new_preferences.email ).forEach( function( key ){

			// Control bool to know if an updated to the mailchimp API will be needed
			if( new_preferences.email[ key ] != old_preferences.email[ key ] ) need_to_update = true;

			var bool = new_preferences.email[ key ] == 'yes' ? true : false;
			update.interests[ config.mailchimp.groups[ key ].id ] = bool;
			
		});

		if( !need_to_update ) return next();

		console.log('Update mailchimp needed');
		console.log(JSON.stringify(update));
		console.log('mailchimp user id : ' + user.mailchimp_id );

		mailer.updateMailchimpUser( user.mailchimp_id, update, function( err, response ){

			if( err )
				return eventUtils.raiseError({
					err: err,
					res: res,
					toClient: "Une erreur s'est produite, veuillez nous excuser"
				});

			next();

		});

	};

	module.exports = {
		subscribeMailchimpUser: subscribeMailchimpUser,
		updateMailchimpUser: updateMailchimpUser
	};