	
	window.LJ = _.merge( window.LJ || {}, 

{

	accessToken:'',
	ui:{
		artificialDelay: 700,
		minimum_loading_time: 1000,
		displayIn:  { opacity: [1, 0], translateX: [-8, 0]   },
		displayOut: { opacity: [0, 1], translateX: [10, 0]   }
	},
	cloudinary:{
		uploadParams: { cloud_name:"radioreve", api_key:"835413516756943" },

		/* Image de l'host dans un event */
		displayParamsEventHost: { cloud_name :"radioreve", width: 80, height: 80, crop: 'fill', gravity: 'face', radius: '2' },

        /* Image des askers dans la vue event */
        displayParamsEventAsker: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'0' },

		/* Image du user dans le header */
		displayParamsHeaderUser: { cloud_name: "radioreve",width: 50,height: 50, crop: 'fill', gravity: 'face', radius: 'max' },

		/* Image zoom lorsqu'on clique sur une photo*/
		displayParamsOverlayUser: { cloud_name: "radioreve", width: 280, height: 280, crop: 'fill', gravity: 'face', radius: 'max' },

        /* Image principale des askers dans vue managemnt */
        displayParamsAskerMain: { cloud_name: "radioreve", width:120, height:120, crop:'fill', gravity:'face', radius:3 },

		/* Image secondaire des askers dans vue management */
        displayParamsAskerThumb: { cloud_name: "radioreve", width:45, height:45, crop:'fill', gravity:'face', radius:'max' },

        /* Image secondaire des askers dans vue management, lorsqu'ils sont refusé */
        displayParamsAskerThumbRefused: { cloud_name: "radioreve", width:45, height:45, crop:'fill', effect:'grayscale', gravity:'face', radius:'max' },
        
		/* Image of friends in profile view */
		profile: {
			me: {
				params: { cloud_name: "radioreve", width: 150, height: 150, crop: 'fill', gravity: 'face' }
			},
			friends: {
				params: { cloud_name: "radioreve", width: 50, height: 50, crop: 'fill', gravity: 'face' }
			}
		},
		create: {
			friends: {
				params: { cloud_name: "radioreve", 'class': 'host-img none', width: 24, height: 24, crop: 'fill', gravity: 'face' }
			}
		},
		search: {
			user: {
				params: { cloud_name: "radioreve", 'class': 'super-centered', width: 40, height: 40, crop: 'fill', gravity: 'face' }
			}
		},
        curtain: {
        	main: {
        		params: { cloud_name: "radioreve", 'class': 'modal-main-picture etiquette', width: 250, height: 250, crop: 'fill', gravity: 'face' }
        	},
        	main_active: {
        		params: { cloud_name: "radioreve", 'class': 'modal-main-picture etiquette active', width: 250, height: 250, crop: 'fill', gravity: 'face' }
        	},
        	thumb: {
        		params: { cloud_name: "radioreve", 'class': 'modal-thumb-picture', crop: 'fill', gravity: 'face' }	
        	},
        	thumb_active: {
        		params: { cloud_name: "radioreve", 'class': 'modal-thumb-picture active', crop: 'fill', gravity: 'face' }
        	}
        },
        logo: {
        	black_on_white: {
        		id:'logo_black_on_white'
        	},
        	white_on_black: {
        		id:'logo_white_on_black'
        	}
        },
        placeholder: {
        	id: 'placeholder_picture',
        	params: { cloud_name :"radioreve", html: { 'class': 'mainPicture' }, width: 150 }
        },
    	loaders: {
    		main: {
    			id: 'main_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader' }
    		},
    		mobile: {
    			id: 'mobile_loader',
    			params: { cloud_name :"radioreve", 'class': 'ajax-loader', width: 25 }
    		},
    		bar: {
    			id: 'bar_loader',
    			params: { cloud_name :"radioreve" }
    		},
    		spinner: {
    			id: 'spinner_loader',
    			params: { cloud_name: "radioreve" }
    		},
    		curtain: {
    			id: 'curtain_loader_v4',
    			params: { cloud_name :"radioreve", 'class': 'curtain-loader super-centered', width: 20 }
    		}
    	},
	},
	/* To be dynamically filled on login */
	user:{},
	myEvents: [],
    myAskers: [],
    myUsers: [],
    myFriends: [],
    channels: { 
    	myChats: []
    },
    myOnlineUsers: [],
    selectedTags: [],
    selectedLocations: [],
    $eventsToDisplay: $(),
    $main_loader: $(),
    $mobile_loader: $(),
    $chat_loader: $(),
    $curtain_loader: $(),
	state: {
		connected: false,
		fetchingEvents: false,
        fetchingAskers: false,
		animatingContent: false,
		animatingChat: false,
		toastAdded: false,
		typingMsg: {},
		jspAPI:{},
		uploadingImage: false,
		uploadingimg_id:'',
		uploadingimg_version:''
	},
	tpl:{
		toastInfo : '<div class="toast toastInfo" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		toastError: '<div class="toast toastError" class="none"><span class="toast-icon icon icon-cancel">'
					+'</span><span class="toastMsg"></span></div>',
		toastSuccess: '<div class="toast toastSuccess" class="none"><span class="toast-icon icon icon-right-open-big">'
					+'</span><span class="toastMsg"></span></div>',
		noResults: '<center id="noResults" class="filtered"><h3>Aucun évènement pour ce choix de filtre </h3></center>',
		noEvents: '<center id="noEvents" class=""><h3>Aucun évènement n\'a encore été proposé. Soyez le premier! </h3></center>'
	},
	tagList: [],
	msgQueue: [],
	locList: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ],
        $body                 : $('body'), 
		$loginWrap		 	  : $('#loginWrapp'),
		$signupWrap			  : $('#signupWrapp'),
		$resetWrap   	      : $('#resetWrapp'),
		$profileWrap	      : $('#profileWrap'),
		$eventsWrap		      : $('#eventsWrap'),
		$manageEventsWrap     : $('#manageEventsWrap'),
        $askersListWrap       : $('#askersListWrap'),
		$thumbWrap			  : $('#thumbWrap'),
		$loginBtn  	          : $('#login'),
		$signupBtn            : $('#signup'),
		$resetBtn			  : $('#reset'),
		$emailInput           : $('#email'),
		$passwordInput        : $('#pw'),
		$lostPassword         : $('#lost_pw'),
		$emailInputSignup     : $('#emailSignup'),
		$passwordInputSignup  : $('#pwSignup'),
		$passwordCheckInput   : $('#pwCheckSignup'),
		$backToLogin          : $('#b_to_login'),
		$validateBtn          : $('#validate'),
		$locationInput        : $('#location'),
		$loaderWrap 	      : $('.loaderWrap'),
		$createEventWrap	  : $('#createEventWrap'),
		$createEventBtn       : $('#createEventBtn'),
		$contentWrap          : $('#contentWrap'),
		$contactWrap          : $('#contactWrap'),
		$menuWrap             : $('#menuWrap'),
		$eventsListWrap       : $('#eventsListWrap'),
		$logout				  : $('#logout')

});