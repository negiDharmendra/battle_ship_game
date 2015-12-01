function get_updates(){
	$.get('get_updates',sucess);
	function sucess(data){
		var updates=JSON.parse(data);
		var gotHit=updates.gotHit;
		var usedPosition=updates.position;
		for (var i = 0; i < usedPosition.length; i++)
			$('#oceanGrid>tbody>tr>td#'+usedPosition[i]).css('background','green');
		for (var i = 0; i < gotHit.length; i++)
			$('#oceanGrid>tbody>tr>td#'+gotHit[i]).css('background','red');
	};
};

if(document.cookie)
	setInterval(get_updates, 1000);

function sayReady(){
	document.querySelector('#harbor>button#ready').remove();
	alert("Please Wait");
	$.post('sayReady','playerId='+getCookie(),function(data){
		$('#message').html('<p style=color:red;>'+JSON.parse(data)+'</p>');
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
		$('#message').html('<p style=color:red;>'+reply+'</p>');
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
			$('#message').html('<p style=color:red;>'+status.error+'</p>');
			if(status.end){
				$('#message').html('<p style=color:red;>'+status.end+'</p>');
			};
		});
	};
};

setInterval(clear_Message,4000);
function clear_Message(){
	$('#message').html('');
}