function ThirdLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var CA = require('./CA');

ThirdLevelGenerator.prototype = {
	fillLevel: function(sketch, level){
		this.fillRooms(sketch, level)
		this.fattenCaverns(level);
		this.placeExits(sketch, level);
		this.raiseIslands(level);
		return level;
	},
	fattenCaverns: function(level){
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current === 'water')
				return false;
			if (surrounding['cavernFloor'] > 0 && Util.chance(20))
				return 'cavernFloor';
			return false;
		}, 1);
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current === 'water')
				return false;
			if (surrounding['cavernFloor'] > 0)
				return 'cavernFloor';
			return false;
		}, 1);
	},
	raiseIslands: function(level){
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'water')
				return false;
			var caverns = surrounding['cavernFloor']; 
			if (caverns > 0 && Util.chance(70))
				return 'cavernFloor';
			return false;
		}, 1, true);
	},
	fillRooms: function(sketch, level){
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			var type = area.areaType;
			if (type === 'cavern'){
				this.fillWithCavern(level, area);
			} else if (type === 'rooms'){
				this.fillWithRooms(level, area);
			}
		}
	},
	placeExits: function(sketch, level){
		for (var i = 0; i < sketch.areas.length; i++){
			var area = sketch.areas[i];
			if (!area.hasExit && !area.hasEntrance)
				continue;
			var tile = null;
			if (area.hasExit){
				tile = 'downstairs';
			}
			if (area.hasEntrance){
				tile = 'upstairs';
			}
			var freeSpot = this.getFreeSpot(level, area);
			level.cells[freeSpot.x][freeSpot.y] = tile;
		}
		// Build a small island around exits
		level.cells = CA.runCA(level.cells, function(current, surrounding){
			if (current != 'water')
				return false;
			if (surrounding['downstairs'] > 0 || surrounding['upstairs'] > 0)
				return 'cavernFloor';
			return false;
		}, 1);
		
	},
	getFreeSpot: function(level, area){
		while(true){
			var randPoint = {
				x: Util.rand(area.x, area.x+area.w-1),
				y: Util.rand(area.y, area.y+area.h-1)
			}
			var cell = level.cells[randPoint.x][randPoint.y]; 
			if (cell == area.floor || cell == 'water')
				return randPoint;
		}
	},
	fillWithCavern: function(level, area){
		// Connect all bridges with midpoint
		var midpoint = {
			x: Math.round(Util.rand(area.x + area.w * 1/3, area.x+area.w * 2/3)),
			y: Math.round(Util.rand(area.y + area.h * 1/3, area.y+area.h * 2/3))
		}
		for (var i = 0; i < area.bridges.length; i++){
			var bridge = area.bridges[i];
			var line = Util.line(midpoint, bridge);
			for (var j = 0; j < line.length; j++){
				var point = line[j];
				var currentCell = level.cells[point.x][point.y];
				if (currentCell != 'water' /*|| Util.chance(30)*/)
					level.cells[point.x][point.y] = area.floor;
			}
		}
		// Scratch the area
		var scratches = Util.rand(2,4);
		var caveSegments = [];
		caveSegments.push(midpoint);
		for (var i = 0; i < scratches; i++){
			var p1 = Util.randomElementOf(caveSegments);
			if (caveSegments.length > 1)
				Util.removeFromArray(caveSegments, p1);
			var p2 = {
				x: Util.rand(area.x, area.x+area.w-1),
				y: Util.rand(area.y, area.y+area.h-1)
			}
			caveSegments.push(p2);
			var line = Util.line(p2, p1);
			for (var j = 0; j < line.length; j++){
				var point = line[j];
				var currentCell = level.cells[point.x][point.y];
				if (currentCell != 'water' /*|| Util.chance(30)*/)
					level.cells[point.x][point.y] = area.floor;
			}
		}
	}
}

module.exports = ThirdLevelGenerator;