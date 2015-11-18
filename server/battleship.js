var sh = {};
exports.sh = sh;

sh.Ship = function(name,holes){
	var ship = this;
	ship.name =  name;
	ship.holes = holes;
	Object.defineProperties(ship,{
		name:{writable:false},
		holes:{writable:false}
	});
};