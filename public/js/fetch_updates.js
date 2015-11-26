
function reply_to_shoot(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	if(evnt.nodeName === 'BUTTON'){
	alert(evnt.id)
		var xmlRqst = new XMLHttpRequest();
		xmlRqst.onreadystatechange = function(){
			if(xmlRqst.readyState == 4 && xmlRqst.status ==200){
				var reply = JSON.parse(xmlRqst.responseText);
				document.querySelector('#targetGrid>tbody>tr>td>#'+evnt.id).remove();
				var color = (reply.status=='hit')&&'red'||'white';
				document.querySelector('#targetGrid>tbody>tr>td>#'+evnt.id).style.background= red;
			};
		};
		xmlRqst.open('POST','shoot',true);
		xmlRqst.send('position='+evnt.id);
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
				console.log(xmlRqst)
				var reply = JSON.parse(xmlRqst.responseText);
				if(reply == false ) alert('can\'t deploy ship on this position');
				else {
					position.trim().split(' ').forEach(function(ele){
						document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='green';
					});
					document.querySelector('#harbor>input').value = '';
					document.querySelector('#harbor>#position_of_ship>[value]').remove();
					if(document.querySelector('#harbor>#position_of_ship').length == 0){
						document.querySelector('#harbor').innerHTML='<h1>Deployed all ships</h1>';
					}
				};
			};
		};
		xmlRqst.open('POST','deployShip',true);
		xmlRqst.send('name='+shipName+'&positions='+position);
	};
};