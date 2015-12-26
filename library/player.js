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
		if(!this.validateAlignment(position))
			throw new Error('Can not Deploy Ship Diagonally');
		else if(!this.validatePosition(position))
			throw new Error('Position Not Valid.');
		else if(isPositionUsed>0)
			throw new Error('Position is already used');
		else if(!this.validateSize(position,ship))
			throw new Error('Ship size is not Valid');
		else if(this.fleet[ship].positions.length!=0)
		 	throw new Error('Can not afford more Ships');
		else{
			this.usedPositions=this.usedPositions.concat(position);
			this.fleet[ship].setPosition(position);
			return true;
		}
	},
	checkRange : function(pos){
		return ld.inRange(parseInt(pos.slice(1)),1,11) && ld.inRange(pos[0].charCodeAt(),65,75);
	},
	notDeployedDiagonally : function(position){
		return function(pos){
			return (position[0][0]==pos[0]) || (parseInt(pos.slice(1))==+position[0].slice(1));
		};
	},
	isEqualToRange : function(pos){
		pos=pos.sort(function(a,b){return a-b;});
		var range=ld.range(pos[0],ld.last(pos)+1,1);
		return pos.toString()==range.toString();
	},
	isInSequence : function(position){
		var alphabet=[],numbers=[];
		position.forEach(function(e){
			alphabet.push(e[0].charCodeAt());
			numbers.push(+e.slice(1));
		});
		if(ld.uniq(numbers).length==1)
			return this.isEqualToRange(alphabet);
		if(ld.uniq(alphabet).length==1)
			return this.isEqualToRange(numbers);
		return false;
	},
	validatePosition : function(position){
			var range = position.every(this.checkRange);
			var duplicate=(position.length==ld.unique(position).length);
			var sequence=this.isInSequence(position);
			return range && duplicate && sequence;
	},
	validateAlignment:function(position){
		var alignment = position.every(this.notDeployedDiagonally(position));
		return alignment;
	},
	validateSize:function(position,shipName){
		var shipsSize = {battleship:4, carrier:5, cruiser:3, destroyer:2, submarine:3};
		var validSize =(position.length == shipsSize[shipName]);
		return validSize;
	},
	ready:function(){
		if(this.usedPositions.length==17)
			emitter.emit('READY',this);
		else
			throw new Error ('Can not announce READY');
	},

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