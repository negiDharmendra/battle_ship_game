var http=require('http');
var fs=require('fs');
var queryString = require('querystring');

var page_not_found=function(req,res){
	res.end('Page Not Found');
};
var serveStaticFile=function(req,res){
	console.log('My Url:----',req.url);
	fs.readFile(req.url,function(err,data){
	if(data)
		res.end(data);
	else
		page_not_found(req,res);
});
};
var getUrl=function(req){
	if(req.url=='/')
		req.url= '/html/index.html';
	return 'public'+req.url;	
};
var handle_get=function(req,res){
	console.log('Requested Url:----',req.url);
	req.url=getUrl(req);
 	serveStaticFile(req,res);
};
var handle_post=function(req,res){
	var chunk=''
	req.on('data',function(data){chunk+=data;chunk = queryString.parse(chunk);console.log('data++++++++++++>',chunk)})
	res.end();
};
var method_not_allowed=function(req,res){
	res.writeHead(405,{'Content-Type':'text/html'});
	res.end('Method Not Allowed');
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
server.listen(3000);

var ser={};
exports.ser={getUrl:getUrl};