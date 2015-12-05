function providePositions(e){
	if(e.target.nodeName == 'TD'){
		var positions = getPositions(e.target.id);
		$('.harbor>input').val(positions.join(' '));
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
			$('.ocean_grid td#'+id).addClass('hover');});
	};
	return positions;
};

function hidePosition(e){
	if(e.target.nodeName == 'TD'){
		var positions = getPositions(e.target.id);
		positions.forEach(function(id){
			$('.ocean_grid td#'+id).removeClass('hover');})
	};
};

function getPositions(startingPosition){
	var shipSize = {battleship:4,cruiser:3,carrier:5,destroyer:2,submarine:3};
	var handlerFunction = {'vertical':vertical,'horizontal':horizontal};
	var shipName = $(".harbor>#position_of_ship>[value]").val();
	var formation = $('select#formation').val();
	// $(document).keydown(function(){
	// 	console.log('dfbvsoducsd vlsd')
	// 	formation  = 'horizontal';
	// var positions = handlerFunction['horizontal'](startingPosition,shipSize[shipName]);
	// 	return positions;
	// })
	var positions = handlerFunction[formation](startingPosition,shipSize[shipName]);
	return positions;
};

function reply_to_deployment(evnt){
	evnt = evnt.target;
	var position = getPositions(evnt.id).join(' ');
	var shipName = $(".harbor>#position_of_ship>[value]").val();
	if(evnt.nodeName === 'TD'){
	$.post('deployShip','name='+shipName+'&positions='+position+'&playerId='+getCookie(),function(data){
		var reply = JSON.parse(data);
		displayDeployedShip(reply,position);
	});
	};
};

function getCookie(){
	return $.cookie('name');
};

function displayDeployedShip(reply,position){
	if(reply == true) {
		position.trim().split(' ').forEach(function(ele){
			$('.ocean_grid>table>tbody>tr>#'+ele).css('background','lightgreen');
		});
		$('.harbor>input').val('');
		$('.harbor>#position_of_ship>option:selected').remove();
		if($('.harbor>#position_of_ship>option').length == 0){
			$('.harbor').html('<h1>Deployed all ships</h1></br>'+'<form method="POST"><button id="ready" type="submit">Ready</button></form>');
		}
	}
	else 
		display_Message(reply);
};

function display_Message(message){
	$('.information').html('<p">'+message+'</p>');
	setTimeout(function(){$('.information').html('');},2000);
}

$( window ).load(function(){
	$('.ocean_grid').click(providePositions);
    $('.ocean_grid td').mouseover(displayPosition);
    $('.ocean_grid td').mouseleave(hidePosition);
    $('.ocean_grid td').click(function(evnt){
		reply_to_deployment(evnt);
	});
});
