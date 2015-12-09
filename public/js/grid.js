function generateTableHeaders(grids,column_or_row_num){
	grids.oceanGridTemplate.push('<td class = "th">'+column_or_row_num+'</td>');
	grids.targetGridTemplate.push('<td class = "th">'+column_or_row_num+'</td>');
};

function generateTableCell(grids,id){
	grids.oceanGridTemplate.push('<td id='+id+' class = "grid" title='+id+'></td>');
	grids.targetGridTemplate.push('<td id='+id+' class = "grid" title="'+id+'" onclick="reply_to_shoot(event)"></td>');
};

function renderGrid(grids){
	for (var row = 1; row <= 11; row++) {
		grids.oceanGridTemplate.push('<tr>');grids.targetGridTemplate.push('<tr>');
		var character = String.fromCharCode(64+row-1);
		for (var column = 1; column <= 11; column++) {
			var columnNum = column && (row == 1 && '' || column-1) || '';
			var rowNum = column==1 && '' || character;
			var id = character+(column-1);
			if(row==1) generateTableHeaders(grids,columnNum);
			else if(row!=1 && column==1)generateTableHeaders(grids,rowNum);
			else generateTableCell(grids,id);
		};
		grids.oceanGridTemplate.push('</tr>');grids.targetGridTemplate.push('</tr>');
	};
	$('.game_screen> #ocean_grid').html('<h2>OCEAN </h2><table id="oceanGrid" >'+grids.oceanGridTemplate.join('\n')+'</table>');
	$('.game_screen> #target_grid').html('<h2>TARGET </h2><table id="targetGrid">'+grids.targetGridTemplate.join('\n')+'</table>');
};

$( window ).load(function(){
	var grids = {oceanGridTemplate:[],targetGridTemplate:[]};
	renderGrid(grids);
});