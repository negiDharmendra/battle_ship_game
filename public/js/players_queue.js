function getCookie(){
	return $.cookie('name');
};
function requestToJoinGame(){
	$.get('queryGameOver',success);
	function success(data){
		data = JSON.parse(data);
		var template = '<form method="POST" action="players_queue.html"><input type="text" name="name" value="{{name}}"><button type="submit">Join game</button></form>';
		var renderHtml = Handlebars.compile(template);
		var html = renderHtml({name:getCookie()});
		if(data == true){
			$('.joinGame').html('<p>Now you can join the game</p><br>'+html);
			clearInterval(request_to_join);
		}
	};
};
$(window).load(function () {
	var request_to_join = setInterval(requestToJoinGame,10000);
});