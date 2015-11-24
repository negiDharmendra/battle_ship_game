var game = require('./battleship.js').sh;
var fs=require('fs');
var player1 =new  game.Player('arun');

var page_not_found=function(req,res){
	res.end('Page Not Found');
};
var serveStaticFile=function(req,res,next){
	console.log('My Url:----',req.url);
	fs.readFile(req.url,function(err,data){
		if(data)
			res.end(data);
		else
			next()
	});
};
var getUrl=function(req){
	if(req.url=='/')
		req.url= '/html/index.html';
	return 'public'+req.url;	
};

var method_not_allowed=function(req,res){
	res.writeHead(405,{'Content-Type':'text/html'});
	res.end('Method Not Allowed');
};
exports.post_handlers = [
	{path : '^public/deployShip$',handler : player1.deployShip},
	{path : '^public/shoot$',handler : 'validateShoot'},
	{path : '',handler : method_not_allowed}
];
exports.get_handler = [
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];