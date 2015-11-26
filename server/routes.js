var fs=require('fs');
var queryString = require('querystring');

var game = require('./battleship.js').sh;
var players={};

var page_not_found=function(req,res){
	res.writeHead(404,{'Content-Type':'text/html'});
	res.end('Page Not Found');
};
var serveStaticFile=function(req,res,next){
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
		data += chunk;
		data = queryString.parse(data);
	});
	req.on('end',function(){
		var status='';
		console.log('data=====',data);
		try{
		status=players[data.number].deployShip(data.name,data.positions.trim().split(' '));
		}catch(e){
			status=e.message;
		}
		console.log('status=====',status);
		res.end(JSON.stringify(status));
	});
};

var addPlayer = function(req,res){
	var data='';
	req.on('data',function(chunk){
		data+=chunk;
	});
	req.on('end',function(){
		data = queryString.parse(data);
		var uniqueID=game.getUniqueId();
		players[uniqueID]= new game.Player(data.name);
		players[uniqueID].playerId=uniqueID;
		res.writeHead(301,{
			'Location':'html/battleship.html',
			'Content-Type':'text/html',
			'Set-Cookie':uniqueID});
		console.log(players);
	res.end();
	});
};

var method_not_allowed=function(req,res){
	res.writeHead(405,{'Content-Type':'text/html'});
	res.end('Method Not Allowed');
};
exports.post_handlers = [
	{path : '^public/html/index.html$', handler:addPlayer},
	{path : '^public/html/deployShip$',	handler : serve_ship_deployment_info},
	{path : '^public/shoot$',			handler : 'validateShoot'}
];
exports.get_handlers = [
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];