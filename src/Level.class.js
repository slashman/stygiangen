function Level(config){
	this.config = config;
};

Level.prototype = {
	init: function(){
		this.cells = [];
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			this.cells[x] = [];
		}
	}
};

module.exports = Level;