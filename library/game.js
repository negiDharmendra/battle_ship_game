var ld = require('lodash');
var Game = function (player) {
	this.players = {};
	this.players[player.playerId] = player;
	this.turn = null;
	this.readyPlayers =[];
};

Game.prototype = {
	status:function(player){
		var players = Object.keys(this.players);
		var self = this;
		var playerStatus = players.some(function(player){
			return self.players[player].isAlive == false;
		});
		if(playerStatus)
			return('Game Over');
		else if(players.length==1)
			return('Initialized');
		else if(players.length==2)
			return('Running');
	},
	addPlayer:function(player){
		if(Object.keys(this.players).length<2)
			this.players[player.playerId] = player;
		else
			throw new Error('Can not join the running game');
	},
	getPlayer:function(id) {
		if(id in this.players)
			return this.players[id];
		else
			throw new Error('player is unauthorized');
	},
	getOpponentplayer:function(id) {
		if(id in this.players){
			var opponentplayerId = ld.remove(Object.keys(this.players),function(key){
				return id != key;
			});
			return this.players[ld.first(opponentplayerId)];
		};
		throw new Error('player is unauthorized');
	},
	validatePosition : function(position){
		var range = position.every(this.inRange);
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
	inRange: function(pos){
		return ld.inRange(parseInt(pos.slice(1)),1,11) && ld.inRange(pos[0].charCodeAt(),65,75);
	},
	notDeployedDiagonally: function(position){
		return function(pos){
			return (position[0][0]==pos[0]) || (parseInt(pos.slice(1))==+position[0].slice(1));
		};
	},
	isEqualToRange:function(pos){
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
	destroy : function(opponentPlayer,position){
		var hittedShip;
		opponentPlayer.removeDamagePosition(position);
		for(var ship in opponentPlayer.fleet){
			hittedShip = opponentPlayer.fleet[ship].gotHit(position);
			if(hittedShip)return hittedShip;
		};
	},
	getUpdates:function(playerId){
		var updates = {positions:[],ships:[],gotHit:[],turn:'',gameEnd:null};
		var player = this.getPlayer(playerId);
		var shipInfo = this.serveShipInfo(playerId);
		var opponentPlayer = this.getOpponentplayer(playerId) || {isAlive:true};
		if(player){
			for(var ship in player.fleet){
				updates.positions=updates.positions.concat(player.fleet[ship].positions);
				if(player.fleet[ship].positions.length>0)
					updates.ships.push(ship);
			}
			updates.positions = ld.compact(updates.positions);
		 	updates.gotHit = ld.difference(updates.positions,player.usedPositions);
		 	updates.turn = this.turn;
		 	if(!player.isAlive||!opponentPlayer.isAlive)
		 		updates.gameEnd = player.isAlive;
		}
		return updates;
	},
	serveShipInfo : function(playerId) {
    	var player = this.getPlayer(playerId);
        var fleetStatus = {};
        for (var ship in player.fleet) {
            var shipStatus = player.fleet[ship].isSunk();
            var hits = player.fleet[ship].vanishedLives;
            fleetStatus[ship] = {
                hits: hits,
                status: shipStatus
            };
        };
        return fleetStatus;
	},
	deletePlayer:function(id){
		var playerId = ld.remove(this.readyPlayers,function(key){
				return id == key;
			});
		return delete this.players[id];
	}
};

module.exports = Game;