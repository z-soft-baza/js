<?php

header('Content-Type: application/json; charset=utf-8');

//--------------------  init MariaDB (MySQL protocol) ------------------------------
$link = mysqli_connect('localhost', 'bazzz_chess', 'jschess', 'bazzzu1115_chess');

if (!$link) {
    echo json_encode(array('msg' => 'DB connect error: '.mysqli_connect_error()));
    exit;
}

mysqli_set_charset($link, 'utf8mb4');
//--------------------  init MariaDB ------------------------------

$ajax_type = isset($_REQUEST['ajax_type']) ? $_REQUEST['ajax_type'] : '';

function request_int($name, $default = 0) {
    if (!isset($_REQUEST[$name])) {
        return (int)$default;
    }
    return (int)$_REQUEST[$name];
}

function request_str($link, $name, $default = '') {
    if (!isset($_REQUEST[$name])) {
        return $default;
    }
    return mysqli_real_escape_string($link, (string)$_REQUEST[$name]);
}

switch ($ajax_type) {
    case 'get_games_list':
        $str = '';
        $sql = "SELECT g.id, p.name FROM games g, players p WHERE g.p2 IS NULL AND g.p1 = p.id";
        $result = mysqli_query($link, $sql);

        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $str .= '<option value="'.$row['id'].'">'.$row['name'].'</option>';
            }
            mysqli_free_result($result);
        }

        $str .= 'bebebe'."<br>"."$ajax_type";
        echo json_encode(array('games_list' => $str, 'msg' => 'gg'));
        break;

    case 'get_my_games':
        $player_id = request_int('player_id');
        $str = '';
        $sql = "SELECT g.id, p1.name p1, p2.name p2
                FROM games g, players p1, players p2
                WHERE (g.p1 = $player_id OR g.p2 = $player_id)
                  AND g.p1 = p1.id AND g.p2 = p2.id";
        $result = mysqli_query($link, $sql);

        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $str .= '<option value="'.$row['id'].'">'.$row['p1'].' - '.$row['p2'].'</option>';
            }
            mysqli_free_result($result);
        }

        $str .= 'bebebe'."<br>"."$ajax_type";
        echo json_encode(array('games_list' => $str, 'msg' => 'gg'));
        break;

    case 'create_new_game':
        $player_id = request_int('player_id');
        $sql = "INSERT INTO games (p1) VALUES ($player_id)";
        $result = mysqli_query($link, $sql);

        $str = $result ? 'Игра создана!' : 'Ошибка при создании..!';
        $id = mysqli_insert_id($link);
        $str .= " id=$id";

        echo json_encode(array('game_id' => $id, 'msg' => $str));
        break;

    case 'join_game':
        $player_id = request_int('player_id');
        $game_id = request_int('game_id');

        $sql = "UPDATE games SET p2 = $player_id WHERE id = $game_id";
        $result = mysqli_query($link, $sql);
        $str = $result ? 'Connected!!' : 'FAIL..!';

        echo json_encode(array('games_list' => '', 'msg' => $str));
        break;

    case 'resume_game':
        $player_id = request_int('player_id');
        $game_id = request_int('game_id');

        $sql = "SELECT * FROM games WHERE id = $game_id";
        $result = mysqli_query($link, $sql);
        $row = $result ? mysqli_fetch_assoc($result) : null;

        $color = (isset($row['p1']) && (int)$row['p1'] === $player_id) ? 'white' : 'black';

        if ($result) {
            mysqli_free_result($result);
        }

        echo json_encode(array('color' => $color, 'msg' => 'resume ok'));
        break;

    case 'save_board':
        $game_id = request_int('game_id');
        $board_str = request_str($link, 'board_str');
        $last_move = request_str($link, 'last_move');

        $sql = "UPDATE games
                SET board_str = '$board_str', last_move = '$last_move'
                WHERE id = $game_id";
        $result = mysqli_query($link, $sql);

        $str = $result ? 'Похожено..' : 'FAIL..!';
        echo json_encode(array('games_list' => '', 'msg' => $str));
        break;

    case 'load_board':
        $game_id = request_int('game_id');

        $sql = "SELECT board_str, last_move FROM games WHERE id = $game_id";
        $result = mysqli_query($link, $sql);
        $row = $result ? mysqli_fetch_assoc($result) : null;

        $str = $result ? 'Зобрано..' : 'FAIL..!';
        if ($result) {
            mysqli_free_result($result);
        }

        echo json_encode(array('board_str' => $row ? $row['board_str'] : '', 'msg' => $str));
        break;

    case 'check_board':
        $game_id = request_int('game_id');
        $my_color = request_str($link, 'my_color');

        $sql = "SELECT board_str FROM games WHERE id = $game_id AND last_move <> '$my_color'";
        $result = mysqli_query($link, $sql);
        $row = $result ? mysqli_fetch_assoc($result) : null;

        if ($row) {
            $str = $result ? 'Зобрано..' : 'FAIL..!';
            echo json_encode(array('board_str' => $row['board_str'], 'msg' => $str));
        } else {
            echo json_encode(array('board_str' => '', 'msg' => 'Противник думает..'));
        }

        if ($result) {
            mysqli_free_result($result);
        }
        break;

    case 'create_player':
        $player_name = request_str($link, 'player_name');

        $sql = "INSERT INTO players (name) VALUES ('$player_name')";
        mysqli_query($link, $sql);
        $id = mysqli_insert_id($link);

        echo json_encode(array('player_id' => $id, 'msg' => 'new player ok'));
        break;

    case 'update_player':
        $player_id = request_int('player_id');
        $player_name = request_str($link, 'player_name');

        $sql = "UPDATE players SET name = '$player_name' WHERE id = $player_id";
        $result = mysqli_query($link, $sql);

        echo json_encode(array('player_id' => $player_id, 'msg' => $result));
        break;

    case 'load_player':
        $player_id = request_int('player_id');

        $sql = "SELECT name FROM players WHERE id = $player_id LIMIT 1";
        $result = mysqli_query($link, $sql);
        $row = $result ? mysqli_fetch_assoc($result) : null;

        if ($result) {
            mysqli_free_result($result);
        }

        echo json_encode(array('player_name' => $row ? $row['name'] : '', 'msg' => 'ok'));
        break;

    default:
        echo json_encode(array('msg' => 'Unknown ajax_type'));
        break;
}

mysqli_close($link);

?>
