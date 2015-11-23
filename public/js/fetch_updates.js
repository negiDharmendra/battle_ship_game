
function reply_to_shoot(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	if(evnt.nodeName === 'BUTTON')
		document.querySelector('#targetGrid>tbody>tr>td>#'+evnt.id).remove();
};

function reply_to_deployment(evnt){
	evnt = evnt || window.event;
	evnt = evnt.target || evnt.srcElement;
	var position = document.querySelector('#harbor>#position>#'+evnt.id.split('_')[1]).value;
	if(evnt.nodeName === 'BUTTON'){
		position.trim().split(' ').forEach(function(ele){
			document.querySelector('#ocean_grid>table>tbody>tr>#'+ele).style.background='green';
		});
		document.querySelector('#harbor>#position>#'+evnt.id).remove();
	}
};