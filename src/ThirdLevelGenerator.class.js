function ThirdLevelGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var CA = require('./CA');
var Splitter = require('./Splitter');

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
			if (surrounding['cavernFloor'] > 1)
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
	},
	fillWithRooms: function(level, area){
		var bigArea = {
			x: area.x,
			y: area.y,
			w: area.w,
			h: area.h
		}
		var maxDepth = 2;
		var MIN_WIDTH = 10;
		var MIN_HEIGHT = 10;
		var SLICE_RANGE_START = 3/8;
		var SLICE_RANGE_END = 5/8;
		var areas = Splitter.subdivideArea(bigArea, maxDepth, MIN_WIDTH, MIN_HEIGHT, SLICE_RANGE_START, SLICE_RANGE_END);
		Splitter.connectAreas(areas);
		var bridgeAreas = [];
		for (var i = 0; i < areas.length; i++){
			var subarea = areas[i];
			for (var j = 0; j < area.bridges.length; j++){
				var bridge = area.bridges[j];
				if (Splitter.getAreaAt(bridge,{x:0,y:0}, areas) == subarea){
					//subarea.externalConnections.push(bridge);
					bridgeAreas.push(subarea);
				}
			}
		}
		//areas = this.removeUnneededAreas(bridgeAreas, areas, 1);
		for (var i = 0; i < areas.length; i++){
			var subarea = areas[i];
			subarea.floor = area.floor;
			subarea.wall = area.wall;
			this.carveRoomAt(level, subarea);
		}
	},
	carveRoomAt: function(level, area){
		for (var x = area.x; x < area.x + area.w; x++){
			for (var y = area.y; y < area.y + area.h; y++){
				if (x == area.x || x == area.x + area.w - 1 || y == area.y || y == area.y + area.h - 1){
					level.cells[x][y] = area.wall;
				} else {
					if (area.unneeded)
						level.cells[x][y] = 'water';
					else
						level.cells[x][y] = area.floor;
				}
			}
		}
		for (var i = 0; i < area.bridges.length; i++){
			var bridge = area.bridges[i];
			level.cells[bridge.x][bridge.y] = 'water';
		}
	},
	removeUnneededAreas: function(keepAreas, areas){
		// All keep areas should be connected with a single pivot area
		var pivotArea = Util.randomElementOf(areas);
		var pathAreas = [];
		for (var i = 0; i < keepAreas.length; i++){
			var keepArea = keepAreas[i];
			var areasPath = this.getDrunkenAreasPath(keepArea, pivotArea, areas);
			//var areasPath = this.getAreasPath(keepArea, pivotArea, areas);
			for (var j = 0; j < areasPath.length; j++){
				var pathArea = areasPath[j];
				if (!Util.contains(pathAreas, pathArea)){
					pathAreas.push(pathArea);
				}
			}
		}
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			if (!Util.contains(pathAreas, area)){
				Util.removeFromArray(areas, area);
				//area.unneeded = false;
			}
		}
		return areas;
	},
	getDrunkenAreasPath: function (fromArea, toArea, areas){
		var currentArea = fromArea;
		var path = [];
		path.push(fromArea);
		path.push(toArea);
		while (true){
			var randomBridge = Util.randomElementOf(currentArea.bridges);
			if (!Util.contains(path, randomBridge.to)){
				path.push(randomBridge.to);
			}
			if (randomBridge.to == toArea)
				break;
			currentArea = randomBridge.to;
		}
		return path;
	}
	
}

module.exports = ThirdLevelGenerator;