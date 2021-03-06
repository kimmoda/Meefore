
		
	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		show_slide_duration: 450,
		show_slide_duration_children: 650,
		hide_slide_duration: 450,

		replace_slide_duration: 300,

		show_slide_delay_children: 500,
		hide_slide_delay   : 250,

		facebook_img_min_width: 200,
		facebook_img_max_width: 300,

		slide_top: 0,
		adjust_top: 55,

		showSlideAndFetch: function( options ){

			var uiPromise;
			if( $('.slide.x--'+ options.type ).length ){
				uiPromise = LJ.ui.replaceSlide
			} else {
				uiPromise = LJ.ui.showSlide
			}

			return LJ.promise(function( resolve, reject ){
				
				LJ.Promise.all([
					options.fetchPromise( options.promise_arg ),
					uiPromise( options )

				]).then(function( results ){
					resolve( results[0] );

				})
				.catch(function( err ){

					if( typeof options.errHandler == "function" ){
						options.errHandler( err );
					}
					
				});
			})

		},
		replaceSlide: function( options ){
			return LJ.promise(function( resolve, reject ){

				var $l = $('.slide.x--'+ options.type ).find('.slide__loader');
				
				// $l.siblings(':not(.slide__close)').velocity('shradeOut', {
				// 	duration : LJ.ui.replace_slide_duration,
				// 	display  : 'none',
				// 	complete: function(){
				// 		$(this).remove();
				// 		resolve();
				// 	}
				// });

				$l.velocity('bounceInQuick', { duration: 500, display: 'block' });
				$l.siblings(':not(.slide__close)').remove();
				LJ.delay( 650 ).then( resolve );

				// $l.velocity('shradeIn', {
				// 	duration : LJ.ui.replace_slide_duration / 1.5
				// 	delay    : LJ.ui.replace_slide_duration
				// });

			});
		},
		showSlide: function( options ){
			return LJ.promise(function( resolve, reject ){

				options = options || {};

				var $slide = $( LJ.ui.renderSlide( options ) );
				var height = $( window ).height() - LJ.ui.slide_top;

				if( LJ.isMobileMode() ){
					LJ.ui.deactivateHtmlScroll();
				}

				LJ.emit("show:slide");

				$slide
					  .hide()
					  .appendTo('body')
					  .css({ 'top': LJ.ui.slide_top, 'height': height })
					  .velocity('shradeIn', {
					  	display  : 'flex',
					  	duration : LJ.ui.show_slide_duration,
					  	complete : resolve
					  })
					  .on('click', '.slide__close', function(){
					  	
					  	LJ.ui.activateHtmlScroll();
					  	LJ.ui.hideSlide( options );
					  	LJ.emit("hide:slide");

					  	if( typeof options.complete == 'function' ) {
					  		options.complete();
					  	}

					  	LJ.unoffsetElements();

					  });

				LJ.offsetElements();

			});
		},
		showSlideOverlay: function( html ){

			var $wrap = $('.slide-body').children().last();

			LJ.ui.showIoptions( $wrap, html );


		},
		hideSlideOverlay: function(){

			var duration = LJ.ui.hide_slide_duration;

			$('.slide-overlay').velocity('fadeOut', {
				duration: duration,
				complete : function(){
					$( this ).children().remove();
				}
			});

		},
		hideSlide: function( opts ){
			
			opts = opts || {};
			
			var type = opts.type ? '.slide.x--' + opts.type : '.slide';

			if( LJ.isMobileMode() ){
				return $( type ).remove();
			}

			$( type ).velocity( 'shradeOut', {
				duration: LJ.ui.hide_slide_duration,
				complete: function(){
					$( this ).remove();

				}
			});


		},
		renderSlide: function( options ){

			var body_html = options.body || LJ.static.renderStaticImage('slide_loader');
			var modifier  = 'x--' + options.type;

			var attributes = [];
			if( options.attributes ){
				options.attributes.forEach(function( attr_object ){
					attributes.push('data-' + attr_object.name  + '="' + attr_object.val + '"');
				});
			}
			attributes = attributes.join(' ');

			var header = '';
			if( options.title ){
				header = ['<header class="slide-header">',
						'<div class="slide__title">',
							'<h1>' + options.title + '</h1>',
						'</div>',
					'</header>'
					].join('');
			}

			var subheader = '';
			if( options.subtitle ){
				subheader = ['<div class="slide-subheader">',
						options.subtitle,
					'</div>'
					].join('');
			}

			var footer = '';
			if( options.footer ){
				footer = ['<div class="slide-subheader">',
						options.subtitle,
					'</div>'
					].join('');
			}

			return [

				'<div class="slide ' + modifier + '" ' + attributes + '>',
					header,
					subheader,
					'<section class="slide-body">',
						'<div class="slide__close x--round-icon">',
							'<i class="icon icon-cross-fat"></i>',
						'</div>',
						body_html,
					'</section>',
					footer,
				'</div>'

			].join('');

		}

	});




	testSlide = function(){
		LJ.ui.showSlide({
			"title": "Félicitations !",
			"subtitle": "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"body": "<div> This is my super body </div>",
			"footer": "<button class='x--rounded'><i class='icon icon-check'></i></button>",
			"type": "test"
		});
	};

	testSlideFetch = function(){

		LJ.profile_user.showUserProfile( LJ.user.facebook_id );

	}