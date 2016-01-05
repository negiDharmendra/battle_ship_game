function checkCookie(){
	if(!navigator.cookieEnabled){
		$('body').html('<h1>Can not start the Game</h1></br>'+
		'<p align=center>Your browser does not support cookies . '+
		'Make Sure that Cookies are enabled in your browser to play the game.</p></br>'+
		'<p>After that <a href="/html/index.html">Click</a> here to play the game</p>');
	}
};

$(window).load(function(){
	$.removeCookie('userName',null, { path: '/' });
	$.removeCookie('gameId',null, { path: '/' });
	checkCookie();
});