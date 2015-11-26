var fs=require('fs');
var queryString = require('querystring');

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
	req.on('data',function(data){
		chunk+=data;
	})
	req.on('end',function(){
		chunk = queryString.parse(chunk);
			res.end('true');
	});
}


exports.post_handlers = [
	{path : '^public/deployShip$|^public/html/deployShip$',handler : serve_ship_deployment_info},
	{path : '^public/shoot$',handler : 'validateShoot'}
];
exports.get_handlers = [
	{path : '',handler:serveStaticFile},
	{path : '',handler:page_not_found}
];