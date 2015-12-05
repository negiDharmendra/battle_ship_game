var lib = require('../server/cookieshandler.js');
var chai = require('chai');
var expect= chai.expect;

describe('getCookie gives the cookie by name',function(){
	it('when cookie is not present',function(){
		var req={headers:{cookie:''}};
		var cookie=lib.getCookie(req,'name');
		expect(cookie).to.be.equal('');
	});
	it('when cookie field is not  present',function(){
		var req={headers:{}};
		var cookie=lib.getCookie(req,'name');
		expect(cookie).to.be.equal('');
	});
	it('when specified cookie is not present',function(){
		var req={headers:{cookie:'age=32;'}};
		var cookie=lib.getCookie(req,'name');
		expect(cookie).to.be.equal('');
	});
	it('when cookie is present',function(){
		var req={headers:{cookie:'name=acp'}};
		var cookie=lib.getCookie(req,'name');
		expect(cookie).to.be.equal('acp');
	});
	it('when multiple cookies are  present',function(){
		var req={headers:{cookie:'name1=acp; name2=rana'}};
		var cookie=lib.getCookie(req,'name2');
		expect(cookie).to.be.equal('rana');
	});
});

describe('authenticateUser authenticates the user basis on the all players',function(){
	it('when the user is valid user',function(){
		var players={rana:{},daya:{}};
		var cookie='rana';
		var valid=lib.authenticateUser(cookie,players);
		expect(valid).to.be.true;
	});
	it('when the user is invalid user',function(){
		var players={rana:{},daya:{}};
		var cookie='milkha';
		var valid=lib.authenticateUser(cookie,players);
		expect(valid).to.be.false;
	});
});

describe('validateUser validates the user',function(){
	//This function is dependent on previous two functions.
	var number=0;
	var connection='open';
	var next=function(){number++};
	var res={end:function(){connection='close'}};
	var players={acp:{},daya:{}};
	beforeEach(function(){
		number=0;
		connection='open';
	});
	it('when the user is valid give him access to other resources',function(){
		var req={headers:{cookie:'name=acp'}};
		lib.validateUser(req,res,next,players);
		expect(number).to.be.equal(1);
		expect(connection).to.be.equal('open');
	});
	it('when the user is not valid he is not able to access other resources',function(){
		var req={headers:{cookie:'name=rana'}};
		lib.validateUser(req,res,next,players);
		expect(number).to.be.equal(0);
		expect(connection).to.be.equal('close');
		expect(req.playerId).to.be.equal('rana');
	});
});
