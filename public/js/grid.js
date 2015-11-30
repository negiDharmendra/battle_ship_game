var renderGrid = function(){
	var oceanGridTemplate = [];
	var targetGridTemplate = [];
	for (var i = 1; i <= 10; i++) {
		oceanGridTemplate.push('<tr>');targetGridTemplate.push('<tr>');
		var character = String.fromCharCode(64+i);
		for (var j = 1; j <= 10; j++) {
			oceanGridTemplate.push('<td id='+character+j+'>'+character+j+'</td>');
			targetGridTemplate.push('<td id='+character+j+'>'+character+j+'</td>');
		};
		oceanGridTemplate.push('</tr>');targetGridTemplate.push('</tr>');
	};
	$('.game_screen> #ocean_grid').html('<h2>OCEAN GRID</h2><table id="oceanGrid" class = "grid">'+oceanGridTemplate.join('\n')+'</table>');
	$('.game_screen> #target_grid').html('<h2>TARGET GRID</h2><table id="targetGrid" class = "grid">'+targetGridTemplate.join('\n')+'</table>');
};
var providePositions = function(evnt){
	var evnt = event.target;
	if(evnt.nodeName == 'TD'){
		$('#harbor>input').val($('#harbor>input').val()+" "+evnt.id);
		$('#harbor>button').attr('onclick','reply_to_deployment()');
	};
};

$( window ).load(function() {
	renderGrid();
    $('#oceanGrid').click(providePositions);
	$('.game_screen> #target_grid>#targetGrid').attr('onclick','reply_to_shoot()');
});