
var check_timer = null;
var move_sound = null;
var attack_sound = null;

function play_sound(sound) {
    if (!sound) {
        return;
    }

    sound.currentTime = 0;
    sound.play().catch(function () {
        // Автовоспроизведение может быть ограничено браузером до первого клика пользователя.
    });
}

$(document).ready(

	function(){

	    board.init();
        init_player();

	    $("#board").html(board.gethtml());


        $(document).on("click", ".cell", function(){
            oncellclick(this);
        });

        get_games_list();
        get_my_games();

        move_sound = new Audio('_mp3/mix3.mp3');
        attack_sound = new Audio('_mp3/gun2.mp3');

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
        board.cell_click(div.id);
        $("#board").html(board.gethtml());

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
