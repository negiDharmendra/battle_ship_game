var express = require('express');
var body_parser = require('./body_parser.js');
var log = require('./log.js');
var Player = require('../library/player.js');
var cookie_parser = require('cookie-parser');

var app = express();
app.use(body_parser);
app.use(cookie_parser());
app.use(express.static('./public'));


var loadUser = function(req, res, next) {
    try {
        if (app.games.ensureValidGame(req.cookies.gameId)) {
            req.game = app.games.getGame(req.cookies.gameId);
            req.user = req.game.getPlayer(req.cookies.userName);
            next();
        } else
            res.redirect('/html/index.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'loadUser ➽' + err.message);
        res.redirect('/html/index.html');
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
        player.ready(game);
        res.redirect('/html/battleship.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'readyAnnouncement ' + req.user.playerId + '➽' + err.message);
        res.redirect('/html/deploy.html');
    }
};

var validateShoot = function(req, res) {
    var game = req.game;
    var player = req.user;
    var status = {};
    try {
        var opponentPlayer = game.getOpponentplayer(req.user.playerId);
        status.reply = player.shoot(opponentPlayer, req.body.position, game);
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
        res.redirect('/html/index.html');
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
        app.games.joinGame(game, player);
        res.cookie('userName', player.playerId);
        res.redirect('/html/deploy.html');
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

var redirectPlayerToState = function(req, res) {
    try {
        if (req.cookies.gameId && req.cookies.userName && app.games.ensureValidGame(req.cookies.gameId)) {
            req.game = app.games.getGame(req.cookies.gameId);
            req.user = req.game.getPlayer(req.cookies.userName);
            if (!req.user.readyState)
                res.redirect('/html/deploy.html');
            else
                res.redirect('/html/battleship.html');
        } else
            res.redirect('/html/index.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'redirectPlayerToState ➽' + err.message);
        res.redirect('/html/index.html');
    }
};

var joinGame = function(req, res) {
    try {
        var gameId = req.body.Id;
        var player = new Player(req.cookies.userName);
        var game = app.games.getGame(gameId);
        app.games.joinGame(game, player);
        res.cookie('gameId', game.gameId);
        res.cookie('userName', player.playerId);
        res.redirect('/html/deploy.html');
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
        res.redirect('/html/deploy.html');
    } catch (err) {
        log.log_message('appendFile', 'errors.log', 'newGame ➽' + err.message);
    }
};

app.get('/', redirectPlayerToState);

app.post('/html/index.html', function(req, res) {
    res.cookie('userName', req.body.name);
    res.redirect('/html/allGames.html');
});

app.post('/html/newGame', newGame);

app.get('/getAllGames', getAllGames);

app.post('/html/joinGame', joinGame);

app.use(loadUser);

app.post('/html/deployShip', deployShips);

app.post('/html/deploy.html', readyAnnouncement);

app.get('/html/get_updates', getUpdates);

app.post('/html/restartGame', respondToRestartGame);

app.get('/html/shipInfo', serveShipInfo);

app.post('/html/shoot', validateShoot);

app.post('/html/quitGame', respondToQuitGame);

app.get('/html/myShootPositions', getMyshootPositions);

app.createController = function(games) {
    app.games = games;
    return app;
};

module.exports = app;
