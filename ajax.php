<?php

//--------------------  init MySQL ------------------------------
$link = mysql_connect('localhost', 'bazzz_chess', 'jschess');
mysql_select_db('bazzzu1115_chess');
mysql_query('SET NAMES utf8');
//--------------------  init MySQL ------------------------------


// входная переменная управляющая работой скрипта - номер меню
    $ajax_type = $_REQUEST['ajax_type'];


switch ($ajax_type) {
    //-----------------------------------------------------------------------------------------------
    case 'get_games_list':
    //-----------------------------------------------------------------------------------------------
        $str ='';
        $result = mysql_query("select g.id, p.name from games g, players p where g.p2 is null and g.p1 = p.id");
        while ($row = mysql_fetch_array($result))
        {
            $str .= '<option value="'.$row['id'].'">'.$row['name'].'</option>';
        };


        $str .= 'bebebe'."<br>"."$ajax_type";
        // print($str);




        print json_encode (array ('games_list' => $str, 'msg' => 'gg'));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'get_my_games':
    //-----------------------------------------------------------------------------------------------
        $player_id = $_REQUEST['player_id'];
        $str ='';
        $result = mysql_query("select g.id, p1.name p1, p2.name p2 from games g, players p1, players p2 where (g.p1 = $player_id or g.p2 =$player_id) and g.p1 = p1.id and g.p2 = p2.id");

        while ($row = mysql_fetch_array($result))
        {
            $str .= '<option value="'.$row['id'].'">'.$row['p1'].' - '.$row['p2'].'</option>';
        };


        $str .= 'bebebe'."<br>"."$ajax_type";

        print json_encode (array ('games_list' => $str, 'msg' => 'gg'));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'create_new_game':
    //-----------------------------------------------------------------------------------------------
        $player_id = $_REQUEST['player_id'];
        $result = mysql_query("insert into games (p1) values ('$player_id')");

        if ($result)
            {$str = 'Игра создана!';}
        else
            {$str = 'Ошибка при создании..!';}

        $id = mysql_insert_id();
        $str .= " id=$id";

        print json_encode (array ('game_id' => $id, 'msg' => $str));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'join_game':
    //-----------------------------------------------------------------------------------------------
        $player_id = $_REQUEST['player_id'];
        $game_id = $_REQUEST['game_id'];

        $result = mysql_query("update games set p2 = '$player_id' where id = $game_id");


        if ($result)
        {$str = 'Connected!!';}
        else
        {$str = 'FAIL..!';}


        print json_encode (array ('games_list' => '', 'msg' => $str));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'resume_game':
    //-----------------------------------------------------------------------------------------------
        $player_id = $_REQUEST['player_id'];
        $game_id = $_REQUEST['game_id'];

        $result = mysql_query("select * from games where id = $game_id");
        $row = mysql_fetch_array($result);

        if ($row['p1']==$player_id)
        {$color = 'white';}
        else
        {$color = 'black';}


        print json_encode (array ('color' => $color, 'msg' => 'resume ok'));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'save_board':
    //-----------------------------------------------------------------------------------------------
        $game_id = $_REQUEST['game_id'];
        $board_str = $_REQUEST['board_str'];
        $last_move = $_REQUEST['last_move'];

        $result = mysql_query("update games set board_str='$board_str', last_move='$last_move' where id=$game_id");


        if ($result)
        {$str = 'Похожено..';}
        else
        {$str = 'FAIL..!';}


        print json_encode (array ('games_list' => '', 'msg' => $str));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'load_board':
    //-----------------------------------------------------------------------------------------------
        $game_id = $_REQUEST['game_id'];
        $my_color = $_REQUEST['my_color'];

        $result = mysql_query("select board_str, last_move from games where id = $game_id");
        $row = mysql_fetch_array($result);

        if ($result) {$str = 'Зобрано..';} else {$str = 'FAIL..!';}

        print json_encode (array ('board_str' => $row['board_str'], 'msg' => $str));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'check_board':
    //-----------------------------------------------------------------------------------------------
        $game_id = $_REQUEST['game_id'];
        $my_color = $_REQUEST['my_color'];

        $result = mysql_query("select board_str from games where id = $game_id and last_move<>'$my_color'");
        if ($row = mysql_fetch_array($result)) {
            if ($result) {$str = 'Зобрано..';} else {$str = 'FAIL..!';}
            print json_encode (array ('board_str' => $row['board_str'], 'msg' => $str));
        } else {
            print json_encode (array ('board_str' => '', 'msg' => 'Противник думает..'));
        }
        break;
    //-----------------------------------------------------------------------------------------------
    case 'create_player':
    //-----------------------------------------------------------------------------------------------
        $player_name = $_REQUEST['player_name'];

        $result = mysql_query("insert into players (name) values ('$player_name')");
        $id = mysql_insert_id();

        print json_encode (array ('player_id' => $id, 'msg' => 'new player ok'));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'update_player':
    //-----------------------------------------------------------------------------------------------
        $player_id = $_REQUEST['player_id'];
        $player_name = $_REQUEST['player_name'];

        $result = mysql_query("update players set name='$player_name' where id=$player_id");


        print json_encode (array ('player_id' => $player_id, 'msg' => $result));
        break;
    //-----------------------------------------------------------------------------------------------
    case 'load_player':
    //-----------------------------------------------------------------------------------------------
        $player_id = $_REQUEST['player_id'];

        $result = mysql_query("select name from players where id = $player_id limit 1");
        $row = mysql_fetch_array($result);


        print json_encode (array ('player_name' => $row['name'], 'msg' => 'ok'));
        break;

}// end case
//-----------------------------------------------------------------------------------------------



//    mysql_free_result($result);
//    mysql_close($link);

?>

