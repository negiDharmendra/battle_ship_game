"use strict"
var sh = {};
var ld = require('lodash');
exports.sh = sh;

sh.Ship = function(name,holes){
	this.name =  name;
	this.holes = holes;
	Object.defineProperties(this,{
		name:{writable:false},
		holes:{writable:false}
	});
};

sh.Player = function(player_name){
	this.name = player_name;
	var holes = [4,5,3,2,3];
	this.fleet =[ 'battleship', 'carrier', 'cruiser', 'distroyer', 'submarine' ].map(function(name,i){
		return new sh.Ship(name,holes[i]);
	})
};

sh.Player.prototype = {
	validatePosition : function(shipName,position){
		var toCheck = position.every(function(pos){
			return ld.inRange(parseInt(pos.slice(1)),1,11) && ld.inRange(pos[0].charCodeAt(),65,75);
		});
		if(toCheck){
			return position.every(function(pos){
				return (position[0][0]==pos[0]) || (parseInt(pos.slice(1))==+position.slice(1));
			});
		};
	};
};
