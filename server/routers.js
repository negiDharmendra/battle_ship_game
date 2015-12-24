var express =  require('express');
var app = express();
var body_parser = require('./body_parser.js');
var log = require('./log.js');

var game = require('../library/game.js').sh;
var Player = require('../library/player.js');
var ld = require('lodash');
var cookie_parser = require('cookie-parser');


var loadUser  = function(req,res,next){
	req.user =  app.players[req.cookies.userName];
	next();
}

var addPlayer=function(req,res){
	var uniqueID ;
	try{
		uniqueID = req.body.name+'_'+game.getUniqueId();
		app.players[uniqueID] =  new Player(req.body.name);
		app.players[uniqueID].playerId = uniqueID;
		res.cookie('userName',uniqueID);
		res.redirect('/html/deploy.html');
		var logMessage = uniqueID +'➽ has joined the game';
		log.log_message('appendFile','players.log',logMessage);
	}catch(err){
		log.log_message('appendFile','errors.log','addPlayer '+uniqueID+'➽'+err.message);
		res.send();
	}

};

var holdPlayer = function(req,res){
	res.cookie('userName',req.body.name);
	res.redirect('/html/players_queue.html');
};
var inform_players = function(req,res){
	if(Object.keys(app.players).length >= 2)
		holdPlayer(req,res);
	else addPlayer(req,res);
};

var getOpponentPlayer = function(player_id){
	var ids = Object.keys(app.players);
	delete ids[ids.indexOf(player_id)];
	var id = ld.compact(ids);
	id = id.shift();
	return app.players[id];
};

var deployShips = function(req,res){
	var status = '';
	try{
		var player = req.user;
		status = player.deployShip(req.body.name,req.body.positions.trim().split(' '));
		log.log_message('appendFile','players.log',req.user.playerId+' has deployed his '+req.body.name);
	}catch(err){
		status = err.message;
		log.log_message('appendFile','errors.log','deployShip '+req.user.playerId+'➽'+err.message+' for '+req.body.name);
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
		log.log_message('appendFile','errors.log','readyAnnounement '+req.user.playerId+'➽'+err.message);
		res.send(err.message);
	}
};

var deliver_latest_updates = function(req,res){
	try{
		var updates = {position:[],gotHit:[],turn:''};
		var player = req.user;
		var opponentPlayer=getOpponentPlayer(req.user.playerId) || {isAlive:true};
		var activePlayer = app.players[game.game.turn];
		if(player && player.readyState){
			for(var ship in player.fleet)
				updates.position=updates.position.concat(player.fleet[ship].positions);
			updates.position = ld.compact(updates.position);
		 	updates.gotHit = ld.difference(updates.position,player.usedPositions);
		 	updates.turn = activePlayer?activePlayer.playerId :null;
		 	if(!player.isAlive||!opponentPlayer.isAlive)
		 		updates.gameEnd = player.isAlive;
		 	else
		 		updates.gameEnd = null;
		}
	 	res.end(JSON.stringify(updates));
	}catch(err){
		log.log_message('appendFile','errors.log','deliver_latest_updates '+req.user+'➽'+err.message);
	}
	finally{
		res.end();
	};
};

var validateShoot = function(req,res){
	var status = {};
	try{
		var player = req.user;
		var opponentPlayer = getOpponentPlayer(req.user.playerId);
		status.reply = game.shoot.call(player,opponentPlayer,req.body.position);
		if(!opponentPlayer.isAlive)
			status.end='You won the Game '+player.name;
	}catch(err){
		status.error = err.message;
		log.log_message('appendFile','errors.log','validateShoot '+req.user.playerId+'➽'+err.message);
	};
	res.end(JSON.stringify(status));
};

var getMyshootPositions =function (req,res){
	var status={hit:[],miss:[]};
	try{
		var player=req.user;
		status.hit=player.hit || [];
		status.miss=player.miss || [];
	res.end(JSON.stringify(status));
	}catch(e){
		console.log(e.message);
	}
	finally{
	res.end();
	}
};

var serveShipInfo = function(req,res){
	try{
		var player = req.user;
		var fleetStatus={};
		for(var ship in player.fleet){
			var ship_status = player.fleet[ship].isSunk();
			var hits = player.fleet[ship].hittedHoles;
			fleetStatus[ship] = {hits:hits,status:ship_status};
		};
		res.end(JSON.stringify(fleetStatus));
	}
	catch(err){
		log.log_message('appendFile','errors.log','serveShipInfo '+req.user.playerId+'➽'+err.message);
	}
	finally{
		res.end();
	};
};

var respondToRestartGame = function(req,res){
	try{
		var playerId = req.user.playerId;
		var playerName = app.players[playerId].name;
		app.players[playerId] =  new Player(playerName);
		app.players[playerId].playerId = playerId;
		game.game.turn=null;
		res.redirect('/html/deploy.html');
		log.log_message('appendFile','players.log',req.user.playerId+' has restarted the game');
	}catch(err){
		log.log_message('appendFile','errors.log','respondToRestartGame '+req.user.playerId+'➽'+err.message);
	}
	finally{
		res.end();
	}
};
var respondToQuitGame = function(req,res){
	try{
		var playerId = req.user.playerId;
		delete app.players[playerId];
		res.redirect('/html/index.html');
		log.log_message('appendFile','players.log',+playerId+' has quit the game');
	}catch(err){
		log.log_message('appendFile','errors.log','respondToQuitGame '+playerId+'➽'+err.message);
	}finally{
		res.end();
	};
};

var respondToPlayerInQueue = function(req,res){
	var noOfPlayers = Object.keys(app.players).length;
	if(noOfPlayers < 2)
		res.end('true');
	else
		res.end('false');
};

app.use(express.static('./public'));


app.get('/',function(req,res){
	res.redirect('/html/index.html');
});
app.use(body_parser);

app.post('/html/index.html',inform_players);
app.use(cookie_parser());
app.use(loadUser);
app.post('/html/deployShip',deployShips);
app.post('/html/deploy.html',readyAnnounement);
app.get('/html/get_updates',function(req,res){
	deliver_latest_updates(req,res);
});
app.post('/html/shoot',function(req,res){
	validateShoot(req,res);
});
app.get('/html/shipInfo',function(req,res){
	serveShipInfo(req,res);
});
app.get('/html/myShootPositions',function(req,res){
	getMyshootPositions(req,res);
});
app.post('/html/players_queue.html',function(req,res){
	inform_players(req,res);
});
app.post('/html/restartGame',function(req,res){
	respondToRestartGame(req,res);
});
app.post('/html/quitGame',function(req,res){
	respondToQuitGame(req,res);
});

app.get('/html/queryGameOver',function(req,res){
	respondToPlayerInQueue(req,res);
});

module.exports = app;
