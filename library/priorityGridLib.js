var ld = require('lodash');
const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

var PriorityGrid = function() {
    var priorities = [];
    for (var i = 65; i < 75; i++)
        for (var j = 1; j < 11; j++)
            priorities.push({
                key: String.fromCharCode(i) + j,
                priority: 1
            });
    this.priorities = priorities;
    this.prev = {
        position: null,
        result: null
    };
    this.hits = [];
    this.miss = [];
};

PriorityGrid.prototype.getMaxPriority = function() {
    var max = this.priorities.reduce(function(a, b) {
        return a.priority >= b.priority ? a : b
    });
    var allBestPositons = this.priorities.filter(function(x) {
        return (x.priority >= max.priority);
    });
    
    return ld.sample(allBestPositons);
};

PriorityGrid.prototype.select = function(p) {
    return ld.find(this.priorities, function(position) {
        return position.key == p
    });
};

PriorityGrid.prototype.getAdjacent = function(position) {
    var self = this;
    var adjacent = [];
    var charCode = String.fromCharCode;
    var alphnumeric = position.key.slice(0, 1).charCodeAt();
    var numeric = parseInt(position.key.slice(1));
    adjacent.push(charCode(alphnumeric) + (numeric + 1), charCode(alphnumeric) + (numeric - 1));
    adjacent.push(charCode(alphnumeric + 1) + (numeric), charCode(alphnumeric - 1) + (numeric));
    adjacent = adjacent.map(function(adj) {
        return self.select(adj);
    });
    return ld.compact(adjacent);
};

PriorityGrid.prototype.isHorizantalSequence = function(position1, position2) {
    var pos1 = position1.key.slice(0, 1).charCodeAt();
    var pos2 = position2 && position2.key.slice(0, 1).charCodeAt() || '';
    return (pos2 == pos1);
};

PriorityGrid.prototype.isVerticalSequence = function(position1, position2) {
    var numeric1 = parseInt(position1.key.slice(1));
    var numeric2 = position2 && parseInt(position2.key.slice(1)) || '';
    return (numeric1 == numeric2);
};


PriorityGrid.prototype.generateHorizantalSequence = function(position, size) {
    size = size || 5;
    var sequence = [];
    var alphnumeric = position.key.slice(0, 1);
    var numeric = parseInt(position.key.slice(1));
    for (var i = 0; i < size; i++)
        sequence.push(this.select(alphnumeric + (numeric + i)));
    return ld.compact(sequence);
};

PriorityGrid.prototype.generateVerticalSequence = function(position, size) {
    size = size || 5;
    var sequence = [];
    var charCode = String.fromCharCode;
    var alphnumeric = position.key.slice(0, 1).charCodeAt();
    var numeric = parseInt(position.key.slice(1));
    for (var i = 0; i < size; i++)
        sequence.push(this.select(charCode(alphnumeric + i) + numeric));
    return ld.compact(sequence);
};


PriorityGrid.prototype.incrementPriority = function(position) {
    if (position.priority != 0)
        position.priority++;
};

PriorityGrid.prototype.decrementPriority = function(position) {
    if (position.priority != 0)
        position.priority--;
};

PriorityGrid.prototype.removePriority = function(position) {
    position.priority = 0;
};

PriorityGrid.prototype.setResult = function(position, result) {
    var self = this;
    var adjacents;
    var isHorizantal = this.isHorizantalSequence(position, this.prev.position);
    var isVertical = this.isVerticalSequence(position, this.prev.position);
    if (result == 'hit' && (!isHorizantal || !isVertical)) {
        this.hits.push(position);
        this.hits.sort(function(a, b) {
            return a.key - b.key;
        });
        adjacents = this.getAdjacent(position);
        adjacents.forEach(function(pos) {
            if (pos.priority != 0) self.incrementPriority(pos);
        });
        this.prev = {
            position: position,
            result: result
        };
    };
    if (result == 'hit' && (isHorizantal || isVertical)) this.analyzePrevious(position, isHorizantal, isVertical);

    if (result == 'miss')
        this.miss.push(position);

};

PriorityGrid.prototype.getPosition = function() {
    var position = this.getMaxPriority();
    this.removePriority(position);
    return position;
};

PriorityGrid.prototype.analyzePrevious = function(current, isHorizantal, isVertical) {
    var self = this;
    var primeSuspect = [];
    var charCode = String.fromCharCode;
   
    if (isHorizantal) {
        primeSuspect = primeSuspect.concat(self.generateHorizantalSequence(current, 2))
        var alphnumeric = current.key.slice(0, 1);
        var numeric = parseInt(current.key.slice(1));
        var numericPrev = this.prev.position.key.slice(1);

         if(alphnumeric>parseInt(numericPrev))
            primeSuspect = primeSuspect.concat(this.select(alphnumeric+(numeric-2)));
        else
            primeSuspect = primeSuspect.concat(this.select(alphnumeric+(numeric-1)));
    } else if (isVertical) {
        var alphnumeric = current.key.slice(0, 1).charCodeAt();
    	var alphnumericPrev = this.prev.position.key.slice(0, 1).charCodeAt();
    	var numeric = parseInt(current.key.slice(1));
        primeSuspect = primeSuspect.concat(self.generateVerticalSequence(current, 2))
        if(alphnumeric>alphnumericPrev)
            primeSuspect = primeSuspect.concat(this.select(charCode(alphnumeric-2)+numeric));
        else
            primeSuspect = primeSuspect.concat(this.select(charCode(alphnumeric-1)+numeric));

    }

    primeSuspect = ld.unique(primeSuspect);
    primeSuspect = ld.compact(primeSuspect);
    primeSuspect = primeSuspect.filter(function(k) {
        return k.priority > 0;
    });
    primeSuspect.forEach(function(sample) {
        if (sample.priority != 0)
            self.incrementPriority(sample);
    });
};


PriorityGrid.prototype.fleetPosition = function() {
    var allBestPositons = this.priorities;
    var finalPositions = [];
    var usedPositions = [];
    var shipSize = {
        battleship: 4,
        cruiser: 3,
        carrier: 5,
        destroyer: 2,
        submarine: 3
    };

    for (ship in shipSize) {
        var counter = (Math.random() * 2);
        var arr = [];
        arr.push(ship);
        if (counter < 1) {
            var sequence = [];
            while (sequence.length != shipSize[ship]) {
                var pos = ld.sample(allBestPositons);
                sequence = this.generateHorizantalSequence(pos, shipSize[ship]);
                sequence = ld.intersection(allBestPositons, sequence);
            }
            usedPositions = usedPositions.concat(sequence);
            arr.push(pos.key);
            arr.push(HORIZONTAL);
        } else {
            var sequence = [];
            while (sequence.length != shipSize[ship]) {
                var pos = ld.sample(allBestPositons);
                sequence = this.generateVerticalSequence(pos, shipSize[ship]);
                sequence = ld.intersection(allBestPositons, sequence);
            }
            usedPositions = usedPositions.concat(sequence);
            arr.push(pos.key);
            arr.push(VERTICAL);
        }
        finalPositions.push(arr);
        allBestPositons = ld.difference(allBestPositons, usedPositions);
    }
    return finalPositions;
};


module.exports = PriorityGrid;
