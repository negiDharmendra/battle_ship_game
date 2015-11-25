"use strict"
var sh = {};
var ld = require('lodash');
var Events=require("events").EventEmitter;
exports.sh = sh;

var emitter=new Events();

sh.Ship = function(name,holes){
	this.name =  name;
	this.holes = holes;
	Object.defineProperties(this,{
		name:{writable:false},
		holes:{writable:false}
	});
};

sh.Ship.prototype = {
	hittedHoles :0,
	isSunk : function() {
		return this.hittedHoles==this.holes;
	}
};

sh.Player = function(player_name){
	var self=this;
	this.name = player_name;
	var holes = [4,5,3,2,3];
	var ships=['battleship','carrier','cruiser','destroyer','submarine'];
	this.fleet={};
	ships.forEach(function(ship,i){
		self.fleet[ship]= new sh.Ship(ship,holes[i]);
	});
	Object.defineProperty(this,'usedPositions',{value:[],enumerable:false,writable:true});
};


sh.Player.prototype = {
	deployShip:function(ship,position){
		var isPositionUsed = ld.intersection(this.usedPositions,position).length;
		if(!sh.observer.validateAlignment(position))
			throw new Error('Can not Deploy Ship Diagonally');
		else if(!sh.observer.validatePosition(position))
			throw new Error('Position Not Valid.');
		else if(isPositionUsed>0)
			throw new Error('Position is already used');
		else if(!sh.observer.validateSize(position,ship))
			throw new Error('Ship size is not Valid');
		else{
			this.usedPositions=this.usedPositions.concat(position);
			this.fleet[ship].onPositions=position;
			return true;
		}
	},
	ready:function(){
		if(this.usedPositions.length==17)
			emitter.emit('READY',this);
		else
			throw new Error ('Can not announce READY');
	}
};

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

sh.observer =  {
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

emitter.on('READY',function(player){
	var allplayers=sh.observer.allplayers;
	allplayers.push(player.playerId);
	if (ld.uniq(allplayers).length==2){
		sh.observer.turn = allplayers[0];
		return ['Start','the','game',allplayers[0]].join(' ');
	};
});

sh.shoot = function(opponentPlayer,position){
	if(sh.observer.turn != this.playerId)
		throw new Error('Opponent turn');
	if(!sh.observer.validatePosition(position.split(' ')))
		throw new Error('Invalid position');	
	var index = opponentPlayer.usedPositions.indexOf(position);
		if(index!= -1)
			emitter.emit('HIT',opponentPlayer,position);
		else
			emitter.emit('MISS',opponentPlayer);
};

var destroy = function(opponentPlayer,position){
	var hittedShip;
	var ships=['battleship','carrier','cruiser','distroyer','submarine'];
	var index = opponentPlayer.usedPositions.indexOf(position);
	delete opponentPlayer.usedPositions[index];
	opponentPlayer.usedPositions = ld.compact(opponentPlayer.usedPositions);
	for(var ship in opponentPlayer.fleet){
		if(opponentPlayer.fleet[ship].onPositions.indexOf(position) >= 0){
			opponentPlayer.fleet[ship].hittedHoles++;
			hittedShip=ship;
		};
	};
	return hittedShip;
};

emitter.on('HIT',function(opponentPlayer,position){
	var hittedShip =destroy(opponentPlayer,position);
	if(opponentPlayer.fleet[hittedShip].isSunk() && (opponentPlayer.usedPositions.length==0)){
			console.log('Game Over');
			//process.exit(0);
	}
	sh.observer.turn = opponentPlayer.playerId;
});
emitter.on('MISS',function(opponentPlayer){
	sh.observer.turn = opponentPlayer.playerId;
});
