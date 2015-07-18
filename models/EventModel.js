
	var mongoose = require('mongoose');
		require('mongoose-moment')( mongoose );

	var EventSchema = mongoose.Schema({

		name: {
			type: String
		},
		description: {
			type: String
		},
		location: {
			type: Number,
			default: 1
		},
		maxGuest:{
			type: Number,
			default: 10
		},
		hostId: {
			type: String
		},
		hostimg_id: {
			type: String
		},
		hostimg_version: {
			type: String
		},
		hostName: {
			type: String
		},
		beginsAt: {
			type: Date
		},
		createdAt: {
			type: Date
		},
		askersList: {
			type: Array,
			default: []
		},
		state: {
			type: String,
			default: 'open'
		},
		tags: {
			type: Array,
			default: []
		},
		meta:{
			type: Array,
			default: []
		},
		templateId:{
			type:String
		}
	});

	module.exports = mongoose.model('Events', EventSchema);