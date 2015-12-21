var routers = require('../server/routers.js');
var supertest = require('supertest'); 
var fs = require('fs');

describe('get',function(){
	describe('/',function(){
		it('for / should redirect me to index.html',function(done){
			supertest(routers)
				 .get('/')
				 .expect('Content-Type', /text\/plain/)
				 .expect(302)
				 .expect('Location','/html/index.html',done);
		});
	});
	describe('Get static files',function(){
		it('for /index.html should serve the file index.html from public folder',function(done){
			supertest(routers)
				 .get('/html/index.html')
				 .expect('Content-Type', /text\/html/)
				 .expect(200)
				 .expect(/WELCOME TO BATTLESHIP GAME/,done);
		});
	});
	
})
describe('post',function(){
	describe('/html/index.html',function(){
		it('should logged in the user and redirect to the deploy.html',function(done){
			supertest(routers)
				.post('/html/index.html')
				.send('name=Dharmendra')
				.expect('Content-Type', /text\/plain/)
				.expect(302)
				.expect('Location','/html/deploy.html',done);
		})
	})
	describe('/html/deployShip',function(){
		it('should allow to deploy battleship',function(done){
			supertest(routers)
				.post('/html/deployShip')
				.set('Cookie','userName=Dharmendra_3')
				.send('name=battleship&positions=A1+A2+A3+A4')
				.expect('Content-Type', /text\/html/)
				.expect(200)
				.expect('true',done);
		});
		it('should allow to deploy cruiser',function(done){
			supertest(routers)
				.post('/html/deployShip')
				.set('Cookie','userName=Dharmendra_3')
				.send('name=cruiser&positions=B1+B2+B3')
				.expect('Content-Type', /text\/html/)
				.expect(200)
				.expect('true',done);
		});
		it('should allow to deploy carrier',function(done){
			supertest(routers)
				.post('/html/deployShip')
				.set('Cookie','userName=Dharmendra_3')
				.send('name=carrier&positions=C1+C2+C3+C4+C5')
				.expect('Content-Type', /text\/html/)
				.expect(200)
				.expect('true',done);
		});
		it('should allow to deploy destroyer',function(done){
			supertest(routers)
				.post('/html/deployShip')
				.set('Cookie','userName=Dharmendra_3')
				.send('name=destroyer&positions=I1+I2')
				.expect('Content-Type', /text\/html/)
				.expect(200)
				.expect('true',done);
		});
		it('should allow to deploy submarine',function(done){
			supertest(routers)
				.post('/html/deployShip')
				.set('Cookie','userName=Dharmendra_3')
				.send('name=submarine&positions=G1+G2+G3')
				.expect('Content-Type', /text\/html/)
				.expect(200)
				.expect('true',done);
		});
	});
	describe('/html/deploy.html',function(){
		it('should redirect the player to battleship.html',function(done){
			supertest(routers)
				.post('/html/deploy.html')
				.set('Cookie','userName=Dharmendra_3')
				.expect('Content-Type', /text\/plain/)
				.expect(302)
				.expect('Location','/html/battleship.html',done);
		})
	})
	
})