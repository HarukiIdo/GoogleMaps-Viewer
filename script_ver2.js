//.htmlに入れていたもの
// sensor=false&(callbackの前についてた)

/**事前知識
 * プログラム内で使われる変数の意味
 * count    loop    tra_num
 * 11       20      0
 * 12       20      1
 * 13       20      2
 * 14       21      0
 * 15       21      1
 * 16       22      0
 * 17       22      1
 */

 class VehicleData{
    constructor(markerdego, loopcount, GPStime, ego_lat, ego_lng, ego_angle, tra_total, tra_num, tra_lat, tra_lng, tra_ang, tra_carflag, loop){
        this.markerdego = markerdego;
        this.loopcount = loopcount;
        this.GPStime = GPStime;
        this.ego_lat = ego_lat;
        this.ego_lng = ego_lng;
        this.ego_angle = ego_angle;
        this.tra_total = tra_total;
        this.tra_num = tra_num;
        this.tra_lat = tra_lat;
        this.tra_lng = tra_lng;
        this.tra_ang = tra_ang;
        this.tra_carflag = tra_carflag;
        this.loop = loop;
    }

    /** 自車の描画 */
    makerEgo(color){
        new google.maps.Marker({
            map: map,
            position: this.ego_latlng[this.loopcount[this.loop]],
            icon: {
                fillColor: color,                                      //塗り潰し色
                fillOpacity: 2.0,                                       //塗り潰し透過率
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,     //円を指定
                scale: 4,                                               //円のサイズ
                strokeColor: color,                                    //枠の色
                strokeWeight: 1.5,                                      //枠の透過率
                rotation: this.ego_latlng[this.loopcount[this.loop]]   //機首方向
            },
            draggable: true,
            //   label: icon.label
        }); 
    }
    
    /** 追跡物体の描画 */
    makerTrackingObject(){
        new google.maps.Marker({
            map: map,
            position: ave_latlng,
            icon: {
                fillColor: "black",                 //塗り潰し色
                fillOpacity: 2.0,                   //塗り潰し透過率
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                scale: 4,                           //円のサイズ
                strokeColor: "black",               //枠の色
                strokeWeight: 1.5,                  //枠の透過率
                rotation: ave_angle                 //機首方向
            },
            label: {
                text: String(ave_num),              //ラベル文字'P'//String(ave_num)
                color: '#000000',                   //文字の色
                fontWeight: 'bold',                 //フォントの太さ
                fontSize: '14px',                   //文字のサイズ
            },
            draggable: true,
        });
    }


    averageTrackingObject(){

    }
}

/**2台のLiDARで追跡した物体の平均を取る(統合) */


var map;                                        //googleマップ表示用

//for文用
var i;
var p;
var q;
var o;
var r;
var s;
var t;
var u;
var v;
var j;
var a;
var b;
var c;
var d;
var f;
var g;

var vehicle_type;                               //車種（bike:0，car:1）

var bike_markerego = [];                        //バイクの自車のマーカー
var markerego = [];                         //四輪車の自車のマーカー

//↓構造体で管理したい
//バイクのデータ
var bike_loopcount = [];                        //ループ数
var bike_GPStime = [];                          //GPSタイム
var bike_ego_angle = [];                        //機首方向
var bike_ego_latlng = [];                          //緯度経度
var bike_ego_lat = [];                            //緯度
var bike_ego_lng = [];                            //経度
var bike_tra_total=[];                          //追跡物体数
var bike_tra_num = [];                          //追跡物体番号
var bike_tra_latlng = [];                       //追跡物体の移動経度
var bike_tra_lat = [];                          //追跡物体の緯度
var bike_tra_lng = [];                          //追跡物体の経度
var bike_tra_angle = [];                        //追跡物体の機首方法
var bike_tra_flag = [];                         //追跡物体の種別

var bike_tra_loop_all=[];                       //bikeのみが追跡中の物体を描画させるための配列

//四輪のデータ
var loopcount = [];                         //ループ数
var GPStime = [];                           //GPSタイム
var ego_angle = [];                         //機首方向
var ego_latlng = [];                          //緯度経度
var ego_lat = [];                             //緯度
var ego_lng = [];                             //経度
var tra_total = [];                           //追跡物体数
var tra_num = [];                           //追跡物体番号
var tra_latlng =[];                         //追跡物体の緯度経度
var tra_lat = [];                           //追跡物体の緯度
var tra_lng = [];                           //追跡物体の経度
var tra_angle = [];                         //追跡物体の機首方向
var tra_carflag = [];                          //追跡物体の種別

var car_tra_loop_all=[];                        //carのみが追跡中の物体を描画させるための配列


//平均系
var markers_ave = [];                             //統合したときのマーカー（平均を取る）
var ave_lat;                                    //統合したときの緯度
var ave_lng;                                    //統合したときの経度
var ave_latlng;                                 //統合したときの緯度経度
var ave_angle;                                  //統合したときの機首方向
var ave_tra_count = new Array(100).fill(0);     //（統合したとき）追跡が１回目かどうか//0なら1回目→前回の追跡情報がないため，前回分は消せない
var pre_ave_loop = [];                            //（統合用）追跡物体の前時刻の情報があるnew_loopの値を保存
var ave_total = [];                               //統合したときの移動物体数
var ave_count;                                  //統合したときのループ数
var ave_type;                                   //統合したときの追跡物体の種類
var car_only_count=0;                           //四輪のみが追跡した物体数
var bike_only_count=0;                          //バイクのみが追跡した物体数            

//追跡系
var bike_tra_loop = 0;                            //??バイクの追跡物体のloop
var car_tra_loop = 0;                             //??四輪車の追跡物体のloop
var patern;                                     //最初のGPStimeについてバイクが大きいか四輪車が大きいか(0:バイクが大きい，1:四輪車が大きい)
var align_flag = true;                            //GPStimeを揃えたかどうかのflag
var comparison_flag = false;                      //GPStimeの0番目を比較したかどうかのflag
var count_difference;                           //GPStimeが揃ったときのcountの差
var markers_biketra = [];                         //バイクで追跡した移動物体のマーカー(2重配列)
var markers_cartra =[];                         //四輪で追跡した移動物体のマーカー(2重配列)
var bike_tra_count = new Array(100).fill(0);    //移動物体を追跡して１回目かどうか//0なら1回目→前回の追跡情報がないため，前回分は消せない
var car_tra_count = new Array(100).fill(0);     //移動物体を追跡して１回目かどうか//0なら1回目→前回の追跡情報がないため，前回分は消せない
var pre_biketra_loop = [];                        //追跡物体の前回の情報があるnew_loopの値を保存
var pre_cartra_loop = [];                         //追跡物体の前回の情報があるnew_loopの値を保存

//ループ系
var bike_loop = 0;                                //データベースに書き込んでいく用
var pre_loopcount = 10000;                             //前時刻のloopcount
var loopcount = 0;                                 //現時刻のloop
// var dis_bike_loop = 0;                            //表示用(未使用)
// var dis_car_loop = 0;                             //表示用(未使用)
// var loop = 0;                                     //全体のloop(未使用)
var new_loop = 0;                                 //現在のスキャン
var new_car_total_loop;                         //totalがどこか調べる関数
var tmp_car_tra_total;                          //四輪車の追跡物体の内，統合する追跡物体数

var pre_trackob_total = 0;                       //前時刻の追跡物体数をカウントする変数
var now_trackob_total = 0;                       //現時刻の追跡物体数をカウントする変数

var pre_tra_total;                         　//前時刻の追跡物体合計をカウントする変数
var pre_tra_num = [];                        //前時刻の追跡物体の番号保存用
var pre_tra_latlng = [];
var pre_tra_angle = [];
var pre_track_total = 0;
var pre_tra_flag = [];
var pre_markerego;
var track_num = 0;                              //追跡物体番号受取用
var is_pre_car_track = Boolean(false);


const R = Math.PI / 180;                        //degreeからRadianに変換する用
//2点間の距離を求める
function calc_distance(lat1, lng1, lat2, lng2) {
  lat1 *= R;
  lng1 *= R;
  lat2 *= R;
  lng2 *= R;
  return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}

/**  Google mapの初期設定*/
function initAutocomplete() {
        /** 地図の基本設定 */
        myOptions = {
            /**  地図拡大率 */
            zoom: 20,
            /**  地図中心値 */
            // center: new google.maps.LatLng(34.79993946, 135.7670043),    //校内
            // center: new google.maps.LatLng(34.79905, 135.78048),         //公道
            center: new google.maps.LatLng(35.010919, 135.756528),          //烏丸

            /** 
             地図の種類を選択 
             ROADMAP：2D地図，SATELLITE：航空写真，HYBRID：航空写真と地形，TERRAIN：地形。
            */
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        /* 地図を表示 */
        map = new google.maps.Map(document.getElementById('map'), myOptions);

        // setInterval("URLdownload()",5000);
        URLdownload();
}

function URLdownload(){
    downloadUrl('http://192.168.11.46/cardata.php', function(data) {
        // console.log("download後")
        var xml = data.responseXML;
        var markers = xml.documentElement.getElementsByTagName('marker');
        //forEachでループさせている
        Array.prototype.forEach.call(markers, function(markerElem) {
            vehicle_type = markerElem.getAttribute('vehicletype');
            /* バイクのデータ読みこみ */
            if(vehicle_type == 1){
            /* 四輪車のデータ読み込み */
                loopcount = markerElem.getAttribute('loopcount');
                GPStime = markerElem.getAttribute('GPStime');
                ego_lat = parseFloat(markerElem.getAttribute('ego_lat'));
                ego_lng = parseFloat(markerElem.getAttribute('ego_lng'));
                ego_latlng = new google.maps.LatLng(
                    parseFloat(ego_lat),
                    parseFloat(ego_lng)
                ); 
                ego_angle = parseInt(markerElem.getAttribute('ego_angle'),10);
                tra_total = markerElem.getAttribute('tra_total');
                tra_num = markerElem.getAttribute('tra_num');
                tra_lat = parseFloat(markerElem.getAttribute('tra_lat'));
                tra_lng = parseFloat(markerElem.getAttribute('tra_lng'));
                tra_latlng = new google.maps.LatLng(
                    parseFloat(tra_lat),
                    parseFloat(tra_lng)
                ); 
                tra_angle = parseInt(markerElem.getAttribute('tra_ang'));
                tra_carflag = markerElem.getAttribute('tra_carflag');
            }
            console.log('loopcount：'+loopcount);
            console.log('pre_loopcount：'+pre_loopcount);

            //車種が四輪車のとき
            if(vehicle_type == 1){
                /** 前時刻のループ数と現時刻のループ数が同じとき
                 *  => 未追跡期間 or 追跡物体が1体以上 */
                if(loopcount == pre_loopcount){
                    pre_tra_total = tra_total;

                    /** 前時刻の追跡物体の数を更新 */
                    if(pre_track_total == 0){
                    pre_track_total = pre_track_total + 2;
                    }
                    else{
                        pre_track_total++;
                    }
                    /** 前時刻の追跡物体の情報を保存 */
                    if(tra_total>0){
                        pre_tra_flag[track_num] = tra_carflag;
                        pre_tra_num[track_num] = tra_num;
                        pre_tra_latlng[track_num] = tra_latlng ;
                        pre_tra_angle[track_num] = tra_angle;
                        track_num++
                    }
                    /** 前時刻のループ数を更新 */  
                    pre_loopcount = loopcount;
                }
                /** 前時刻から現時刻に変わるときだけ描画を行う */
                else if(loopcount != pre_loopcount){
                    track_num = 0;
                    /* 自車描画処理 */
                    markerego[loopcount] = new google.maps.Marker({
                        map: map,
                        position: ego_latlng,
                        icon: {
                            fillColor: "red",                                       //塗り潰し色
                            fillOpacity: 2.0,                                       //塗り潰し透過率
                            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,     //円を指定
                            scale: 4,                                               //円のサイズ
                            strokeColor: "red",                                     //枠の色
                            strokeWeight: 1.5,                                      //枠の透過率
                            rotation: ego_angle      //機首方向
                        },
                        draggable: true,
                        //   label: icon.label
                    });


                    // //追跡物体描画用
                    // markers_cartra = [];
                    // is_pre_car_track[pre_track_total] = false;
        
                    // /**前時刻の追跡物体削除（四輪車）*/
                    // if(pre_tra_total>0){
                    //     for(b=0; b<pre_tra_total; b++){
                    //         if(is_pre_car_track[tra_num] == true){
                    //             markers_cartra[b].setMap(null);      
                    //         }
                    //     }
                    // }

                    // /* 追跡物体表示（四輪車） */
                    // //バイク，四輪車それぞれの追跡物体の表示bike_tra_all[]とcar_tra_num[car_tra_loop_all[c]]を表示させる
                    // //四輪車の追跡物体の表示
                    // //現スキャンの追跡物体数分繰り返す
                    // console.log(pre_tra_total);
                    // for(c = 0; c < pre_tra_total; c++){
                    //     var car_tra_number=pre_tra_num[c];
                    //     //四輪車の追跡物体表示
                    //     //歩行者の場合(P)
                    //     if(pre_tra_flag[c] == 0){　
                    //         markers_cartra[car_tra_number]=new google.maps.Marker({
                    //             map: map,
                    //             position: pre_tra_latlng[car_tra_number],
                    //             icon: {
                    //                 fillColor: "orange",                    //塗り潰し色
                    //                 fillOpacity: 2.0,                       //塗り潰し透過率
                    //                 path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                    //                 scale: 4,                               //円のサイズ
                    //                 strokeColor: "orange",                  //枠の色
                    //                 strokeWeight: 1.5,                      //枠の透過率
                    //                 rotation: pre_tra_angle[car_tra_number]                 //機首方向
                    //             },
                    //             label: {
                    //                 text: String('P'),           //ラベル文字'P'//String(car_tra_number)//'P'
                    //                 color: '#000000',                       //文字の色
                    //                 fontWeight: 'bold',                     //フォントの太さ
                    //                 fontSize: '14px',                       //文字のサイズ
                    //             },
                    //             draggable: true,
                    //         });
                    //     }
                    //     //車両の場合(V)
                    //     else if(tra_carflag[car_tra_loop_all[c]]==1){
                    //         markers_cartra[new_loop][car_tra_number]=new google.maps.Marker({
                    //             map: map,
                    //             position: pre_tra_latlng[car_tra_number],
                    //             icon: {
                    //                 fillColor: "orange",                    //塗り潰し色
                    //                 fillOpacity: 2.0,                       //塗り潰し透過率
                    //                 path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                    //                 scale: 4,                               //円のサイズ
                    //                 strokeColor: "orange",                  //枠の色
                    //                 strokeWeight: 1.5,                      //枠の透過率
                    //                 rotation: pre_tra_angle[car_tra_number]                 //機首方向
                    //             },
                    //             label: {
                    //                 text: String('V'),           //ラベル文字'V'//String(car_tra_number)//'V'
                    //                 color: '#000000',                       //文字の色
                    //                 fontWeight: 'bold',                     //フォントの太さ
                    //                 fontSize: '14px',                       //文字のサイズ
                    //             },
                    //             draggable: true,
                    //         });
                    //     }

                    //     //前時刻の追跡物体かどうかを追跡物体番号ごとに判定
                    //     is_pre_car_track[car_tra_number] = true;
                    // }
                    //前時刻の自車を消す
                    if(loopcount > 0){
                        markerego[pre_loopcount].setMap(null);
                    }

                    /** 追跡物体数初期化 */
                    pre_track_total = 0;
                    pre_tra_flag = [];
                    pre_tra_num = [];
                    pre_tra_latlng = [];
                    pre_tra_angle = [];
                    track_num = 0;  

                    /** 前時刻のループ数を更新 */  
                    pre_loopcount = loopcount;
                }    
            }
        });
        //処理がすべて終了してから繰り返す
        setTimeout(URLdownload,1000);
    });
} 

function downloadUrl(url, callback) {
    var request = window.ActiveXObject ?
        new ActiveXObject('Microsoft.XMLHTTP') :
        new XMLHttpRequest;
    request.onreadystatechange = function() {
        //request.readyState:0→XMLHttpRequestの作成直後
        //1→openメソッドを実行，4→サーバにリクエストを送信し，サーバからのレスポンスの受信が完了したとき
        if (request.readyState == 4) {
            request.onreadystatechange = doNothing;
            callback(request, request.status);
        }
    };
    //第３引数をtrueにすることで非同期に処理することを指定している
    request.open('GET', url, true);
    request.send(null);
}

// getting data from mysql
function doNothing() {}
