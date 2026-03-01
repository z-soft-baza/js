
var check_timer = null;
var clock_timer = null;
var move_sound = null;
var attack_sound = null;
var sound_enabled = true;

var INITIAL_CLOCK_MS = 5 * 60 * 1000;
var clock_state = {
    white_ms: INITIAL_CLOCK_MS,
    black_ms: INITIAL_CLOCK_MS,
    last_tick: null,
    running: false
};

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


function format_clock(ms) {
    var total_sec = Math.max(0, Math.floor(ms / 1000));
    var min = Math.floor(total_sec / 60);
    var sec = total_sec % 60;
    return (min < 10 ? '0' + min : '' + min) + ':' + (sec < 10 ? '0' + sec : '' + sec);
}

function render_clock() {
    $('#clock_white .clock-time').text(format_clock(clock_state.white_ms));
    $('#clock_black .clock-time').text(format_clock(clock_state.black_ms));

    $('#clock_white').toggleClass('active', board.player_color === 'white');
    $('#clock_black').toggleClass('active', board.player_color === 'black');
}

function reset_clock() {
    clock_state.white_ms = INITIAL_CLOCK_MS;
    clock_state.black_ms = INITIAL_CLOCK_MS;
    clock_state.last_tick = Date.now();
    clock_state.running = true;
    render_clock();
}

function stop_clock() {
    if (clock_timer !== null) {
        clearInterval(clock_timer);
        clock_timer = null;
    }
    clock_state.running = false;
}

function tick_clock() {
    if (!clock_state.running) {
        return;
    }

    var now = Date.now();
    if (clock_state.last_tick === null) {
        clock_state.last_tick = now;
        return;
    }

    var elapsed = now - clock_state.last_tick;
    clock_state.last_tick = now;

    if (board.player_color === 'white') {
        clock_state.white_ms = Math.max(0, clock_state.white_ms - elapsed);
    } else if (board.player_color === 'black') {
        clock_state.black_ms = Math.max(0, clock_state.black_ms - elapsed);
    }

    render_clock();

    if (clock_state.white_ms === 0 || clock_state.black_ms === 0) {
        stop_clock();
        if (clock_state.white_ms === 0) {
            $('#div_info').html('Время белых вышло');
        }
        if (clock_state.black_ms === 0) {
            $('#div_info').html('Время чёрных вышло');
        }
    }
}

function start_clock() {
    stop_clock();
    clock_state.running = true;
    clock_state.last_tick = Date.now();
    render_clock();
    clock_timer = setInterval(tick_clock, 1000);
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

        reset_clock();
        start_clock();

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
                reset_clock();
                start_clock();
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
                reset_clock();
                start_clock();
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
                reset_clock();
                start_clock();
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
                render_clock();
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
                render_clock();
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
            render_clock();
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
