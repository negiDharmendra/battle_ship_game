
function reply_to_shoot(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	if(evnt.nodeName === 'BUTTON'){
		var xmlRqst = new XMLHttpRequest();
		xmlRqst.onreadystatechange = function(){
			if(xmlRqst.readyState == 4 && xmlRqst.status ==200){
				var reply = JSON.parse(xmlRqst.responseText);
				reply.status
				document.querySelector('#targetGrid>tbody>tr>td>#'+evnt.id).remove();
				var color = (reply.status=='hit')&&'red'||'white';
				document.querySelector('#targetGrid>tbody>tr>td>#'+evnt.id).style.background= color;
			};
		};
		xmlRqst.open('POST','shoot',true);
		xmlRqst.send('position='+evnt.id)
	};
};

function reply_to_deployment(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	var position = document.querySelector('#harbor>#position>#'+evnt.id.split('_')[1]).value;
	var shipName = evnt.id.split('_')[1];
	if(evnt.nodeName === 'BUTTON'){
		var xmlRqst = new XMLHttpRequest();
		xmlRqst.onreadystatechange = function(){
			if(xmlRqst.readyState == 4 && xmlRqst.status ==200){
				var reply = JSON.parse(xmlRqst.responseText);
				if(reply == false ) alert('can\'t deploy ship on this position');
				else {
					position.trim().split(' ').forEach(function(ele){
						document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='green';
					});
					document.querySelctor('#harbor>#position>#'+evnt.id.split('_')[1]).value = '';
					document.querySelector('#harbor>#position>#'+evnt.id).remove();
				};
			};
		};
		xmlRqst.open('POST','deployShip',true);
		xmlRqst.send('name='+shipName+'&positions='+position)
	};
};