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
var car_markerego = [];                         //四輪車の自車のマーカー

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
var car_loopcount = [];                         //ループ数
var car_GPStime = [];                           //GPSタイム
var car_ego_angle = [];                         //機首方向
var car_ego_latlng = [];                          //緯度経度
var car_ego_lat = [];                             //緯度
var car_ego_lng = [];                             //経度
var car_tra_total = [];                           //追跡物体数
var car_tra_num = [];                           //追跡物体番号
var car_tra_latlng =[];                         //追跡物体の緯度経度
var car_tra_lat = [];                           //追跡物体の緯度
var car_tra_lng = [];                           //追跡物体の経度
var car_tra_angle = [];                         //追跡物体の機首方向
var car_tra_flag = [];                          //追跡物体の種別

var car_tra_loop_all=[];                        //carのみが追跡中の物体のloop番号（loop = 11，12，13）


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
var bike_pre_headloop = 0;                            //??バイクの追跡物体のloop
var car_pre_headloop = 0;                             //??四輪車の追跡物体のloop
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
var car_loop = 0;                                 //データベースに書き込んでいく用
// var dis_bike_loop = 0;                            //表示用(未使用)
// var dis_car_loop = 0;                             //表示用(未使用)
// var loop = 0;                                     //全体のloop(未使用)
var new_loop = 0;                                 //現在のスキャン
var car_now_headloop;                         //totalがどこか調べる関数
var pre_car_tra_total;                          //四輪車の追跡物体の内，統合する追跡物体数


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
            vehicle_type=markerElem.getAttribute('vehicletype');
            /* バイクのデータ読みこみ */
            if(vehicle_type==0){
                bike_loopcount[bike_loop] = markerElem.getAttribute('bike_loopcount');
                bike_GPStime[bike_loop] = markerElem.getAttribute('bike_GPStime');
                
                //自車情報
                //egoの情報はbike_loopcount[bike_loop]にして，traの情報はまた考える（bike_loopcount[bike_loop]が同じやったらegoの値は一緒）
                bike_ego_lat[bike_loopcount[bike_loop]] = parseFloat(markerElem.getAttribute('bike_ego_lat'));
                bike_ego_lng[bike_loopcount[bike_loop]] = parseFloat(markerElem.getAttribute('bike_ego_lng'));
                bike_ego_latlng[bike_loopcount[bike_loop]] = new google.maps.LatLng(
                    parseFloat(bike_ego_lat[bike_loopcount[bike_loop]]),
                    parseFloat(bike_ego_lng[bike_loopcount[bike_loop]])
                ); 
                bike_ego_angle[bike_loopcount[bike_loop]] = parseInt(markerElem.getAttribute('bike_ego_angle'),10);

                //追跡物体情報(すべて一次元にした)→??マーカーだけ２次元
                bike_tra_total[bike_loop] = markerElem.getAttribute('bike_tra_total');
                bike_tra_num[bike_loop] = markerElem.getAttribute('bike_tra_num');
                bike_tra_lat[bike_loop]=parseFloat(markerElem.getAttribute('bile_tra_lat'));
                bike_tra_lng[bike_loop]=parseFloat(markerElem.getAttribute('bike_tra_lng'));
                bike_tra_latlng[bike_loop] = new google.maps.LatLng(
                    parseFloat(bike_tra_lat[bike_loop]),
                    parseFloat(bike_tra_lng[bike_loop])
                ); 
                bike_tra_angle[bike_loop] = parseInt(markerElem.getAttribute('bike_tra_ang'));
                bike_tra_flag[bike_loop] = markerElem.getAttribute('bike_tra_carflag');
            }
            /* 四輪車のデータ読み込み */
            else{
                car_loopcount[car_loop] = markerElem.getAttribute('loopcount');
                car_GPStime[car_loop] = markerElem.getAttribute('GPStime');

                //自車情報
                //egoの情報はcar_loopcount[car_loop]にして，traはまた考える（car_loopcount[car_loop]が同じやったらegoの値は一緒→書き換えられても問題なし）
                car_ego_lat[car_loopcount[car_loop]] = parseFloat(markerElem.getAttribute('ego_lat'));
                car_ego_lng[car_loopcount[car_loop]] = parseFloat(markerElem.getAttribute('ego_lng'));
                car_ego_latlng[car_loopcount[car_loop]] = new google.maps.LatLng(
                    parseFloat(car_ego_lat[car_loopcount[car_loop]]),
                    parseFloat(car_ego_lng[car_loopcount[car_loop]])
                ); 
                car_ego_angle[car_loopcount[car_loop]] = parseInt(markerElem.getAttribute('ego_angle'),10);

                //追跡物体情報
                car_tra_total[car_loop] = markerElem.getAttribute('tra_total');
                car_tra_num[car_loop] = markerElem.getAttribute('tra_num');
                car_tra_lat[car_loop] = parseFloat(markerElem.getAttribute('tra_lat'));
                car_tra_lng[car_loop] = parseFloat(markerElem.getAttribute('tra_lng'));
                car_tra_latlng[car_loop] = new google.maps.LatLng(
                    parseFloat(car_tra_lat[car_loop]),
                    parseFloat(car_tra_lng[car_loop])
                ); 
                car_tra_angle[car_loop] = parseInt(markerElem.getAttribute('tra_ang'));
                car_tra_flag[car_loop] = markerElem.getAttribute('tra_carflag');
            }

            /* 自車描画処理 */
            //前提：四輪車のデータのほうがデータベースに先に入ってきている
            if(vehicle_type == 1){//バイクの値を格納するときのみ→四輪車のGPSタイムのほうが先に進んでいることを前提とすると
                if(car_loop > 0){//同じcountのものを表示する→bike_loopcountを基準として0から表示させる
                    /** 前時刻から現時刻に変わるときだけ以下の描画処理を行う */
                    if(car_loopcount[car_loop] != car_loopcount[car_loop-1]){
                        //console.log(car_loopcount[car_loop]);
                        //consoloe.log(car_loop);
                        bike_markerego[new_loop] = new google.maps.Marker({
                            map: map,
                            position: bike_ego_latlng[bike_loopcount[bike_loop-1]],
                            icon: {
                                fillColor: "blue",                                      //塗り潰し色
                                fillOpacity: 2.0,                                       //塗り潰し透過率
                                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,     //円を指定
                                scale: 4,                                               //円のサイズ
                                strokeColor: "blue",                                    //枠の色
                                strokeWeight: 1.5,                                      //枠の透過率
                                rotation: bike_ego_angle[bike_loopcount[bike_loop-1]]   //機首方向
                            },
                            draggable: true,
                            //   label: icon.label
                        }); 
                        car_markerego[new_loop] = new google.maps.Marker({
                            map: map,
                            position: car_ego_latlng[car_loopcount[car_loop-1]],
                            icon: {
                                fillColor: "red",                                       //塗り潰し色
                                fillOpacity: 2.0,                                       //塗り潰し透過率
                                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,     //円を指定
                                scale: 4,                                               //円のサイズ
                                strokeColor: "red",                                     //枠の色
                                strokeWeight: 1.5,                                      //枠の透過率
                                rotation: car_ego_angle[car_loopcount[car_loop-1]]      //機首方向
                            },
                            draggable: true,
                            //   label: icon.label
                        });

                        //追跡物体の表示→bike_loopcount[bike_loop-1]分を表示させる
                        //??階層ごとに初期化→これをしないとerrorなるbike_loop
                        markers_biketra[new_loop]=[];           //バイクの追跡物体描画用
                        markers_cartra[new_loop]=[];            //四輪車の追跡物体描画用

                        //バイク前準備ここから
                        /** 前時刻のloopcountの先頭を算出 */
                        bike_pre_headloop = bike_loop-bike_tra_total[bike_loop-1]; //(現在のbike_loop)-(前時刻にバイクで追跡した物体数)
                        //バイク前準備ここまで

                        //四輪車前準備ここから
                        //統合処理を行うために，統合する追跡物体数を算出する
                        //??bike_loop-1に対応するcar_loopcountのcar_loopを探す（これを新しくcar_tra_loopとして，それを１つずつ描画していく）
                        //car_tra_loopの初期値算出
                        var car_now_loopcount
                        for(r=0;r<car_loop;r++){
                            if(bike_loopcount[bike_pre_headloop] == car_loopcount[r]){
                                car_pre_headloop = r;
                                car_now_loopcount = car_loopcount[car_pre_headloop];
                                break;
                            }
                        }
                        //四輪車のバイクと同じloopcountのloopを調べる
                        //統合する追跡物体の数を調べるためのloop
                        for(s = 0; s < car_loop; s++){
                            if(bike_loopcount[bike_loop] == car_loopcount[s]){
                                car_now_headloop = s;
                                break;
                            }
                        }

                        //四輪車のtotal保存
                        //前時刻の追跡物体合計(統合に用いる)
                        var car_pre_endloop = car_now_headloop - 1;
                        var pre_car_tra_total = car_tra_total[car_pre_endloop];
                        //四輪車準備ここまで

                        var bike_now_loopcount=bike_loopcount[bike_pre_headloop];       //バイクの現時刻のループ数
                        var ave_num=0;                                              //統合する追跡物体数
                        var minus_count=0;                                          //統合後にマーカーを消す追跡物体数
                        var car_tra_minus=[];                                       //統合後にマーカーを消す追跡物体番号(四輪車用)
                        var bike_tra_minus=[];                                      //統合後にマーカーを消す追跡物体番号(バイク用)
                        var car_tra_loop_minus=[];                                  //統合後にマーカーを消す際のループ数(四輪車用)
                        var bike_tra_loop_minus=[];                                 //統合後にマーカーを消す際のループ数(バイク用)

                        //後の二重for文で使う用
                        var tmp_car_pre_headloop=car_pre_headloop;
                        var tmp2_car_pre_headloop=car_pre_headloop;
                        var tmp_bike_pre_headloop=bike_pre_headloop;
                        var ave_loop=0;

                        var tmp_bike_tra_total=bike_tra_total[bike_loop-1];

                        /* 統合処理 */
                        //１つ前のマークを消す
                        if(ave_count>0){
                            for(b=0;b<ave_count;b++){
                                if(ave_tra_count[ave_total[b]]>0){
                                    markers_ave[pre_ave_loop[ave_total[b]]][ave_total[b]].setMap(null);      
                                }
                            }
                        }

                        //統合数の初期化
                        ave_count=0;

                        for(p=0;p<bike_tra_total[bike_loop-1];p++){//bike_loop-1の追跡分を表示
                            //バイクのcountが揃っていなければ表示させない
                            if(bike_loopcount[bike_pre_headloop] == bike_now_loopcount){
                                 //carの追跡情報があるとき
                                if(pre_car_tra_total>0){
                                    for(q=0;q<pre_car_tra_total;q++){
                                        if(car_loopcount[car_pre_headloop] == car_now_loopcount){
                                            //初期化
                                            markers_ave[ave_loop]=[];
                                            //統合処理
                                            //距離の算出[m]
                                            var distance = Math.abs(calc_distance(car_tra_lat[car_pre_headloop], car_tra_lng[car_pre_headloop],bike_tra_lat[bike_pre_headloop],bike_tra_lng[bike_pre_headloop])*1000);
                                            var difference_angle=Math.abs(car_tra_angle[car_pre_headloop]-bike_tra_angle[bike_pre_headloop]);

                                            //統合条件
                                            if((distance<1.7)&&(difference_angle<180)){
                                                //位置の平均
                                                ave_num=car_tra_num[car_pre_headloop];
                                                ave_total[ave_count]=ave_num;
                                                ave_lat=(car_tra_lat[car_pre_headloop]+bike_tra_lat[bike_pre_headloop])/2;
                                                ave_lng=(car_tra_lng[car_pre_headloop]+bike_tra_lng[bike_pre_headloop])/2;
                                                ave_latlng=new google.maps.LatLng(
                                                    parseFloat(ave_lat),
                                                    parseFloat(ave_lng)
                                                ); 
                                                //機首方向の平均
                                                ave_angle=parseInt((car_tra_angle[car_pre_headloop]+bike_tra_angle[bike_pre_headloop])/2);
                                                 //平均を取った値でマーカーを置く
                                                 //車両種別
                                                 if((car_tra_flag[car_pre_headloop]==0)&&(bike_tra_flag[bike_pre_headloop==0])){
                                                    ave_type=0;
                                                }
                                                else if((car_tra_flag[car_pre_headloop]==1)&&(bike_tra_flag[bike_pre_headloop==1])){
                                                    ave_type=1;
                                                }
                                                else ave_type=1;
                                                //歩行者と判定
                                                if(ave_type==0){
                                                    markers_ave[ave_loop][ave_num]=new google.maps.Marker({
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
                                                //車両と判定                          
                                                else{
                                                    markers_ave[ave_loop][ave_num]=new google.maps.Marker({
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
                                                            text: String(ave_num),               //ラベル文字'V'
                                                            color: '#000000',                    //文字の色
                                                            fontWeight: 'bold',                  //フォントの太さ
                                                            fontSize: '14px',                    //文字のサイズ
                                                        },
                                                        draggable: true,
                                                    });
                                                }
                                                //追跡物体の前回の情報を消すかどうか（0:消さない，2以上：消す）
                                                ave_tra_count[ave_num]=ave_tra_count[ave_num]+1;
                                                //追跡物体の前回の情報がave_loopのどこに入っているかわかるように保存する処理
                                                pre_ave_loop[ave_num]=ave_loop;
                                                //四輪車の追跡情報を表示させるときに，統合する分の情報だけ抜く用
                                                //追跡番号を保存
                                                car_tra_minus[minus_count]=car_tra_num[car_pre_headloop];
                                                car_tra_loop_minus[minus_count]=car_pre_headloop;
                                                //バイクの追跡情報を表示させるときに統合する分の情報を抜く用
                                                bike_tra_minus[minus_count]=bike_tra_num[bike_pre_headloop];
                                                bike_tra_loop_minus[minus_count]=bike_pre_headloop;
                                                ave_loop++;
                                                ave_count++;
                                                minus_count++;
                                                car_pre_headloop++;
                                                break;
                                            }
                                            car_pre_headloop++;
                                        }
                                        else break;
                                    }
                                    car_pre_headloop=tmp_car_pre_headloop;
                                }
                                bike_pre_headloop++;
                            }
                            else break;
                        }

                        //四輪車削除
                        //保存されている１つ前の情報を用いる
                        //追跡物体があるかどうか()
                        if(car_tra_loop_all.length>0){
                            //追跡物体数だけ繰り返す
                            for(b=0;b<car_only_count;b++){
                                //全追跡物体から前時刻の追跡物体かどうかを判定
                                if(car_tra_count[car_tra_num[car_tra_loop_all[b]]]>0){
                                    markers_cartra[pre_cartra_loop[car_tra_num[car_tra_loop_all[b]]]][car_tra_num[car_tra_loop_all[b]]].setMap(null);      
                                }
                            }
                        }

                        //追跡物体の番号を初期化
                        car_tra_loop_all=[];
                        //carの追跡情報を取り出す
                        car_only_count=0;
                        var car_egotra_flag=false;
                        //console.log(car_loopcount[tmp2_car_pre_headloop]);

                        /* 車載LiDAR(四輪車)が車載LiDAR(バイク)を追跡しているマーカーを除去するための処理 */
                        //現時刻の四輪車の追跡物体全てに対して
                        for(u=0; u<pre_car_tra_total; u++){　
                            // console.log(car_tra_num[tmp2_car_pre_headloop]);
                            //バイクの自車と四輪車の移動物体の距離
                            var car_ego_tra_distance = (calc_distance(bike_ego_lat[bike_loopcount[tmp_bike_pre_headloop]],bike_ego_lng[bike_loopcount[tmp_bike_pre_headloop]],car_tra_lat[tmp2_car_pre_headloop],car_tra_lng[tmp2_car_pre_headloop]))*1000;
                            //現時刻のloopcountのすべてのloopを回す
                            if(car_loopcount[tmp2_car_pre_headloop]==car_now_loopcount){
                                //バイクの自車と四輪車の距離が1.5[m]以上あったら格納する，もしくは１回自車との距離が1.5[m]以内の追跡物体があったとき
                                if((car_ego_tra_distance>1.5)||(car_egotra_flag==true)){
                                    //car_tra_num[car_tra_loop_all[u]]を表示させる
                                    //表示させるloop番号の保存
                                    car_tra_loop_all[car_only_count]=tmp2_car_pre_headloop;
                                    car_only_count++;
                                }
                                else {//自車との距離が近いため，格納しない
                                    car_egotra_flag=true;
                                }
                                tmp2_car_pre_headloop++;
                            }
                            else break;
                        }


                         /* 追跡物体表示（四輪車） */
                        //??統合する追跡物体があるときcar_tra_loop_allを変更する
                        //四輪車の全追跡物体から統合する追跡物体を消すための
                        if(minus_count>0){
                            car_tra_loop_all=car_tra_loop_all.filter(r=>car_tra_loop_minus.indexOf(r)==-1)
                        }
                        //バイク，四輪車それぞれの追跡物体の表示bike_tra_all[]とcar_tra_num[car_tra_loop_all[c]]を表示させる
                        //四輪車の追跡物体の表示
                        for(c=0; c<car_tra_loop_all.length; c++){
                            var car_tra_number=car_tra_num[car_tra_loop_all[c]];
                            //四輪車の追跡物体表示
                            //歩行者の場合(P)
                            if(car_tra_flag[car_tra_loop_all[c]]==0){
                                markers_cartra[new_loop][car_tra_number]=new google.maps.Marker({
                                    map: map,
                                    position: car_tra_latlng[car_tra_loop_all[c]],
                                    icon: {
                                        fillColor: "orange",                    //塗り潰し色
                                        fillOpacity: 2.0,                       //塗り潰し透過率
                                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                                        scale: 4,                               //円のサイズ
                                        strokeColor: "orange",                  //枠の色
                                        strokeWeight: 1.5,                      //枠の透過率
                                        rotation: car_tra_angle[car_tra_loop_all[c]]                 //機首方向
                                    },
                                    label: {
                                        text: String(car_tra_number),           //ラベル文字'P'//String(car_tra_number)//'P'
                                        color: '#000000',                       //文字の色
                                        fontWeight: 'bold',                     //フォントの太さ
                                        fontSize: '14px',                       //文字のサイズ
                                    },
                                    draggable: true,
                                });
                            }
                            //車両の場合(V)
                            else if(car_tra_flag[car_tra_loop_all[c]]==1){
                                markers_cartra[new_loop][car_tra_number]=new google.maps.Marker({
                                    map: map,
                                    position: car_tra_latlng[car_tra_loop_all[c]],
                                    icon: {
                                        fillColor: "orange",                    //塗り潰し色
                                        fillOpacity: 2.0,                       //塗り潰し透過率
                                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                                        scale: 4,                               //円のサイズ
                                        strokeColor: "orange",                  //枠の色
                                        strokeWeight: 1.5,                      //枠の透過率
                                        rotation: car_tra_angle[car_tra_loop_all[c]]                 //機首方向
                                    },
                                    label: {
                                        text: String(car_tra_number),           //ラベル文字'V'//String(car_tra_number)//'V'
                                        color: '#000000',                       //文字の色
                                        fontWeight: 'bold',                     //フォントの太さ
                                        fontSize: '14px',                       //文字のサイズ
                                    },
                                    draggable: true,
                                });
                            }
                            //追跡物体の前回の情報を消すかどうか（0:消さない，2以上：消す）
                            car_tra_count[car_tra_number] = car_tra_count[car_tra_number]+1;
                            //追跡物体の前回の情報がnew_loopのどこに入っているかわかるように保存する処理
                            pre_cartra_loop[car_tra_number] = new_loop;
                        }


                        //1つ前の追跡物体削除（バイク）
                        if(bike_tra_loop_all.length>0){
                            for(a=0;a<bike_only_count;a++){
                                if(bike_tra_count[bike_tra_num[bike_tra_loop_all[a]]]>0){
                                    markers_biketra[pre_biketra_loop[bike_tra_num[bike_tra_loop_all[a]]]][bike_tra_num[bike_tra_loop_all[a]]].setMap(null);                                              
                                }
                            }
                        }
                        bike_tra_loop_all=[];

                        console.log(bike_loopcount[tmp_bike_pre_headloop]);

                        /* 車載LiDAR(四輪車)が車載LiDAR(バイク)を追跡しているマーカーを除去するための処理 */
                        //bikeの追跡情報を取り出す
                        bike_only_count=0;
                        var bike_egotra_flag=false;
                        //bike全体
                        for(f=0;f<tmp_bike_tra_total;f++){
                            // console.log(bike_tra_num[tmp_bike_pre_headloop]);
                            //バイクの自車と四輪車の距離
                            var bike_ego_tra_distance=(calc_distance(car_ego_lat[car_loopcount[tmp_car_pre_headloop]],car_ego_lng[car_loopcount[tmp_car_pre_headloop]],bike_tra_lat[tmp_bike_pre_headloop],bike_tra_lng[tmp_bike_pre_headloop]))*1000;
                            if(bike_loopcount[tmp_bike_pre_headloop]==bike_now_loopcount){

                                if((bike_ego_tra_distance>1.5)||(bike_egotra_flag==true)){
                                    //表示させるloop番号の保存
                                    bike_tra_loop_all[bike_only_count]=tmp_bike_pre_headloop;
                                    bike_only_count++;
                                }
                                else{
                                    bike_egotra_flag=true;
                                }
                                tmp_bike_pre_headloop++;
                            }
                            else break;
                        }

                        /* 追跡物体表示処理（バイク） */
                        //統合する追跡物体があるときbike_tra_loop_allを変更する
                        //バイクの全追跡物体から統合された追跡物体のcountを引く
                        //ex)追跡物体のcountが11, 12, 13とし，11が統合されたとき，bike_tra_loop_allには12, 13が入る
                        if(minus_count>0){
                            bike_tra_loop_all=bike_tra_loop_all.filter(l=>bike_tra_loop_minus.indexOf(l)==-1)
                        }
                        //バイクの追跡物体の表示
                        for(d=0;d<bike_tra_loop_all.length;d++){
                            var bike_tra_number=bike_tra_num[bike_tra_loop_all[d]];

                            //歩行者の場合
                            if(bike_tra_flag[bike_tra_loop_all[d]]==0){
                                markers_biketra[new_loop][bike_tra_number]=new google.maps.Marker({
                                    map: map,
                                    position: bike_tra_latlng[bike_tra_loop_all[d]],
                                    icon: {
                                        fillColor: "green",                //塗り潰し色
                                        fillOpacity: 2.0,                    //塗り潰し透過率
                                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                                        scale: 4,                           //円のサイズ
                                        strokeColor: "green",              //枠の色
                                        strokeWeight: 1.5,                   //枠の透過率
                                        rotation: bike_tra_angle[bike_tra_loop_all[d]]                 //機首方向
                                    },
                                    label: {
                                        text: String(bike_tra_number),                           //ラベル文字'P'//String(bike_tra_number)
                                        color: '#000000',                    //文字の色
                                        fontWeight: 'bold',        //フォントの太さ
                                        fontSize: '14px',                     //文字のサイズ
                                    },
                                    draggable: true,
                                });
                            }
                            //車両の場合
                            else if(bike_tra_flag[bike_tra_loop_all[d]]==1){
                                markers_biketra[new_loop][bike_tra_number]=new google.maps.Marker({
                                    map: map,
                                    position: bike_tra_latlng[bike_tra_loop_all[d]],
                                    icon: {
                                        fillColor: "green",                //塗り潰し色
                                        fillOpacity: 2.0,                    //塗り潰し透過率
                                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, //円を指定
                                        scale: 4,                           //円のサイズ
                                        strokeColor: "green",              //枠の色
                                        strokeWeight: 1.5,                   //枠の透過率
                                        rotation: bike_tra_angle[bike_tra_loop_all[d]]                 //機首方向
                                    },
                                    label: {
                                        text: String(bike_tra_number),                           //ラベル文字'V'//String(bike_tra_number)
                                        color: '#000000',                    //文字の色
                                        fontWeight: 'bold',        //フォントの太さ
                                        fontSize: '14px',                     //文字のサイズ
                                    },
                                    draggable: true,
                                });   
                            }
                            //追跡物体の前回の情報を消すかどうか（0:消さない，2以上：消す）
                            bike_tra_count[bike_tra_number]=bike_tra_count[bike_tra_number]+1;
                            //追跡物体の前回の情報がnew_loopのどこに入っているかわかるように保存する処理
                            pre_biketra_loop[bike_tra_number]=new_loop;
                        }

                        //前時刻の自車を消す
                        if(new_loop>0){
                            bike_markerego[new_loop-1].setMap(null);
                            car_markerego[new_loop-1].setMap(null);
                        }
                        new_loop++;
                    }
                }
            }

            if(vehicle_type==0){
                bike_loop++;
            }
            else{
                car_loop++;
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
