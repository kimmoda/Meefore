	
	var _       = require('lodash');
	var request = require('request');
	var config  = require('../../config/config');
	var mailer  = require('../../services/mailer');

	function pretty( json ){
		console.log( JSON.stringify( json, null, 3 ));
	};

	var mailchimp_id = 'a38b89c4a398be61e13691648d14299a';

	mailer.updateUserAtMailchimp( mailchimp_id, {}, function( err, res ){

		if( err ){
			console.log( pretty(err) );
		} else {
			console.log( pretty(res) );
		}
	});
	





