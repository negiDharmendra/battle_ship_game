var lib={};
module.exports=lib;
lib.getCookie =function(req,cookieName) {
    var cookies = req.headers.cookie || '';
    var cookieRegEx = new RegExp(cookieName+'=\\w+','g'); 
    var cookie = cookies.match(cookieRegEx);
    cookie = cookie && cookie.pop() || '';
    var cookieValue = cookie.substr(cookie.indexOf('=')+1);
    return cookieValue;
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
