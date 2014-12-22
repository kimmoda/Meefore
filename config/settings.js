

var settings = {

	eventsFreezeAt: 9,
	eventsEndAt: 13,

	tagList: 
			 [  'afterwork',
				'before',
				'club',
				'apero',
				'apparte',
				'bar',
				'rencontre',
				'erasmus',
				'blackout'
			 ],

	activeEventStates:
			 [
			 	'open',
			 	'suspended'
			 ],
	isFrozenTime: function(){
		var hour = (new Date).getHours();
		return ( hour >= settings.eventsFreezeAt && hour < settings.eventsEndAt );
	}


};

module.exports = settings;