
var check_timer = null;
var move_sound = null;
var attack_sound = null;
var sound_enabled = true;
var sound_volume = 0.7;

function play_sound(sound) {
    if (!sound || !sound_enabled) {
        return;
    }

    sound.volume = sound_volume;

    if (sound.readyState > 0) {
        sound.currentTime = 0;
    }

    var play_result = sound.play();
    if (play_result && typeof play_result.catch === 'function') {
        play_result.catch(function () {
            // Автовоспроизведение может быть ограничено браузером до первого клика пользователя.
        });
    }
}

function apply_sound_settings() {
    if (move_sound) {
        move_sound.volume = sound_volume;
    }

    if (attack_sound) {
        attack_sound.volume = sound_volume;
    }

    $('#sound_enabled').prop('checked', sound_enabled);
    $('#sound_volume').val(Math.round(sound_volume * 100));
    $('#sound_volume_value').text(Math.round(sound_volume * 100) + '%');
}


function init_control_tabs() {
    $(document).on('click', '.tab-btn', function () {
        var tab_id = $(this).data('tab');

        $('.tab-btn').removeClass('active').attr('aria-selected', 'false');
        $(this).addClass('active').attr('aria-selected', 'true');

        $('.tab-pane').removeClass('active');
        $('#' + tab_id).addClass('active');
    });
}

function init_sound_controls() {
    var saved_enabled = localStorage.getItem('sound_enabled');
    var saved_volume = localStorage.getItem('sound_volume');

    if (saved_enabled !== null) {
        sound_enabled = saved_enabled === '1';
    }

    if (saved_volume !== null) {
        var parsed = parseFloat(saved_volume);
        if (!isNaN(parsed)) {
            sound_volume = Math.max(0, Math.min(1, parsed));
        }
    }

    apply_sound_settings();

    $('#sound_enabled').on('change', function () {
        sound_enabled = $(this).is(':checked');
        localStorage.setItem('sound_enabled', sound_enabled ? '1' : '0');
        apply_sound_settings();
    });

    $('#sound_volume').on('input change', function () {
        sound_volume = parseInt($(this).val(), 10) / 100;
        localStorage.setItem('sound_volume', sound_volume);
        apply_sound_settings();
    });
}


function cell_to_notation(cell_id) {
    var col = parseInt(cell_id[1], 10);
    var row = parseInt(cell_id[0], 10);
    var file = 'abcdefgh'[col];
    var rank = 8 - row;
    return file + rank;
}

function append_game_log(action) {
    if (!action) {
        return;
    }

    var piece_name = {
        p: 'Пешка',
        l: 'Ладья',
        k: 'Конь',
        s: 'Слон',
        f: 'Ферзь',
        kr: 'Король'
    };

    var from = cell_to_notation(action.from);
    var to = cell_to_notation(action.to);
    var piece = piece_name[action.piece] || action.piece;
    var text = '';

    if (action.type === 'move') {
        text = piece + ': ход ' + from + ' → ' + to;
    }

    if (action.type === 'attack_hit') {
        text = piece + ': атака ' + from + ' → ' + to + ' (враг выжил, HP: ' + action.target_hp + ')';
    }

    if (action.type === 'attack_kill_move') {
        text = piece + ': добивание ' + from + ' → ' + to + ' (клетка занята атакующей фигурой)';
    }

    if (!text) {
        return;
    }

    if ($('#game_log .game-log-empty').length) {
        $('#game_log').html('');
    }

    $('#game_log').prepend('<div class="game-log-item">' + text + '</div>');
}

$(document).ready(

	function(){

	    board.init();
        init_player();

	    $("#board").html(board.gethtml());


        $(document).on("click", ".cell", function(){
            oncellclick(this);
        });

        init_control_tabs();

        get_games_list();
        get_my_games();

        move_sound = new Audio('_mp3/mix3.mp3');
        attack_sound = new Audio('_mp3/gun2.mp3');

        move_sound.preload = 'auto';
        attack_sound.preload = 'auto';

        init_sound_controls();

	}
);


    function get_games_list(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'get_games_list' },

            success: function(msg){
                $('#games_list').html(msg.games_list);
            }
        });

        return false;
    }

    function get_my_games(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'get_my_games',
                    player_id: player_id},

            success: function(msg){
                $('#my_games').html(msg.games_list);
            }
        });

        return false;
    }

    function create_new_game(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'create_new_game',
                    player_id: player_id},

            success: function(msg){
                $('#div_info').html(msg.msg);
                board.game_id = msg.game_id;
                get_games_list();
                save_board();
            }
        });

        return false;
    }

    function join_game(game_id){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'join_game',
                    game_id: game_id,
                    player_id: player_id},

            success: function(msg){
                $('#div_info').html(msg.msg+' '+game_id);
                board.game_id = game_id;
                board.player_color = 'black';
                get_my_games();
                save_board();
            }
        });

        return false;
    }


    function resume_game(game_id){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'resume_game',
                game_id: game_id,
                player_id: player_id},

            success: function(msg){
                $('#div_info').html(msg.msg+' '+game_id);
                board.game_id = game_id;
                board.player_color = msg.color;
                load_board();
            }
        });

        return false;
    }


    function save_board(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'save_board',
                    game_id: board.game_id,
                    last_move: board.player_color,
                    board_str: JSON.stringify(board) },

            success: function(msg){
                $('#div_info').html(msg.msg);
                board.move_over = true;
                start_check_timer();
            }
        });

        return false;
    }



    function load_board(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'load_board',
                    game_id: board.game_id,
                    my_color: board.player_color},

            success: function(msg){
                board.cells = JSON.parse(msg.board_str).cells;
                $("#board").html(board.gethtml());
                $('#div_info').html(msg.msg);
            }
        });

        return false;
    }


    function check_board(){

        $('#game_title').html($('#game_title').html()+'.');
        if ($('#game_title').html()=='....') {$('#game_title').html('.')};

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'check_board',
                game_id: board.game_id,
                my_color: board.player_color},

            success: function(msg){
                if (msg.msg!='Противник думает..') {
                    board.cells = JSON.parse(msg.board_str).cells;
                    $("#board").html(board.gethtml());
                    stop_check_timer();
                    board.move_over = false;
                }
                $('#div_info').html(msg.msg);
            }
        });

        return false;
    }



//======================================================================================================================
//  PLAYERS
//======================================================================================================================

    function init_player(){
    //        if(typeof conf.player !== "undefined") {

        if (localStorage.getItem('player_id' )!==null)    {
            player_id = parseInt(localStorage["player_id"]);
            load_player();
        } else {
            create_player();
        }



        return true;
    }


    function load_player(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'load_player',
                player_id: player_id},

            success: function(msg){
                $('#div_info').html(msg.msg);
                $('#player_name').val(msg.player_name);
            }
        });

        return false;
    }


    function create_player(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'create_player',
                player_name: $('#player_name').val()},

            success: function(msg){
                $('#div_info').html(msg.msg);
                player_id = msg.player_id;
                localStorage.setItem( 'player_id', player_id);
            }
        });

        return false;
    }

    function update_player(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: 'update_player',
                player_id: player_id,
                player_name: $('#player_name').val(),
            },

            success: function(msg){
                $('#div_info').html(msg.msg);
            }
        });

        return false;
    }

    function oncellclick(div){

        //console.log('chess onclick '+board.last_cell.fig);
        var click_result = board.cell_click(div.id);
        $("#board").html(board.gethtml());

        if (click_result === 'done') {
            append_game_log(board.last_action);
        }

    }
    function start_check_timer(){
        stop_check_timer();
        check_timer = setInterval(check_board, 3000);
    }

    function stop_check_timer(){
        if (check_timer !== null) {
            clearInterval(check_timer);
            check_timer = null;
        }
    }
