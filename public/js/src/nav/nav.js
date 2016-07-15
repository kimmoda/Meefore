
	window.LJ.nav = _.merge( window.LJ.nav || {}, {

		$nav: $('.app-nav'),
		current_link: null,

		init: function(){
			return LJ.promise(function( resolve, reject ){

				LJ.nav.handleDomEvents();
				LJ.nav.navigate('map');
				resolve();

			});
		},
		handleDomEvents: function(){

			LJ.nav.$nav.on('click', 'li[data-link]', LJ.nav.handleNavigate );

		},
		handleNavigate: function(e){

			e.preventDefault();
			var $li = $(this);
			var lk  = $li.attr('data-link');
			LJ.nav.navigate( lk );

		},
		getActiveView: function(){

			return $('.app__menu-item.--active').attr('data-link');

		},
		navigate: function( target_link ){

			var current_link = LJ.nav.current_link;

			var $target_section  = $('.app-section[data-link="' + target_link + '"]');
			var $current_section = $('.app-section[data-link="' + current_link + '"]') || $target_section; // For the first activation

			var $target_menuitem = $('.app__menu-item[data-link="' + target_link + '"]');
			var $current_menuitem = $('.app__menu-item[data-link="' + current_link + '"]') || $target_menuitem

			var $target_headertitle  = $('.app-header__title[data-link="' + target_link + '"]');
			var $current_headertitle = $('.app-header__title[data-link="' + current_link + '"]') || $target_headertitle;

			if( $target_section.length + $target_menuitem.length + $target_headertitle.length != 3 ){
				return LJ.wlog('Ghost target for link : ' + link );
			}

			// Set the internal state
			LJ.nav.current_link = target_link

			// Update the Header ui
			$current_menuitem.removeClass('--active');
			$target_menuitem.addClass('--active');

			// Update the header title
			/*var duration = 220;
			LJ.ui.shradeOut( $current_headertitle, duration )
				.then(function(){
					LJ.ui.shradeIn( $target_headertitle, duration );
				});
			*/
			
			// Display the view
			$current_section.hide();
			$target_section.css({ display: 'flex' });

			if( !$target_menuitem.is( $current_menuitem ) ){
				LJ.ui.hideSlide();
				LJ.before.hideCreateBeforeStraight();
				LJ.before.showBrowser();
				LJ.map.deactivateMarkers();
				LJ.map.refreshMarkers();
			}

			// Specificities
			var duration = 220;
			var hasMeepassRibbon = $('.meepass-ribbon').length > 0;

			if( target_link == 'search' && hasMeepassRibbon ) {
				LJ.ui.shradeIn( $('.meepass-ribbon'), duration );
			} 

			if( target_link != 'search' && hasMeepassRibbon ){
				LJ.ui.shradeOut( $('.meepass-ribbon'), duration );
			}

			if( target_link == 'map' ){
				$('.app').removeClass('padded');

				LJ.unoffsetAll();
				// Refresh the map dued to a bug when the window is resized and the map not visible
				// The try catch is to avoid an ugly error in the console during app intitialization
				try {
					LJ.map.refreshMap();
				} catch( e ){

				}


			} else {
				$('.app').addClass('padded');
			}

			if( target_link != "menu" ){
				LJ.friends.hideInviteFriendsPopup();
			}


		}

	});

