function get_updates(){
	$.get('get_updates',sucess);
	function sucess(data){
		var updates=JSON.parse(data);
		var gotHit=updates.gotHit;
		var usedPosition=updates.position;
		var turn=updates.turn;
		var gameEnd=updates.gameEnd;
		for (var i = 0; i < usedPosition.length; i++)
			$('#oceanGrid>tbody>tr>td#'+usedPosition[i]).css('background','lightgreen');
		for (var i = 0; i < gotHit.length; i++)
			$('#oceanGrid>tbody>tr>td#'+gotHit[i]).css('background','red');
		if(turn!='')
			display_Message('It\'s '+turn+' turn');
		else if(turn=='')
			display_Message('Your opponent player haven\'t started yet.');
		if(gameEnd)
			display_Message('You lost!!!!!');
	};
};

function sayReady(){
	$('#harbor').html("Deployed all ships");
	$.post('sayReady','playerId='+getCookie(),function(data){
		display_Message(JSON.parse(data));
	});
};

function displayDeployedShip(reply,position){
	if(reply == true) {
		position.trim().split(' ').forEach(function(ele){
			$('#ocean_grid>table>tbody>tr>#'+ele).css('background','lightgreen');
		});
		$('#harbor>input').val('');
		document.querySelector('#harbor>#position_of_ship>[value]').remove();
		if($('#harbor>#position_of_ship>option').length == 0)
			$('#harbor').html('<h1>Deployed all ships</h1></br>'+'<button id="ready" onclick = "sayReady()">Ready</button>');
	}
	else 
		display_Message(reply);
};


function getCookie(){
	return document.cookie;
};

function reply_to_deployment(evnt){
	evnt = evnt.target;
	var position = $('#harbor>input').val();
	var shipName = $("#harbor>#position_of_ship>[value]").val();
	if(evnt.nodeName === 'BUTTON'){
	$.post('deployShip','name='+shipName+'&positions='+position+'&playerId='+getCookie(),function(data){
		var reply = JSON.parse(data);
		displayDeployedShip(reply,position);
	});
	};
};

function reply_to_shoot(evnt){
	evnt = evnt.target;
	if(evnt.nodeName === 'TD'){
		$.post("shoot",{position:evnt.id,playerId:getCookie()},function(data){
		var status = JSON.parse(data);
		if(status.reply){
			var color = (status.reply=='hit')&&'red'||'white';
			$('#targetGrid>tbody>tr>td#'+evnt.id).css('background',color);
		}
		else if(status.error)
				display_Message(status.error);
		if(status.end)
			display_Message(status.end),end_Game(true);
		});
	};
};

if(document.cookie && !end_Game())
	setInterval(get_updates,1000);

function display_Message(message){
	$('.message').html('<p>'+message+'</p>');
}
function end_Game(status){
	var s=status;
	return function(){
		return s;
	}();
}