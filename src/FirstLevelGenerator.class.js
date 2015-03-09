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
		this.connectAreas(areas);
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
				bigArea.bridges = [];
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
				area1.bridges = [];
				areas.push(area1);
				area2.areaType = 'cavern';
				area2.areaId = 'c2'; 
				area2.bridges = [];
				areas.push(area2);
			} else {
				area1.depth = bigArea.depth +1;
				area2.depth = bigArea.depth +1;
				bigAreas.push(area1);
				bigAreas.push(area2);
			}
		}
		return areas;
	},
	connectAreas: function(areas){
		/* Make one area connected
		 * While not all areas connected,
		 *  Select a connected area
		 *  Select a valid wall from the area
		 *  Tear it down, connecting to the a nearby area
		 *  Mark area as connected
		 */
		var connectedAreas = [];
		var randomArea = Util.randomElementOf(areas);
		connectedAreas.push(randomArea);
		var cursor = {};
		var vari = {};
		while (connectedAreas.length < areas.length){
			randomArea = Util.randomElementOf(connectedAreas);
			var wallDir = Util.rand(1,4);
			switch(wallDir){
			case 1: // Left
				cursor.x = randomArea.x;
				cursor.y = Util.rand(randomArea.y, randomArea.y+randomArea.h);
				vari.x = -2;
				vari.y = 0;
				break;
			case 2: //Right
				cursor.x = randomArea.x + randomArea.w;
				cursor.y = Util.rand(randomArea.y, randomArea.y+randomArea.h);
				vari.x = 2;
				vari.y = 0;
				break;
			case 3: //Up
				cursor.x = Util.rand(randomArea.x, randomArea.x+randomArea.w);
				cursor.y = randomArea.y;
				vari.x = 0;
				vari.y = -2;
				break;
			case 4: //Down
				cursor.x = Util.rand(randomArea.x, randomArea.x+randomArea.w);
				cursor.y = randomArea.y + randomArea.h;
				vari.x = 0;
				vari.y = 2;
				break;
			}
			var connectedArea = this.getAreaAt(cursor, vari, areas);
			if (connectedArea && !Util.contains(connectedAreas, connectedArea)){
				this.connectArea(randomArea, connectedArea, cursor);
				connectedAreas.push(connectedArea);
			}
		}
	},
	getAreaAt: function(cursor, vari, areas){
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			if (cursor.x + vari.x > area.x && cursor.x + vari.x < area.x + area.w 
					&& cursor.y + vari.y > area.y && cursor.y + vari.y < area.y + area.h)
				return area;
		}
		return false;
	},
	connectArea: function(area1, area2, position){
		area1.bridges.push({
			x: position.x,
			y: position.y,
			to: area2
		});
		area2.bridges.push({
			x: position.x,
			y: position.y,
			to: area1
		});
	}
}

module.exports = FirstLevelGenerator;