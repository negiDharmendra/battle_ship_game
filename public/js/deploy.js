function vertical(position, size) {
    var charcode = position[0].charCodeAt();
    var positions = [];
    for (var i = 0; i < size; i++) {
        positions.push(String.fromCharCode(charcode + i) + position.slice(1));
    };
    return positions;
};

function horizontal(position, size) {
    var cHar = position[0];
    var positions = [];
    for (var i = 0; i < size; i++) {
        positions.push(cHar + (Number(position.slice(1)) + i));
    };
    return positions;
};

function displayPosition(e) {
    var positions = getPositions(e.target.id);
    if ($('.harbor>#position_of_ship>option').length > 0) {
        positions.forEach(function(id) {
            $('.ocean_grid td#' + id).addClass('hover');
        });
    };
};

function hidePosition(e) {
    var positions = getPositions(e.target.id);
    positions.forEach(function(id) {
        $('.ocean_grid td#' + id).removeClass('hover');
    })
};

function getPositions(startingPosition) {
    if ($('.harbor>#position_of_ship>option').length > 0) {
        var shipSize = {
            battleship: 4,
            cruiser: 3,
            carrier: 5,
            destroyer: 2,
            submarine: 3
        };
        var handlerFunction = {
            'vertical': vertical,
            'horizontal': horizontal
        };
        var shipName = $('.harbor>#position_of_ship option:selected').val();
        var formation = $('select#formation').val();
        var positions = handlerFunction[formation](startingPosition, shipSize[shipName]);
        return positions;
    };
};

function reply_to_deployment(evnt) {
    evnt = evnt.target;
    var position = getPositions(evnt.id).join(' ');
    var shipName = $(".harbor>#position_of_ship>option:selected").val();
    var alignment = $(".harbor>#formation>option:selected").val();
    $.post('deployShip', 'name=' + shipName + '&positions=' + evnt.id + '&alignment='+alignment, function(data) {
        var reply = JSON.parse(data);
        displayDeployedShip(reply, position);
    });
};

function getCookie() {
    return $.cookie('name');
};

function play(){
   var audio = document.getElementById("audio");
   audio.play();
}

function displayDeployedShip(reply, position) {
    if (reply == true) {
        position.trim().split(' ').forEach(function(ele) {
            $('.ocean_grid>table>tbody>tr>#' + ele).css('background', 'lightgreen');
        });
        play();
        $('.harbor>#position_of_ship>option:selected').remove();
    } else
        display_Message(reply);
};

function get_updates() {
    $.get('get_updates', success);
    function success(data) {
        var updates = JSON.parse(data);
        var readyTemplate = '<form method="POST"><button id="ready" type="submit">Ready</button></form>';
        if(updates.ships.length==5)$('.harbor').html(readyTemplate);
        updates.ships.forEach(manageShipSelectionList);
        displayShips('.ocean_grid', updates.positions, 'lightgreen');
    };
};

function manageShipSelectionList(ship) {
    ship&&$('.harbor>#position_of_ship>option[value='+ship+']').remove();
};

function displayShips(gridId, usedPosition, color) {
    for (var i = 0; i < usedPosition.length; i++)
        $(gridId + ' tbody tr td#' + usedPosition[i]).css('background', color);

};


function display_Message(message) {
    $('.information').html('<p">' + message + '</p>');
    setTimeout(function() {
        $('.information').html('');
    }, 2000);
}


$(window).load(function() {
    get_updates();
    if ($('.harbor>#position_of_ship>option').length > 0) {
        $('.ocean_grid td').mouseover(displayPosition);
        $('.ocean_grid td').mouseleave(hidePosition);
    };
    $('.ocean_grid td').click(function(evnt) {
        reply_to_deployment(evnt);
    });
    setInterval(get_updates,1000);
});

function displayPlayerName() {
    var playerName = $.cookie('userName').split('_')[0];
    $('#playerName').html(playerName.toUpperCase());
}
$(window).load(displayPlayerName);
