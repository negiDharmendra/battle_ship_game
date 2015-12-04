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
			$('#oceanGrid>tbody>tr>td#'+gotHit[i]).css('background','#ee9090');
		if(turn!='')
			display_Message('It\'s '+turn+' turn');
		else if(turn=='')
			display_Message('Your opponent player haven\'t started yet.');
		if(gameEnd){
			display_Message('You lost!!!!'),displayGameOver();
		}
	};
};
function get_ship_info(){
	$.post('shipInfo','playerId='+getCookie(),function(data,status){
		data = JSON.parse(data);
		var ships = Object.keys(data);
		var shipStatus = [];
		var sunk =[];
		shipStatus.push('<tr><th>Ship name</th><th>Hits</th></tr>');
		for (var i = 0; i < 5; i++) {
			var shipName = ships[i];
			var holes = +data[shipName].split(' ')[0];
			var hitHoles = +data[shipName].split(' ')[1];
			if(holes==hitHoles)
			shipStatus.push('<tr><td >'+shipName+'</td>'+'<td  align=center>'+hitHoles+'</td></tr>');	
				else
			shipStatus.push('<tr><td>'+shipName+'</td>'+'<td align=center>'+hitHoles+'</td></tr>');
		};
		$('.ship_info').html('<table class="fleet">'+shipStatus.join('\n')+'</table>');
	});
};



function reply_to_shoot(evnt){
	evnt = evnt.target;
	$.post("shoot",{position:evnt.id,playerId:getCookie()},function(data){
		var status = JSON.parse(data);
		if(status.reply){
			$('#targetGrid>tbody>tr>td#'+evnt.id).removeAttr('onclick');
			$('#targetGrid>tbody>tr>td#'+evnt.id).addClass(status.reply);
		}
		else if(status.error)
			display_Message(status.error);
	if(status.end)
		display_Message(status.end),displayGameOver();
	});
};


function displayGameOver(chunk){
	$('#targetGrid>tbody>tr>.grid').removeAttr('onclick');
	clearInterval(position_updates);
	clearInterval(ship_updates)
};

function display_Message(message){
	$('.message').html('<p>'+message+'</p>');
};
function getCookie(){
	return $.cookie('name');
};

function display_sunk_info(message){
	$('.info').html('<p>'+message+'</p>');
	setTimeout(function(){$('.info').html('')},7000);
}
if(getCookie()){
	var position_updates = setInterval(get_updates,1000);	
	var ship_updates = setInterval(get_ship_info,1000);
};
