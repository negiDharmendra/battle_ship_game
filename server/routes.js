var fs = require('fs');
var ld = require('lodash');
var queryString = require('querystring');

var battleship = require('./battleship.js').sh;
var players = {};

var page_not_found = function(req,res){
	res.writeHead(404,{'Content-Type':'text/html'});
	res.end('Page Not Found');
};

var redirectToHome=function(req,res){
	if(!req.headers.cookie){
		res.writeHead(301,{'Location': '/'});
		res.end();
	}
};

var serveStaticFile = function(req,res,next){
	console.log('My Url:----',req.url);
	if(req.url.match('^public/html/battleship.html$'))
		redirectToHome(req,res);
	fs.readFile(req.url,function(err,data){
		if(data)
			res.end(data);
		else
			next();
	});
};

var serve_ship_deployment_info = function(req,res,next){
	console.log('My Url:----',req.url);
	var data = '';
	console.log('req.header.cookie--->',req.headers.cookie)
	req.on('data',function(chunk){
		data +=  chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		var status = '';
		var player = get_player(data.playerId);
		console.log('data=====',data);
		try{
		status = player.deployShip(data.name,data.positions.trim().split(' '));
		}catch(e){
			status = e.message;
		}
		res.end(JSON.stringify(status));
	});
};

var addPlayer = function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		data = queryString.parse(data);
		var uniqueID = battleship.getUniqueId();
		players[data.name+'_'+uniqueID] =  new battleship.Player(data.name);
		players[data.name+'_'+uniqueID].playerId = data.name+'_'+uniqueID;
		res.writeHead(301,{
			'Location':'html/battleship.html',
			'Content-Type':'text/html',
			'Set-Cookie':data.name+'_'+uniqueID});
	res.end();
	console.log(players);
	});
};

var i_am_ready = function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		var player = get_player(data.playerId);
		try{
		player.ready();
		if(battleship.game.allplayers.length == 1)
			res.end('Please wait for your opponent to be ready');
		else
			res.end('It\'s'+get_player(battleship.game.turn).name+'your turn');
		}
		catch(e){
			console.log(e.message);
		}
	})
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
var validateShoot = function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		data = queryString.parse(data);
		var status = {};
		try{
			var opponentPlayer = get_opponentPlayer(data.playerId);
			var player = get_player(data.playerId);
			status.reply = battleship.shoot.call(player,opponentPlayer,data.position);
			if(opponentPlayer.sunkShips.length==5){
				status.end=player.name+'You won the Game';
			}
		}catch(e){
			status.error = e.message;
		};
		res.end(JSON.stringify(status));
	});
};
var deliver_latest_updates = function(req,res){
	try{
		var updates = {position:[]};
		if(!req.headers.cookie)
			res.end(JSON.stringify('Id Required'));
		var player = get_player(req.headers.cookie);
		for(var ship in player.fleet)
			updates.position=updates.position.concat(player.fleet[ship].onPositions);
		updates.position = ld.compact(updates.position);
	 	updates.gotHit = ld.difference(updates.position,player.usedPositions);
	 	res.end(JSON.stringify(updates));
	}catch(e){
		console.log(e.message);
	}
	finally{
		res.end();
	};
};

var serveShipInfo = function(req,res){
	var data ='';
	req.on('data',function(chunk){
		data+=chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		try{
			var player = get_player(data.playerId);
			var fleetStatus={};
			for(var ship in player.fleet)
				fleetStatus[ship]=player.fleet[ship].holes +' '+player.fleet[ship].hittedHoles;
			res.end(JSON.stringify(fleetStatus));
		}
		catch(e){
			console.log(e.message);
		}
		finally{
			res.end();
		}
	});
}
exports.post_handlers = [
	{path : '^public/html/sayReady$',   handler : i_am_ready},
	{path : '^public/html/index.html$', handler : addPlayer},
	{path : '^public/html/deployShip$',	handler : serve_ship_deployment_info},
	{path : '^public/html/shoot$',		handler : validateShoot},
	{path : '^public/html/shipInfo$',handler:serveShipInfo}
];
exports.get_handlers = [
	{path : '^public/html/get_updates$', handler: deliver_latest_updates},
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];