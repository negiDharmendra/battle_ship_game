var Player = require('../library/player.js');
var sinon = require('sinon');
var chai = require('chai');

var deployShip = function(player) {
    var game = {
        validatePosition: sinon.stub().withArgs().returns(true),
        validateAlignment: sinon.stub().withArgs().returns(true),
        validateSize: sinon.stub().withArgs().returns(true),
    };
    var fleet = ['cruiser', 'carrier', 'submarine', 'battleship', 'destroyer'];
    var positions = ['A1', 'C6', 'H5', 'E3', 'G7'];
    fleet.forEach(function(ship, index) {
        player.deployShip(ship, positions[index], game, 'horizontal');
    })
};

describe('Player', function() {
    var game;
    var player;
    var player1;
    beforeEach(function() {
        player = new Player('arun');
        player1 = new Player('rana');
    });
    it('has \'fleet\' of five ship.', function() {
        chai.expect(player.fleet).to.have.all.keys('battleship', 'carrier', 'cruiser', 'destroyer', 'submarine');
    });
    describe('deployShip', function() {
        describe('player', function() {
            var game = {
                validatePosition: sinon.stub().withArgs().returns(true),
                validateAlignment: sinon.stub().withArgs().returns(true),
                validateSize: sinon.stub().withArgs().returns(true)
            };
            it('should able to deploy ship', function() {
                var deployedShip = player.deployShip('cruiser', 'A1', game, 'vertical');
                chai.assert.ok(deployedShip);
            });
            it('should have deployed ship position in usedPositions', function() {
                var deployedShip = player.deployShip('cruiser', 'A1', game, 'horizontal');
                chai.assert.deepEqual(player.usedPositions, ['A1', 'A2', 'A3']);
            });
            it('should have all deployed ship position in usedPositions', function() {
                var deployedCruiser = player.deployShip('cruiser', 'A1', game, 'horizontal');
                chai.assert.deepEqual(player.usedPositions, ['A1', 'A2', 'A3']);
                var deployedBattleship = player.deployShip('battleship', 'J1', game, 'horizontal');
                chai.assert.deepEqual(player.usedPositions, ['A1', 'A2', 'A3', 'J1', 'J2', 'J3', 'J4']);
            });
        });
        describe('throws an error when player tries to deploy his ship', function() {
            it('diagonally', function() {
                var game = {
                    validatePosition: sinon.stub().withArgs().returns(true),
                    validateAlignment: sinon.stub().withArgs().returns(false),
                    validateSize: sinon.stub().withArgs().returns(true)
                };
            });
            it('on invalid postions', function() {
                var game = {
                    validatePosition: sinon.stub().withArgs().returns(false),
                    validateAlignment: sinon.stub().withArgs().returns(true),
                    validateSize: sinon.stub().withArgs().returns(true)
                };
                var deployedBattleship = function() {
                    player.deployShip('battleship', 'A7', game, 'horizontal')
                };
                chai.expect(deployedBattleship).to.throw(Error, /^Position Not Valid.$/);
            });
            it('on used positions', function() {
                var game = {
                    validatePosition: sinon.stub().withArgs().returns(true),
                    validateAlignment: sinon.stub().withArgs().returns(true),
                    validateSize: sinon.stub().withArgs().returns(true)
                };
                var deployedCruiser = player.deployShip('cruiser', 'A1', game, 'horizontal');
                var deployedBattleship = function() {
                    player.deployShip('battleship', 'A2', game, 'horizontal')
                };
                chai.assert.ok(deployedCruiser);
                chai.expect(deployedBattleship).to.throw(Error, /^Position is already used$/);
            });
        });
    });
    describe('ready', function() {
        var player, opponentPlayer, game;
        beforeEach(function() {
            player = new Player('Manu');
            deployShip(player);
            opponentPlayer = new Player('Shanu');
            deployShip(opponentPlayer);
            game = {
                turn: null,
                readyPlayers: [],
                validatePosition: sinon.stub().withArgs().returns(true),
                validateAlignment: sinon.stub().withArgs().returns(true),
                validateSize: sinon.stub().withArgs().returns(true),
            };
        });
        it('will set the player turn first if player is the first one to say ready', function() {
            player.playerId = 1;
            opponentPlayer.playerId = 2;
            player.ready(game);
            opponentPlayer.ready(game);
            chai.expect(game.turn).to.equal(1);
        });
    })
    describe('shoot', function() {
        var player, opponentPlayer, game;
        beforeEach(function() {
            player = new Player('Manu');
            deployShip(player);
            opponentPlayer = new Player('Shanu');
            deployShip(opponentPlayer);
            game = {
                turn: null,
                readyPlayers: [],
                validatePosition: sinon.stub().withArgs().returns(true),
                validateAlignment: sinon.stub().withArgs().returns(true),
                validateSize: sinon.stub().withArgs().returns(true),
            };
        });
        it('will invoke destroy method once for a valid shoot', function() {
            player.ready(game);
            opponentPlayer.ready(game);
            player.playerId = 1;
            opponentPlayer.playerId = 2;
            game.turn = 1;
            game.destroy = sinon.stub().withArgs().returns('cruiser');
            player.shoot(opponentPlayer, 'A1', game);
            chai.assert(game.destroy.calledOnce);
        });
        it('player can not shoot if it is not his turn', function() {
            player.ready(game);
            opponentPlayer.ready(game);
            player.playerId = 1;
            game.turn = 2;
            chai.expect(function() {
                player.shoot(opponentPlayer, 'A1', game);
            }).to.throw(Error, /^Opponent turn$/);
        });
        it('player can shoot only if it is his turn', function() {
            player.playerId = 1;
            player.ready(game);
            opponentPlayer.ready(game);
            game.turn = 1;
            game.destroy = sinon.stub().withArgs().returns('cruiser')
            chai.expect(function() {
                player.shoot(opponentPlayer, 'A1', game);
            }).not.to.throw(Error);
        });
        it('player can not shoot on invalid position', function() {
            player.ready(game);
            opponentPlayer.ready(game);
            player.playerId = 1;
            opponentPlayer.playerId = 2;
            game.turn = 1;
            game.validatePosition = sinon.stub().withArgs().returns(false)
            chai.expect(function() {
                player.shoot(opponentPlayer, 'A12', game);
            }).to.throw(Error, /^Invalid position$/);
        });
        it('after every shoot hit or miss event will be invoked and turn will be changed', function() {
            player.ready(game);
            opponentPlayer.ready(game);
            player.playerId = 1;
            opponentPlayer.playerId = 2;
            game.turn = 1;
            game.destroy = sinon.stub().withArgs().returns('cruiser');
            player.shoot(opponentPlayer, 'A1', game);

            chai.expect(game.turn).to.be.equal(2);
        });
        it('can not shoot if not announced ready', function() {
            player.playerId = 1;
            opponentPlayer.playerId = 2;
            game.turn = 1;
            chai.expect(function() {
                player.shoot(opponentPlayer, 'A1', game);
            }).to.throw(Error, /^Not announced ready$/);
        });
    });
    describe('removeDamagePosition', function() {
        var player, opponentPlayer, game;
        beforeEach(function() {
            player = new Player('Manu');
            deployShip(player);
            opponentPlayer = new Player('Shanu');
            deployShip(opponentPlayer);
        });
        it('should remove the given position from usedPosition', function() {
            player.removeDamagePosition('A1');
            chai.expect(player.usedPositions).to.have.length(16);
        });
    })
    describe('getBoardStatus', function() {
        var player, opponentPlayer, game;
        beforeEach(function() {
            player = new Player('Manu');
            deployShip(player);
        });
        it('should get the status of the board when it is clean', function() {
            var boardStatus = player.getBoardStatus();
            chai.expect(boardStatus).to.have.length(100);
            boardStatus.forEach(function(key){
                chai.assert.equal(key,0);
            });
        });
        it('should get the status of the board when some of the hits and misses are on it', function() {
            player.hit = ['A1','J2'];
            player.miss = ['B1','D2'];
            var boardStatus = player.getBoardStatus();
            chai.assert.equal(boardStatus[0],1);
            chai.assert.equal(boardStatus[91],1);

            chai.assert.equal(boardStatus[10],2);
            chai.assert.equal(boardStatus[31],2);
        });
        it('should not change the status of the board if there are no miss and hits', function() {
            player.hit = ['A1'];
            var boardStatus = player.getBoardStatus();

            chai.assert.equal(boardStatus[0],1);
            boardStatus.shift();
            
            boardStatus.forEach(function(key){
                chai.assert.equal(key,0);
            });
        });
        it('convert to numeric should convert the postion to numeric values', function() {
            var numeric = player.convertToNumeric('A2')
            chai.expect(numeric).to.be.equal(1);
        });
        it('convert to numeric should convert the postion to numeric values', function() {
            var numeric = player.convertToNumeric('J1')
            chai.expect(numeric).to.be.equal(90);
        });
    })
});
