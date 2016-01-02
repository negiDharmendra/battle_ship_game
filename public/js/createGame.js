var getAllGames = function(){
	$.get('/getAllGames',function(data){
		data = JSON.parse(data)
		for (var i = 0; i <data.length; i++) {
		console.log(data[i]);
			$('#gameCreated').append(['<p>Game is running id --',i,
				'<form action="joinGame" method="POST">'+
				'<input hidden="text" name="Id" value="'+data[i]+'">',
				'<button type="submit"> Join</button></form>'].join(' '));
		};
	});
}

$( window ).load(function(){
	getAllGames();
})
