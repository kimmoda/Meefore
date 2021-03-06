
	var _ 	     = require('lodash');
	var config   = require('../../../config/config').mailchimp;
	var Promise  = require('bluebird');
	var fs 		 = Promise.promisifyAll( require('fs') );
	var tools 	 = require('../../tools');

	// Mailchimp interface
	var MailchimpInterface = require('../../../services/mc');
	var Mailchimp 		   = new MailchimpInterface( _.extend( {}, config, { list_id: "ace186c18c" } ));


	// Test - Create a new member in the list

	// Default configuration to test 
	var signup_data = {
		email_address: tools.randHumanName() + "@fake.com" 
	};

	Mailchimp.createMember( signup_data )
		.then(function( member ){
			console.log(member);
			return Mailchimp.writeMembersToFile( __dirname + '/../' );
		})






