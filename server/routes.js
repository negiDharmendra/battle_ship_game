var fs=require('fs');
var queryString = require('querystring');
var game = require('./battleship.js').sh;


var player1 = new game.Player('arun');

var page_not_found=function(req,res){
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
	var chunk = '';
	console.log('My Url:----',req.url);
	req.on('data',function(data){
		chunk += data;
		chunk = queryString.parse(chunk);
	});
	req.on('end',function(){
		if(player1.deployShip(chunk.name,chunk.positions.trim().split(' '))==true)
			res.end('true');
		else res.end('false');
	});
}

var method_not_allowed=function(req,res){
	res.writeHead(405,{'Content-Type':'text/html'});
	res.end('Method Not Allowed');
};
exports.post_handlers = [
	{path : '^public/deployShip$',handler : serve_ship_deployment_info},
	{path : '^public/shoot$',handler : 'validateShoot'},
	{path : '',handler : method_not_allowed}
];
exports.get_handlers = [
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];