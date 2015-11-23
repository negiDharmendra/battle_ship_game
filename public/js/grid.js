var reply_click = function(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	if(evnt.nodeName === 'BUTTON')
		document.querySelector('#targetGrid>tbody>tr>td>#'+evnt.id).remove();
};

var renderGrid = function(oceanGrid,targetGrid){
	var oceanGridTemplate = [];
	var targetGridTemplate = [];
	for (var i = 1; i <= 10; i++) {
		oceanGridTemplate.push('<tr>');targetGridTemplate.push('<tr>');
		var character = String.fromCharCode(64+i);
		for (var j = 1; j <= 10; j++) {
			oceanGridTemplate.push('<td id='+character+j+'>'+character+j+'</td>');
			targetGridTemplate.push('<td><button id='+character+j+'></button></td>');
		};
		oceanGridTemplate.push('</tr>');targetGridTemplate.push('</tr>');
	};
	oceanGrid.innerHTML += '<table id="oceanGrid">'+oceanGridTemplate.join('\n')+'</table>';
	targetGrid.innerHTML += '<table id="targetGrid">'+targetGridTemplate.join('\n')+'</table>';
};

var setUP_battleShip = function(){
	var position = document.querySelector('#battleship').value;
	position.trim().split(' ').forEach(function(ele){
		document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='red';
	});
	document.querySelector('#deployBattleship').remove()
};;
var setUP_cruiser = function(){
	var position = document.querySelector('#cruiser').value;
	position.split(' ').forEach(function(ele){
		document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='green';
	});
	document.querySelector('#deployCruiser').remove()
};
var setUP_carrier = function(){
	var position = document.querySelector('#carrier').value;
	position.trim().split(' ').forEach(function(ele){
		document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='white';
	});
	document.querySelector('#deployCarrier').remove()
};
var setUP_destroyer = function(){
	var position = document.querySelector('#destroyer').value;
	position.trim().split(' ').forEach(function(ele){
		document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='black';
	});
	document.querySelector('#deployDestroyer').remove()
};
var setUP_submarine = function(){
	var position = document.querySelector('#submarine').value;
	position.trim().split(' ').forEach(function(ele){
		document.querySelector('#ocean_grid>table>tbody>tr>#'+ele+'').style.background='blue';
	});
	document.querySelector('#deploySubmarine').remove()
};
window.onload = function(){
	var oceanGrid = document.querySelector('#game_screen> #ocean_grid');
	var targetGrid = document.querySelector('#game_screen> #target_grid');
	renderGrid(oceanGrid,targetGrid);
	targetGrid.querySelector('#targetGrid').setAttribute('onclick','reply_click()')
	document.querySelector('#deployBattleship').onclick = setUP_battleShip;
	document.querySelector('#deployCruiser').onclick = setUP_cruiser;
	document.querySelector('#deployCarrier').onclick = setUP_carrier;
	document.querySelector('#deployDestroyer').onclick = setUP_destroyer;
	document.querySelector('#deploySubmarine').onclick = setUP_submarine;
};
