var express = require('express');
var app = express();
var body_parser = require('./body_parser.js');
var log = require('./log.js');
var Player = require('../library/player.js');
var ld = require('lodash');
var cookie_parser = require('cookie-parser');

app.use(body_parser);
app.use(cookie_parser());
app.use(express.static('./public'));

var loadUser = function(req, res, next) {
    req.game = app.games.getGame(req.cookies.gameId);
    req.user = req.game.players[req.cookies.userName];
    next();
};

var deployShips = function(req, res) {
    var game = req.game;
    var status = '';
    try {
        var player = req.user;
        status = player.deployShip(req.body.name, req.body.positions.trim().split(' '), game);
        log.log_message('appendFile', 'players.log', req.user.playerId + ' has deployed his ' + req.body.name);
    } catch (err) {
        status = err.message;
        log.log_message('appendFile', 'errors.log', 'deployShip ' + req.user.playerId + '➽' + err.message + ' for ' + req.body.name);
    } finally {
        res.send(JSON.stringify(status));
    };
};

var readyAnnounement = function(req, res) {
    try {
        var game = req.game;
        var player = req.user;
        player.ready(game);
        res.redirect('/html/battleship.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'readyAnnounement ' + req.user.playerId + '➽' + err.message);
        res.send(err.message);
    }
};

var validateShoot = function(req, res) {
    var game = req.game;
    var status = {};
    try {
        var player = req.user;
        var opponentPlayer = game.getOpponentplayer(req.user.playerId);
        status.reply = player.shoot(opponentPlayer, req.body.position, game);
    } catch (err) {
        status.error = err.message;
        log.log_message('appendFile', 'errors.log', 'validateShoot ' + req.user.playerId + '➽' + err.message);
    };
    res.send(JSON.stringify(status));
};


var serveShipInfo = function(req, res) {
    try {
        var player = req.user;
        var fleetStatus = {};
        for (var ship in player.fleet) {
            var shipStatus = player.fleet[ship].isSunk();
            var hits = player.fleet[ship].vanishedLives;
            fleetStatus[ship] = {
                hits: hits,
                status: shipStatus
            };
        };
        res.send(JSON.stringify(fleetStatus));
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'serveShipInfo ' + req.user.playerId + '➽' + err.message);
    } finally {
        res.end();
    };
};

var respondToQuitGame = function(req, res) {
    try {
        var playerId = req.user.playerId;
        var game = req.game;
        res.clearCookie('userName');
        res.clearCookie('gameId');
        game.deletePlayer(playerId);
        res.redirect('/html/index.html');
        log.log_message('appendFile', 'players.log', +playerId + ' has quit the game');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'respondToQuitGame ' + playerId + '➽' + err.message);
    } finally {
        res.end();
    };
};

var getMyshootPositions = function(req, res) {
    try {
        var status = {};
        var player = req.user;
        status.hit = player.hit;
        status.miss = player.miss;
        res.send(JSON.stringify(status));
    } catch (e) {
        console.log(e.message);
    } finally {
        res.end();
    }
};


app.get('/', function(req, res) {
    res.redirect('/html/index.html');
});
app.post('/html/index.html', function(req, res) {
    res.cookie('userName', req.body.name);
    res.redirect('/html/allGames.html');
});
app.post('/html/newGame', function(req, res) {
    var player = new Player(req.cookies.userName);
    var game = app.games.createGame(player);
    res.cookie('userName', player.playerId);
    res.cookie('gameId', game.gameId);
    res.redirect('/html/deploy.html');
});

app.get('/getAllGames', function(req, res) {
    var games = app.games.getInitializedGames();
    if (Object.keys(games).length)
        res.send(JSON.stringify(Object.keys(games)));
    else
        res.send('false');
});
app.post('/html/joinGame', function(req, res) {
    var gameId = req.body.Id;
    var player = new Player(req.cookies.userName);
    var game = app.games.getGame(gameId);
    app.games.joinGame(game, player);
    res.cookie('gameId', game.gameId);
    res.cookie('userName', player.playerId);
    res.redirect('/html/deploy.html');
});

app.use(loadUser);
app.post('/html/deployShip', deployShips);
app.post('/html/deploy.html', readyAnnounement);
app.get('/html/get_updates', function(req, res) {
    var game = req.game;
    res.send(JSON.stringify(game.getUpdates(req.user.playerId)));
});
app.get('/html/shipInfo', function(req, res) {
    serveShipInfo(req, res);
});

app.post('/html/shoot', function(req, res) {
    validateShoot(req, res);
});


app.post('/html/quitGame', function(req, res) {
    respondToQuitGame(req, res);
});

app.get('/html/myShootPositions', function(req, res) {
    getMyshootPositions(req, res);
});

app.createController = function(games) {
    app.games = games;
    return app;
};

module.exports = app;
