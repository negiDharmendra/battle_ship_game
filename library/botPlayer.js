var http = require('http');
var Events = require("events").EventEmitter;

var PriorityGrid = require('./priorityGridLib.js');

const HOST = process.env.BOT_HOST ||'localhost';
const PORT = process.env.BOT_PORT || 5000;

var emitter = new Events();

var bodyParser = function(res, next) {
    var data = '';
    res.on('data', function(chunk) {
        data += chunk;
    });
    res.on('end', function() {
        data = JSON.parse(data);
        res.body = data;
        next();
    });
};

var BotPlayer = function(gameId) {
    var grid = new PriorityGrid();
    this.http = http;
    this.name = 'userName=BotPlayer';
    this.cookie = 'Id=' + gameId;
    this.grid = grid;
};

BotPlayer.prototype.start = function() {
    var caller = this;
    console.log('Starting')
     var options = {
        hostname: HOST,
        port: PORT,
        path: '/joinGame',
        method: 'POST',
        headers: {
            'Cookie': caller.name
        }
    };
    var req = caller.http.request(options, function(res) {
        if (res.statusCode == 302) {
            console.log('Joined Game');
            caller.cookie = res.headers['set-cookie'].toString().replace('Path=/,', '');
            caller.cookie = caller.cookie.replace('Path=/', '');
            emitter.emit('deploy', caller);
            return;
        }
    });
    req.write(caller.cookie);
    req.end();
    
};

var getUpdates = function(caller){
	var options = {
        hostname: HOST,
        port: PORT,
        path: '/get_updates',
        headers: {
            'Cookie': caller.cookie
        }
    };
    caller.name = caller.cookie.split(';')[1].split('=')[1];
    var req = http.request(options,function(res){
    	var sucess = function(){
    		var updates = res.body;
    		if(updates.turn == caller.name)
                emitter.emit('shoot',caller);
            if(updates.gameEnd!==null || !updates.liveStatusOfGame){
                clearInterval(caller.interval);
                setTimeout(function(){ 
                    emitter.emit('quitGame',caller);
                },4000);
                return ;
            }
    	};
    	bodyParser(res, sucess);
    });
    req.end();
}

emitter.on('deploy', function(caller) {
    var shipPositions = caller.grid.fleetPosition();
    var failed = 0;
    var counter = 0;
    var pased = 0;
    var options = {
        hostname: HOST,
        port: PORT,
        path: '/deployShip',
        method: 'POST',
        headers: {
            'Cookie': caller.cookie
        }
    };
    for (var i =0 ; i< 5 ;i++) {
        var req = caller.http.request(options, function(res) {
        var sucess = function() {
            var data = res.body;
            counter++;
            if(data===true)
              pased++;  
            else if (data !== true)
              failed++;
            if (counter == 5){
                if(failed)
                    emitter.emit('deploy', caller);
                else
                    emitter.emit('sayReady', caller);
            }
            
        }
        bodyParser(res, sucess);
        });
        var postion = 'name=' + shipPositions[i].shipName +
         '&positions='+ shipPositions[i].position  +
         '&alignment='+shipPositions[i].alignment;
        console.log(postion);
        req.write(postion);
        req.end();
    }
});

emitter.on('sayReady', function(caller) {
    var options = {
        hostname: HOST,
        port: PORT,
        path: '/deploy.html',
        method: 'POST',
        headers: {
            'Cookie': caller.cookie
        }
    };
    var req = caller.http.request(options, function(res) {
        if (res.statusCode == 302) {
            console.log('Announced Ready');
            caller.interval = setInterval(getUpdates.bind(null,caller),2000);
        }
    });
    req.write(caller.cookie);
    req.end();
});

emitter.on('shoot',function(caller){
	var current = caller.grid.getPosition();
    console.log("current----->",current.key);
	var options = {
        hostname: HOST,
        port: PORT,
        path: '/shoot',
        method: 'POST',
        headers: {
            'Cookie': caller.cookie
        }
    };
    var req = caller.http.request(options, function(res) {
    	var sucess = function(){
    		caller.grid.setResult(current,res.body.reply);
    	};
        bodyParser(res, sucess);
    });
    var postion = 'position='+current.key;
    req.write(postion);
    req.end();
});

emitter.on('quitGame', function(caller) {
    var options = {
        hostname: HOST,
        port: PORT,
        path: '/quitGame',
        method: 'POST',
        headers: {
            'Cookie': caller.cookie
        }
    };
    var req = caller.http.request(options, function(res) {
        if(res.statusCode==302)
            console.log('Auto Bot Quit'); 
    });
    req.write(caller.cookie);
    req.end();
});

process.on('uncaughtException',function(err){
    console.log(err);
})
module.exports = BotPlayer;
