
	window.LJ.fn = _.merge( window.LJ.fn || {}, {

		handleDomEventsGroups: function(){

			 LJ.$body.on('click', '.icon-toggle', function(){

                var $self = $(this);

                LJ.fn.showLoaders();
                $self.addClass('active');

                var group_status = '';
                var group_id = $self.parents('.event-accepted-users-group').attr('data-groupid');
                var status   = $self.parents('.event-accepted-users-group').attr('data-status');
                var event_id = $self.parents('.row-events-accepted-inview').attr('data-eventid');

                if( status == 'accepted' ) {
                    group_status = 'kicked';
                } else {
                    group_status = 'accepted';
                }

                LJ.fn.updateGroupStatus({
                        group_status : group_status,
                        group_id     : group_id,
                        event_id     : event_id
                });

            });	


            LJ.$body.on('click', '.event-accepted-chatgroup', function(){

                var $self = $(this);

                if( $self.hasClass('active') )
                    return;

                $self.find('.bubble').addClass('none').text('');

                $('.event-accepted-chatgroup').removeClass('active')
                $self.addClass('active');

                var group_id = $self.attr('data-groupid');

                var duration = 235;

                // Display proper groups
                $('.event-accepted-users-group:not([data-groupid="hosts"])')
                    .velocity('transition.fadeOut',{
                        duration: duration * 1.82
                    });

                $('.event-accepted-users-group[data-groupid="' + group_id + '"]:not([data-groupid="hosts"])')
                    .velocity('transition.fadeIn',
                        { duration: duration * 1.82
                    });

                // Display proper chat
                var $current_chat =  $('.event-accepted-chat-wrap:not(.none)');
                var $target_chat  =  $('.event-accepted-chat-wrap[data-groupid="' + group_id + '"]');

                $current_chat

                    .find('.event-accepted-chat-message:not(.me)')
                    .velocity( LJ.ui.slideRightOutLight, {
                        duration: duration,
                        complete: function(){
                            $('.event-accepted-chat-wrap').addClass('none');
                        }
                    }).end()

                    .find('.event-accepted-chat-message.me')
                    .velocity( LJ.ui.slideLeftOutLight, {
                        duration: duration,
                        complete: function(){
                            $('.event-accepted-chat-wrap').addClass('none');      
                        }
                    }).end()

                    .find('.event-accepted-chat-typing')
                    .velocity('transition.fadeOut', {
                        duration: duration,
                        complete: function(){

                            $current_chat.addClass('none');

                            $target_chat
                                .find('.event-accepted-chat-message').addClass('none').end()
                                .removeClass('none');

                            LJ.fn.adjustAllChatPanes();

                            $target_chat

                               .find('.event-accepted-chat-message:not(.me)')
                                    .css({ opacity: 0 })
                                    .removeClass('none')
                                    .velocity( LJ.ui.slideRightInLight, {
                                        duration: duration + 100
                                    }).end()

                                .find('.event-accepted-chat-message.me')
                                    .css({ opacity: 0 })
                                    .removeClass('none')
                                .velocity( LJ.ui.slideLeftInLight, {
                                    duration: duration + 100
                                }).end()

                                .find('.event-accepted-chat-typing')
                                    .velocity('transition.fadeIn');

                        }
                    });
            });
			
			 
		},
		updateGroupStatus: function( options ){

            var group_status = options.group_status,
                event_id     = options.event_id,
                group_id     = options.group_id;

            if( !group_status || !group_status || !event_id )
                return console.error('Missing group_id || group_status || group_id');

            var data = {
                group_status : group_status,
                chat_id      : LJ.fn.makeChatId({ event_id: event_id, group_id: group_id })
            };

            LJ.fn.api('patch', 'events/' + event_id + '/groups/' + group_id + '/status', { data: data }, function( err, res ){

                LJ.fn.hideLoaders();

                if( err ){
                    LJ.fn.handleApiError( err );
                } else {
                    LJ.fn.handleUpdateGroupStatusSuccess( res );
                }

            });

        },
        handleUpdateGroupStatusSuccess: function( res ){

            console.log('Updating group status success');
            var event_id = res.event_id;
            var group    = res.group;

            LJ.fn.updateGroupStatusUI( event_id, group );

            var status = group.status;
            var $wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $wrap.find('[data-groupid="' + group.group_id + '"]')
                 .attr('data-status', status )

            if( status == 'accepted' ){
                LJ.fn.toastMsg('Le groupe ' + group.name + ' a été accepté');
            }

            if( status == 'kicked' ){
                LJ.fn.toastMsg('Le groupe ' + group.name + ' a été mis en attente');
            }     
        },
        updateGroupStatusUI: function( event_id, group ){

            var status = group.status;
            var $wrap = $('.row-events-accepted-inview[data-eventid="' + event_id + '"]');

            $wrap.find('[data-groupid="' + group.group_id + '"]')
                 .attr('data-status', status )

            if( status == 'accepted' ){
                $wrap.find('[data-groupid="' + group.group_id + '"] .icon-toggle')
                    .removeClass('icon-toggle-off').addClass('icon-toggle-on').removeClass('active');
            }

            if( status == 'kicked' ){
                $wrap.find('[data-groupid="' + group.group_id + '"] .icon-toggle')
                    .removeClass('icon-toggle-on').addClass('icon-toggle-off').removeClass('active');
            }     

        }

	});