function VeinGenerator(config){
	this.config = config;
}

var Util = require('./Utils');
var Level = require('./Level.class');
var CA = require('./CA');

VeinGenerator.prototype = {
	traceVeins: function(sketch, level){
		var veinMap = this.createVeinMap(sketch, level);
		this.seedVeins(veinMap);
		veinMap = this.growVeins(veinMap);
		this.applyVeins(level, veinMap);
	},
	createVeinMap: function(sketch, level){
		var ret = [];
		for (var x = 0; x < level.cells.length; x++){
			ret[x] = [];
			for (var y = 0; y < level.cells[x].length; y++){
				ret[x][y] = sketch.strata;
			}
		}
		return ret;
	},
	seedVeins: function(veinMap){
		var seeds = (veinMap.length * veinMap[0].length) / 16;
		for (var i = 0; i < seeds; i++){
			var point = {
				x: Math.round(Util.rand(1, veinMap.length-2)),
				y: Math.round(Util.rand(1, veinMap[0].length-2))
			}
			var mineral = Util.rand(1,2);
			switch (mineral){
			case 1:
				veinMap[point.x][point.y] = 'grayRock';
				break;
			case 2:
				veinMap[point.x][point.y] = 'darkRock';
				break;
			}
		}
	},
	growVeins: function(veinMap){
		veinMap = CA.runCA(veinMap, function(current, surrounding){
			if (surrounding['grayRock'] > 0 && Util.chance(80))
				return 'grayRock';
			return false;
		}, 3, true);
		veinMap = CA.runCA(veinMap, function(current, surrounding){
			if (surrounding['darkRock'] > 0 && Util.chance(80))
				return 'darkRock';
			return false;
		}, 3, true);
		return veinMap;
	},
	applyVeins: function(level, veinMap){
		for (var x = 0; x < level.cells.length; x++){
			for (var y = 0; y < level.cells[x].length; y++){
				if (level.cells[x][y] == 'solidRock'){
					level.cells[x][y] = veinMap[x][y];
				}
			}
		}
	}
}

module.exports = VeinGenerator;