function get_updates(){
	var xmlRqst = new XMLHttpRequest();
	xmlRqst.onreadystatechange = function(){
		if(xmlRqst.readyState == 4 && xmlRqst.status==200){
			var gotHit = JSON.parse(xmlRqst.responseText);
			for (var i = 0; i < gotHit.length; i++) {
				document.querySelector('#oceanGrid>tbody>tr>td#'+gotHit[i]).style.background = 'red';
			};
		};
	};
	xmlRqst.open('GET','get_updates',true);
	xmlRqst.send();
};
if(document.cookie)
	setInterval(get_updates, 1000);

function sayReady(){
	var xmlRqst = new XMLHttpRequest();
	xmlRqst.onreadystatechange = function(){
		if(xmlRqst.readyState == 4 && xmlRqst.status==200){
			alert(JSON.parse(xmlRqst.responseText))
		};
	};
	document.querySelector('#harbor>button#ready').remove();
	alert("Please Wait");
	xmlRqst.open('POST','sayReady',true);
	xmlRqst.send('playerId='+getId());
};
function reply_to_shoot(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	if(evnt.nodeName === 'TD'){
		var xmlRqst = new XMLHttpRequest();
		xmlRqst.onreadystatechange = function(){
			if(xmlRqst.readyState == 4 && xmlRqst.status ==200){
				var status = JSON.parse(xmlRqst.responseText);
				if(status.reply){
					var color = (status.reply=='hit')&&'red'||'white';
					document.querySelector('#targetGrid>tbody>tr>td#'+evnt.id).style.background = color;
				}else alert(status.error);
			};
		};
		xmlRqst.open('POST','shoot',true);
		xmlRqst.send('position='+evnt.id+'&playerId='+getId());
	};
};

function reply_to_deployment(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	var position = document.querySelector('#harbor>input').value;
	var shipName = document.querySelector("#harbor>#position_of_ship>[value]").value;
	if(evnt.nodeName === 'BUTTON'){
		var xmlRqst = new XMLHttpRequest();
		xmlRqst.onreadystatechange = function(){
			if(xmlRqst.readyState == 4 && xmlRqst.status ==200){
				var reply = JSON.parse(xmlRqst.responseText);
				displayDeployedShip(reply,position);
			};
		};
		xmlRqst.open('POST','deployShip',true);
		xmlRqst.send('name='+shipName+'&positions='+position+'&playerId='+getId());
	};
};

function displayDeployedShip(reply,position){
	if(reply == true) {
		position.trim().split(' ').forEach(function(ele){
			document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='lightgreen';
		});
		document.querySelector('#harbor>input').value = '';
		document.querySelector('#harbor>#position_of_ship>[value]').remove();
		if(document.querySelector('#harbor>#position_of_ship').length == 0)
			document.querySelector('#harbor').innerHTML='<h1>Deployed all ships</h1></br>'+
			'<button id="ready" onclick = "sayReady()">Ready</button>';
	}
	else alert(reply);
};


function getId(){
	return document.cookie;
}