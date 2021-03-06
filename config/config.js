	
	// NOTE : All following services have been deactivated
	// All subsequent api keys are obsolete

	var config = {

		log_level: {
			console: {
				dev    : "info",
				staged : "info",
				prod   : "info"
			},
			file: {
				dev    : "warn",
				staged : "warn",
				prod   : "warn"
			}
		},
		admins_facebook_id: [
			'10152931836919063', // Léo
			'10205618910126551',  // Ben
			'139625316382924' // David Dav [test user]
		],
		admin_api_key: "meeforever",
		db: {
		  	dev: {
				uri: "mongodb://Radioreve:" + process.env.PW + "@dogen.mongohq.com:10008/meefore-staged"
			},
			staged: {
				uri: "mongodb://Radioreve:" + process.env.PW + "@dogen.mongohq.com:10008/meefore-staged"
			},
			prod: {
				uri: "mongodb://Radioreve:" + process.env.PW + "@c152.lighthouse.5.mongolayer.com:10152,lighthouse.4.mongolayer.com:10152,lighthouse.5.mongolayer.com:10152/meefore-prod?replicaSet=set-561e78e680f8684254000143"
			}
		}
		, redis: {
			dev: {
				host : "aws-eu-west-1-portal.1.dblayer.com",
				port : "10576",
				pass : "R4dioreve"
			},
			staged: {
				host : "aws-eu-west-1-portal.1.dblayer.com",
				port : "10576",
				pass : "R4dioreve"
			}, 
			prod: {
				host : "aws-eu-west-1-portal.1.dblayer.com",
				port : "10820",
				pass : "R4dioreve"
			}
			
		}
		, app: {
		  	uri: {
		  		dev    : 'http://localhost:1234',
		  		staged : 'http://staged.meefore.com',
		  		prod   : 'http://www.meefore.com'
		  	}
		  }
		, homepage: {
			dev      : process.cwd()  + '/views/index-dev.html',
			staged   : process.cwd()  + '/views/index-staged.html',
			prod     : process.cwd()  + '/views/index-prod.html'
		}
		, jwtSecret: "Wenighters"	
		, cloudinary: {
			cloud_name  : "radioreve",
			api_key     : "835413516756943",
			api_secret  : "MMKeDsJlgYDvDdR2wsep0DZRggo"
		}
		, facebook: {
			dev: {
				client_id	  : "1638104993142222",
				client_secret : "303aae46230e0859af0e4bbe235f3ab7",
				redirect_uri  : "http://localhost:1234/home/"
			},
			staged: {
				client_id 	  : "1638108873141834",
				client_secret : "be00dd6b64d9f8bb10a33e4f76041d7f",
				redirect_uri  : "http://staged.meefore.com/home/"
			},
			prod: {
				client_id     : "1509405206012202",
				client_secret : "4525e27d90dcc73f716dae4fa36c6885",
				redirect_uri  : "http://www.meefore.com/home/"
			}
		}
		, pusher: {
			dev: {
				app_id    : '139958',
				key       : 'f9e4bf4e8f1e0342ca27',
				secret    : '316f1677d800392fde21'
			},
			staged: {
				app_id    : '139958',
				key       : 'f9e4bf4e8f1e0342ca27',
				secret    : '316f1677d800392fde21'
			},
			prod: {
				app_id    : '139960',
				key       : 'e0e801db688ab26d8581',
				secret    : '41d03023ab512e98adc1'
			}
		}
		, mandrill: {
			host     : "smtp.mandrillapp.com",
			port     : "587",
			username : "Meefore",
			api_key  : "iAyP05rC1H15WjCbcaNsSA"
		}
		, mailchimp: {
			dev: {
				api_key   : '1975e0d603d5cb51d2cabd25dfab1d94-us10',
				list_id   : '49bfd88fd5',
				dc	      : 'us10',
				username  : 'methodezela@gmail.com',
				interests: [
					{
			            "id" 	     	: "77b294f0f2",
			            "name"       	: "newsletter",
						"category_id"	: "fd526148e7",
			            "default_value" : false
		       	 	}

				]
			},
			staged: {
				api_key   : '1975e0d603d5cb51d2cabd25dfab1d94-us10',
				list_id   : '49bfd88fd5',
				dc	      : 'us10',
				username  : 'methodezela@gmail.com',
				interests: [
					{
			            "id" 	     	: "77b294f0f2",
			            "name"       	: "newsletter",
						"category_id"	: "fd526148e7",
			            "default_value" : false
		       	 	}

				]
			},
			prod: {
				api_key   : '1975e0d603d5cb51d2cabd25dfab1d94-us10',
				list_id   : '7e2bd8f4ed',
				dc	      : 'us10',
				username  : 'methodezela@gmail.com',
				interests: [
					{
						"id" 	  	    : "447f527682",
						"name" 			: "newsletter",
						"category_id"	: "8d22a3c98e",
						"default_value" : false
					}
				]
			}
		}

	};

	module.exports = config;