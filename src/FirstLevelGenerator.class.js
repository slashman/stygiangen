function FirstLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var Splitter = require('./Splitter');

FirstLevelGenerator.prototype = {
	generateLevel: function(depth){
		var hasRiver = depth < 6 && Util.chance(100 - depth * 15);
		var hasLava = depth > 5 && Util.chance(depth * 10 + 20);
		hasLava = Util.chance(50);
		hasRiver = Util.chance(50);
		
		var mainEntrance = depth == 1;
		var areas = this.generateAreas(hasLava);
		this.placeExits(areas);
		var level = {
			hasRivers: hasRiver,
			hasLava: hasLava,
			mainEntrance: mainEntrance,
			strata: 'solidRock',
			areas: areas
		}
		return level;
	},
	generateAreas: function(hasLava){
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
			if (Util.chance(70)){ //TODO: Define areas based on depth
				area.areaType = 'cavern';
				area.areaId = 'c1';
				if (hasLava){
					area.floor = 'cavernFloor';
					area.cavernType = 'rocky';
				} else {
					area.floor = Util.chance(50)?'fakeWater':'cavernFloor';
					area.cavernType = Util.chance(50) ? 'rocky' : 'watery';
				}
			} else {
				area.areaType = 'rooms';
				area.areaId = 'c1';
				area.floor = 'stoneFloor';
				area.wall = Util.chance(50) ? 'stoneWall' : false;
				area.corridor = 'stoneFloor';
			}
			area.enemies = ['bat', 'lavaLizard'];
			area.enemyCount = 5;
			area.boss = 'daemon';
			area.items = ['dagger', 'dagger', 'leatherArmor']
		}
		return areas;
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