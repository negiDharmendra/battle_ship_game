var getStatus = function(){
	$.get('/getStatus',function(data){
		data = JSON.parse(data);










$( window ).load(function(){
	getStatus();
	// setInterval(getStatus,1000);
});
