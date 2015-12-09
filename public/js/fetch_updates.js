function get_updates(){
	$.get('get_updates',success);
	function success(data){
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
			"display_Message('It\'s '+turn+' turn')";
		else if(turn=='')
			display_Message('Your opponent player haven\'t started yet.');
		if(!gameEnd.player || !gameEnd.opponentPlayer){
			gameOver();
			if(!gameEnd.player)
				display_gameover('You lost the game');
			if(!gameEnd.opponentPlayer)
				display_gameover('You won the game');
		}
	};
};

function display_gameover(message){
	var sampleHtml = '<div class="game_screen"><div class="gameStatus">{{gameStatus}}</br></br> If you wants to play again click on restart otherwise click on quit"</div>'+
	'<div class="restartOrQuit"><form method="POST" action="restartGame"><button>Restart</button>'+
	'</form><form method="POST" action="quitGame"><button>Quit</button></form></div></div>';
	var template = Handlebars.compile(sampleHtml);
	var htmlStructure = template({gameStatus:message});
 	$('.game_screen').html(htmlStructure);
}

function get_ship_info(){
	$.get('shipInfo',function(data,status){
		var ships = JSON.parse(data);
		for (var ship in ships) {
			var ship_info = ships[ship];
			$('.ship_info .'+ship+' td:nth-child(2)').html(ship_info.hits)
			if(ship_info.status){
				$('.ship_info .'+ship).removeClass('alive');
				$('.ship_info .'+ship).addClass('sunk');
				$('.ship_info .'+ship+' td:nth-child(3)').html('sunk')
			}
		};
	});
};



function reply_to_shoot(evnt){
	evnt = evnt.target;
	$.post("shoot",{position:evnt.id},function(data){
		var status = JSON.parse(data);
		if(status.reply){
			$('#targetGrid>tbody>tr>td#'+evnt.id).removeAttr('onclick');
			$('#targetGrid>tbody>tr>td#'+evnt.id).addClass(status.reply);
		}
		if(status.end)
			if(!gameEnd.player)
				display_gameover('You lost');
			else if(!gameEnd.opponentPlayer)
				display_gameover('You won');
	});
};

function gameOver(){
	clearInterval(position_updates);
	clearInterval(ship_updates)
	$('#targetGrid>tbody>tr>.grid').removeAttr('onclick');
};
function display_Message(message){
	$('.message').html('<p>'+message+'</p>');
};
function getCookie(){
	return $.cookie('name');
};

if(getCookie()||$(window).unload()){
	var position_updates = setInterval(get_updates,1);	
	var ship_updates = setInterval(get_ship_info,1000);
};
