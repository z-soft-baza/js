
function cell(row, col) {
	this.row = row;
	this.col = col;
	this.id = row+''+col;
    this.avaible = false;
	this.fig = {};
    this.fig.tip = 'em';
    this.fig.color = 'none';
    this.fig.hp = 0;
    this.fig.atack = 0;
};



var board = {};
	board.cells = [];
	board.last_cell = {};
	board.selected_cell = {};
    board.game_id = 0;
    board.player_color = 'white';

	board.init = function(){

		this.last_cell = new cell(-1,-1);

		for (var row = 0; row < 8; row++){

            this.cells[row] = [];
            var c;
			for (var col = 0; col < 8; col++){

                c = new cell(row, col);


	 			if (row==0||row==7) {
	 			 	if (col==0||col==7) {
                          c.fig.tip = 'l';
                          c.fig.hp = 4;
                          c.fig.atack = 1;

                    };
	 			 	if (col==1||col==6) {
                          c.fig.tip = 'k';
                          c.fig.hp = 3;
                          c.fig.atack = 1;

                      };
	 			 	if (col==2||col==5) {
                          c.fig.tip = 's';
                          c.fig.hp = 3;
                          c.fig.atack = 1;

                      };
	 			 	if (col==3) {
                          c.fig.tip = 'f';
                          c.fig.hp = 5;
                          c.fig.atack = 1;
                      };
	 			 	if (col==4) {
                          c.fig.tip = 'kr';
                          c.fig.hp = 1;
                          c.fig.atack = 2;

                      };
	 			}

	 			if (row==1||row==6) {
                    c.fig.tip = 'p';
                    c.fig.hp = 2;
                    c.fig.atack = 1;

                }

                if (c.fig.tip!='em') {
                    if (row<4) {
                        c.fig.color = 'black';
                    } else {
                        c.fig.color = 'white';
                    }
                }

                this.cells[row][col] = c;

			}
		}


	};


// =============================================================================================================
// =============================================================================================================
//     board.cell_click = function(cell_id) {
// =============================================================================================================
// =============================================================================================================
	board.cell_click = function(cell_id) {

		cell = this.cellbyid(cell_id);

        if (cell.avaible) {
            var f = cell.fig;
                f.tip = 'em';
                f.color = 'none';
            cell.fig = this.selected_cell.fig;
            this.selected_cell.fig = f;


            this.clear_selected();
            this.clear_avaible();
            this.clear_moved();

            this.player_color = this.player_color == 'white' ? 'black' : 'white';
            $('#div_info').html('Ход ' + this.player_color);
            //save_board();
            return 'done';
        }


        if (cell.enemy) {

            //enemy_mp3.play();

            cell.fig.hp -= this.selected_cell.fig.atack;
            if (cell.fig.hp<=0) {
                var f = cell.fig;
                f.tip = 'em';
                f.color = 'none';
                cell.fig = this.selected_cell.fig;
                this.selected_cell.fig = f;

                //death_mp3.play();
                this.clear_selected();
                this.clear_avaible();
                this.clear_moved();
                this.player_color = this.player_color == 'white' ? 'black' : 'white';
                //save_board();
            }

            this.selected_cell.fig.moved = true;
            this.clear_selected();
            this.clear_avaible();
            return 'done';
        }

        if (cell.selected){
            cell.selected = false;
            this.clear_avaible();
            return 'cancel';
        }

        this.clear_selected();
        this.clear_avaible();
        if (cell.fig.tip!='em'){
            cell.selected = true;
            this.selected_cell = cell;
		    this.avaible_move(cell);
        }


	}




//===================================================================================
//===================================================================================
//     board.cell_html = function (cell)
//===================================================================================
//===================================================================================


board.cell_html = function (cell) {
    var str='';

    str += '<div class="cell';
    if ((cell.row+cell.col)%2==0) {str += ' odd';} else {str += ' even';}
    str += ' ';
    if (cell.fig.tip!='em') {
        if (cell.fig.color=='white') {str += 'w';}
        if (cell.fig.color=='black') {str += 'b';}
    }
    if (cell.fig.tip!='') {str += cell.fig.tip;};
    if (cell.selected) {str += ' selected';};
    if (cell.avaible) {str += ' avaible';};
    if (cell.enemy) {str += ' enemy';};
    str += '" id="'+cell.row+''+cell.col+'">';
    if (cell.fig.tip!='em') {
        str += '<div class="atack">'+ cell.fig.atack+'</div>';
        str += '<div class="hp">'+ cell.fig.hp+'</div>';

    }
    str += '</div>';

    return str;
};

board.cellbyid = function (id) {
    var r=id[0];
    var c=id[1];

    return this.cells[r][c];
}


board.clear_avaible = function () {
    for (var row = 0; row < 8; row++){
        for (var col = 0; col < 8; col++){
            this.cells[row][col].avaible = false;
            this.cells[row][col].enemy = false;
        }
    }
}

board.clear_selected = function () {
    for (var row = 0; row < 8; row++){
        for (var col = 0; col < 8; col++){
            this.cells[row][col].selected = false;
        }
    }
}

board.clear_moved = function () {
    for (var row = 0; row < 8; row++){
        for (var col = 0; col < 8; col++){
            this.cells[row][col].fig.moved = false;
        }
    }
}



board.gethtml = function (){
    var	str ='';
    
        for (var row = 0; row < 8; row++){
            for (var col = 0; col < 8; col++){
                str += this.cell_html(this.cells[row][col]);
            };
            str += '<br>';    
        };
    	return str;        
        
//--------------------------------------------------------------

    if (this.player_color=='white') {
        for (var row = 0; row < 8; row++){
            for (var col = 0; col < 8; col++){
                str += this.cell_html(this.cells[row][col]);
            };
            str += '<br>';
        };
    } else {
        for (var row = 7; row >=0; row--){
            for (var col = 7; col >=0; col--){
                str += this.cell_html(this.cells[row][col]);
            };
            str += '<br>';
        };
    }


    return str;
};


// =============================================================================================================
//    function sleep(ms) {
//        return new Promise(resolve => setTimeout(resolve, ms));
//    }
//    async function demo() {
//            await sleep(2000);
//    }


	board.avaible_move = function(cell) {
        this.clear_avaible();


        if (this.move_over) {
            return false;
        }
        if (cell.fig.moved) {
            return false;
        }
        if (cell.fig.color != this.player_color) {
            return false;
        }

        //-----------------------------------------------------
        if (cell.fig.tip=='p'&&cell.fig.color=='white') {

            if (cell.row == 0) {
                return 'ferz';
            }

            if ((cell.row == 6)&&(this.cells[cell.row-2][cell.col].fig.tip == 'em')&&(this.cells[cell.row-1][cell.col].fig.tip == 'em')) {
                this.cells[cell.row-2][cell.col].avaible = true;
            }
            if (this.cells[cell.row-1][cell.col].fig.tip == 'em') {
                this.cells[cell.row-1][cell.col].avaible = true;
            }
            if ((cell.col>0)&&(this.cells[cell.row-1][cell.col-1].fig.color =='black')) {
                this.cells[cell.row-1][cell.col-1].enemy = true;
            }
            if ((cell.col<7)&&(this.cells[cell.row-1][cell.col+1].fig.color =='black')) {
                this.cells[cell.row-1][cell.col+1].enemy = true;
            }

        }
        //-----------------------------------------------------
        if (cell.fig.tip=='p'&&cell.fig.color=='black') {

            if (cell.row == 7) {
                return 'ferz';
            }

            if ((cell.row == 1)&&(this.cells[cell.row+2][cell.col].fig.tip == 'em')&&(this.cells[cell.row+1][cell.col].fig.tip == 'em')) {
                this.cells[cell.row+2][cell.col].avaible = true;
            }
            if (this.cells[cell.row+1][cell.col].fig.tip == 'em') {
                this.cells[cell.row+1][cell.col].avaible = true;
            }
            if ((cell.col>0)&&(this.cells[cell.row+1][cell.col-1].fig.color =='white')) {
                this.cells[cell.row+1][cell.col-1].enemy = true;
            }
            if ((cell.col<7)&&(this.cells[cell.row+1][cell.col+1].fig.color =='white')) {
                this.cells[cell.row+1][cell.col+1].enemy = true;
            }

        }
        //-----------------------------------------------------
        if (cell.fig.tip=='l') {

            for (i = cell.col+1; i<8; i++) {
                c = this.cells[cell.row][i];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }
            for (i = cell.col-1; i>=0; i--) {
                c = this.cells[cell.row][i];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }
            for (i = cell.row+1; i<8; i++) {
                c = this.cells[i][cell.col];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }
            for (i = cell.row-1; i>=0; i--) {
                c = this.cells[i][cell.col];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }

        }

        //-----------------------------------------------------
        if (cell.fig.tip=='k') {
            r = cell.row+1;
            c = cell.col+2;
            if (c<8&&r<8) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row+2;
            c = cell.col+1;
            if (c<8&&r<8) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row+2;
            c = cell.col-1;
            if (c>=0&&r<8) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row+1;
            c = cell.col-2;
            if (c>=0&&r<8) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row-1;
            c = cell.col-2;
            if (c>=0&&r>=0) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row-2;
            c = cell.col-1;
            if (c>=0&&r>=0) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row-2;
            c = cell.col+1;
            if (c<8&&r>=0) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }
            r = cell.row-1;
            c = cell.col+2;
            if (c<8&&r>=0) {
                if (this.cells[r][c].fig.tip == 'em') {
                    this.cells[r][c].avaible = true;
                } else if (this.cells[r][c].fig.color!=cell.fig.color) {
                    this.cells[r][c].enemy = true;
                }
            }


        }

        //-----------------------------------------------------
        if (cell.fig.tip=='s') {

            r = cell.row;
            c = cell.col;
            for (i = 1; i<8; i++) {
                if ((r+i>7)||(c+i>7)) {break;}
                cl = this.cells[r+i][c+i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = 1; i<8; i++) {
                if ((r+i>7)||(c-i<0)) {break;}
                cl = this.cells[r+i][c-i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = 1; i<8; i++) {
                if ((r-i<0)||(c-i<0)) {break;}
                cl = this.cells[r-i][c-i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = 1; i<8; i++) {
                if ((r-i<0)||(c+i>7)) {break;}
                cl = this.cells[r-i][c+i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }



        }


        //-----------------------------------------------------
        if (cell.fig.tip=='f') {

            r = cell.row;
            c = cell.col;
            for (i = 1; i<8; i++) {
                if ((r+i>7)||(c+i>7)) {break;}
                cl = this.cells[r+i][c+i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = 1; i<8; i++) {
                if ((r+i>7)||(c-i<0)) {break;}
                cl = this.cells[r+i][c-i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = 1; i<8; i++) {
                if ((r-i<0)||(c-i<0)) {break;}
                cl = this.cells[r-i][c-i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = 1; i<8; i++) {
                if ((r-i<0)||(c+i>7)) {break;}
                cl = this.cells[r-i][c+i];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color!=cl.fig.color) {
                    cl.enemy = true;
                    break;
                } else {
                    break;
                }
            }

            for (i = cell.col+1; i<8; i++) {
                c = this.cells[cell.row][i];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }
            //-------------------------------------
            for (i = cell.col-1; i>=0; i--) {
                c = this.cells[cell.row][i];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }
            for (i = cell.row+1; i<8; i++) {
                c = this.cells[i][cell.col];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }
            for (i = cell.row-1; i>=0; i--) {
                c = this.cells[i][cell.col];
                if (c.fig.tip == 'em') {
                    c.avaible = true;
                } else if (cell.fig.color!=c.fig.color) {
                    c.enemy = true;
                    break;
                } else {
                    break;
                }
            }

        }

        //-----------------------------------------------------
        if (cell.fig.tip=='kr') {


            r = cell.row-1;
            c = cell.col-1;
            if (r>=0&&c>=0) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row+1;
            c = cell.col+1;
            if (r<=7&&c<=7) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row-1;
            c = cell.col+1;
            if (r>=0&&c<=7) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row+1;
            c = cell.col-1;
            if (r<=7&&c>=0) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row-1;
            c = cell.col;
            if (r>=0) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row+1;
            c = cell.col;
            if (r<=7) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row;
            c = cell.col+1;
            if (c<=7) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

            r = cell.row;
            c = cell.col-1;
            if (c>=0) {
                cl = this.cells[r][c];
                if (cl.fig.tip == 'em') {
                    cl.avaible = true;
                } else if (cell.fig.color != cl.fig.color) {
                    cl.enemy = true;
                }
            }

        }


	}
	
