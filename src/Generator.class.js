function Generator(config){
	this.config = config;
	this.firstLevelGenerator = new FirstLevelGenerator(config);
	this.secondLevelGenerator = new SecondLevelGenerator(config);
	this.thirdLevelGenerator = new ThirdLevelGenerator(config);
	this.monsterPopulator = new MonsterPopulator(config);
}

var FirstLevelGenerator = require('./FirstLevelGenerator.class');
var SecondLevelGenerator = require('./SecondLevelGenerator.class');
var ThirdLevelGenerator = require('./ThirdLevelGenerator.class');
var MonsterPopulator = require('./MonsterPopulator.class');

Generator.prototype = {
	generateLevel: function(depth){
		var sketch = this.firstLevelGenerator.generateLevel(depth);
		var level = this.secondLevelGenerator.fillLevel(sketch);
		this.thirdLevelGenerator.fillLevel(sketch, level);
		this.monsterPopulator.populateLevel(sketch, level);
		return {
			sketch: sketch,
			level: level
		}
	}
}

module.exports = Generator;