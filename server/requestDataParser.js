var lib={};
module.exports=lib;
var queryString=require('querystring');

lib.requestDataParser=function(req,res,next) {
	var data = '';
	req.on('data',function(chunk){
		data +=  chunk;
	});
	req.on('end',function(){
		data = queryString.parse(data);
		req.data=data;
		next();
	});
};
