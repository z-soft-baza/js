
$(document).ready(

	function(){

	    board.init();
        init_player();

	    $("#board").html(board.gethtml());


        $('.cell').live("click", function(){ setTimeout(oncellclick(this), 2000);});
//        $('.cell').live("click", function(){oncellclick(this);});

        get_games_list();
        get_my_games();

//        enemy_mp3 = new Audio();
//        enemy_mp3.src = '_mp3/gun2.mp3';
//
//        death_mp3 = new Audio();
//        death_mp3.src = '_mp3/mix3.mp3';

	}
);


    function getFnName(fn) {
      return fn.toString().match(/function ([^(]*)\(/)[1];
    }


    function get_games_list(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: getFnName(arguments.callee) },

            success: function(msg){
                $('#games_list').html(msg.games_list);
            }
        });

        return false;
    }

    function get_my_games(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
                    game_id: board.game_id,
                    last_move: board.player_color,
                    board_str: JSON.stringify(board) },

            success: function(msg){
                $('#div_info').html(msg.msg);
                board.move_over = true;
                check_timer = setInterval(check_board, 3000);
            }
        });

        return false;
    }



    function load_board(){

        $.ajax({
            type: "POST", url: "ajax.php", dataType : 'json',
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
                game_id: board.game_id,
                my_color: board.player_color},

            success: function(msg){
                if (msg.msg!='Противник думает..') {
                    board.cells = JSON.parse(msg.board_str).cells;
                    $("#board").html(board.gethtml());
                    clearInterval(check_timer);
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
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
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
            data: { ajax_type: getFnName(arguments.callee),
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
