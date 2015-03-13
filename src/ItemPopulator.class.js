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
		var items = Util.rand(0,2);
		for (var i = 0; i < items; i++){
			var position = level.getFreePlace(area);
			var item = this.getAnItem(level.depth);
			level.addItem(item, position.x, position.y);
		}
	},
	ITEMS: ['dagger'],
	getAnItem: function(depth){
		return Util.randomElementOf(this.ITEMS);
	}
}

module.exports = ItemPopulator;