function checkCookie(){
	if(!navigator.cookieEnabled){
		$('body').html('<h1>Can not start the Game</h1></br>'+
		'<p align=center>Your browser does not support cookies . '+
		'Make Sure that Cookies are enabled in browser to play the game.</p>');
	}
};

$(window).load(function(){
	checkCookie();
});