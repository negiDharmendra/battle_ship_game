var http=require('http');

var routes = require('./routes.js');
var queryString = require('querystring');
var eventEmitter = require('events').EventEmitter;
var emitter = new eventEmitter();


var get_handler = routes.get_handler;
var post_handler = routes.post_handler;

var matchHandlers = function(url){
	return function(handler){
		var path = new RegExp(handler.path);
		return url.match(path);
	};
};

emitter.on('next', function(handlers, req, res, next){
	if(handlers.length == 0) return;
	var ph = handlers.shift();
	ph.handler(req, res, next);
});

var getUrl=function(req){
	if(req.url=='/')
		req.url= '/html/index.html';
	return 'public'+req.url;	
};
var handle_get=function(req,res){
	req.url=getUrl(req);
	console.log('Requested Url:----',req.url);
	var handlers = get_handler.filter(matchHandlers(req.url));
	var next = function(){
		emitter.emit('next',handlers,req,res,next); 
	};
	next();
};
var handle_post=function(req,res){
	var chunk=''
	req.on('data',function(data){chunk+=data;chunk = queryString.parse(chunk);console.log('data+++>',chunk)})
	res.end();
};
var requestHandler = function(req, res){
	console.log('method==>',req.method,'\nURl==>',req.url);
	console.log('=====================================================')
	if(req.method == 'GET')
		handle_get(req,res);
	else if(req.method == 'POST')
		handle_post(req,res);
	else
		method_not_allowed(req,res);
};
var server = http.createServer(requestHandler);
var port  = +process.argv[2];
server.listen(port,function(){console.log("listening at port===>"+port)});

var ser={};
exports.ser={getUrl:getUrl};