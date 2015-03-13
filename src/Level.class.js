function Level(config){
	this.config = config;
};

Level.prototype = {
	init: function(){
		this.cells = [];
		this.enemies = [];
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			this.cells[x] = [];
		}
	},
	addEnemy: function(enemy, x, y){
		this.enemies.push({
			code: enemy,
			x: x,
			y: y
		});
	}
};

module.exports = Level;