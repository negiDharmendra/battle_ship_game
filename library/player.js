"use strict";
var ld = require('lodash');
var Events=require("events").EventEmitter;
var Ship = require('./ship.js');

var emitter=new Events();

var Player = function(player_name){
	var self=this;
	this.name = player_name;
	var holes = [4,5,3,2,3];
	this.isAlive = true;
	var ships=['battleship','carrier','cruiser','destroyer','submarine'];
	this.hit = [];
	this.miss = [];
	this.fleet={};
	ships.forEach(function(ship,i){
		self.fleet[ship]= new Ship(ship,holes[i]);
	});
	Object.defineProperty(this,'usedPositions',{value:[],enumerable:false,writable:true});
	Object.defineProperty(this,'sunkShips',{value:[],enumerable:false,writable:true});
	Object.defineProperty(this,'readyState',{value:false,enumerable:false,writable:true});
	Object.defineProperty(this,'isAlive',{enumerable:false,writable:true});
};



Player.prototype = {
	getAllPositionOfShip : function(ship,position,alignment){
		var fleet = {battleship:4,cruiser:3,submarine:3,destroyer:2,carrier:5};
		var allPosition =[];
		for (var i = 0; i < fleet[ship]; i++) {
			if(alignment=='horizontal')
				allPosition.push(position[0]+(parseInt(position.slice(1))+i).toString());
			if(alignment=='vertical')
				allPosition.push(String.fromCharCode(position[0].charCodeAt()+i)+position.slice(1));
		};
		return allPosition;
	},
	deployShip:function(ship,position,game,alignment){
		var allPosition = this.getAllPositionOfShip(ship,position,alignment);
		var isPositionUsed = ld.intersection(this.usedPositions,allPosition).length;
		if(!game.validatePosition(allPosition))
			throw new Error('Position Not Valid.');
		else if(isPositionUsed>0)
			throw new Error('Position is already used');
		else if(this.fleet[ship].positions.length!=0)
		 	throw new Error('Can not afford more Ships');
		else{
			this.usedPositions=this.usedPositions.concat(allPosition);
			this.fleet[ship].setPosition(allPosition);
			return true;
		}
	},
	shoot : function(opponentPlayer,position,game){
		if(!this.isAlive)
			return 'miss';
		if(!this.readyState)
			throw new Error('Not announced ready');
		if(game.turn != this.playerId)
			throw new Error('Opponent turn');
		if(!game.validatePosition(position.split(' ')))
			throw new Error('Invalid position');
		var index = opponentPlayer.usedPositions.indexOf(position);
			if(index!= -1){
				emitter.emit('HIT',opponentPlayer,position,game);
				this.hit.push(position);
				return 'hit';
			}
			else{
				emitter.emit('MISS',opponentPlayer,game);
				this.miss.push(position);
				return 'miss';
			}
	},
	ready:function(game){
		if(this.usedPositions.length==17)
			emitter.emit('READY',this,game);
		else
			throw new Error ('Can not announce READY');
	},
	removeDamagePosition:function(position){
		ld.remove(this.usedPositions,function(pos){
			return pos==position;
		});
	}
};


emitter.on('HIT',function(opponentPlayer,position,game){
	var hittedShip = game.destroy(opponentPlayer,position);
	if(opponentPlayer.fleet[hittedShip].isSunk())
		opponentPlayer.sunkShips.push(hittedShip);
	if(opponentPlayer.sunkShips.length==5)
			opponentPlayer.isAlive = false;
	game.turn = opponentPlayer.playerId;
});
emitter.on('MISS',function(opponentPlayer,game){
	game.turn = opponentPlayer.playerId;
});


emitter.on('READY',function(player,game){
	player.readyState=true;
	game.readyPlayers.push(player.playerId);
	if (ld.uniq(game.readyPlayers).length==2){
		game.turn = ld.first(game.readyPlayers);
	};
});

module.exports = Player;