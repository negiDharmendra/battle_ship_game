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
		if(gameEnd){
			$('.message').html('<p>You lost!!!!</p>'),displayGameOver();
		}
	};
};

function get_ship_info(){
	$.post('shipInfo','playerId='+getCookie(),function(data,status){
		data = JSON.parse(data);
		var ships = Object.keys(data);
		var shipStatus = [];
		shipStatus.push('<tr><th>Ship_name</th><th>Hit_holes</th></tr>');
		for (var i = 0; i < 5; i++) {
			var shipName = ships[i];
			var holes = +data[shipName].split(' ')[0];
			var hitHoles = +data[shipName].split(' ')[1];
			if(holes==hitHoles)
				display_sunk_info('Your '+shipName+' has been destroyed.');
			shipStatus.push('<tr><td>'+shipName+'</td>'+'<td align=center>'+hitHoles+'</td></tr>');
		};
		$('#ship_info').html('<table border=1>'+shipStatus.join('\n')+'</table>');
	});
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
			display_Message(status.end),displayGameOver();
		});
	};
};


function displayGameOver(chunk){
	clearInterval(position_updates);
	clearInterval(ship_updates)
};

function display_Message(message){
	$('.message').html('<p>'+message+'</p>');
};
function getCookie(){
	return document.cookie;
};

function display_sunk_info(message){
	$('.info').html('<p>'+message+'</p>');
}

if(document.cookie){
	var position_updates = setInterval(get_updates,1000);	
	var ship_updates = setInterval(get_ship_info,1000);
};
