var body_parser=require('../server/body_parser.js');
var expect=require('chai').expect;
var queryString=require('querystring');
var eventEmitter = require('events').EventEmitter;

describe('requestDataParser parse the request and add the data',function(){
	var number=0;
	var next=function(){number++};
	var res={end:function(){connection='close'}};
	it('Reads the data when available',function(){
		var req=new eventEmitter();
		expect(req.data).to.be.undefined;
		body_parser(req,res,next);
		req.emit('data',queryString.stringify({Name:'Rana'}));
		req.emit('end');
		expect(req.body).to.be.deep.equal({Name:'Rana'});
		expect(number).to.be.equal(1);
	});
});