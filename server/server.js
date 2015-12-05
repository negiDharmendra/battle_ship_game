var http=require('http');

var routes = require('./routes.js');

var eventEmitter = require('events').EventEmitter;
var emitter = new eventEmitter();


var get_handlers = routes.get_handlers;
var post_handlers = routes.post_handlers;

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
	return 'public'+req.url;	
};

var handle_get=function(req,res){
	req.url=getUrl(req);
	var handlers = get_handlers.filter(matchHandlers(req.url));
	var next = function(){
		emitter.emit('next',handlers,req,res,next); 
	};
	next();
};
var handle_post=function(req,res){
	req.url=getUrl(req);
	var handlers = post_handlers.filter(matchHandlers(req.url));
	var next = function(){
		emitter.emit('next',handlers,req,res,next); 
	};
	next();
};
var method_not_allowed=function(req,res){
	res.writeHead(405,{'Content-Type':'text/html'});
	res.end('Method Not Allowed');
};

var requestHandler = function(req, res){
	console.log("===========",req.method,"==========");
	console.log('Request:----',req.url);	
	if(req.method == 'GET')
		handle_get(req,res);
	else if(req.method == 'POST')
		handle_post(req,res);
	else
		method_not_allowed(req,res);
};
var server = http.createServer(requestHandler);
server.listen(3000,function(){console.log("listening at port===>"+3000)});
server.on('error',function(e){
	console.log('Can not Start the Server due to:--',e.message);
});
 
