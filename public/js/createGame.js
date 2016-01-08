var getAllGames = function(){
	$.get('/getAllGames',function(data){
		data = JSON.parse(data)
		$('.newGame #joinGame').html('');
		for (var i = 0; i <data.length; i++) {
			var serial =i+1;
			$('.newGame #joinGame').append(['<form class="joinGame" action="joinGame" method="POST">',
				'<p>'+ serial+': Join the running Game&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp',
				'<input hidden="text" name="Id" value="'+data[i]+'">',
				'<button type="submit"> Join</button></form>'].join(' '));
		};
	});
}

$( window ).load(function(){
	getAllGames();
	setInterval(getAllGames,1000);
})
