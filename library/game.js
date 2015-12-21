"use strict";
var sh = {};
var ld = require('lodash');
var Events=require("events").EventEmitter;
exports.sh = sh;

var emitter=new Events();

sh.inRange = function(pos){
	return ld.inRange(parseInt(pos.slice(1)),1,11) && ld.inRange(pos[0].charCodeAt(),65,75);
};
sh.notDeployedDiagonally = function(position){
	return function(pos){
		return (position[0][0]==pos[0]) || (parseInt(pos.slice(1))==+position[0].slice(1));
	};
};

var is_equal_to_range=function(pos){
	pos=pos.sort(function(a,b){return a-b;});
	var range=ld.range(pos[0],ld.last(pos)+1,1);
	return pos.toString()==range.toString();
};

sh.is_in_sequence=function(position){
	var alphabet=[],numbers=[];
	position.forEach(function(e){
		alphabet.push(e[0].charCodeAt());
		numbers.push(+e.slice(1));
	});
	if(ld.uniq(numbers).length==1)
		return is_equal_to_range(alphabet);
	if(ld.uniq(alphabet).length==1)
		return is_equal_to_range(numbers);
	return false;
};

sh.game =  {
	validatePosition : function(position){
		var range = position.every(sh.inRange);
		var duplicate=(position.length==ld.unique(position).length);
		var sequence=sh.is_in_sequence(position);
		return range && duplicate && sequence;
	},
	validateAlignment:function(position){
		var alignment = position.every(sh.notDeployedDiagonally(position));
		return alignment;
	},
	validateSize:function(position,shipName){
		var shipsSize = {battleship:4, carrier:5, cruiser:3, destroyer:2, submarine:3};
		var validSize =(position.length == shipsSize[shipName]);
		return validSize;
	},
	allplayers:[],
};
sh.getUniqueId=(function(){
	var id = 1;
	return function(){return id++;};
})();


sh.shoot = function(opponentPlayer,position){
	if(!this.readyState)
		throw new Error('Not announced ready');
	if(sh.game.turn != this.playerId)
		throw new Error('Opponent turn');
	if(!sh.game.validatePosition(position.split(' ')))
		throw new Error('Invalid position');
	var index = opponentPlayer.usedPositions.indexOf(position);
		if(index!= -1){
			emitter.emit('HIT',opponentPlayer,position);
			this.hit=this.hit || [];
			this.hit.push(position);
			return 'hit';
		}
		else{
			emitter.emit('MISS',opponentPlayer);
			this.miss=this.miss || [];
			this.miss.push(position);
			return 'miss';
		}
};

sh.destroy = function(opponentPlayer,position){
	var hittedShip;
	var ships=['battleship','carrier','cruiser','distroyer','submarine'];
	var index = opponentPlayer.usedPositions.indexOf(position);
	delete opponentPlayer.usedPositions[index];
	opponentPlayer.usedPositions = ld.compact(opponentPlayer.usedPositions);
	for(var ship in opponentPlayer.fleet){
		if(opponentPlayer.fleet[ship].positions.indexOf(position) >= 0){
			opponentPlayer.fleet[ship].vanishedLives++;
			hittedShip=ship;
		};
	};
	return hittedShip;
};

emitter.on('HIT',function(opponentPlayer,position){
	var hittedShip =sh.destroy(opponentPlayer,position);
	if(opponentPlayer.fleet[hittedShip].isSunk()){
		opponentPlayer.sunkShips.push(hittedShip);
	if(opponentPlayer.sunkShips.length==5)
			opponentPlayer.isAlive = false;
	}
	sh.game.turn = opponentPlayer.playerId;
});
emitter.on('MISS',function(opponentPlayer){
	sh.game.turn = opponentPlayer.playerId;
});
