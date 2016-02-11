var http = require('http');
var Events = require("events").EventEmitter;

var PriorityGrid = require('./priorityGridLib.js');

const HOST = 'localhost';
const PORT = 5000;

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
    this.name = 'name=BotPlayer';
    this.cookie = 'Id=' + gameId;
    this.grid = grid;
};

BotPlayer.prototype.start = function() {
    var self = this;
    var options = {
        hostname: HOST,
        port: PORT,
        path: '/index.html',
        method: 'POST'
    };
    var req = this.http.request(options, function(res) {
        if (res.statusCode == 302) {
            console.log('Registered');
            self.name = res.headers['set-cookie'].toString();
            emitter.emit('joinGame', self);
        }
    });
    req.write(self.name);
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
            if(updates.gameEnd!==null){
                clearInterval(caller.interval);
            	emitter.emit('quitGame',caller);
                return ;
            }
    	};
    	bodyParser(res, sucess);
    });
    req.end();
}

emitter.on('joinGame', function(caller) {
    console.log(caller.cookie);
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
});



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
            if(data===true || data ==='Can not afford more Ships')
              pased++;  
            else if (data !== true)
                console.log('Failed',data,failed++);
            if (counter == 5){
                if(failed)
                    emitter.emit('deploy', caller);
                else
                    emitter.emit('sayReady', caller);
            }
            
        }
        bodyParser(res, sucess);
        });
        var postion = 'name=' + shipPositions[i][0] + '&positions='+ shipPositions[i][1]  +'&alignment='+shipPositions[i][2];
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
    console.log("current----->",current)
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
