var Ship = function(name,lives){
	Object.defineProperties(this,{
		'name':{value:name,writable:false,enumerable:true,configurable:false},
		'lives':{value:lives,writable:false,enumerable:false,configurable:false}
	});
};
Ship.prototype = {
	positions:[],
	vanishedLives:0,
	setPosition:function(positions,alignment){
		this.positions = positions;
		this.alignment = alignment;
	},
	isSunk:function(){
		return this.vanishedLives==this.lives;
	},
	gotHit:function(position){
		if(this.positions.indexOf(position) >= 0){
			this.vanishedLives++;
			return this.name;
		}
	},
	getAllPositionOfShip : function(position,alignment){
		var ship = this.name;
		var fleet = {battleship:4,cruiser:3,submarine:3,destroyer:2,carrier:5};
		var allPosition =[];
		for (var i = 0; i < fleet[ship]; i++) {
			if(alignment=='horizontal')
				allPosition.push(position[0]+(parseInt(position.slice(1))+i).toString());
			if(alignment=='vertical')
				allPosition.push(String.fromCharCode(position[0].charCodeAt()+i)+position.slice(1));
		};
		return allPosition;
	}
}
module.exports = Ship;