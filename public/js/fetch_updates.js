function get_updates(){
	$.get('get_updates',success);
	function success(data){
		var updates=JSON.parse(data);
		var gameEnd=updates.gameEnd;
		displayShips('#oceanGrid',updates.gotHit,updates.positions,'lightgreen');
		if(gameEnd===true)display_gameover('You won the game'),stop_updates();
		else if(gameEnd===false) display_gameover('You lost the game'),stop_updates();
		else displayTurnMessage(updates.turn);
	};
};
function displayTurnMessage(turn){
	if(!turn)
		display_Message('Your opponent is not ready');
	else if(turn==getCookie()){
		display_Message('Your Turn');
		$('#targetGrid>tbody>tr>td.grid').css({"cursor":"default"});
		$('#targetGrid>tbody>tr>td.grid').addClass('hover');
	}
	else{
		display_Message('Opponent Turn');
		$('#targetGrid>tbody>tr>td.grid').css({"cursor":"not-allowed"});
		$('#targetGrid>tbody>tr>td.grid').removeClass('hover');

	}
}

function display_gameover(message){
	var sampleHtml = '<div class="game_screen"><div class="gameStatus">{{gameStatus}}</br></br></div>'+
	'<div class="restartOrQuit"><form method="POST" action="restartGame"><button>Restart</button>'+
	'</form><form method="POST" action="quitGame"><button>Quit</button></form></div></div>';
	var template = Handlebars.compile(sampleHtml);
	var htmlStructure = template({gameStatus:message});
 	$('.game_screen').html(htmlStructure);
}
function displayShips(gridId,gotHit,usedPosition,color) {
	for (var i = 0; i < usedPosition.length; i++)
		$(gridId+'>tbody>tr>td#'+usedPosition[i]).css('background',color);
	for (var i = 0; i < gotHit.length; i++)
		$(gridId+'>tbody>tr>td#'+gotHit[i]).css('background','#ee9090');
};

function get_ship_info(){
	$.get('shipInfo',function(data,status){
		var ships = JSON.parse(data);
		for (var ship in ships) {
			var ship_info = ships[ship];
			$('.ship_info .'+ship+' td:nth-child(2)').html(ship_info.hits)
			if(ship_info.status){
				$('.ship_info .'+ship).removeClass('alive');
				$('.ship_info .'+ship).addClass('sunk');
				$('.ship_info .'+ship+' td:nth-child(3)').html('sunk');
			}
		};
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
	$.post("shoot",{position:evnt.id},function(data){
		var status = JSON.parse(data);
		if(status.reply){
			$('#targetGrid>tbody>tr>td#'+evnt.id).removeAttr('onclick');
			$('#targetGrid>tbody>tr>td#'+evnt.id).addClass(status.reply);
		}
	});
};

function stop_updates(){
	clearInterval(position_updates);
	clearInterval(ship_updates)
	$('#targetGrid>tbody>tr>.grid').removeAttr('onclick');
	$('.message').html('');
};
function display_Message(message){
	$('.message').html('<p>'+message+'</p>');
};
function getCookie(){
	return $.cookie('userName');
};

if(getCookie()||$(window).unload()){
	var position_updates = setInterval(get_updates,1000);	
	var ship_updates = setInterval(get_ship_info,1000);
};
