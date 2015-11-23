var server = require('../server/server.js').ser;
var chai = require('chai');

describe('getUrl',function(){
	var req=res={};
	it('changes the request url as file structure for index.html',function(){
		req.url='/';
		chai.expect(server.getUrl(req,res)).to.be.equal('public/html/index.html');
	});
	it('changes the request url as file structure for any file',function(){
		req.url='/html/style.css';
		chai.expect(server.getUrl(req,res)).to.be.equal('public/html/style.css');
	});
});