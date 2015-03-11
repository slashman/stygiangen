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
		this.useAreas(bridgeAreas, areas, bigArea);
		for (var i = 0; i < areas.length; i++){
			var subarea = areas[i];
			if (!subarea.render)
				continue;
			subarea.floor = area.floor;
			subarea.wall = area.wall;
			this.carveRoomAt(level, subarea);
		}
		//TODO: Link bridge subareas with adjacent areas
	},
	carveRoomAt: function(level, area){
		// Trace corridors from exits
		for (var i = 0; i < area.bridges.length; i++){
			var bridge = area.bridges[i];
			if (bridge.x == area.x){
				// Left Corridor
				for (var j = bridge.x; j < bridge.x + area.w / 2; j++){
					level.cells[j][bridge.y] = area.floor;
				}
			} else if (bridge.x == area.x + area.w){
				// Right corridor
				for (var j = bridge.x; j >= bridge.x - area.w / 2; j--){
					level.cells[j][bridge.y] = area.floor;
				}
			} else if (bridge.y == area.y){
				// Top corridor
				for (var j = bridge.y; j < bridge.y + area.h / 2; j++){
					level.cells[bridge.x][j] = area.floor;
				}
			} else {
				// Down Corridor
				for (var j = bridge.y; j >= bridge.y - area.h / 2; j--){
					level.cells[bridge.x][j] = area.floor;
				}
			}
		}
		var padx = 0;
		if (area.w > 5)
			padx = Math.round(Util.rand(0, area.w /6));
		var pady = 0;
		if (area.h > 5)
			pady = Math.round(Util.rand(0, area.h /6));
		padx = 0;
		pady = 0;
		var roomx = area.x + padx;
		var roomy = area.y + pady;
		var roomw = area.w - 2 * padx;
		var roomh = area.h - 2 * pady;
		for (var x = roomx; x < roomx + roomw; x++){
			for (var y = roomy; y < roomy + roomh; y++){
				if (x == roomx || x == roomx + roomw - 1 || y == roomy || y == roomy + roomh - 1){
					if (level.cells[x][y] != area.floor)
						level.cells[x][y] = area.wall;
				} else {
					if (area.unneeded)
						level.cells[x][y] = 'water';
					else
						level.cells[x][y] = area.floor;
				}
			}
		}
		
	},
	useAreas: function(keepAreas, areas, bigArea){
		// All keep areas should be connected with a single pivot area
		var pivotArea = Splitter.getAreaAt({x: Math.round(bigArea.x + bigArea.w/2), y: Math.round(bigArea.y + bigArea.h/2)},{x:0,y:0}, areas);
		pivotArea.unneeded = true;
		var pathAreas = [];
		for (var i = 0; i < keepAreas.length; i++){
			var keepArea = keepAreas[i];
			keepArea.render = true;
			var areasPath = this.getDrunkenAreasPath(keepArea, pivotArea, areas);
			for (var j = 0; j < areasPath.length; j++){
				areasPath[j].render = true;
			}
		}
		for (var i = 0; i < areas.length; i++){
			var area = areas[i];
			if (!area.render){
				bridgesRemove: for (var j = 0; j < area.bridges.length; j++){
					var bridge = area.bridges[j];
					for (var k = 0; k < bridge.to.bridges.length; k++){
						var sourceBridge = bridge.to.bridges[k];
						if (sourceBridge.x == bridge.x && sourceBridge.y == bridge.y){
							Util.removeFromArray(bridge.to.bridges, sourceBridge);
						}
					}
				}
			}
		}
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