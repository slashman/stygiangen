function ItemPopulator(config){
	this.config = config;
}

var Util = require('./Utils');

ItemPopulator.prototype = {
	populateLevel: function(sketch, level, uniqueRegistry){
		this.uniqueRegistry = uniqueRegistry;
		this.calculateRarities(level.depth);
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			this.populateArea(area, level);
		}
	},
	populateArea: function(area, level){
		var items = Util.rand(0,2);
		for (var i = 0; i < items; i++){
			var position = level.getFreePlace(area, false, true);
			var item = this.getAnItem();
			level.addItem(item, position.x, position.y);
		}
	},
	calculateRarities: function(depth){
		this.thresholds = [];
		this.generationChanceTotal = 0;
		for (var i = 0; i < this.ITEMS.length; i++){
			var item = this.ITEMS[i];
			var malus = Math.abs(depth-item.depth) > 1;
			var rarity = malus ? item.rarity / 2 : item.rarity;
			this.generationChanceTotal += rarity;
			this.thresholds.push({threshold: this.generationChanceTotal, item: item});
		}
	},
	ITEMS: [
		/* Original U4 items
		    {code: 'dagger', rarity: 500},
			{code: 'oilFlask', rarity: 1400},
			{code: 'staff', rarity: 350},
			{code: 'sling', rarity: 280},
			{code: 'mace', rarity: 70},
			{code: 'axe', rarity: 31},
			{code: 'bow', rarity: 28},
			{code: 'sword', rarity: 350},
			{code: 'halberd', rarity: 23},
			{code: 'crossbow', rarity: 11},
			{code: 'magicAxe', rarity: 5},
			{code: 'magicBow', rarity: 4},
			{code: 'magicSword', rarity: 4},
			{code: 'magicWand', rarity: 2},
			{code: 'cloth', rarity: 140},
			{code: 'leather', rarity: 35},
			{code: 'chain', rarity: 12},
			{code: 'plate', rarity: 4},
	 	*/

		{code: 'daggerPoison', rarity: 100},
		{code: 'daggerFang', rarity: 50, unique: true},
		{code: 'daggerSting', rarity: 50, unique: true},
		{code: 'staffGargoyle', rarity: 100, unique: true},
		{code: 'staffAges', rarity: 50, unique: true},
		{code: 'staffCabyrus', rarity: 50, unique: true},
		
		{code: 'maceBane', rarity: 50, unique: true},
		{code: 'maceBoneCrusher', rarity: 50, unique: true},
		{code: 'maceSlayer', rarity: 25, unique: true},
		{code: 'maceJuggernaut', rarity: 25, unique: true},
		
		{code: 'axeDwarvish', rarity: 100},
		{code: 'axeDeceiver', rarity: 50, unique: true},
		{code: 'axeRune', rarity: 50},
		
		{code: 'swordFire', rarity: 100, unique: true},
		{code: 'swordChaos', rarity: 100, unique: true},
		{code: 'swordDragon', rarity: 50},
		{code: 'swordQuick', rarity: 25, unique: true},
		
		{code: 'slingEttin', rarity: 100, unique: true},
		{code: 'bowPoison', rarity: 200},
		{code: 'bowSleep', rarity: 200},
		{code: 'bowMagic', rarity: 100},
		{code: 'crossbowMagic', rarity: 50},
		
		{code: 'phazor', rarity: 25, unique: true},
		{code: 'wandLightning', rarity: 50},
		{code: 'wandFire', rarity: 50},
		
		{code: 'leatherDragon', rarity: 75},
		{code: 'leatherImp', rarity: 100},
		{code: 'chainMagic', rarity: 50},
		{code: 'chainDwarven', rarity: 75},
		{code: 'plateEternium', rarity: 5},
		{code: 'plateMagic', rarity: 10},
		
		{code: 'cure', rarity: 2000, depth: 1},
		{code: 'heal', rarity: 2000, depth: 1},
		{code: 'redPotion', rarity: 2000, depth: 1},
		{code: 'yellowPotion', rarity: 2000, depth: 1},
		{code: 'light', rarity: 2000, depth: 2},
		{code: 'missile', rarity: 2000, depth: 3},
		{code: 'iceball', rarity: 1000, depth: 4},
		//{code: 'repel', rarity: 1000, depth: 5},
		{code: 'blink', rarity: 666, depth: 5},
		{code: 'fireball', rarity: 666, depth: 6},
		{code: 'protection', rarity: 500, depth: 6},
		{code: 'time', rarity: 400, depth: 7},
		{code: 'sleep', rarity: 400, depth: 7},
		//{code: 'jinx', rarity: 166, depth: 8},
		//{code: 'tremor', rarity: 166, depth: 8},
		{code: 'kill', rarity: 100, depth: 8}
	],
	getAnItem: function(){
		var number = Util.rand(0, this.generationChanceTotal);
		for (var i = 0; i < this.thresholds.length; i++){
			if (number <= this.thresholds[i].threshold){
				if (this.uniqueRegistry && this.thresholds[i].item.unique) {
					if (this.uniqueRegistry[this.thresholds[i].item.code]){
						i = 0;
						number = Util.rand(0, this.generationChanceTotal);
						continue
					} else {
						this.uniqueRegistry[this.thresholds[i].item.code] = true;
					}
				}
				return this.thresholds[i].item.code;
			}
		}
		return this.thresholds[0].item.code;
	}
}

module.exports = ItemPopulator;