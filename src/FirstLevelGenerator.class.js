function FirstLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var Splitter = require('./Splitter');

FirstLevelGenerator.prototype = {
	LAVA_CHANCE:     [100,  0, 20,  0,100, 10, 50,100],
	WATER_CHANCE:    [  0,100, 10,100,  0, 50,  0,  0],
	CAVERN_CHANCE:   [ 80, 80, 20, 20, 60, 90, 10, 50],
	LAGOON_CHANCE:   [  0, 50, 10, 20,  0, 30,  0,  0],
	WALLLESS_CHANCE: [ 50, 10, 80, 90, 10, 90, 10, 50],
	HEIGHT:          [  1,  2,  1,  1,  1,  2,  2,  3],
	GANGS: [
		[ // Level 1
			{boss: 'daemon', minions: ['firelizard'], quantity: 5},
			{minions: ['firelizard'], quantity: 10},
			{boss: 'hydra', minions: ['firelizard'], quantity: 5}
		],
		[ // Level 2
			{boss: 'daemon', minions: ['seaSerpent', 'octopus', 'nixie'], quantity: 5},
			{boss: 'hydra', minions: ['seaSerpent', 'octopus', 'nixie'], quantity: 5},
			{boss: 'balron', minions: ['seaSerpent', 'octopus', 'nixie'], quantity: 5},
			{minions: ['seaSerpent'], quantity: 10},
			{minions: ['nixie'], quantity: 10}
		],
		[ // Level 3
			{minions: ['daemon'], quantity: 10},
			{boss: 'balron', minions: ['daemon'], quantity: 3},
		],
		[ // Level 4
			{boss: 'gazer', minions: ['headless'], quantity: 5},
			{boss: 'liche', minions: ['ghost'], quantity: 5},
			{boss: 'daemon', minions: ['gazer', 'gremlin'], quantity: 5},
		],
		[ // Level 5
			{minions: ['dragon', 'zorn', 'balron'], quantity: 6},
			{minions: ['reaper', 'gazer', 'phantom'], quantity: 6},
			{boss: 'balron', minions: ['headless'], quantity: 10},
			{boss: 'zorn', minions: ['headless'], quantity: 10},
			{minions: ['dragon', 'lavaLizard'], quantity: 10},
		],
		[ // Level 6
			{minions: ['reaper'], quantity: 6},
			{boss: 'balron', minions: ['daemon'], quantity: 6},
			{areaType: 'cave', minions: ['bat'], quantity: 15},
			{areaType: 'cave', boss: 'twister', minions: ['seaSerpent'], quantity: 5},
			{boss: 'balron', minions: ['hydra'], quantity: 10},
			{boss: 'balron', minions: ['mage'], quantity: 10}
		],
		[ // Level 7
			{minions: ['headless'], quantity: 20},
			{minions: ['hydra'], quantity: 6},
			{minions: ['skeleton', 'wisp', 'ghost'], quantity: 15},
			{boss: 'balron', minions: ['skeleton'], quantity: 20}
		],
		[ // Level 8
			{minions: ['dragon', 'daemon', 'balron'], quantity: 10},
			{minions: ['warrior', 'mage', 'bard', 'druid', 'tinker', 'paladin', 'shepherd', 'ranger'], quantity: 15},
			{minions: ['gazer', 'balron'], quantity: 10},
			{boss: 'liche', minions: ['skeleton'], quantity: 20},
			{minions: ['ghost', 'wisp'], quantity: 20},
			{minions: ['lavaLizards'], quantity: 20}
		]		
	],

	
	generateLevel: function(depth){
		var hasRiver = Util.chance(this.WATER_CHANCE[depth-1]);
		var hasLava = Util.chance(this.LAVA_CHANCE[depth-1]);
		var mainEntrance = depth == 1;
		var areas = this.generateAreas(depth, hasLava);
		this.placeExits(areas);
		var level = {
			hasRivers: hasRiver,
			hasLava: hasLava,
			mainEntrance: mainEntrance,
			strata: 'solidRock',
			areas: areas,
			depth: depth,
			ceilingHeight: this.HEIGHT[depth-1]
		} 
		return level;
	},
	generateAreas: function(depth, hasLava){
		var bigArea = {
			x: 0,
			y: 0,
			w: this.config.LEVEL_WIDTH,
			h: this.config.LEVEL_HEIGHT
		}
		var maxDepth = this.config.SUBDIVISION_DEPTH;
		var MIN_WIDTH = this.config.MIN_WIDTH;
		var MIN_HEIGHT = this.config.MIN_HEIGHT;
		var MAX_WIDTH = this.config.MAX_WIDTH;
		var MAX_HEIGHT = this.config.MAX_HEIGHT;
		var SLICE_RANGE_START = this.config.SLICE_RANGE_START;
		var SLICE_RANGE_END = this.config.SLICE_RANGE_END;
		var areas = Splitter.subdivideArea(bigArea, maxDepth, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, SLICE_RANGE_START, SLICE_RANGE_END);
		Splitter.connectAreas(areas,3);
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			this.setAreaDetails(area, depth, hasLava);
		}
		return areas;
	},
	setAreaDetails: function(area, depth, hasLava){
		if (Util.chance(this.CAVERN_CHANCE[depth-1])){
			area.areaType = 'cavern';
			if (hasLava){
				area.floor = 'cavernFloor';
				area.cavernType = Util.randomElementOf(['rocky','bridges']);
			} else {
				if (Util.chance(this.LAGOON_CHANCE[depth-1])){
					area.floor = 'fakeWater';
				} else {
					area.floor = 'cavernFloor';
				}
				area.cavernType = Util.randomElementOf(['rocky','bridges','watery']);
			}
		} else {
			area.areaType = 'rooms';
			area.floor = 'stoneFloor';
			area.wall = Util.chance(this.WALLLESS_CHANCE[depth-1]) ? false : 'stoneWall';
			area.corridor = 'stoneFloor';
		}
		area.enemies = [];
		area.items = [];
		var randomGang = Util.randomElementOf(this.GANGS[depth-1]);
		area.enemies = randomGang.minions;
		area.enemyCount = randomGang.quantity + Util.rand(0,3);
		if (randomGang)
			area.boss = randomGang.boss;
	},
	placeExits: function(areas){
		var dist = null;
		var area1 = null;
		var area2 = null;
		var fuse = 1000;
		do {
			area1 = Util.randomElementOf(areas);
			area2 = Util.randomElementOf(areas);
			if (fuse < 0){
				break;
			}
			dist = Util.lineDistance(area1, area2);
			fuse--;
		} while (dist < (this.config.LEVEL_WIDTH + this.config.LEVEL_HEIGHT) / 3);
		area1.hasExit = true;
		area2.hasEntrance = true;
	}
}

module.exports = FirstLevelGenerator;