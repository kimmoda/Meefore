		
	testModal = function(){
		LJ.ui.showModal({
			"title": "Félicitations !",
			"subtitle": "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"body": "Then there goes the body...",
			"footer": "<button class='--rounded'><i class='icon icon-plus'></i></button>"
		});
	};

	testModalFetch = function(){

		LJ.ui.showModalAndFetch({

			"title"			: "Félicitations fetch!",
			"subtitle"		: "Vous allez désormais pouvoir créer votre propre évènement privé avec vos amis.",
			"footer"		: "<button class='--rounded'><i class='icon icon-plus'></i></button>",

			"fetchPromise"	: LJ.facebook.fetchProfilePictures

		}).then(function( results ){
			console.log('Call went thru!');
			
			var html = [];
			results.data.forEach(function( picture_object ){
				picture_object.images.forEach(function( image_object ){
					if( image_object.width > LJ.ui.facebook_img_min_width && image_object.width < LJ.ui.facebook_img_max_width ){
						html.push( LJ.facebook.renderPicture( image_object.source ) );
					}
				});
			});

			$('.modal-body').append( html.join('') )
							.find('.modal__loader')
							.velocity('bounceOut', {
								duration: 500,
								delay: 1000,
								complete: function(){
									$(this).siblings()
										   .velocity('bounceInQuick', {
										   		display: 'block'
										   });
								}
							})

		});

	}

	window.LJ.ui = _.merge( window.LJ.ui || {}, {

		show_modal_duration: 700,
		hide_modal_duration: 700,

		facebook_img_min_width: 200,
		facebook_img_max_width: 300,

		showModalAndFetch: function( options ){
			return LJ.promise(function( resolve, reject ){
				LJ.Promise.all([
					options.fetchPromise(),
					LJ.ui.showModal( options )
				]).then(function( results ){
					resolve( results[0] );
				}, function( err ){
					console.log(err);
				});
			})

		},	
		showModal: function( options ){
			return LJ.promise(function( resolve, reject ){

				options = options || {};

				var $modal = $( LJ.ui.renderModal( options ) );

				LJ.ui.showCurtain({ duration: 400, opacity: .75 })

				$modal.hide()
					  .appendTo( $('.curtain') )
					  .velocity('bounceInQuick', {
					  	delay: 200,
					  	display: 'flex',
					  	duration: LJ.ui.show_modal_duration,
					  	complete: function(){
					  		LJ.log('Modal show finished');
					  		return resolve();
					  	}
					  })
					  .on('click', '.modal__close', LJ.ui.hideModal )

			});
		},
		hideModal: function(){
			
			$('.modal').velocity('bounceOut', {
				duration: LJ.ui.hide_modal_duration
			});

			$('.curtain').velocity('fadeOut', {
				duration: LJ.ui.hide_modal_duration,
				delay: 300,
				complete: function(){
					$(this).remove();
				}
			})

		},
		renderModal: function( options ){

			var body_html = options.body || LJ.static.renderStaticImage('modal_loader');

			return [

				'<div class="modal">',
					'<header class="modal-header">',
						'<div class="modal__close">',
							'<i class="icon icon-cancel"></i>',
						'</div>',
						'<div class="modal__title">',
							'<h1>' + options.title + '</h1>',
						'</div>',
					'</header>',
					'<div class="modal-subheader">',
						options.subtitle,
					'</div>',
					'<section class="modal-body">',
						body_html,
					'</section>',
					'<footer class="modal-footer">',
						options.footer,
					'</footer>',
				'</div>'

			].join('');

		}

	});