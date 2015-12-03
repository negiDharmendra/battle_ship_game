function renderGrid(){
	var oceanGridTemplate = [];
	var targetGridTemplate = [];
	for (var i = 1; i <= 10; i++) {
		oceanGridTemplate.push('<tr>');targetGridTemplate.push('<tr>');
		var character = String.fromCharCode(64+i);
		for (var j = 1; j <= 10; j++) {
			oceanGridTemplate.push('<td id='+character+j+' class = "grid">'+character+j+'</td>');
			targetGridTemplate.push('<td id='+character+j+' class = "grid">'+character+j+'</td>');
		};
		oceanGridTemplate.push('</tr>');targetGridTemplate.push('</tr>');
	};
	$('.game_screen> #ocean_grid').html('<h2>OCEAN GRID</h2><table id="oceanGrid" >'+oceanGridTemplate.join('\n')+'</table>');
	$('.game_screen> #target_grid').html('<h2>TARGET GRID</h2><table id="targetGrid">'+targetGridTemplate.join('\n')+'</table>');
};

$( window ).load(function(){
	renderGrid();
	$('.game_screen>#target_grid>#targetGrid').click(reply_to_shoot);
});