function KramgineExporter(config){
	this.config = config;
}

KramgineExporter.prototype = {
	getLevel: function(level){
		var tiles = [];
		var objects = [];
		var map = [];
		var cells = level.cells;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			map[x] = [];
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y];
				var id = null;
				if (cell === 'water'){
					id = 0;
				} else if (cell === 'fakeWater'){
					id = 0;
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
				}
				map[x][y] = id;
			}
		}
		return {
			tiles: tiles,
			objects: objects,
			map: map
		};
	}
}

module.exports = KramgineExporter;