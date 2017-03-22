"use strict";
var ld = require('lodash');
var Ship = require('./ship.js');
var HIT = 'hit';
var MISS = 'miss';

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
	deployShip:function(ship,position,game,alignment){
		var selectedShip = this.fleet[ship];
		var allPosition = selectedShip.getAllPositionOfShip(position,alignment);
		var isPositionUsed = ld.intersection(this.usedPositions,allPosition).length;
		if(!game.validatePosition(allPosition))
			throw new Error('Position Not Valid.');
		else if(isPositionUsed>0)
			throw new Error('Position is already used');
		else if(selectedShip.positions.length!=0)
		 	throw new Error('Can not afford more Ships');
		else{
			this.usedPositions=this.usedPositions.concat(allPosition);
			selectedShip.setPosition(allPosition,alignment);
			return true;
		}
	},
	shoot : function(opponentPlayer,position,game,saveShotResult = ()=>{}){
		var boardStatus = this.getBoardStatus();
		if(!this.isAlive)
			return 'miss';
		if(!this.readyState)
			throw new Error('Not announced ready');
		if(game.turn != this.playerId)
			throw new Error('Opponent turn');
		if(!game.validatePosition(position.split(' ')))
			throw new Error('Invalid position');
		var shotResult = this.evaluateShot(opponentPlayer,position,game);
		var entry = {player_id:this.playerId,game_id:game.gameId,
			boardStatus:JSON.stringify(boardStatus),
			currentHitPosition:this.convertToNumeric(position),
			shotResult:shotResult.statusCode,
			isBot:this.isBot()
		};
		console.log(this.playerId,position);
		saveShotResult(entry);
		game.turn = opponentPlayer.playerId;
		return shotResult.status;
	},
	evaluateShot:function (opponentPlayer,position,game) {
		var index = opponentPlayer.usedPositions.indexOf(position);
		var shotResult = {status:MISS,statusCode:0};
		if(index!= -1){
			var hittedShip = game.destroy(opponentPlayer,position);
			if(opponentPlayer.fleet[hittedShip].isSunk())
				opponentPlayer.sunkShips.push(hittedShip);
			if(opponentPlayer.sunkShips.length==5)
				opponentPlayer.isAlive = false;
			this.hit.push(position);
			shotResult = {status:HIT,statusCode:1};
		}
		else{
			this.miss.push(position);
		}
		return shotResult;
	},
	ready:function(game,savePlacments = ()=>{}){
		if(this.usedPositions.length!=17)
			throw new Error ('Can not announce READY');
		this.readyState=true;
		game.readyPlayers.push(this.playerId);
		if (ld.uniq(game.readyPlayers).length==2){
			game.turn = ld.first(game.readyPlayers);
		};
		var entry = {player_id:this.playerId,
			game_id:game.gameId,
			placing_position:JSON.stringify(ld.values(this.fleet)),
			isBot:this.isBot()
		};
		savePlacments(entry);
	},
	isBot:function () {
		return !!this.name.match('BotPlayer'); //Dirty Hack
	}, 
	removeDamagePosition:function(position){
		ld.remove(this.usedPositions,function(pos){
			return pos==position;
		});
	},
	convertToNumeric:function (position) {
		var split = position.split('');
		var asciiValueOfA = 65;
		var char = ld.first(split).charCodeAt() - asciiValueOfA;
		return char*10 +  parseInt(position.slice(1)) - 1;
	},
	getBoardStatus:function() {
		var board = new Array(100);
		board = ld.fill(board,0);
    	var hitIndexes = this.hit.map(this.convertToNumeric);
    	var missIndexes = this.miss.map(this.convertToNumeric);
    	board = board.map(function (val,index) {
    		if (hitIndexes.indexOf(index)>-1) return 1;
    		if (missIndexes.indexOf(index)>-1) return 2;
    		return 0;
    	});
		return board;
	}
};

module.exports = Player;