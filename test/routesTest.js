var routers = require("../server/routers.js");
var supertest = require("supertest"); 
var fs = require("fs");
routers.players = {};

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
	
})
describe("player",function(){
	describe("First Player",function(){
		it("should logged in the user and redirect to the deploy.html",function(done){
			supertest(routers)
				.post("/html/index.html")
				.send("name=Dharmendra")
				.expect("Content-Type", /text\/plain/)
				.expect(302)
				.expect("Location","/html/deploy.html",done);
		})
	})
	describe("/html/deployShip",function(){
		it("should allow to deploy battleship",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Dharmendra_3")
				.send("name=battleship&positions=A1+A2+A3+A4")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy cruiser",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Dharmendra_3")
				.send("name=cruiser&positions=B1+B2+B3")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy carrier",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Dharmendra_3")
				.send("name=carrier&positions=C1+C2+C3+C4+C5")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy destroyer",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Dharmendra_3")
				.send("name=destroyer&positions=I1+I2")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy submarine",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Dharmendra_3")
				.send("name=submarine&positions=G1+G2+G3")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
	});
	describe("/html/deploy.html",function(){
		it("should redirect the player to battleship.html",function(done){
			supertest(routers)
				.post("/html/deploy.html")
				.set("Cookie","userName=Dharmendra_3")
				.expect("Content-Type", /text\/plain/)
				.expect(302)
				.expect("Location","/html/battleship.html",done);
		})
	})

	describe("Second Player",function(){
		it("should logged in the user and redirect to the deploy.html",function(done){
			supertest(routers)
				.post("/html/index.html")
				.send("name=Vikas")
				.expect("Content-Type", /text\/plain/)
				.expect(302)
				.expect("Location","/html/deploy.html",done);
		});
		describe("/html/deployShip",function(){
		it("should allow to deploy battleship",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Vikas_4")
				.send("name=battleship&positions=A1+A2+A3+A4")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy cruiser",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Vikas_4")
				.send("name=cruiser&positions=B1+B2+B3")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy carrier",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Vikas_4")
				.send("name=carrier&positions=C1+C2+C3+C4+C5")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy destroyer",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Vikas_4")
				.send("name=destroyer&positions=I1+I2")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
		it("should allow to deploy submarine",function(done){
			supertest(routers)
				.post("/html/deployShip")
				.set("Cookie","userName=Vikas_4")
				.send("name=submarine&positions=G1+G2+G3")
				.expect("Content-Type", /text\/html/)
				.expect(200)
				.expect("true",done);
		});
	});
	describe("/html/deploy.html",function(){
		it("should redirect the player to battleship.html",function(done){
			supertest(routers)
				.post("/html/deploy.html")
				.set("Cookie","userName=Vikas_4")
				.expect("Content-Type", /text\/plain/)
				.expect(302)
				.expect("Location","/html/battleship.html",done);
		})
	})

	})
	describe("First Player shoot",function(){
		it("should validate shoot",function(done){
			supertest(routers)
			.post("/html/shoot")
			.set("Cookie","userName=Dharmendra_3")
			.send("position=A1")
			.expect('{"reply":"hit"}')
			.expect(200,done)
		});
	});
	describe("First Player shoot when it is not his turn",function(){
		it("should validate shoot",function(done){

			supertest(routers)
			.post("/html/shoot")
			.set("Cookie","userName=Dharmendra_3")
			.send("position=A4")
			.expect('{"error":"Opponent turn"}')
			.expect(200,done)
		});
	});
	describe("update for first player",function(){
		it("should give when player shoot or join the game",function(done){
			supertest(routers)
			.get("/html/get_updates")
			.set("Cookie","userName=Dharmendra_3")
			.expect(/"turn":"Vikas_4"/)
			.expect(200,done)
		})
	});
	describe('ship information to the player',function(){
		it('info of ship',function(done){
			supertest(routers)
			.get('/html/shipInfo')
			.set("Cookie","userName=Dharmendra_3")
			.expect(/battleship/)
			.expect(/cruiser/)
			.expect(/carrier/)
			.expect(/submarine/)
			.expect(/destroyer/)
			.expect(200,done)
		})
	})
	describe('shoot positions',function(){
		it('should give shoot information',function(done){
			supertest(routers)
			.get('/html/myShootPositions')
			.set("Cookie","userName=Dharmendra_3")
			.expect(/A1/)
			.expect(200,done)
		})
	})
	describe('queue',function(){
		it('should redirect if already two player is added ',function(done){
			supertest(routers)
			.post('/html/players_queue.html')
			.set('Cookie',"userName=seetaram_4")
			.expect('Location','/html/players_queue.html')
			.expect(302,done)
		})
	})
	describe('restart the game',function(){
		it('should send deployment page when player want restart the game',function(done){
			supertest(routers)
			.post('/html/restartGame')
			.set("Cookie","userName=Dharmendra_3")
			.expect('Location','/html/deploy.html')
			.expect('Content-Type',/text\/plain/)
			.expect(302,done)
		})
	})
	describe('quit the game',function(){
		it('should send login page when player want quit the game',function(done){
			supertest(routers)
			.post('/html/quitGame')
			.set("Cookie","userName=Dharmendra_3")
			.expect('Location','/html/index.html')
			.expect('Content-Type',/text\/plain/)
			.expect(302,done)
		})
	})
	describe('response that player who in queue',function(){
		it('should send login page when player want quit the game',function(done){
			supertest(routers)
			.get('/html/queryGameOver')
			.expect('true')
			.expect(200,done)
		})
	})
})