
var check_timer = null;
var move_log = [];

var figure_names = {
    p: "Пешка",
    l: "Ладья",
    k: "Конь",
    s: "Слон",
    f: "Ферзь",
    kr: "Король"
};


$(document).ready(

	function(){

	    board.init();
        init_player();

	    $("#board").html(board.gethtml());
        reset_log();

        $(document).on("click", ".cell", function(){
            oncellclick(this);
        });

        get_games_list();
        get_my_games();

//        enemy_mp3 = new Audio();
//        enemy_mp3.src = '_mp3/gun2.mp3';
//
//        death_mp3 = new Audio();
//        death_mp3.src = '_mp3/mix3.mp3';

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
                reset_log();
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
                reset_log();
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
                reset_log();
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

        var move_result = board.cell_click(div.id);
        if (move_result && move_result !== 'cancel') {
            append_move_log(move_result);
        }
        $("#board").html(board.gethtml());

    }

    function get_cell_name(cell){
        if (!cell) {
            return '';
        }
        return String.fromCharCode(65 + Number(cell.col)) + (8 - Number(cell.row));
    }

    function get_piece_name(fig){
        if (!fig || !(fig.piece || fig.tip)) {
            return 'Фигура';
        }
        return figure_names[fig.piece || fig.tip] || 'Фигура';
    }

    function append_move_log(move){
        var text = format_move_log(move);
        if (!text) {
            return;
        }

        move_log.push(text);
        render_move_log();
    }

    function format_move_log(move){
        if (!move || !move.piece) {
            return '';
        }

        var prefix = move.color === 'white' ? 'Белые' : 'Чёрные';
        var piece = get_piece_name(move);
        var from = get_cell_name({ row: move.from[0], col: move.from[1] });
        var to = get_cell_name({ row: move.to[0], col: move.to[1] });

        if (move.type === 'attack') {
            var target = move.target_color === 'white' ? 'белую ' : 'чёрную ';
            target += (figure_names[move.target] || 'фигуру');
            return prefix + ': ' + piece + ' ' + from + ' атакует ' + target + ' на ' + to;
        }

        return prefix + ': ' + piece + ' ' + from + ' → ' + to;
    }

    function reset_log(){
        move_log = [];
        render_move_log();
    }

    function render_move_log(){
        var $log = $('#game_log');

        if (!$log.length) {
            return;
        }

        if (move_log.length === 0) {
            $log.html('<div class="game-log-empty">Ходы ещё не сделаны</div>');
            return;
        }

        var html = '';
        for (var i = 0; i < move_log.length; i++) {
            html += '<div class="game-log-entry">' + (i + 1) + '. ' + move_log[i] + '</div>';
        }

        $log.html(html);
        $log.scrollTop($log[0].scrollHeight);
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
