	

	window.LJ = _.merge( window.LJ || {} , {

		typeahead: {
			users: {
				class_names: {
					input:'',
					hint:'',
					menu:'search-results-users',
					dataset:'search-wrap',
					suggestion:'search-result-default search-result-users',
					empty:'empty',
					open:'open',
					cursor:'cursor',
					highlight:'highlight'
				}
			},
			places: {
				class_names: {
					input:'',
					hint:'hint-places',
					menu:'search-results-places',
					dataset:'search-wrap',
					suggestion:'search-result-default search-result-places',
					empty:'empty',
					open:'open',
					cursor:'cursor',
					highlight:'highlight'
				}
			},
			hosts: {
				class_names: {
					input:'',
					hint:'hint-places',
					menu:'search-results-autocomplete search-results-hosts',
					dataset:'search-wrap',
					suggestion:'search-result-default search-result-hosts',
					empty:'empty',
					open:'open',
					cursor:'cursor',
					highlight:'highlight'
				}
			}
		}

	});


	window.LJ.fn = _.merge( window.LJ.fn || {} , 

	{
		initTypeaheadUsers: function(){

			var users = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.whitespace,
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 remote: {
  				 	url: '/api/v1/users?name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			users.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized users'); })

			$('#search input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.users.class_names
			},
			{
				name:'users',
				display:'name',
				source: users.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound,
					pending    : LJ.fn.renderTypeaheadPending,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Users
				}
			});

		},
		initTypeaheadHosts: function( friends ){

			var hosts = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 local: friends,
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			hosts.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized hosts'); })

			$('.row-create-hosts input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.hosts.class_names
			},
			{
				name:'hosts',
				display:'name',
				source: hosts.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadBlank,
					pending    : LJ.fn.renderTypeaheadPending,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Users
				}
			});

		},
		initTypeaheadPlaces: function(){

			var places = new Bloodhound({
				 datumTokenizer: Bloodhound.tokenizers.whitespace,
  				 queryTokenizer: Bloodhound.tokenizers.whitespace,
  				 identify: function(o){ return o.name; },
  				 remote: {
  				 	url: '/api/v1/places?name=%query',
  				 	wildcard: '%query'
  				 },
  				 transform: function(res){
  				 	delog(res);
  				 }
			});

			places.initialize()
				 .done(function(){ })
				 .fail(function(){ delog('Bloodhound engine failed to initialized places'); })

			$('.row-create-party-location input').typeahead({
				hint: true,
				highlight: true,
				minLength: 1,
				classNames: LJ.typeahead.places.class_names
			},
			{
				name:'places',
				display:'name',
				source: places.ttAdapter(),
				templates: {
					notFound   : LJ.fn.renderTypeaheadNotFound,
					pending    : LJ.fn.renderTypeaheadPending,
					suggestion : LJ.fn.renderTypeaheadSuggestion_Places
				}
			});

		},
		renderTypeaheadNotFoundHosts: function(){

			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.black_on_white.id;

			var message 		 = "Aucun de tes amis n'a ce nom. Peut-être n'est-il pas encore inscrit? Invite-le!";


			var html = '<div class="search-result-default search-result-default-empty">'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name search-result-name-host">' + message + '</div>'
				       + '</div>'
				      +'</div>';

			return html;

		},
		renderTypeaheadNotFound: function(){
			
			var display_settings = LJ.cloudinary.search.user.params;
				img_id  		 = LJ.cloudinary.logo.black_on_white.id;

			var message 		 = "Aucun résultats";

			user_main_img = $.cloudinary.image( img_id, display_settings ).prop('outerHTML');

			var html = '<div class="search-result-default search-result-default-empty">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';

			return html;

		},
		renderTypeaheadPending: function(){

			var message 		 = "Recherche..."
			var image_tag_loader = LJ.$spinner_loader.clone().addClass('search-loader').addClass('super-centered').prop('outerHTML');

			var html = '<div class="search-result-default search-result-default-empty" >'
					   + '<div class="search-result-images">' 
				       		+ image_tag_loader
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + message + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		},
		renderTypeaheadBlank: function( data ){
			return '<div class="nonei"></div>';
		},
		renderTypeaheadSuggestion_Places:  function( place ){

			var html = '<div data-placeid="'+place._id+'">'
							+'<div class="place-data place-name">'+place.name+'</div>'
							+'<div class="place-data place-address">'+place.address+'</div>'
							+'<div class="place-data place-type">'+place.type+'</div>'
						+'</div>';

			return html;

		},
		renderTypeaheadSuggestion_Users: function( user ){

			var user_main_img = '', user_hashtags = '';

			var main_img = LJ.fn.findMainImage( user ),
				display_settings = LJ.cloudinary.search.user.params;
				display_settings.img_version = main_img.img_version;

			user_main_img = $.cloudinary.image( main_img.img_id, display_settings ).prop('outerHTML');

			user_hashtags += '<div>#' +  user.drink + '</div>';
			user_hashtags += '<div>#' +  user.mood + '</div>';

			var image_tag_loader = LJ.$spinner_loader.clone().addClass('search-loader').addClass('super-centered').prop('outerHTML');

			var html = '<div data-userid="'+user.facebook_id+'">'
					   + '<div class="search-result-images">' 
				       		+ user_main_img 
				       		+ image_tag_loader
				       + '</div>'
				       + '<div class="search-result-name-wrap">'
				       + '<div class="search-result-name">' + user.name + '</div>'
				       + '<div class="search-result-hashtags">' + user_hashtags + '</div>'
				       + '</div>'
				      +'</div>';
			return html;

		}
	});