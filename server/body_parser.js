var queryString=require('querystring');

var requestDataParser=function(req,res,next) {
	var data = '';
	req.on('data',function(chunk){
		data +=  chunk;
	});
	req.on('end',function(){
		data = queryString.parse(data);
		req.body=data;
		next();
	});
};
module.exports=requestDataParser;
