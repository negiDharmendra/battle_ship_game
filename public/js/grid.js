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
function providePositions(e){
	if(e.target.nodeName == 'TD'){
		var positions = getPositions(e.target.id);
		$('#harbor>input').val(positions.join(' '));
	};
};

function vertical(position,size){
	var charcode = position[0].charCodeAt();
	var positions = [];
	for (var i = 0; i < size; i++) {
		positions.push(String.fromCharCode(charcode+i)+position.slice(1));
	};
	return positions;
};

function horizontal(position,size){
	var cHar = position[0];
	var positions = [];
	for (var i = 0; i < size; i++) {
		positions.push(cHar+(Number(position.slice(1))+i));
	};
	return positions;
};

function displayPosition(e){
	if(e.target.nodeName == 'TD'){
		var positions = getPositions(e.target.id);
		positions.forEach(function(id){
			$('#oceanGrid>tbody>tr>td#'+id).addClass('hover');})
	};
};

function hidePosition(e){
	if(e.target.nodeName == 'TD'){
		var positions = getPositions(e.target.id);
		positions.forEach(function(id){
			$('#oceanGrid>tbody>tr>td#'+id).removeClass('hover');})
	};
};

function getPositions(startingPosition){
	var shipSize = {battleship:4,cruiser:3,carrier:5,destroyer:2,submarine:3};
	var handlerFunction = {'vertical':vertical,'horizontal':horizontal};
	var shipName = $("#harbor>#position_of_ship>[value]").val();
	var formation = $('select#formation').val();
	var positions = handlerFunction[formation](startingPosition,shipSize[shipName]);
	return positions;
};

$( window ).load(function(){
	renderGrid();
    $('#oceanGrid').click(providePositions);
    $('#oceanGrid>tbody>tr>td').mouseover(displayPosition);
    $('#oceanGrid>tbody>tr>td').mouseleave(hidePosition);
	$('.game_screen>#target_grid>#targetGrid').click(reply_to_shoot);
	$('#harbor>button').click(function(evnt){
		if($('#harbor>input').val().trim()!='')reply_to_deployment(evnt);
		else $('#message').html('<p style="color:red;">Please provide position</p>');
	});
});