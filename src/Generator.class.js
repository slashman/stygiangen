function Generator(config){
	this.config = config;
	this.firstLevelGenerator = new FirstLevelGenerator(config);
}

var FirstLevelGenerator = require('./FirstLevelGenerator.class');

Generator.prototype = {
	generateLevel: function(depth){
		var level = this.firstLevelGenerator.generateLevel(depth);
		return level;
	},
	drawLevel: function(level, canvas){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 2;
		for (var i = 0; i < level.areas.length; i++){
			var area = level.areas[i];
			context.beginPath();
			context.rect(area.x * zoom, area.y * zoom, (area.w - 1) * zoom, (area.h-1) * zoom);
			context.fillStyle = 'yellow';
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = 'black';
			context.stroke();
		}
	}
}

window.Generator = Generator;
module.exports = Generator;