

window.LJ.fn = _.merge( window.LJ.fn || {} ,

{
		
		handleDomEvents_Globals: function(){

            $('#logo').click(function(){
                $('#events').click();
            });

			LJ.$body.on('click', '.moving-arrow', function(){
				$('.landing-keypoints').velocity('scroll', { duration: window.tanim || 1800, easing: window.nanim || "ease-in-out" });
			});

			LJ.$body.on('mouseenter', '.eventItemWrap', function(){
				$(this).addClass('mouseover');
			});

			LJ.$body.on('mouseleave', '.eventItemWrap', function(){
				$(this).removeClass('mouseover');
			});

			$('.modal-curtain').click( function(){
				LJ.fn.hideModal();
			});

            LJ.$body.on('click', '.detailable', function(){

            	var facebook_id = $(this).attr('data-id') || $(this).closest('[data-userid]').attr('data-userid');

            	if( !facebook_id ){
            		return console.warn('Couldnt find any id to display profile');
            	}

            	LJ.fn.displayUserProfile( facebook_id );
            });
            
            LJ.$body.on('click', '.row-input, .picture-hashtag', function(){

            	var $self = $(this);

            	if( $self.parents('.row').hasClass('editing') ) return;

            	if( $self.hasClass('.picture-hashtag') ){
            		$self.closest('.picture')
            			.find('.picture-upload')
            			.velocity('transition.fadeOut', { duration: 300 });
            	}

            	$self.parents('.row')
            		.find('.icon-edit')
            		.toggleClass('slow-down-3')
            		.click();

            	$self.find('input').focus();

            });


            LJ.$body.on('click', '.pick-lang', function(){

            	var $self = $(this);
            	var lang_code = $self.attr('data-code');

            	if( $self.hasClass('active') ) return;

        		LJ.fn.displayCurtain({
        			behindTheScene: function(){

        				console.log('Changing language');
        				$('.pick-lang').removeClass('active');
        				$('.pick-lang[data-code="' + lang_code + '"]').addClass('active');

        				LJ.fn.setAppLanguage( lang_code );
        			},
        			duration: 550,
        			delay: 350,
        			static_delay: true,
        			afterTheScene: function(){

        				if( $self.hasClass('no-cb') ) return;
        				
        				LJ.fn.toastMsg( LJ.text_source[ "t_language_changed" ][ lang_code ] );

        			}
        		});

            });

		},
		handleDomEvents_Search: function(){

			LJ.$body.bind('typeahead:select', function(ev, suggestion) {

				console.log(suggestion);

				if( $('.row-create-party-location input').is( ev.target ) ){
					/* Nothing special - default typeahead behavior, copy name on input */	
				}

			  	if( $('#search input').is( ev.target ) ){
			  		LJ.fn.displayUserProfile( suggestion.facebook_id );
			  	}

			  	if( $('.row-create-friends input').is( ev.target ) ){
			  		delog('Friends input selected!');
			  	}

			});

		}
		


});