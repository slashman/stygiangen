function KramgineExporter(config){
	this.config = config;
}

KramgineExporter.prototype = {
	getLevel: function(level){
		this.initTileDefs(level.ceilingHeight);
		var tiles = this.getTiles();
		var objects = this.getObjects(level);
		var map = this.getMap(level);
		return {
			tiles: tiles,
			objects: objects,
			map: map
		};
	},
	initTileDefs: function(ceilingHeight){
		this.tiles = [];
		this.tilesMap = [];
		this.tiles.push(null);
		this.ceilingHeight = ceilingHeight;
		this.addTile('STONE_WALL', 2, 0, 0);
		this.addTile('STONE_FLOOR', 0, 2, 2);
		this.addTile('BRIDGE', 0, 4, 2);
		this.addTile('WATER', 0, 101, 2);
		this.addTile('LAVA', 0, 103, 2);
	},
	addTile: function (id, wallTexture, floorTexture, ceilTexture){
		var tile = this.createTile(wallTexture, floorTexture, ceilTexture, this.ceilingHeight);
		this.tiles.push(tile);
		this.tilesMap[id] = this.tiles.length - 1;
	},
	getTile: function(id){
		return this.tilesMap[id];
	},
	createTile: function(wallTexture, floorTexture, ceilTexture, height){
		return {
			w: wallTexture,
			y: 0,
			h: height,
			f: floorTexture,
			fy: 0,
			c: ceilTexture,
			ch: height,
			sl: 0,
			dir: 0
		};
	},
	getTiles: function(){
		return this.tiles;
	},
	getObjects: function(level){
		var objects = [];
		objects.push({
			x: level.start.x + 0.5,
			z: level.start.y + 0.5,
			y: 0,
			dir: 3,
			type: 'player'
		});
		for (var i = 0; i < level.enemies.length; i++){
			var enemy = level.enemies[i];
			var enemyData =
			{
	            x: enemy.x + 0.5,
	            z: enemy.y + 0.5,
	            y: 0,
	            type: 'enemy',
	            enemy: enemy.code
	        };
			objects.push(enemyData);
		}
		for (var i = 0; i < level.items.length; i++){
			var item = level.items[i];
			var itemData =
			{
	            x: item.x + 0.5,
	            z: item.y + 0.5,
	            y: 0,
	            type: 'item',
	            item: item.code
	        };
			objects.push(itemData);
		}
		return objects;
	},
	getMap: function(level){
		var map = [];
		var cells = level.cells;
		for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
			map[y] = [];
			for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
				var cell = cells[x][y];
				var id = null;
				if (cell === 'water'){
					id = this.getTile("WATER");
				} else if (cell === 'fakeWater'){
					id = this.getTile("WATER");
				}else if (cell === 'solidRock'){
					id = this.getTile("STONE_WALL");
				}else if (cell === 'cavernFloor'){
					id = this.getTile("STONE_FLOOR");
				}else if (cell === 'downstairs'){
					id = this.getTile("STONE_FLOOR");
				}else if (cell === 'upstairs'){
					id = this.getTile("STONE_FLOOR");
				}else if (cell === 'stoneWall'){
					id = this.getTile("STONE_WALL");
				}else if (cell === 'stoneFloor'){
					id = this.getTile("STONE_FLOOR");
				}else if (cell === 'corridor'){
					id = this.getTile("STONE_FLOOR");
				}else if (cell === 'bridge'){
					id = this.getTile("BRIDGE");
				}else if (cell === 'lava'){
					id = this.getTile("LAVA");
				}
				map[y][x] = id;
			}
		}
		return map;
	}
}

module.exports = KramgineExporter;
