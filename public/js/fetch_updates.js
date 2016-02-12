function get_updates() {
    $.get('get_updates', success);

    function success(data) {
        var updates = JSON.parse(data);
        var gameEnd = updates.gameEnd;
        if (updates.liveStatusOfGame && updates.players == 1) {
            $('.message').show();
            display_Message('<div>Waiting for opponent</div><div><img src="./image/loading.svg" height="30" width="30"></div>');
        }
        if (updates.liveStatusOfGame && updates.players == 2) {
            $('.message').hide();
            displayShips('.oceanGridTable', updates.gotHit, updates.positions, 'lightgreen', updates.gotMiss);
            if (gameEnd === true) display_gameover('You won the game'), stop_updates();
            else if (gameEnd === false) display_gameover('You lost the game'), stop_updates();
            else displayTurnMessage(updates.turn);
        } else if (updates.liveStatusOfGame === false) {
            $('.grid').removeAttr('onclick');
            var sampleHtml = '<div class="leftMessage">Your opponent has left the game..<form method="POST" action="restartGame"><button>Start Again</button></form></div>';
            $('.message').html(sampleHtml);
            $('.message').show();
        }
    };
};

function displayTurnMessage(turn) {
    if (!turn)
        display_Message('<div>Your opponent is not ready</div><div><img src="./image/loading.svg" height="30" width="30"></div>');
    else if (turn == getCookie()) {
        $(".targetGridTable").fadeTo(2, 1, function() {});
        $('.targetGridTable>tbody>tr>td.grid').addClass('hover');
        $('.targetGridTable>tbody>tr>td.grid').removeClass('notAllowedCursor');
        $('.targetGridTable>tbody>tr>td.grid').addClass('defaultCursor');
    } else {
        $(".targetGridTable").fadeTo(2, 0.3, function() {});
        $('.targetGridTable>tbody>tr>td.grid').removeClass('defaultCursor');
        $('.targetGridTable>tbody>tr>td.grid').addClass('notAllowedCursor');
        $('.targetGridTable>tbody>tr>td.grid').removeClass('hover');
    }
}

function stop_play(id) {
    var audio = document.getElementById(id);
    audio.pause();
};

function play(id) {
    var audio = document.getElementById(id);
    audio.play();
};


function display_gameover(message) {
    var sampleHtml = '<div class="game_screen"><div class="gameStatus">{{gameStatus}}</br></br></div>' +
        '<div class="restartOrQuit"><form method="POST" action="restartGame"><button>Restart</button>' +
        '</form><form method="POST" action="quitGame"><button>Quit</button></form></div></div>';
    var template = Handlebars.compile(sampleHtml);
    var htmlStructure = template({
        gameStatus: message
    });
    $('.mainContent').html(htmlStructure);
}

function displayShips(gridId, gotHit, usedPosition, color, gotMiss) {
    for (var i = 0; i < usedPosition.length; i++)
        $(gridId + '>tbody>tr>td#' + usedPosition[i]).css('background', color);
    for (var i = 0; i < gotHit.length; i++) {
        $(gridId + '>tbody>tr>td#' + gotHit[i]).css('background', '#ee9090');
        $(gridId + '>tbody>tr>td#' + gotHit[i]).removeAttr('onclick');
        $(gridId + '>tbody>tr>td#' + gotHit[i]).removeClass('defaultCursor');
        $(gridId + '>tbody>tr>td#' + gotHit[i]).addClass('notAllowedCursor');
    }
    if (gotMiss)
        for (var i = 0; i < gotMiss.length; i++) {
            $(gridId + '>tbody>tr>td#' + gotMiss[i]).css('background', '#9090EE');
            $(gridId + '>tbody>tr>td#' + gotMiss[i]).removeAttr('onclick');
            $(gridId + '>tbody>tr>td#' + gotMiss[i]).removeClass('defaultCursor');
            $(gridId + '>tbody>tr>td#' + gotMiss[i]).addClass('notAllowedCursor');
        }
};

function get_ship_info() {
    $.get('shipInfo', function(data, status) {
        var ships = JSON.parse(data);
        for (var ship in ships) {
            var ship_info = ships[ship];
            $('.ship_info .' + ship + ' td:nth-child(2)').html(ship_info.hits + '/' + ship_info.lives)
            if (ship_info.status) {
                $('.ship_info .' + ship).removeClass('alive');
                $('.ship_info .' + ship).addClass('sunk');
                $('.ship_info .' + ship + ' td:nth-child(3)').html('sunk');
            }
        };
    });
};

$(window).load(function() {
    $('.message').hide();
    get_updates();
    $.get('myShootPositions', function(data) {
        data = JSON.parse(data);
        displayShips('.targetGridTable', data.hit, [], '#9090EE', data.miss);
    });
});

var play_hit_or_miss_sound = function(reply) {
    if (reply == 'hit') play('audio_for_hit')
    if (reply == 'miss') play('audio_for_miss');
    if (!reply) play('opponent_turn');
}

function reply_to_shoot(evnt) {
    evnt = evnt.target;
    $.post("shoot", {
        position: evnt.id
    }, function(data) {
        var status = JSON.parse(data);
        if (status.opponentPlayerId)
            play_hit_or_miss_sound(status.reply);
        if (status.reply) {
            $('.targetGridTable>tbody>tr>td#' + evnt.id).removeAttr('onclick');
            $('.targetGridTable>tbody>tr>td#' + evnt.id).addClass(status.reply);
        }
    });
};

function stop_updates() {
    clearInterval(position_updates);
    clearInterval(ship_updates)
    $('.targetGridTable>tbody>tr>.grid').removeAttr('onclick');
    $('.message').html('');
};

function display_Message(message) {
    $('.message').show();
    $('.message').html(message);
};

function getCookie() {
    return $.cookie('userName');
};

if (getCookie() || $(window).unload()) {
    var position_updates = setInterval(get_updates, 1000);
    var ship_updates = setInterval(get_ship_info, 1000);
};

function displayPlayerName() {
    var playerName = $.cookie('userName').split('_')[0];
    $('#playerName').html(playerName.toUpperCase());
}
$(window).load(displayPlayerName);
