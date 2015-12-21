var Ship = function(name,lives){
	Object.defineProperties(this,{
		'name':{value:name,writable:false,enumerable:true,configurable:false},
		'lives':{value:lives,writable:false,enumerable:false,configurable:false}
	});
};
Ship.prototype = {
	positions:[],
	vanishedLives:0,
	setPosition:function(positions){
		this.positions = positions;
	},
	isSunk:function(){
		return this.vanishedLives==this.lives;
	}
}
module.exports = Ship;