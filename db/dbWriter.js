var pg = require('pg');
var con ={
			host     : process.env.DB_HOST,
			user     : process.env.DB_USERNAME,
			password : process.env.DB_PASSWORD,
			port     : process.env.DB_PORT,
			database : process.env.DB_NAME,
};		
var conString = 'postgres://'+con.user+':'+con.password+'@'+con.host+':'+con.port+'/'+con.database;

if(!con.user)
	conString = "postgres://postgres:!abcd1234@localhost/dev_battleship";

exports.savePlacments = function(entry){
	var date = new Date();
	var insertions = [entry.player_id,entry.game_id,entry.placing_position,entry.isBot,date.toJSON()].map(x => '\''+x+'\'');
	var query = 'insert into placing_patterns (player_id,game_id,placing_position,is_bot,datestamp) values('+insertions.join(',')+');';
	pg.connect(conString,function(err,client,done) {
	  if(err) console.error('Could not connect to database', err);
		client.query(query, function(err, result) {
	    	if(err) console.error('Error in running query', err,result);
	  });
	done();
	});
};

exports.saveShotResult = function (entry) {
	var date = new Date();
	var insertions = [entry.player_id,entry.game_id,entry.boardStatus,entry.currentHitPosition,entry.shotResult,entry.isBot,date.toJSON()].map(x => '\''+x+'\'');
	var query = 'insert into shooting_patterns (player_id,game_id,board,shooting_pos,shot_res,is_bot,datestamp) values('+insertions.join(',')+');';
	pg.connect(conString,function(err,client,done) {
	  if(err) console.error('Could not connect to database', err);
		client.query(query, function(err, result) {
	    	if(err) console.error('Error in running query', err,result);
	  });
	done();
	});
}




