"use strict";
var sh = {};
var ld = require('lodash');
var Events=require("events").EventEmitter;
var sh = require('./game.js').sh;
var Ship = require('./ship.js');

var emitter=new Events();

var Player = function(player_name){
	var self=this;
	this.name = player_name;
	var holes = [4,5,3,2,3];
	this.isAlive = true;
	var ships=['battleship','carrier','cruiser','destroyer','submarine'];
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
	deployShip:function(ship,position){
		var isPositionUsed = ld.intersection(this.usedPositions,position).length;
		if(!sh.game.validateAlignment(position))
			throw new Error('Can not Deploy Ship Diagonally');
		else if(!sh.game.validatePosition(position))
			throw new Error('Position Not Valid.');
		else if(isPositionUsed>0)
			throw new Error('Position is already used');
		else if(!sh.game.validateSize(position,ship))
			throw new Error('Ship size is not Valid');
		else if(this.fleet[ship].positions.length!=0)
		 	throw new Error('Can not afford more Ships');
		else{
			this.usedPositions=this.usedPositions.concat(position);
			this.fleet[ship].setPosition(position);
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



emitter.on('READY',function(player){
	player.readyState=true;
	sh.game.allplayers.push(player.playerId);
	if (ld.uniq(sh.game.allplayers).length==2){
		sh.game.turn = sh.game.allplayers[0];
		sh.game.allplayers=[];
	};
});
module.exports = Player;