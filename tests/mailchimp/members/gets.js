
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Get all members of a given list
	
	console.log('Running...');
	
	Mailchimp.getMembers( ["merge_fields", "email_address"] )
		.then( console.log )
		.then(function(){
			return Mailchimp.writeMembersToFile( __dirname + '/../' );
		})
		.catch( console.log );


