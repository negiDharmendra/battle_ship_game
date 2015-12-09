var fs = require('fs');
var ld = require('lodash');
var battleship = require('./battleship.js').sh;
var cookiehandler = require('./cookieshandler.js');
var dataParser=require('../server/requestDataParser.js');
var players ={};

var page_not_found = function(req,res){
	res.writeHead(404,{'Content-Type':'text/html'});
	res.end('Page Not Found');
};

var serveStaticFile = function(req,res,next){
	fs.readFile(req.url,function(err,data){
		if(data)
			res.end(data);
		else
			next();
	});
};

var bad_request=function(req,res,next){
	res.writeHead(400,{'Content-Type':'text/html'});
	res.end('Bad Request');
};

var addPlayer=function(req,res){
	try{
		var uniqueID = battleship.getUniqueId();
		players[req.data.name+'_'+uniqueID] =  new battleship.Player(req.data.name);
		players[req.data.name+'_'+uniqueID].playerId = req.data.name+'_'+uniqueID;
		res.writeHead(301,{
			'Location':'deploy.html',
			'Content-Type':'text/html',
			'Set-Cookie':'name='+req.data.name+'_'+uniqueID});
	}catch(err){
		console.log(err.message);
	}
	finally{
		res.end();
	}
};

var readyAnnounement = function(req,res){
	try{
	var player = get_player(req.playerId);
	player.ready();
	res.writeHead(301,{
		'Location':'battleship.html',
		'Content-Type':'text/html'});
	}
	catch(e){
		console.log(e.message);
	}
	finally{
		res.end();
	}
};

var holdPlayer = function(req,res){
	res.writeHead(301,{
			'Location':'players_queue.html',
			'Content-Type':'text/html',
			'Set-Cookie':'name='+req.data.name});
	res.end();
};
var respondToPlayerInQueue = function(req,res){
	var noOfPlayers = Object.keys(players).length;
	if(noOfPlayers < 2)
		res.end('true');
	else
		res.end('false');
};
var inform_players = function(req,res){
	if(Object.keys(players).length >= 2)
		holdPlayer(req,res);
	else addPlayer(req,res);
};

var deployShips = function(req,res,next){
	var status = '';
	try{
		var player = get_player(req.playerId);
		status = player.deployShip(req.data.name,req.data.positions.trim().split(' '));
	}catch(e){
		status = e.message;
	}
	finally{
		res.end(JSON.stringify(status));
	}
};


var deliver_latest_updates = function(req,res){
	try{
		var updates = {position:[],gotHit:[],turn:''};
		var player = get_player(req.playerId);
		var opponentPlayer=get_opponentPlayer(req.playerId) || {isAlive:true};
		var activePlayer = get_player(battleship.game.turn);
		if(player && player.readyState){
			for(var ship in player.fleet)
				updates.position=updates.position.concat(player.fleet[ship].onPositions);
			updates.position = ld.compact(updates.position);
		 	updates.gotHit = ld.difference(updates.position,player.usedPositions);
		 	updates.turn = activePlayer?activePlayer.playerId :null;
		 	updates.gameEnd={player:player.isAlive,opponentPlayer:opponentPlayer.isAlive};
		}
	 	res.end(JSON.stringify(updates));
	}catch(e){
		console.log(e.message);
	}
	finally{
		res.end();
	};
};

var serveShipInfo = function(req,res){
	try{
		var player = get_player(req.playerId);
		var fleetStatus={};
		for(var ship in player.fleet){
			var ship_status = player.fleet[ship].isSunk();
			var hits = player.fleet[ship].hittedHoles;
			fleetStatus[ship] = {hits:hits,status:ship_status};
		}
		res.end(JSON.stringify(fleetStatus));
	}
	catch(e){
		console.log(e.message);
	}
	finally{
		res.end();
	}
}

var validateShoot = function(req,res){
	var status = {};
	try{
		var opponentPlayer = get_opponentPlayer(req.playerId);
		var player = get_player(req.playerId);
		status.reply = battleship.shoot.call(player,opponentPlayer,req.data.position);
		if(!opponentPlayer.isAlive)
			status.end='You won the Game '+player.name;
	}catch(e){
		status.error = e.message;
	};
	res.end(JSON.stringify(status));
};

var get_opponentPlayer = function(player_id){
	var ids = Object.keys(players);
	delete ids[ids.indexOf(player_id)];
	var id = ld.compact(ids);
	id = id.shift();
	return players[id];
};

var get_player=function(id){
	return players[id];
};

var autheniction=function(req,res,next){
	cookiehandler.validateUser(req,res,next,players);
}
var respondToRestartGame = function(req,res){
	var playerId = req.playerId;
	var playerName = players[playerId].name;
	players[playerId] =  new battleship.Player(playerName);
	players[playerId].playerId = playerId;
	battleship.game.turn=null;
	res.writeHead(301,{
		'Location':'deploy.html',
		'Content-Type':'text/html'});
	res.end();
};
var respondToQuitGame = function(req,res){
	var playerId = req.playerId;
	delete players[playerId];
	res.writeHead(301,{
		'Location':'/',
		'Content-Type':'text/html'});
	res.end();
};

function getMyshootPositions(req,res){
	var status={hit:[],miss:[]};
	try{
		var player=get_player(req.playerId);
		status.hit=player.hit || [];
		status.miss=player.miss || [];
	}catch(e){
		console.log(e.message);
	}
	finally{
	res.end(JSON.stringify(status));
	}
};
function serveIndexFile(req,res){
	res.writeHead(301,{Location:'html/index.html','Content-Type':'text/html'});
	res.end();
};


exports.post_handlers = [
	{path : ''						   ,handler : dataParser.requestDataParser},
	{path : '^public/html/index.html$' ,handler : inform_players},
	{path : '^public/html/players_queue.html$',  handler : inform_players},
	{path : ''						  									 ,handler : autheniction},
	{path : '^public/html/restartGame$',handler : respondToRestartGame},
	{path : '^public/html/quitGame$'   ,handler : respondToQuitGame},
	{path : '^public/html/deployShip$' ,handler : deployShips},
	{path : '^public/html/deploy.html$',handler : readyAnnounement},
	{path : '^public/html/shoot$'	   ,handler : validateShoot},
	{path : '^public/html/shipInfo$'   ,handler : serveShipInfo},
	{path : ''						   ,handler : bad_request}
];
exports.get_handlers = [
	{path : '^public/$', handler: serveIndexFile},
	{path : '^public/html/queryGameOver$',handler : respondToPlayerInQueue},
	{path : ''						   ,handler : dataParser.requestDataParser},
	{path : ''						   ,handler : serveStaticFile},
	{path : ''						   ,handler : autheniction},
	{path : '^public/html/get_updates$',handler : deliver_latest_updates},
	{path : '^public/html/myShootPositions$',handler : getMyshootPositions},
	{path : ''						   ,handler : page_not_found}
];
