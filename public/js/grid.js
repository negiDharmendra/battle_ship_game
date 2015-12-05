function renderGrid(){
	var oceanGridTemplate = [];
	var targetGridTemplate = [];
	for (var i = 1; i <= 11; i++) {
		oceanGridTemplate.push('<tr>');targetGridTemplate.push('<tr>');
		var character = String.fromCharCode(64+i-1);
		for (var j = 1; j <= 11; j++) {
			if(i==1){
				oceanGridTemplate.push('<td class = "th">'+(j&&(i==1&''||j-1)||'')+'</td>');
				targetGridTemplate.push('<td class = "th">'+(j&&(i==1&''||j-1)||'')+'</td>');
			}
			else if(i!=1&&j==1){
				oceanGridTemplate.push('<td class = "th">'+(j==1&''||character)+'</td>');
				targetGridTemplate.push('<td class = "th">'+(j==1&''||character)+'</td>');
			}
			else{
				oceanGridTemplate.push('<td id='+character+(j-1)+' class = "grid" title='+character+(j-1)+'></td>');
				targetGridTemplate.push('<td id='+character+(j-1)+' class = "grid" title="'+character+(j-1)+'" onclick="reply_to_shoot(event)"></td>');
			}
		};
		oceanGridTemplate.push('</tr>');targetGridTemplate.push('</tr>');
	};
	$('.game_screen> #ocean_grid').html('<h2>OCEAN </h2><table id="oceanGrid" >'+oceanGridTemplate.join('\n')+'</table>');
	$('.game_screen> #target_grid').html('<h2>TARGET </h2><table id="targetGrid">'+targetGridTemplate.join('\n')+'</table>');
};

$( window ).load(function(){
	renderGrid();
	// $('#targetGrid>tbody>tr>.grid').click(reply_to_shoot);
});