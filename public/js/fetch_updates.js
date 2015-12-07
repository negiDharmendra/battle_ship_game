function get_updates(){
	$.get('get_updates',success);
	function success(data){
		var updates=JSON.parse(data);
		var turn=updates.turn;
		var gameEnd=updates.gameEnd;
		displayShips('#oceanGrid',updates.gotHit,updates.position,'lightgreen');
		if(turn!='')
			display_Message('It\'s '+turn+' turn');
		else if(turn=='')
			display_Message('Your opponent player haven\'t started yet.');
		if(!gameEnd.player || !gameEnd.opponentPlayer){
			gameOver(),restartOrQuit();
			if(!gameEnd.player)
				display_Message('You lost!!!!');
			if(!gameEnd.opponentPlayer)
				display_Message('You won!!!!');
		}
	};
};

function displayShips(gridId,gotHit,usedPosition,color) {
	for (var i = 0; i < usedPosition.length; i++)
		$(gridId+'>tbody>tr>td#'+usedPosition[i]).css('background',color);
	for (var i = 0; i < gotHit.length; i++)
		$(gridId+'>tbody>tr>td#'+gotHit[i]).css('background','#ee9090');
};

function get_ship_info(){
	$.post('shipInfo','playerId='+getCookie(),function(data,status){
		var ships = JSON.parse(data);
		var shipStatus = [];
		shipStatus.push('<tr><th>Ship name</th><th>Hits</th><th>Status</th></tr>');
		for (var ship in ships) {
			var ship_info = ships[ship];
			var status = ship_info.status&&'Sunk'||'';
			shipStatus.push('<tr><td>'+ship+'</td>'+'<td align=center>'+ship_info.hits+'</td><td align=center>'+status+'</td></tr>');
		};
		$('.ship_info').html('<table class="fleet">'+shipStatus.join('\n')+'</table>');
	});
};

$( window ).load(function(){
	get_updates();
	$.get('myShootPositions',function(data) {
			data=JSON.parse(data);
		displayShips('#targetGrid',data.hit,data.miss,'#9090EE');
	});
});


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
			display_Message(status.end),gameOver(),restartOrQuit();
	});
};

function gameOver(){
	clearInterval(position_updates);
	clearInterval(ship_updates)
	$('#targetGrid>tbody>tr>.grid').removeAttr('onclick');
};

function restartOrQuit(){
	var restartHtml = '<form method="POST" action="restartGame"><button>Restart</button></form><br><form method="POST" action="quitGame"><button>Quit</button></form>';
	$('div.info').html(restartHtml);
}
function display_Message(message){
	$('.message').html('<p>'+message+'</p>');
};
function getCookie(){
	return $.cookie('name');
};

if(getCookie()){
	var position_updates = setInterval(get_updates,1000);
	var ship_updates = setInterval(get_ship_info,1000);
};
