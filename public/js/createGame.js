var getAllGames = function(){
	$.get('/getAllGames',function(data){
		data = JSON.parse(data);
		var gameIds = Object.keys(data);
		$('.newGame #joinGame').html('');
		for (var i = 0; i < gameIds.length; i++) {
			var serial =i+1, playerName = data[gameIds[i]].match(/[a-z \s a-z]+/gi);
			console.log(gameIds[i])
			$('.newGame #joinGame').append(['<form class="joinGame" action="joinGame" method="POST">',
				'<div class="inputSubmit"><input hidden="text" name="Id" value="'+gameIds[i]+'">',
				'<button class="joinButton" type="submit">'+ serial+': Join the running Game with '+
				playerName+'</button></form></div>'].join(' '));
		};
	});
}

$( window ).load(function(){
	getAllGames();
	setInterval(getAllGames,1000);
})
