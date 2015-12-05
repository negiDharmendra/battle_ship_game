var lib={};
module.exports=lib;
lib.getCookie =function(req,cookie_n) {
    var name = cookie_n + "=";
    var cookies = req.headers.cookie || '';
    var cookies = cookies.split(';');
    for(var index=0; index<cookies.length; index++) {
        var cookie = cookies[index];
        while (cookie.charAt(0)==' ') 
        	cookie = cookie.substring(1);
        if (cookie.indexOf(name) == 0) 
        	return cookie.substring(name.length, cookie.length);
    }
    return "";
};

lib.authenticateUser=function(cookie,players){
	if(!cookie || !players) return false;
	var playersCookie=Object.keys(players);
	return playersCookie.some(function(player){return player==cookie;});
};

lib.validateUser=function(req,res,next,players){
    var cookie=lib.getCookie(req,'name');
    req.playerId=cookie;
	if(lib.authenticateUser(cookie,players))
		next();
	else
		res.end('Not a Valid User');
};