var getAllGames = function(){
	$.get('/getAllGames',function(data){
		data = JSON.parse(data)
		for (var i = 0; i <data.length; i++) {
			var serial =i+1;
			$('.newGame').append(['<form action="joinGame" method="POST">',
				'<p>'+ serial+':Join the running Game id is:',data[i],
				'<input hidden="text" name="Id" value="'+data[i]+'">',
				'<button type="submit"> Join</button></form>'].join(' '));
		};
	});
}

$( window ).load(function(){
	getAllGames();
})
