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
	var positions = getPositions(e.target.id);
	if($('.harbor>#position_of_ship>option').length>0){
		positions.forEach(function(id){
			$('.ocean_grid td#'+id).addClass('hover');});
	};
};

function hidePosition(e){
	var positions = getPositions(e.target.id);
	positions.forEach(function(id){
		$('.ocean_grid td#'+id).removeClass('hover');})
};

function getPositions(startingPosition){
	if($('.harbor>#position_of_ship>option').length>0){
		var shipSize = {battleship:4,cruiser:3,carrier:5,destroyer:2,submarine:3};
		var handlerFunction = {'vertical':vertical,'horizontal':horizontal};
		var shipName = $('.harbor>#position_of_ship option:selected').val();
		var formation = $('select#formation').val();
		var positions = handlerFunction[formation](startingPosition,shipSize[shipName]);
		return positions;
	};
};

function reply_to_deployment(evnt){
	evnt = evnt.target;
	var position = getPositions(evnt.id).join(' ');
	var shipName = $(".harbor>#position_of_ship>option:selected").val();
	$.post('deployShip','name='+shipName+'&positions='+position,function(data){
		var reply = JSON.parse(data);
		displayDeployedShip(reply,position);
	});
};

function getCookie(){
	return $.cookie('name');
};
function play(){
   var audio = document.getElementById("audio");
   audio.play();
}
function displayDeployedShip(reply,position){
	if(reply == true) {
		position.trim().split(' ').forEach(function(ele){
			$('.ocean_grid>table>tbody>tr>#'+ele).css('background','lightgreen');
		});
		play();
		$('.harbor>#position_of_ship>option:selected').remove();
		if($('.harbor>#position_of_ship>option').length == 0){
			$('.harbor').html('Deployed all ships</br>'+'<form method="POST"><button id="ready" type="submit">Ready</button></form>');
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
	if($('.harbor>#position_of_ship>option').length>0){
	    $('.ocean_grid td').mouseover(displayPosition);
	    $('.ocean_grid td').mouseleave(hidePosition);
	};
    $('.ocean_grid td').click(function(evnt){
		reply_to_deployment(evnt);
	});

});
