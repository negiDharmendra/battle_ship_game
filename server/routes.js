var fs = require('fs');
var ld = require('lodash');
var queryString = require('querystring');
var battleship = require('./battleship.js').sh;
var players = {};

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

var authenticateUser=function(cookie){
	if(!cookie) return false;
	var playersCookie=Object.keys(players);
	return playersCookie.some(function(player){return player==cookie;});
};

var serve_ship_deployment_info = function(req,res,next){
	if(!authenticateUser(getCookie(req,'name'))){
		res.end();
		return;
	}
	var data = '';
	req.on('data',function(chunk){
		data +=  chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		var status = '';
		var player = get_player(data.playerId);
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
	try{
		if(Object.keys(players).length >= 2){
			res.write('Wait')
		}else{
			data = queryString.parse(data);
			var uniqueID = battleship.getUniqueId();
			players[data.name+'_'+uniqueID] =  new battleship.Player(data.name);
			players[data.name+'_'+uniqueID].playerId = data.name+'_'+uniqueID;
			res.writeHead(301,{
				'Location':'html/deploy.html',
				'Content-Type':'text/html',
				'Set-Cookie':'name='+data.name+'_'+uniqueID});
			console.log(players);	
		}
	}catch(err){
		console.log(err.message);	
	}
	finally{
		res.end();
	}
	});
};

var i_am_ready = function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		var player = get_player(getCookie(req,'name'));
		try{
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
			if(!opponentPlayer.isAlive){
				status.end='You won the Game '+player.name;
			}
		}catch(e){
			status.error = e.message;
		};
		res.end(JSON.stringify(status));
	});
};
var deliver_latest_updates = function(req,res){
	if(!authenticateUser(getCookie(req,'name'))){
		res.end();
	}
	else{
		try{
			var updates = {position:[],gotHit:[],turn:''};
			var player = get_player(getCookie(req,'name'));
			var opponentPlayer=get_opponentPlayer(getCookie(req,'name')) || {isAlive:true};
			if(player && player.readyState){
				for(var ship in player.fleet)
					updates.position=updates.position.concat(player.fleet[ship].onPositions);
				updates.position = ld.compact(updates.position);
			 	updates.gotHit = ld.difference(updates.position,player.usedPositions);
			 	updates.turn = selectPlayer(getCookie(req,'name'),battleship.game.turn).name;
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
};

var serveShipInfo = function(req,res){
	var data ='';
	req.on('data',function(chunk){
		data+=chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		if(!authenticateUser(getCookie(req,'name'))){
		res.end();
		}
		else{
			try{
				var player = get_player(getCookie(req,'name'));
				var fleetStatus={};
				for(var ship in player.fleet){
					var ship_status = player.fleet[ship].isSunk();
					var hits = player.fleet[ship].hittedHoles;
					fleetStatus[ship] = {hits:hits , status:ship_status};
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
	});
}

function getCookie(req,cookie_n) {
    var name = cookie_n + "=";
    var cookies = req.headers.cookie.split(';');
    for(var index=0; index<cookindexes.length; index++) {
        var cookie = cookies[index];
        while (cookie.charAt(0)==' ') cookie = cookie.substring(1);
        if (cookie.indexOf(name) == 0) return cookie.substring(name.length, cookie.length);
    }
    return "";
};

function selectPlayer(cookie,id){
	if(!id) return {name:''};
	if(players[cookie].playerId==id)
		return get_player(cookie);
	return get_opponentPlayer(cookie);
};

exports.post_handlers = [
	{path : '^public/html/deploy.html$',handler : i_am_ready},
	{path : '^public/html/index.html$', handler : addPlayer},
	{path : '^public/html/deployShip$',	handler : serve_ship_deployment_info},
	{path : '^public/html/shoot$',		handler : validateShoot},
	{path : '^public/html/shipInfo$',	handler : serveShipInfo}
];
exports.get_handlers = [
	{path : '^public/html/get_updates$', handler: deliver_latest_updates},
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];