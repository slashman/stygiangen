function FirstLevelGenerator(config){
	this.config = {
		MIN_WIDTH: 32,
		MIN_HEIGHT: 32,
		LEVEL_WIDTH: 64,
		LEVEL_HEIGHT: 64,
		SUBDIVISION_DEPTH: 3,
		SLICE_RANGE_START: 3/8,
		SLICE_RANGE_END: 5/8,
	}
	if (config)
		this.config = config;
}

var Util = require('./Utils');

FirstLevelGenerator.prototype = {
	generateLevel: function(depth){
		var hasRiver = depth < 6 && Util.chance(100 - depth * 15);
		var hasLava = depth > 5 && Util.chance(depth * 10 + 20);
		var mainEntrance = depth == 1;
		var areas = this.generateAreas();
		var level = {
			hasRiver: hasRiver,
			hasLava: hasLava,
			mainEntrance: mainEntrance,
			areas: areas
		}
		return level;
	},
	generateAreas: function(){
		var maxDepth = this.config.SUBDIVISION_DEPTH;
		var areas = [];
		var bigArea = {
			x: 0,
			y: 0,
			w: this.config.LEVEL_WIDTH,
			h: this.config.LEVEL_HEIGHT,
			depth: 0
		}
		var MIN_WIDTH = this.config.MIN_WIDTH;
		var MIN_HEIGHT = this.config.MIN_HEIGHT;
		var salt = Util.rand(0,3);
		var bigAreas = [];
		bigAreas.push(bigArea);
		while (bigAreas.length > 0){
			var bigArea = bigAreas.pop();
			var horizontalSplit = Util.chance(50);
			if (bigArea.w < MIN_WIDTH && bigArea.h < MIN_HEIGHT){
				bigArea.areaType = 'cavern';
				bigArea.areaId = 'c1'; 
				areas.push(bigArea);
				continue;
			} 
			if (bigArea.w < MIN_WIDTH){
				horizontalSplit = true;
			} else if (bigArea.h < MIN_HEIGHT){
				horizontalSplit = false;
			}
			var area1 = null;
			var area2 = null;
			if (horizontalSplit){
				var slice = Math.round(Util.rand(bigArea.h * this.config.SLICE_RANGE_START, bigArea.h * this.config.SLICE_RANGE_END));
				area1 = {
					x: bigArea.x,
					y: bigArea.y,
					w: bigArea.w,
					h: slice-1
				};
				area2 = {
					x: bigArea.x,
					y: bigArea.y+slice,
					w: bigArea.w,
					h: bigArea.h - slice
				}
			} else {
				var slice = Math.round(Util.rand(bigArea.w * this.config.SLICE_RANGE_START, bigArea.w * this.config.SLICE_RANGE_END));
				area1 = {
					x: bigArea.x,
					y: bigArea.y,
					w: slice-1,
					h: bigArea.h
				}
				area2 = {
					x: bigArea.x+slice,
					y: bigArea.y,
					w: bigArea.w-slice,
					h: bigArea.h
				};
			}
			if (bigArea.depth == maxDepth){
				area1.areaType = 'cavern';
				area1.areaId = 'c1'; 
				areas.push(area1);
				area1.areaType = 'cavern';
				area1.areaId = 'c2'; 
				areas.push(area2);
			} else {
				area1.depth = bigArea.depth +1;
				area2.depth = bigArea.depth +1;
				bigAreas.push(area1);
				bigAreas.push(area2);
			}
		}
		return areas;
	}

}

module.exports = FirstLevelGenerator;