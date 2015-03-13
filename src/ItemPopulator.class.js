function ItemPopulator(config){
	this.config = config;
}

var Util = require('./Utils');

ItemPopulator.prototype = {
	populateLevel: function(sketch, level){
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			this.populateArea(area, level);
		}
	},
	populateArea: function(area, level){
		for (var i = 0; i < area.items.length; i++){
			var position = level.getFreePlace(area);
			level.addItem(area.items[i], position.x, position.y);
		}
	}
}

module.exports = ItemPopulator;