var renderGrid = function(oceanGrid,targetGrid){
	var oceanGridTemplate = [];
	var targetGridTemplate = [];
	for (var i = 1; i <= 10; i++) {
		oceanGridTemplate.push('<tr>');targetGridTemplate.push('<tr>');
		var character = String.fromCharCode(64+i);
		for (var j = 1; j <= 10; j++) {
			oceanGridTemplate.push('<td id='+character+j+'>'+character+j+'</td>');
			targetGridTemplate.push('<td><button id='+character+j+'></button></td>');
		};
		oceanGridTemplate.push('</tr>');targetGridTemplate.push('</tr>');
	};
	oceanGrid.innerHTML += '<table id="oceanGrid">'+oceanGridTemplate.join('\n')+'</table>';
	targetGrid.innerHTML += '<table id="targetGrid">'+targetGridTemplate.join('\n')+'</table>';
};
window.onload = function(){
	var oceanGrid = document.querySelector('#game_screen> #ocean_grid');
	var targetGrid = document.querySelector('#game_screen> #target_grid');
	renderGrid(oceanGrid,targetGrid);
	targetGrid.querySelector('#targetGrid').setAttribute('onclick','reply_to_shoot()');
};
