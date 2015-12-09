var fs = require('fs');

exports.log_message = function(functionName,fileName,data){
	fs[functionName]('./data/'+fileName,data+'\n','utf-8',function(err){
		// console.log(err)
	});
};
