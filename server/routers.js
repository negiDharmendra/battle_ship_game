var express = require('express');
var body_parser = require('./body_parser.js');
var log = require('./log.js');
var Player = require('../library/player.js');
var cookie_parser = require('cookie-parser');
var BotPlayer = require('../library/botPlayer.js');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var dbWriter = require('../db/dbWriter.js');

var app = express();
    passport.use(new FacebookStrategy({
    clientID :process.env.CLIENTID,
    clientSecret : process.env.CLIENTSECRET,
    callbackURL : process.env.CALLBACKURL
    },
    function(accessToken,refreshToken,profile,done){
           return done(null,{id:profile.id,userName:profile.displayName})
    }));


passport.serializeUser(function(user,done){
    done(null,user)
})
passport.deserializeUser(function(user,done){
    done(null,user)
})
app.use(passport.initialize())
app.use(passport.session())

app.get('/facebookauth',passport.authenticate('facebook'));

app.get('/auth/facebook/callback',passport.authenticate('facebook',{failureRedirect:'/'}),function(req,res){
    res.cookie('userName', req.user.userName);
    res.redirect('/allGames.html');
});

app.use(body_parser);
app.use(cookie_parser());

var redirectPlayerToState = function(req, res) {
    try {
        if (req.cookies.gameId && req.cookies.userName && app.games.ensureValidGame(req.cookies.gameId)) {
            req.game = app.games.getGame(req.cookies.gameId);
            req.user = req.game.getPlayer(req.cookies.userName);
            if (!req.user.readyState)
                res.redirect('/deploy.html');
            else
                res.redirect('/battleship.html');
        } else
            res.redirect('/index.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'redirectPlayerToState ➽' + err.message);
        res.redirect('/index.html');
    }
};

app.get('/', redirectPlayerToState);
app.use(express.static('./public'));
app.use(express.static('./public/html/'));

var loadUser = function(req, res, next) {
    try {
        if (app.games.ensureValidGame(req.cookies.gameId)) {
            req.game = app.games.getGame(req.cookies.gameId);
            req.user = req.game.getPlayer(req.cookies.userName);
            next();
        } else
            res.redirect('/index.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'loadUser ➽' + err.message);
        res.redirect('/index.html');
    }
};

var deployShips = function(req, res) {
    var game = req.game;
    var player = req.user;
    var status = '';
    try {
        status = player.deployShip(req.body.name, req.body.positions, game,req.body.alignment);
        log.log_message('appendFile', 'players.log', req.user.playerId + ' has deployed his ' + req.body.name);
    } catch (err) {
        status = err.message;
        log.log_message('appendFile', 'errors.log', 'deployShip ' + req.user.playerId + '➽' + err.message + ' for ' + req.body.name);
    } finally {
        res.send(JSON.stringify(status));
    };
};

var readyAnnouncement = function(req, res) {
    var game = req.game;
    var player = req.user;
    try {
        player.ready(game,dbWriter.savePlacments);
        res.redirect('/battleship.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'readyAnnouncement ' + req.user.playerId + '➽' + err.message);
        res.redirect('/deploy.html');
    }
};

var validateShoot = function(req, res) {
    var game = req.game;
    var player = req.user;
    var status = {};
    try {
        var opponentPlayer = game.getOpponentplayer(req.user.playerId);
        status.opponentPlayerId = opponentPlayer.playerId;
        status.reply = player.shoot(opponentPlayer, req.body.position, game,dbWriter.saveShotResult);
    } catch (err) {
        status.error = err.message;
        log.log_message('appendFile', 'errors.log', 'validateShoot ' + req.user.playerId + '➽' + err.message);
    };
    res.send(JSON.stringify(status));
};


var serveShipInfo = function(req, res) {
    try{
        var game = req.game;
        res.send(JSON.stringify(game.serveShipInfo(req.user.playerId)));
    }catch (err) {
        log.log_message('appendFile', 'errors.log', 'serveShipInfo ' + playerId + '➽' + err.message);
    }
};


var respondToQuitGame = function(req, res) {
    var playerId = req.user.playerId;
    var game = req.game;
    try {
        res.clearCookie('userName');
        res.clearCookie('gameId');
        game.deletePlayer(playerId);
        res.redirect('/index.html');
        log.log_message('appendFile', 'players.log', playerId + ' has quit the game');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'respondToQuitGame ' + playerId + '➽' + err.message);
    }
};

var respondToRestartGame = function(req, res) {
    var playerId = req.user.playerId;
    var playerName = req.user.name;
    var game = req.game;
    try {
        game.deletePlayer(playerId);
        var player = new Player(playerName);
        game.turn = null;
        app.games.joinGame(game, player);
        res.cookie('userName', player.playerId);
        res.redirect('/deploy.html');
        log.log_message('appendFile', 'players.log', playerId + ' has restarted the game');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'respondToRestartGame ' + playerId + '➽' + err.message);
    } finally {
        res.end();
    };
};

var getMyshootPositions = function(req, res) {
    var player = req.user;
    try {
        var status = {};
        status.hit = player.hit;
        status.miss = player.miss;
        res.send(JSON.stringify(status));
    } catch (e) {
        console.log(e.message);
    }
};

var getUpdates = function(req, res) {
    var game = req.game;
    res.send(JSON.stringify(game.getUpdates(req.user.playerId)));
};



var joinGame = function(req, res) {
    try {
        var gameId = req.body.Id;
        var player = new Player(req.cookies.userName);
        var game = app.games.getGame(gameId);
        app.games.joinGame(game, player);
        res.cookie('gameId', game.gameId);
        res.cookie('userName', player.playerId);
        res.redirect('/deploy.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'joinGame ➽' + err.message);
    }
};

var getAllGames = function(req, res) {
    try {
        var games = app.games.getInitializedGames();
        if (Object.keys(games).length){
            var gameIds = {};
            for (var game in games) {
                var player = games[game].players;
                var playerId = Object.keys(player);
                var playerName = player[playerId[0]].name;
                gameIds[game] = playerName;
            }
            res.send(JSON.stringify(gameIds));
        }
        else
            res.send('false');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'getAllGames ➽' + err.message);
    }
}

var newGame = function(req, res) {
    try {
        var player = new Player(req.cookies.userName);
        var game = app.games.createGame(player);
        res.cookie('userName', player.playerId);
        res.cookie('gameId', game.gameId);
        res.redirect('/deploy.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'newGame ➽' + err.message);
    }
};


var playWithBot = function(req, res) {
    try {
        var player = new Player(req.cookies.userName);
        var game = app.games.createGame(player);
        res.cookie('userName', player.playerId);
        res.cookie('gameId', game.gameId);
        var bot = new BotPlayer(game.gameId);
        bot.start();
        res.redirect('/deploy.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'playWithBot ➽' + err.message);
    }
};

var getAccuracy = function(req,res){
    var game =req.game;
    var player = req.user;
    var opponentPlayer = game.getOpponentplayer(req.user.playerId);
    var status = {
        player: {hit: player.hit.length, miss: player.miss.length},
        opponentPlayer: {hit: opponentPlayer.hit.length, miss: opponentPlayer.miss.length}
    };
    var accuracyOfPlayer = Math.round((status.player.hit/(status.player.hit+status.player.miss))*100);
    var accuracyOfOpponent = Math.round((status.opponentPlayer.hit/(status.opponentPlayer.hit+status.opponentPlayer.miss))*100);
    var accuracy = {accuracyOfPlayer:accuracyOfPlayer, accuracyOfOpponentPlayer:accuracyOfOpponent};
    res.send(JSON.stringify(accuracy));
}

var getStatus = function(req,res){
    try{
        

    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'gameOver ➽' + err.message);
    }
}


app.post('/newGame', newGame);

app.post('/playWithBot', playWithBot);

app.get('/getAllGames', getAllGames);

app.post('/joinGame', joinGame);

app.use(loadUser);

app.post('/deployShip', deployShips);

app.post('/deploy.html', readyAnnouncement);

app.get('/get_updates', getUpdates);

app.post('/restartGame', respondToRestartGame);

app.get('/shipInfo', serveShipInfo);

app.post('/shoot', validateShoot);

app.post('/quitGame', respondToQuitGame);

app.get('/myShootPositions', getMyshootPositions);

app.get('/accuracy', getAccuracy);

app.get('/checkStatus', getStatus);

app.createController = function(games) {
    app.games = games;
    return app;
};

module.exports = app;
