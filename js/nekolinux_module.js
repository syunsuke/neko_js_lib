/***********************************************************************\
 NEKOLINUXモジュール
 nekolinux_module.js
 syunsuke.fukuda@gmail.com

 NEKOLINUX.namespace(String  name)
  名前空間確保の関数

 NEKOLINUX.event_listener
  ブラウザ汎用のラッパーモジュール

 NEKOLINUX.calendar
  カレンダーUIモジュール

 NEKOLINUX.utils.password
  パスワード生成ユティリティ

\***********************************************************************/
var NEKOLINUX = NEKOLINUX || {};

/*****************************************
 名前空間確保のユティリティ
*****************************************/
NEKOLINUX.namespace = function (ns_string){
    var parts = ns_string.split('.');
    var parent = NEKOLINUX;
    var i;

    if(parts[0] === "NEKOLINUX"){
	parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1){
	if(typeof parent[parts[i]] ==="undefined"){
	    parent[parts[i]] = {};
	}
	parent = parent[parts[i]]
    }
    return parent;
};

/*****************************************
 パスワードユティリティ
*****************************************/
NEKOLINUX.namespace('NEKOLINUX.utils.password');
NEKOLINUX.utils.password = (function () {
    var default_char =
	"abcdefghijklmnopqrstuvdxyz"
      + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      + "0123456789";

    /********************************************
      _car_arrayはプライベート変数
      パスワードに使用するキャラクタを格納
　　　初期化でdefault_carを読み込み

      TODO:クロージャーの場合、
　　　　　set,getのメソッド書き換えると
          迷子になる。
　　　　　クロージャーにする必要がないのかもしれない。
     ********************************************/
    var _char_array = [];
    _set_use_char(default_char);


    /********************************************
      オブジェクト定義
     ********************************************/
    var self = {
	length: 8,
	create: function(){
	    return _create();
	},

	set_use_char: function(str){
	    _set_use_char(str);
	},

	get_use_char: function(){
	    return _get_use_char();
	}
    };
    return self;

    function _create(){
	var pass_str = "";
	var col,id;
	var array_len = _char_array.length;

	for ( col = 0; col < self.length; col += 1){
	    id = Math.floor(Math.random()*array_len);
	    pass_str = pass_str + _char_array[id];
	}
	return pass_str;
    }

    function _set_use_char(str){
	_char_array = str.split('');
    }

    function _get_use_char(){
	var i = 0, max = _char_array.length;
	var result = "";
	for (; i<max; i += 1){
	    result = result + _char_array[i];
	}
	return result;
    }

}());



/*****************************************
 イベントリスナーのユティリティ
  「JavaScriptパターン」を参考
   初期化時分岐パターンの実装
*****************************************/
NEKOLINUX.namespace('NEKOLINUX.event_listener');
NEKOLINUX.event_listener = (function () {
    var self = {
	add: null,
	remove: null
    }

    if( typeof window.addEventListen === 'function'){
	self.add = function(target, type, func){
	    target.addEventListener(type, func, false);
	};
	self.remove = function(target, type, func){
	    target.removeEventListener(type, func, false);
	};
    }else if(typeof document.attachEvent === 'function'){
	self.add = function(target, type, func){
	    target.attachEvent('on' + type, func);
	};
	self.remove = function(target, type, func){
	    target.detachEvent('on' + type, func);
	};
    }else{
	self.add = function(target, type, func){
	    target['on'+type] = func;
	}
	self.remove = function(target, type, func){
	    target['on'+type] = null;
	}
    }

    return self;
}());


/************************************************************
 カレンダーモジュール
 http://gihyo.jp/dev/serial/01/crossbrowser-javascript/0024
 を参考にした。
*************************************************************/
NEKOLINUX.namespace('NEKOLINUX.calendar');
NEKOLINUX.calendar = (function () {


    /*****************************************
     年と月を今日の日付から初期化
    *****************************************/
    var today = new Date();

    var self = {
	year:  today.getFullYear(),
	month: today.getMonth(),

	table: _create_table(),

	update_view: function(){
	    var parent = self.table.parentNode;
	    parent.removeChild(self.table);

	    self.table = _create_table();
	    self.create(parent);
	},

	create: function(parent){
	    self.table.appendChild(_createCaption());
	    self.table.appendChild(_createThead());
	    self.table.appendChild(_createTbody());

	    parent.appendChild(self.table);

	    NEKOLINUX.event_listener.add(self.table, 'click', _handler);

	},

	click_arrow: function(elem){
	    _change_month(elem);
	},

	click_each_date: function(){
	}

    };

    return self;


    /*************************************
      テーブルを作る
     *************************************/
    function _create_table(){
	var table_tag = document.createElement('table');
	table_tag.id = "neko_calendar"
	return table_tag;
    }

    /*************************************
      カレンダーめくり処理
     *************************************/
    function _change_month(elem){

	if(elem.id === "pre_m_button"){
	    self.month -= 1;
	    if(self.month < 0){
		self.month = 11;
		self.year -= 1;
	    }
	}

	if(elem.id === "next_m_button"){
	    self.month += 1;
	    if(self.month > 11){
		self.month = 0;
		self.year += 1;
	    }
	}

	self.update_view();
    }

    /*************************************
      クリックイベントの処理
     *************************************/
    function _handler(e){
	var src;

	e = e || window.event;
	src = e.target || e.srcElement;


	if( ! /_m_button/.test(src.id) ){
	    return;
	}
	self.click_arrow(src);

	//キャンセル処理
	if( typeof e.stopPropagation === 'function'){
	    e.stopPropagation();
	}
	if(typeof e.cancelBubble !== "undefined"){
	    e.cancelBubble = true;
	}
	if(typeof e.preventDefault === "function"){
	    e.preventDefault();
	}
	if(typeof e.returnValue !== "undefined"){
	    e.returnValue = false;
	}

    }

    /*************************************
      カレンダーの中身（tbody）
     *************************************/
    function _createTbody () {

	var first = new Date(self.year, self.month, 1);       //一日
	var last  = new Date(self.year, self.month + 1, 0);   //晦日
	var today_f = -1;

	var youbi_first = first.getDay();  //一日の曜日
	var last_date = last.getDate();    //晦日の日にち

	var date_count = 1;                //日付
	var row, col, row_tag, cell_tag;   //一時変数

	var tbody_tag = document.createElement('tbody');  //HTMLオブジェクト


	/**************************************************************
	 表示は現在か？
         今日を含むカレンダーでは、今日の色をかえるためのフラグ的変数
	 **************************************************************/
	if (self.year === today.getFullYear()
	    && self.month === today.getMonth() ){
	    today_f = today.getDate();
	}

	/*****************************************
	 日曜日が先頭の七列の行を六行作る。
	 *****************************************/
	for(row = 0; row < 6; row += 1){
	    row_tag = document.createElement('tr');

	    for(col = 0; col < 7; col += 1){
		cell_tag = document.createElement('td');

		//第一週目の処理
		if ( row === 0 && col < youbi_first){
		    cell_tag.className = "skip";
		    cell_tag.innerHTML = '&nbsp;';

		//最終日以降の処理
		}else if (date_count > last_date){
		    cell_tag.className = "skip";
		    cell_tag.innerHTML = '&nbsp;';

		//その他の処理
		}else{
		    cell_tag.innerHTML = date_count ;
		    cell_tag.className = "youbi" + col;
		    if( today_f === date_count ){
			cell_tag.className = "today";
		    }
		    date_count += 1;
		}

		row_tag.appendChild(cell_tag);
	    }

	    tbody_tag.appendChild(row_tag);
	}

	return tbody_tag;
    };

    /*************************************
      曜日部分(thead)
     *************************************/
    function _createThead () {

	var thead_tag = document.createElement('thead');
	var youbi_str = ["日", "月", "火", "水", "木", "金", "土"];
	var col, cell_tag, row_tag;

	row_tag = document.createElement('tr');

	for(col = 0; col < 7; col += 1){
	    cell_tag = document.createElement('th');
	    cell_tag.className = "youbi" + col;
	    cell_tag.innerHTML = youbi_str[col];

	    row_tag.appendChild(cell_tag);
	}

	thead_tag.appendChild(row_tag);

	return thead_tag;
    };

    /*************************************
      キャプション部分
     *************************************/
    function _createCaption () {

	var caption_tag = document.createElement('caption');

	//真ん中は年及び月の表示
	var span_tag = document.createElement('span');
	span_tag.innerHTML = "&nbsp;" + self.year + "年" + (self.month + 1) + "月&nbsp;";

	//左側ボタンは前の月を表示
	var pre_tag = document.createElement('a');
	pre_tag.href = "#";
	pre_tag.id = "pre_m_button"
	pre_tag.innerHTML = "←"

	//右側ボタンは次の月を表示
	var next_tag = document.createElement('a');
	next_tag.href = "#";
	next_tag.id = "next_m_button"
	next_tag.innerHTML = "→"

	caption_tag.appendChild(pre_tag);
	caption_tag.appendChild(span_tag);
	caption_tag.appendChild(next_tag);

	return caption_tag;
    };
} ());


