var routers = require("../server/routers.js");
var supertest = require("supertest"); 
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

var players = {};
var game ={ game: 
   { validatePosition: sinon.stub().returns(true),
     validateAlignment: sinon.stub().returns(true),
     validateSize: sinon.stub().returns(true),
   },
  getUniqueId: sinon.spy()
};

routers =routers.createController(game,players);

describe("get",function(){
	describe("/",function(){
		it("for / should redirect me to index.html",function(done){
			supertest(routers)
				 .get("/")
				 .expect("Content-Type", /text\/plain/)
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

describe("Dynamic request based on State of Game",function(){
	describe("Player",function(){
		it("should logged in the user and redirect to the deploy.html",function(done){
			routers.players ={};
			supertest(routers)
				.post("/html/index.html")
				.send("name=Dharmendra")
				.expect("Content-Type", /text\/plain/)
				.expect(302)
				.expect("Location","/html/deploy.html",done);
		});
	});
	describe("/html/deployShip",function(){
		it("should allow to deploy battleship",function(done){
			routers.players = { Dharmendra_3:{deployShip:sinon.stub()
				.withArgs('battleship',['A1','A2','A3','A4'])
				.returns(true)}};

			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Dharmendra_3")
				.send("name=battleship&positions=A1+A2+A3+A4")
				.expect(200)
				.expect("true",done);
		});
	});
	describe("/html/deploy.html",function(){
		it("should redirect player to battleship.html",function(done){
			routers.players ={Dharmendra_3:{
					ready:sinon.spy()}};

			supertest(routers)
				.post("/html/deploy.html")
				.set("Cookie","userName=Dharmendra_3")
				.expect(302)
				.expect("Content-Type", /text\/plain/)
				.expect("Location","/html/battleship.html",done);
		});
	});

	describe("/html/deploy.html",function(){
		it("should not redirect player to battleship.html and return Error",function(done){
			routers.players ={Dharmendra_6:{
				ready:sinon.stub().withArgs().throws('Error','Can Not announce ready')}};
					
			supertest(routers)
				.post("/html/deploy.html")
				.set("Cookie","userName=Dharmendra_6")
				.expect(/Can Not announce ready/)
				.expect(200,done);
		});
	});
	describe("Player shoot",function(){
		it("should validate shoot for miss ",function(done){
			routers.game.shoot = sinon.stub().withArgs().returns("miss");
			routers.game.game.turn = 'Vikas_4';
			routers.players ={Dharmendra_6:
			{readyState:true,usedPositions:['A2'],playerId:'Dharmendra_6',isAlive:true},
			Vikas_4:{readyState:true,playerId:'Vikas_4'}};


			supertest(routers)
			.post("/html/shoot")
			.set("Cookie","userName=Vikas_4")
			.send("position=A1")
			.expect('{"reply":"miss"}')
			.expect(200,done);
		});
	});
	describe("Player shoot when it is not his turn",function(){
		it("should validate shoot",function(done){
			routers.game.shoot = sinon.stub().withArgs().throws("Error","Opponent turn");
			routers.game.game.turn = 'Vikas_4';
			routers.players ={Dharmendra_6:
			{readyState:true,usedPositions:['A2'],playerId:'Dharmendra_6',isAlive:true},
			Vikas_4:{readyState:true,playerId:'Vikas_4'}};

			supertest(routers)
			.post("/html/shoot")
			.set("Cookie","userName=Dharmendra_6")
			.send("position=A4")
			.expect('{"error":"Opponent turn"}')
			.expect(200,done)
		});
	});

	describe("Player shoot on invalid position ",function(){
		it("should validate shoot",function(done){
			routers.game.shoot = sinon.stub().withArgs().throws("Error","Invalid position");
			routers.game.game.turn = 'Dharmendra_6';
			routers.players ={Dharmendra_6:
			{readyState:true,playerId:'Dharmendra_6',isAlive:true},
			Vikas_4:{readyState:true,playerId:'Vikas_4',usedPositions:['A2'],isAlive:true}};

			supertest(routers)
				.post("/html/shoot")
				.set("Cookie","userName=Dharmendra_6")
				.send("position=A12")
				.expect('{"error":"Invalid position"}')
				.expect(200,done)
		});
	});

	describe("Player shot on position that is hit",function(){
		it("should validate shoot",function(done){
			routers.game.shoot = sinon.stub().withArgs().returns('hit');
			
			supertest(routers)
				.post("/html/shoot")
				.set("Cookie","userName=Dharmendra_6")
				.send("position=A2")
				.expect('{"reply":"hit"}')
				.expect(200,done)
		});
	});

	describe("update for first player",function(){
		it("should give when player shoot or join the game",function(done){
			routers.game.game.turn = 'Vikas_4';
			routers.players = {Dharmendra_6:{readyState:true},
			Vikas_4:{playerId:'Vikas_4'}};

			supertest(routers)
				.get("/html/get_updates")
				.set("Cookie","userName=Dharmendra_6")
				.expect(/"turn":"Vikas_4"/)
				.expect(200,done);
		});
	});
	describe('serveShipInfo',function(){
		it('should provide the ships information to player',function(done){
			routers.players = {Dharmendra_3:{playerId:'Dharmendra_3',
			fleet:{battleship:{isSunk:sinon.stub().returns(false),hittedHoles:3}}
				}
			};

			supertest(routers)
				.get('/html/shipInfo')
				.set("Cookie","userName=Dharmendra_3")
				.expect(/"hits":3/)
				.expect(200,done)
		})
	})
	describe('shoot positions',function(){
		it('should give shoot information',function(done){
			routers.players = { Dharmendra_3:{playerId:'Dharmendra_3', hit:['A1'] }};

			supertest(routers)
			.get('/html/myShootPositions')
			.set("Cookie","userName=Dharmendra_3")
			.expect(/A1/)
			.expect(200,done)
		})
	})
	describe('holdPlayer',function(){
		it('should redirect player if game is started ',function(done){
			routers.players = { Dharmendra_3:{playerId:'Dharmendra_3'},
				Vikas_4:{playerId:'Vikas_4'}														};

			supertest(routers)
				.post('/html/players_queue.html')
				.set('Cookie',"userName=seetaram_4")
				.expect('Location','/html/players_queue.html')
				.expect(302,done)
		})
	})
	describe('restart the game',function(){
		it('should redirect to the deploy.html page when player wants to restart the game',function(done){
			routers.players = { Dharmendra_3:{playerId:'Dharmendra_3'},
				Vikas_4:{playerId:'Vikas_4'}	
			};
			supertest(routers)
				.post('/html/restartGame')
				.set("Cookie","userName=Dharmendra_3")
				.expect('Location','/html/deploy.html')
				.expect(302,done)
		})
	})
	describe('quit the game',function(){
		it('should redirect to the index.html page when player wants to quit the game',function(done){
			routers.players = { Dharmendra_3:{playerId:'Dharmendra_3'},
				Vikas_4:{playerId:'Vikas_4'}	
			};

			supertest(routers)
				.post('/html/quitGame')
				.set("Cookie","userName=Dharmendra_3")
				.expect('Location','/html/index.html')
				.expect('Content-Type',/text\/plain/)
				.expect(302,done)
		})
	})
	describe('respondToPlayerInQueue',function(){
		it('should informs player in queue that he can join game',function(done){
			routers.players = { Dharmendra_3:{playerId:'Dharmendra_3'}};
			supertest(routers)
				.get('/html/queryGameOver')
				.expect('true')
				.expect(200,done)
		})
		it('should not hold player when game is running',function(done){
			routers.players = { Dharmendra_3:{playerId:'Dharmendra_3'},
				Vikas_4:{playerId:'Vikas_4'}	
			};

			supertest(routers)
				.get('/html/queryGameOver')
				.expect('false')
				.expect(200,done);
		})
	})
})