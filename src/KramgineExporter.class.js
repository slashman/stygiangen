function KramgineExporter(config){
	this.config = config;
}

KramgineExporter.prototype = {
	getLevel: function(level){
		var tiles = this.getTiles();
		var objects = this.getObjects(level);
		var map = this.getMap(level);
		return {
			tiles: tiles,
			objects: objects,
			map: map
		};
	},
	BASIC_WALL_TILE: {
        "w":2,
        "y":0,
        "h":2,
        "c":0,
        "f":0,
        "ch":2,
        "sl":0,
        "dir":0,
        "fy":0
    },
    BASIC_FLOOR_TILE: {
    	"w":0,
        "y":0,
        "h":2,
        "c":2,
        "f":2,
        "ch":2,
        "sl":0,
        "dir":0,
        "fy":0
    },
    WATER_TILE: {
    	"w":0,
    	"y":0,
    	"h":2,
    	"c":2,
    	"f":101,
    	"ch":2,
    	"sl":0,
    	"dir":0,
    	"fy":0
	},
	LAVA_TILE: {
    	"w":0,
    	"y":0,
    	"h":2,
    	"c":2,
    	"f":101,
    	"ch":2,
    	"sl":0,
    	"dir":0,
    	"fy":0
	},
	getTiles: function(){
		return [
	        null, 
	        this.BASIC_WALL_TILE,
	        this.BASIC_FLOOR_TILE,
	        this.BASIC_FLOOR_TILE,
	        this.BASIC_FLOOR_TILE,
	        this.BASIC_WALL_TILE,
	        this.BASIC_FLOOR_TILE,
	        this.BASIC_FLOOR_TILE,
	        this.BASIC_FLOOR_TILE,
	        this.LAVA_TILE,
	        this.WATER_TILE
		];
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
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			map[x] = [];
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y];
				var id = null;
				if (cell === 'water'){
					id = 10;
				} else if (cell === 'fakeWater'){
					id = 10;
				}else if (cell === 'solidRock'){
					id = 1;
				}else if (cell === 'cavernFloor'){
					id = 2;
				}else if (cell === 'downstairs'){
					id = 3;
				}else if (cell === 'upstairs'){
					id = 4;
				}else if (cell === 'stoneWall'){
					id = 5;
				}else if (cell === 'stoneFloor'){
					id = 6;
				}else if (cell === 'corridor'){
					id = 7;
				}else if (cell === 'bridge'){
					id = 8;
				}else if (cell === 'lava'){
					id = 9;
				}
				map[x][y] = id;
			}
		}
		return map;
	}
}

module.exports = KramgineExporter;