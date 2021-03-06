
	window.LJ.login = _.merge( window.LJ.login || {}, {

			'$trigger_login': '.js-login',
			'$trigger_logout': '.js-logout',
			'$modal_logout'  : '.modal.x--logout',
			'opening_duration': 1000,
			'prompt_duration': 600,
			'prompt_buttons_duration': 900,
			'completed_steps': 0,
			'break_duration': 400,

			'data': {},

			init: function(){

				if( LJ.isBrowserSafari() ){
	                LJ.log('Safari browser detected, binding the promise to the anchor tag');
	                $('.js-no-popup').show().attr('href', LJ.facebook.makeFacebookLoginUrl() );
	            }

				return LJ.promise(function( resolve, reject ){
					LJ.ui.$body.on('click', '.js-login', function(){

						resolve();

					});
				});


			},
			showLandingElements: function(){

				var duration = 600;

				$('.landing').find('.landing-logo')
					.velocity('slideLeftIn', {
						duration: duration,
						display : 'flex'
					});

				$('.landing').find('.landing-lang')
					.velocity('slideRightIn', {
						duration: duration,
						display : 'flex'
					});

				$('.landing').find('.landing-body')
					.velocity('shradeIn', {
						duration: duration*2,
						display : 'flex'
					});

				$('.landing').find('.landing-footer')
					.velocity('slideUpIn', {
						duration: duration,
						display : 'flex'
					});


			},
			addLoginProgression: function(){

				$( LJ.login.renderLoginProgression() )
					.children().hide()
					.end().appendTo('body');

			},
			showLoginProgression: function(){

				$('.login')
					.children()
					.css({ 'display': 'block', 'opacity': '0' })
					.velocity('shradeIn', { duration: 1000 });

				// 	.velocity({ opacity: [ 1, 0 ], scale: [ 1, 1.1 ]}, {
				// 	duration: 2000
				// });

			},
			enterLoginProcess: function(){

				LJ.landing.hide();
				LJ.ui.deactivateHtmlScroll();

				LJ.delay( 1000 )
						 .then(function(){

						 	LJ.ui.showCurtain({
						 		duration: 0, theme: "light", sticky: true,
						 		transition: { opacity: [ 1, 0 ], scale: [ 1, 1.2 ] }
						 	});

						 	LJ.login.addLoginProgression();
						 	LJ.login.showLoginProgression();

						 });



			},
			hideLoginSteps: function(){

				LJ.log('Hiding login steps...');
				return LJ.promise(function( resolve, reject ){

					$('.app').removeClass('nonei');

					$('.login__message, .login__progress-bar, .login__loader').velocity('shradeOut', {
						duration: 400,
						complete: resolve
						
					});

				});
			},
			firstSetup: function(){
				// the app requires a user's location to boot properly
				// - to be visible in the search section
				// - to allow for geo requests to fetch the right befores
				// - to allow the map to load in the right city
				var L = LJ.user.location;
				if( L && L.place_id && L.place_name && L.lat && L.lng ){
					return;
				}

				// Version 1 of the login
				return LJ.login.updateProfileFirstLogin( LJ.map.city_locations[ "paris" ] )
					.then(function(){

						if( LJ.user.access.indexOf('bot') == -1 ){
							return LJ.pictures.uploadFacebookPicture_Intro();
						} else {
							return;
						}
					});

				// Version 2 of the login, only when users > 500
				// Useless to prompt users for a location when so few of them 
	            return LJ.login.break()
	            		.then(function(){
	            			return LJ.login.promptUserLocation();

	            		})
	            		.then(function(){
	            			return LJ.login.debreak();

	            		});

			},
			break: function(){
				return LJ.ui.shradeOut( $('.login'), LJ.login.break_duration );

			},
			debreak: function(){
				return LJ.ui.shradeIn( $('.login'), LJ.login.break_duration );

			},
			stepCompleted: function( fill_ratio ){

				if( typeof fill_ratio != "number" ){
					fill_ratio = 33.33;
				}

				LJ.login.completed_steps += 1;
				LJ.login.fillProgressBar( fill_ratio );
			},
			fillProgressBar: function( fill_ratio ){

				var max_width = $('.login__progress-bar').width();
				var add_width = max_width * fill_ratio/100;
				var cur_width = (LJ.login.completed_steps) * add_width;
				var new_width = cur_width + add_width;

				$('.login__progress-bar-bg')
					.css({ 'width':  new_width });

			},
			renderLoginProgression: function(){

				return LJ.ui.render([

					'<div class="login">',
						'<div class="login__loader">',
							LJ.static.renderStaticImage('slide_loader'),
						'</div>',
						'<div class="login__message">',
							'<h1 data-lid="login_loading_msg"></h1>',
						'</div>',
						'<div class="login__progress-bar">',
							'<div class="login__progress-bar-bg"></div>',
						'</div>',
					'</div>'

				].join(''));

			},
			promptUserLocation: function(){
				return LJ.promise(function( resolve, reject ){

					LJ.log('Requesting the user to provide a location...');

					$( LJ.login.renderLocationPrompt() )
						.hide()
						.appendTo('.curtain')
						.velocity('shradeIn', {
							duration: LJ.login.prompt_duration,
							display: 'flex'
						});

					LJ.seek.activatePlacesInFirstLogin();
					LJ.seek.login_places.addListener('place_changed', function(){

						var place = LJ.seek.login_places.getPlace();

						$('.init-location').attr('data-place-id'   , place.place_id )
							  			   .attr('data-place-name' , place.formatted_address )
							  			   .attr('data-place-lat'  , place.geometry.location.lat() )
							  			   .attr('data-place-lng'  , place.geometry.location.lng() );

						LJ.login.showPlayButton();

					});

					// Resolve the promise when the user picked a location
					$('.init-location .action__validate').click(function(){
						var $block = $( this ).closest('.init-location');

						if( $block.hasClass('x--validating') ) return
						$block.addClass('x--validating');

						LJ.login.updateProfileFirstLogin()
							.then(function(){

								$block
									.removeClass('x--validating')
									.velocity('bounceOut', {
										duration : LJ.login.prompt_duration,
										complete : resolve
									});
								

							}, function( err ){
								LJ.wlog('An error occured');
								LJ.log(err);

							});
					});
				});	
			},
			updateProfileFirstLogin: function( location ){

				LJ.log('Updating user location for the first time...');
				var update = {};

				if( location ){
					update.location = location;

				} else {					

					var place_id   = $('.init-location').attr('data-place-id');
					var place_name = $('.init-location').attr('data-place-name');
					var lat        = $('.init-location').attr('data-place-lat');
					var lng        = $('.init-location').attr('data-place-lng');

					if( !( place_id && place_name && lat && lng) ){
						return LJ.wlog('Missing place attributes on the dom, cannot contine with login');
					}

					update.location = {
						place_name : place_name,
						place_id   : place_id,
						lat 	   : lat,
						lng 	   : lng
					};

				}

				return LJ.api.updateProfile( update )
						  .then(function( exposed ){
							  	LJ.profile.setMyInformations();
							  	return;
						});

			},
			showPlayButton: function(){

				var $elm = $('.init-location').find('.init-location-action');

				if( $elm.css('opacity') != "0" ) return;

				$elm.velocity('bounceInQuick', {
					duration : LJ.login.prompt_buttons_duration,
					display  : 'flex',
					delay    : 500,
					complete : function(){
						$( this ).addClass('pound-light');
					}
				});

			},
			// Do a bunch of functions right before the login happens
			terminateLoginProcess: function(){

				LJ.ui.activateHtmlScroll();

				$('.curtain')
						.children('.login')
						.velocity('bounceOut', {
							duration: LJ.login.prompt_duration
						});

				$('.curtain')
					.children('.login__bg')
					.velocity({ 'opacity': [ 0, 0.09 ]}, {
						duration: LJ.login.prompt_duration/2,
						complete: function(){
							$( this ).remove();
						}
					});

				return LJ.ui.hideCurtain({
					delay: LJ.login.prompt_duration * 1.3,
					duration: 1000

				}).then(function(){

					LJ.emit("login:complete");

					LJ.ui.$body.on('click', '.js-logout', LJ.login.handleLogout );
					LJ.ui.$body.on('click', '.modal.x--logout .modal-footer button', LJ.login.logUserOut );

					$('.multi-landing').remove();
					$('.login').remove();
					
					return;
				});	

			},
			renderLocationPrompt: function(){

				return LJ.ui.render([

					'<div class="init-location">',
						'<div class="init-location__title">',
							'<h2 data-lid="init_location_title"></h2>',
						'</div>',
						'<div class="init-location__subtitle">',
							'<input id="init-location__input" type="text" data-lid="init_location_subtitle_placeholder">',
						'</div>',
						'<div class="init-location__splitter"></div>',
						'<div class="init-location__explanation">',
							'<p data-lid="init_location_explanation"></p>',
						'</div>',
						'<div class="init-location__geoloc">',
							'<button data-lid="init_location_geoloc"></button>',
						'</div>',
						'<div class="init-location-action">',
							'<div class="action__validate x--round-icon">',
								'<i class="icon icon-play"></i>',
							'</div>',
						'</div>',
					'</div>'

				].join(''));

			},
			handleLogout: function(){

				LJ.ui.showModal({
					"title"	   : LJ.text("logout_title"),
					"subtitle" : LJ.text("logout_subtitle"),
					"type"     : "logout",
					"footer"   : "<button class='x--rounded'><i class='icon icon-power'></i></button>"
				});

			},
			logUserOut: function(){

				var p1 = LJ.ui.shadeModal();
				var p2 = LJ.api.updateUser({
					"app_preferences": {
						ux: {
							auto_login: false
						}
					}
				});

				LJ.Promise.all([ p1, p2 ]).then(function(){
					LJ.store.remove('facebook_access_token');
					location.reload();
				});

			},
			handleLoginFail: function( e ){

				LJ.wlog("Login fatal error");
				LJ.wlog( e );

			}


	});