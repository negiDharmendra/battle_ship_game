var fs = require('fs');
var ld = require('lodash');
var queryString = require('querystring');

var game = require('./battleship.js').sh;
var players = {};

var page_not_found = function(req,res){
	res.writeHead(404,{'Content-Type':'text/html'});
	res.end('Page Not Found');
};
var serveStaticFile = function(req,res,next){
	console.log('My Url:----',req.url);
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
	req.on('data',function(chunk){
		data +=  chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		var status = '';
		console.log('data=====',data);
		try{
		status = players[data.playerId].deployShip(data.name,data.positions.trim().split(' '));
		}catch(e){
			status = e.message;
		}
		console.log('used position for'+ players[data.playerId].name+'=====',players[data.playerId].usedPositions);
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
		var uniqueID = game.getUniqueId();
		players[uniqueID] =  new game.Player(data.name);
		players[uniqueID].playerId = uniqueID;
		res.writeHead(301,{
			'Location':'html/battleship.html',
			'Content-Type':'text/html',
			'Set-Cookie':uniqueID});
		console.log(players);
	res.end();
	});
};

var i_am_ready = function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		players[data.playerId].ready();
		console.log('game.game.allplayers---',game.game.allplayers,"\n 'It\'s your turn "+game.game.turn)
		if(game.game.allplayers.length == 1)
			res.end('Please wait for your opponent to be ready');
		else
			res.end('It\'s your turn '+players[game.game.turn].name);
	})

};

var get_opponentPlayer_id = function(player_id){
	var ids = Object.keys(players);
	delete ids[ids.indexOf(player_id)];
	ids = ld.compact(ids);
	ids = ids.shift();
	return ids;
}
var validateShoot = function(req,res){
	var data = '';
	req.on('data',function(chunk){
		data += chunk;
	});
	req.on('end',function(){
		data = queryString.parse(data);
		var id = get_opponentPlayer_id(data.playerId);
		console.log("I'm inside shoot function",players[data.playerId].name,players[id].name,"\n i'm finished")
		var status = game.shoot.call(players[data.playerId],players[id],data.position);
		console.log(players[id].name,'=================',players[id].fleet.cruiser.hittedHoles);
	})

}
var method_not_allowed = function(req,res){
	res.writeHead(405,{'Content-Type':'text/html'});
	res.end('Method Not Allowed');
};
exports.post_handlers = [
	{path : '^public/html/sayReady$',   handler:i_am_ready},
	{path : '^public/html/index.html$', handler:addPlayer},
	{path : '^public/html/deployShip$',	handler : serve_ship_deployment_info},
	{path : '^public/html/shoot$',		handler : validateShoot}
];
exports.get_handlers = [
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];