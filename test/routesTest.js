var routers = require("../server/routers.js");
var supertest = require("supertest"); 
var sinon = require('sinon');
var chai = require('chai');
var Games  = require('../library/games.js');
var expect = chai.expect;

describe("get",function(){
	describe("/",function(){
		it("for / should redirect me to index.html",function(done){
			supertest(routers)
				 .get("/")
				 .expect(302)
				 .expect("Location","/html/index.html",done);
		});
	});
	describe("Get static files",function(){
		it("for /index.html should serve the file index.html from public folder",function(done){
			supertest(routers)
				 .get("/html/index.html")
				 .expect("Content-Type", /text\/html/)
				 .expect(200)
				 .expect(/WELCOME TO BATTLESHIP GAME/,done);
		});
	});
});

describe("redirection to allgame.html",function(){
	describe("Player",function(){
		it("should logged in the user and redirect to the allgame.html",function(done){
			routers.players ={};
			supertest(routers)
				.post("/html/index.html")
				.send("name=Dharmendra")
				.expect(302)
				.expect("Location","/html/allGames.html",done);
		});
	});
})		
describe("all games",function(){
	it('should get all game on allGame.html',function(done){
	var allgames ={game1:{},game2:{}};
	var game = {};
	var games ={
		getInitializedGames : sinon.stub().returns(allgames),
		getGame : sinon.stub().returns(game),
		joinGame : sinon.stub().returns(game)
	}
	routers =routers.createController(games);
		supertest(routers)
		.get('/getAllGames')
		.set('Cookie','userName=vikas')
		.expect('["game1","game2"]')
		.expect(200,done);
	});
});
describe("new games",function(){
	it('should create a game',function(done){
	var allgames ={game1:{},game2:{}};
	var game = {gameId:100};
	var games ={
		getInitializedGames : sinon.stub().returns(allgames),
		getGame : sinon.stub().returns(game),
		joinGame : sinon.stub().returns(game),
		createGame:sinon.stub().returns(game)
	}
	routers =routers.createController(games);
		supertest(routers)
		.post('/html/newGame')
		.set('Cookie','userName=vikas')
		.expect('Location','/html/deploy.html')
		.expect(302,done);
	});
});
describe('player ',function(){
	it('should join game after creating new game',function(done){
		supertest(routers)
		.post('/html/joinGame')
		.set('Cookie','userName=vikas')
		.expect('Location','/html/deploy.html')
		.expect(302,done)
	})
})
describe("/html/deployShip",function(){
	it("should allow to deploy battleship",function(done){
		var game = {players:{
			Dharmendra_3:{
			deployShip:sinon.stub().returns(true),
			playerId:'Dharmendra_3'}
			}};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}

		supertest(routers)
			.post("/html/deployShip")
			.set("Cookie","userName=Dharmendra_3;gameId=100")
			.send("name=battleship&positions=A1+A2+A3+A4")
			.expect(200)
			.expect("true",done);
	});
});
describe("/html/deploy.html",function(){
	it("should redirect player to battleship.html",function(done){
		var game = {players:{
			Dharmendra_3:{
			ready:sinon.spy(),
			playerId:'Dharmendra_3'}
			}};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}

		supertest(routers)
			.post("/html/deploy.html")
			.set("Cookie","userName=Dharmendra_3;gameId=100")
			.expect(302)
			.expect("Content-Type", /text\/plain/)
			.expect("Location","/html/battleship.html",done);
	});
});
describe("updates",function(){
	it('should give updates when player say ready',function(done){
		var game = {players:{
			Dharmendra_3:{
			playerId:'Dharmendra_3'}
			},
			getUpdates:sinon.spy()};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.get('/html/get_updates')
		.set("Cookie","userName=Dharmendra_3;gameId=100")
		.expect(200,done)
	});
})

describe("Player shoot",function(){
	it("should validate shoot for miss ",function(done){
		var game = {players:{
			Dharmendra_6:{},
			Vikas_4:{
			readyState:true,playerId:'Vikas_4',shoot : sinon.stub().withArgs().returns("miss")},},
			getOpponentplayer : sinon.stub().withArgs(100).returns('true')
			};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.post("/html/shoot")
		.set("Cookie","userName=Vikas_4")
		.send("position=A1")
		.expect('{"reply":"miss"}')
		.expect(200,done);
	});
});
describe("Player can when it's not his turn",function(){
	it("should validate shoot for miss ",function(done){
		var game = {players:{
			Dharmendra_6:{},
			Vikas_4:{
			readyState:true,playerId:'Vikas_4',shoot : sinon.stub().withArgs().throws("Error","Opponent turn")},},
			turn : 'Vikas_4',
			getOpponentplayer : sinon.stub().withArgs(100).returns('true')
			};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.post("/html/shoot")
		.set("Cookie","userName=Vikas_4")
		.send("position=A1")
		.expect('{"error":"Opponent turn"}')
		.expect(200,done);
	});
});
describe("Player shoot on invalid position",function(){
	it("should validate shoot for miss ",function(done){
		var game = {players:{
			Dharmendra_6:{},
			Vikas_4:{
			readyState:true,playerId:'Vikas_4',shoot : sinon.stub().withArgs().throws("Error","Invalid position")},},
			getOpponentplayer : sinon.stub().withArgs(100).returns('true')
			};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.post("/html/shoot")
		.set("Cookie","userName=Vikas_4")
		.send("position=A12")
		.expect('{"error":"Invalid position"}')
		.expect(200,done);
	});
});
describe("Player shoot",function(){
	it("should validate shoot for hit ",function(done){
		var game = {players:{
			Dharmendra_6:{
			readyState:true,usedPositions:['A2'],playerId:'Vikas_4',isAlive:true},
			Vikas_4:{
			readyState:true,playerId:'Vikas_4',shoot : sinon.stub().withArgs().returns("hit")},},
			getOpponentplayer : sinon.stub().withArgs(100).returns('true')
			};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.post("/html/shoot")
		.set("Cookie","userName=Vikas_4")
		.send("position=A1")
		.expect('{"reply":"hit"}')
		.expect(200,done);
	});
});
describe('serveShipInfo',function(){
	it('should provide the ships information to player',function(done){
		var game = {players:{
			Dharmendra_3:{playerId:'Dharmendra_3',fleet:{battleship:{isSunk:sinon.stub().returns(false),vanishedLives:3}}}}};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
			.get('/html/shipInfo')
			.set("Cookie","userName=Dharmendra_3")
			.expect(/"hits":3/)
			.expect(/{"battleship":{"hits":3,"status":false}}/)
			.expect(200,done)
	})
})
describe('shoot positions',function(){
	it('should give shoot information',function(done){
		var game = {players:{
			Dharmendra_3:{playerId:'Dharmendra_3',hit:['A1']}}};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.get('/html/myShootPositions')
		.set("Cookie","userName=Dharmendra_3")
		.expect(/A1/)
		.expect(200,done)
	})
})
describe('reponse to quit game',function(){
	it('player can quit game',function(done){
		var game = {players:{
			Dharmendra_3:{playerId:'Dharmendra_3'}}};
		routers.games={
			getGame:sinon.stub().withArgs(100).returns(game)
		}
		supertest(routers)
		.post('/html/quitGame')
		.set("Cookie","userName=Dharmendra_3")
		.expect('Location','/html/index.html')
		.expect(302,done)
	})
})