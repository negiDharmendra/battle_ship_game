var express =  require('express');
var app = express();
var body_parser = require('./body_parser.js');
var log = require('./log.js');

var game = require('../library/game.js').sh;
var Player = require('../library/player.js');
var ld = require('lodash');
var cookie_parser = require('cookie-parser');
var players = {};


var loadUser  = function(req,res,next){
	req.user =  players[req.cookies.userName];
	next();
}

var addPlayer=function(req,res){
	var uniqueID ;
	try{
		uniqueID = req.body.name+'_'+game.getUniqueId();
		players[uniqueID] =  new Player(req.body.name);
		players[uniqueID].playerId = uniqueID;
		res.cookie('userName',uniqueID);
		res.redirect('/html/deploy.html');
		console.log("players list------->",palyers);
		var logMessage = uniqueID +'➽ has joined the game';
		log.log_message('appendFile','players.log',logMessage);
	}catch(err){
		log.log_message('appendFile','errors.log','line-44 '+uniqueID+'➽'+err.message);
		res.send();
	}

};

var holdPlayer = function(req,res){
	res.cookie('userName',req.body.name);
	res.redirect('/html/players_queue.html');
};
var inform_players = function(req,res){
	if(Object.keys(players).length >= 2)
		holdPlayer(req,res);
	else addPlayer(req,res);
};

var get_opponentPlayer = function(player_id){
	var ids = Object.keys(players);
	delete ids[ids.indexOf(player_id)];
	var id = ld.compact(ids);
	id = id.shift();
	return players[id];
};

var deployShips = function(req,res,next){
	var status = '';
	try{
		var player = req.user;
		status = player.deployShip(req.body.name,req.body.positions.trim().split(' '));
		log.log_message('appendFile','players.log',req.playerId+' has deployed his '+req.body.name);
	}catch(err){
		status = err.message;
		log.log_message('appendFile','errors.log','line-94 '+req.playerId+'➽'+err.message+' for '+req.body.name);
	}
	finally{
		res.send(JSON.stringify(status));
	};
};

var readyAnnounement = function(req,res){
	try{
		var player = req.user;
		player.ready();
		res.redirect('/html/battleship.html');
	}
	catch(err){
		log.log_message('appendFile','errors.log','line-61 '+req.playerId+'➽'+err.message);
		res.send(err.message);
	}
};


app.use(express.static('./public'));

var players = {};
app.get('/',function(req,res){
	res.redirect('/html/index.html');
});
app.use(body_parser);

app.post('/html/index.html',inform_players);
app.use(cookie_parser());
app.use(loadUser);
app.post('/html/deployShip',deployShips);
app.post('/html/deploy.html',readyAnnounement);


module.exports = app;
