
	window.LJ.pictures = _.merge( window.LJ.pictures || {}, {

		$upload_form: $(''),
		cloudinary_cloud_name: "radioreve",
		cloudinary_upload_params: { cloud_name:"radioreve", api_key:"835413516756943" },
		uploading_image: false,
		uploading_img_place: null,
		upload_id_profile: null,
		upload_ux_duration: 600,
		img_params: {
			'me': 			{ width: 170, height: 170, crop: 'fill', gravity: 'face' },
			'me-thumbnail': { width: 60,  height: 60,  crop: 'fill', gravity: 'face' },
			'me-friends': 	{ width: 170, height: 170, crop: 'fill', gravity: 'face' }
		},

		init: function(){

			// Global configuration of the uploader. Need to be callec once !
			$.cloudinary.config( LJ.pictures.cloudinary_upload_params );

			return LJ.promise(function( resolve, reject ){

				LJ.api.fetchCloudinaryTags()
					  .then( LJ.pictures.setupCloudinary )
					  .then( LJ.pictures.handleDomEvents );

				resolve();				
			});
			
		},
		setupCloudinary: function( cloudinary_tags ){

				// Add the input that triggers the upload to the element
				// The element is signed serverside to allow upload to cloudinary
				// Just use a CSS hack to display it on top of icon with opacity 0.01
				$('.picture__icon.--upload-desktop').each(function( i, icon ){

					$( icon ).find('.cloudinary-fileupload').remove(); // Remove previous if existed

					$( icon ).append( cloudinary_tags[i] )
						     .find('.cloudinary-fileupload')
							     .click( LJ.pictures.stageFileUpload__Profile )
								 .bind('fileuploadstart', LJ.pictures.handleFileUploadStart__Profile )
								 .bind('fileuploadprogress', LJ.pictures.handleFileUploadProgress__Profile )
								 .bind('cloudinarydone', LJ.pictures.handleCloudinaryDone__Profile)
								 .cloudinary_fileupload();
							});


				// Refresh every upload tag every 45min. They become out-dated after 1 hour.
				var delay = 1000 * 60 * 45;
	            LJ.delay( delay ).then(function(){
	            	LJ.api.fetchCloudinaryTags().then( LJ.pictures.setupCloudinary );
	            	// LJ.pictures.setupCloudinary( cloudinary_tags );
	            });

		},
		handleDomEvents: function(){

			$('.pictures').on('click', LJ.pictures.handleClickOnPicture );
			LJ.ui.$body.on('click', LJ.pictures.handleClickInModal );

		},
		handleClickInModal: function( e ){

			var $tar      = $(e.target);
			var $block    = $tar.closest('.modal');
			var img_place = $block.attr('data-img-place');		

			if( $tar.is('.modal__facebook-picture img') ){
				return LJ.pictures.toggleFacebookPictureState( $tar );
			}

			if( $tar.is('.modal-footer button') || $tar.closest('.modal-footer button').length == 1 ){
				if( $block.hasClass('--active') ){
					$block.removeClass('--active');
					LJ.ui.hideModal();
					var src = $('.modal__facebook-picture.--active').attr('data-img-src');
					LJ.pictures.uploadFacebookPicture( src, img_place );
				}
			}

		},
		handleClickOnPicture: function( e ){

			var $tar      = $(e.target);
			var $block    = $tar.closest('.picture');
			var img_place = $block.attr('data-img-place');

			if( $tar.is('.picture__icon.--upload-facebook') ){
				return LJ.facebook.showFacebookPicturesInModal( img_place );
			}

			if( $tar.is('.picture__icon.--mainify') ){
				return LJ.pictures.mainifyPicture( img_place );
			}

			if( $tar.is('.picture__icon.--trash') ){
				return LJ.pictures.deletePicture( img_place );
			}

			if( $tar.is('.picture__hashtag input')){
				return LJ.pictures.activateHashtagEdit( img_place );
			}

			if( $tar.is('.hashtag__action-validate i') || $tar.is('.hashtag__action-validate') ){
				if( $tar.closest('.hashtag-action').hasClass('--pending') ) return;
				$tar.closest('.hashtag-action').addClass('--pending');
				return LJ.pictures.updateHashtag( img_place );
			}

			if( $tar.is('.hashtag__action-cancel i') || $tar.is('.hashtag__action-cancel') ){
				if( $tar.closest('.hashtag-action').hasClass('--pending') ) return;
				return LJ.pictures.deactivateHashtagEdit( img_place );
			}


		},
		toggleFacebookPictureState: function( $pic ){

			var $block = $pic.closest('.modal');
			var $pic   = $pic.closest('.modal__facebook-picture');
			
			if( $pic.hasClass('--active') ){
				return $block.add( $('.modal__facebook-picture') ).removeClass('--active');
			}
			
			$('.modal__facebook-picture').removeClass('--active');
			$block.add( $pic ).addClass('--active');


		},
		uploadFacebookPicture: function( src, img_place ){

			LJ.log('Uploading facebook picture...');

			var $picture = $('.picture[data-img-place="' + img_place + '"]');
			var img_id	 = $picture.attr('data-img-id');

			var call_id = LJ.generateId();
			LJ.ui.showLoader( call_id );


			var update = {
				url 		: src,
				call_id 	: call_id,
				img_place 	: img_place,
				img_id		: img_id
			};

			LJ.api.uploadNewPictureUrl( update )
		 	  .then( LJ.pictures.handleUpdatePicturesSuccess );

		},
		updateHashtag: function( img_place ){

			var $picture = $('.picture[data-img-place="' + img_place + '"]');
			var $input 	 = $picture.find('.picture__hashtag input');

			var new_hashtag = $input.val();

			LJ.pictures.updatePicture( img_place, "hashtag", new_hashtag );

		},
		activateHashtagEdit: function( img_place ){

			var $picture = $('.picture[data-img-place="' + img_place + '"]');
			var $input   = $picture.find('.picture__hashtag input');

			$input.attr('data-restore', $input.val() );
			$input.attr( 'readonly', false );

			if( $input.hasClass('--active') ) return;

			$input.addClass('--active');

			var css_transition = $picture.css('transition');
			$picture.css({ transition: 'none' }).velocity({ height: parseInt( $picture.css('height') ) + 40 }, {
				duration: 100,
				complete: function(){
					$picture.css({ transition: css_transition })
							.find('.hashtag-action')
							.velocity('bounceInQuick', {
								duration: 400,
								display: 'flex'
							});
				}
			});


		},
		deactivateHashtagEdit: function( img_place ){

			var $picture = $('.picture[data-img-place="' + img_place + '"]');
			var $input   = $picture.find('.picture__hashtag input');

			if( !$input.hasClass('--active') ) return;

			$input.attr( 'readonly', true )
				  .val( $input.attr('data-restore') )
				  .attr('data-restore', null )
				  .removeClass('--active');

			var css_transition = $picture.css('transition');
			$picture.find('.hashtag-action').velocity('bounceOut', { duration: 400 });
			$picture.css({ transition: 'none' }).velocity({ height: parseInt( $picture.css('height') ) - 40 }, {
				duration: 100,
				delay: 300,
				complete: function(){
					$picture.css({ transition: css_transition })
				}
			});

		},
		updatePicture: function( img_place, action, hashtag ){

			if( ['mainify', 'delete', 'hashtag'].indexOf( action ) == -1 ){
				return LJ.wlog('Cant upload, the action ' + action + ' is not recognized');
			}

			var update_id = LJ.generateId();
			LJ.ui.showLoader( update_id );

			var updated_pictures = [{
				'img_place' : img_place,
				'action'    : action
			}];

			if( hashtag && action == 'hashtag' ){
				updated_pictures[0].new_hashtag = hashtag;
			};


			LJ.api.updatePicture({ updated_pictures: updated_pictures, call_id: update_id })
				  .then( LJ.pictures.handleUpdatePicturesSuccess, LJ.pictures.handleUpdatePicturesError );

		},
		mainifyPicture: function( img_place ){
			return LJ.pictures.updatePicture( img_place, 'mainify' );

		},
		deletePicture: function( img_place ){
			return LJ.pictures.updatePicture( img_place, 'delete' );

		},
		handleUpdatePicturesSuccess: function( res ){

			var call_id  = res.call_id;
			var pictures = res.pictures;

			LJ.ui.hideLoader( call_id );
			LJ.pictures.upload_id_profile = null;

			LJ.ui.showToast( LJ.text('to_update_pic_success') );

			LJ.user.pictures = pictures;

			// Check if the main picture has changed
			var $o_main_pic = $('.picture.--main');
			var $n_main_pic = $('.picture[data-img-place="' + LJ.findMainPic().img_place + '"]');

			if( ! $o_main_pic.is( $n_main_pic ) ){

				$o_main_pic.removeClass('--main');
				$n_main_pic.addClass('--main');

				// Update the thumbnail
				var $img = $('.app-thumbnail').find('img');
				LJ.pictures.replaceImage( $img, {
					img_id      : $n_main_pic.attr('data-img-id'),
					img_version : $n_main_pic.attr('data-img-vs')
				});
			}

			LJ.user.pictures.forEach(function( pic ){
				var $pic = $('.picture[data-img-place="' + pic.img_place + '"]');

				if( $pic.attr('data-img-vs') != pic.img_version ){

					var options = {
						img_id		: pic.img_id,
						img_version : pic.img_version
					};

					if( $pic.hasClass('--main') ){
						LJ.pictures.replaceImage( $('.app-thumbnail').find('img'), options );
					}
					LJ.pictures.replaceImage( $pic.find('img'), options );
				}

				var $hashtag_input = $pic.find('.picture__hashtag input');
				if( $hashtag_input.val() == pic.hashtag ){
					$pic.find('.hashtag-action').removeClass('--pending');
					LJ.pictures.deactivateHashtagEdit( pic.img_place );
					$hashtag_input.val( pic.hashtag );
				}
			});


		},
		handleUpdatePicturesError: function( res ){

			var call_id = res.call_id;

			LJ.ui.hideLoader( call_id );
			LJ.pictures.upload_id_profile = null;

			if( res.error.err_id == 'mainify_placeholder' ){
				return LJ.ui.showToast( LJ.text('err_update_profile_mainify_placeholder'), 'error' );
			}

			if( res.error.err_id == 'delete_main_picture' ){
				return LJ.ui.showToast( LJ.text('err_update_profile_delete_main_picture'), 'error' );
			}

		},
		makeImgHtml: function( img_id, img_version, scope ){

			img_params            = LJ.pictures.img_params[ scope ];
			img_params.cloud_name = LJ.pictures.cloudinary_cloud_name;
			img_params.version    = img_version;

			return $.cloudinary.image( img_id, img_params ).attr('data-scopeid', scope ).prop('outerHTML');

		},
		getUploadingState: function(){
			 return LJ.pictures.uploading_image ? "uploading" : "idle";

		},
		stageFileUpload__Profile: function(){

			if( LJ.pictures.getUploadingState() == "uploading" ){
				return LJ.wlog('Cant upload multiple files at the same time');
			}

			var $input = $(this);
			var $block = $input.closest('.picture');

			LJ.pictures.uploading_img_place = $block.attr('data-img-place');
			LJ.log('Uploading img_place : ' + LJ.pictures.uploading_img_place );

			// Upload id to uniquely identify loaders
			LJ.pictures.upload_id_profile = LJ.generateId();

			$block.find('.picture__progress-bar').attr('data-uploadid', LJ.pictures.upload_id_profile )

		},
		handleFileUploadStart__Profile: function(){

			LJ.pictures.uploading_image = true;

			LJ.ui.showLoader( LJ.pictures.upload_id_profile );
			LJ.pictures.showPictureProgressBar( LJ.pictures.upload_id_profile );

		},
		handleFileUploadProgress__Profile: function( e, data ){

			LJ.pictures.getPictureProgressBar()
				.find('.picture__progress-bar-bg')
				.css('width', Math.round( (data.loaded * 100.0) / data.total) + '%');

		},
		getPictureProgressBar: function( upload_id ){

			return $('.picture__progress-bar[data-uploadid="' + LJ.pictures.upload_id_profile + '"]');

		},
		showPictureProgressBar: function( upload_id ){

			LJ.pictures.getPictureProgressBar()
				.velocity('fadeIn', { duration: LJ.pictures.upload_ux_duration });

		},
		hidePictureProgressBar: function( upload_id ){

			LJ.ui.hideLoader( upload_id );

			LJ.pictures.getPictureProgressBar()
				.velocity('fadeOut', { duration: LJ.pictures.upload_ux_duration })
				.find('.picture__progress-bar-bg').css({ width: '0%' });

		},
		handleCloudinaryDone__Profile: function( e, data ){

			// Known by the app because tied to whatever photo triggered the upload
			// These are essentially used to determine uniquely which pic is being updated
			LJ.log('Uploading now the picture to the server...');
			var img_place   = LJ.pictures.uploading_img_place;

			// Known by cloudinary
			var img_id      = data.result.public_id;
			var img_version = data.result.version;

			var update = {
				img_id           : img_id,
				img_version      : img_version,
				img_place        : img_place
			};
			
			LJ.api.uploadNewPicture( update )
				  .then( LJ.pictures.handleNewPictureSuccess );

		},
		handleNewPictureSuccess: function( new_picture ){

			// Update cache
			LJ.user.pictures.forEach(function( pic ){
				if( pic.img_place == new_picture.img_place ){
					pic = new_picture;
				}
			})

			$('.picture__progress-bar[data-uploadid="' + LJ.pictures.upload_id_profile + '"]')
				.find('.picture__progress-bar-bg')
				.css('width', '100%');

			var $block = $('.picture[data-img-place="' + new_picture.img_place + '"]');

			LJ.ui.showToast( LJ.text("to_upload_pic_success") );

			var options = {
				img_id 		: new_picture.img_id,
				img_version	: new_picture.img_version
			};

			if( new_picture.is_main ){
				LJ.pictures.replaceImage( $block.find('img'), options );
				LJ.pictures.replaceImage( $('.app-thumbnail').find('img'), options );
			} else {
				LJ.pictures.replaceImage( $block.find('img'), options );
			}

		},
		resetUploadState: function(){
			
			LJ.pictures.uploading_image 	  = false;
			LJ.pictures.uploading_img_place   = null;
			LJ.pictures.upload_id_profile 	  = null;

		},
		replaceImage: function( o_img, options ){

			$o_img = o_img instanceof jQuery ? o_img : $( o_img );

			if( $o_img.length != 1 || !$o_img.is('img') ){
				return LJ.wlog('Cant replace image, unable to uniquely identify the image on dom, length is ' + $o_img.length);
			}

			var scope    = $o_img.attr('data-scopeid');
			var $new_img = $( LJ.pictures.makeImgHtml( options.img_id, options.img_version, scope ) );

			// Duplicate classes
			var o_classes = ( $o_img.attr('class') || '' ).split(' ');

			if( o_classes.indexOf('none') == -1 ){
				o_classes.push('none');
			}
			
			o_classes = o_classes.filter( Boolean );

			$new_img.attr('class', o_classes.join(''));
			$new_img.insertAfter( $o_img );
			$new_img.closest('.picture')
					.attr('data-img-id', options.img_id )
					.attr('data-img-vs', options.img_version );


			var duration = options.duration || LJ.pictures.upload_ux_duration;
			$o_img.velocity('fadeOut', {
				duration: duration,
				complete: function(){
					
					$(this).remove();
					$new_img.waitForImages(function(){

						// Special case, when the replace occurs after desktop upload
						if( LJ.pictures.upload_id_profile ){
							LJ.pictures.hidePictureProgressBar( LJ.pictures.upload_id_profile );
						}

						$new_img.velocity('fadeIn', { duration: duration });

						LJ.pictures.resetUploadState();

					});
				}
			})



		}


	});