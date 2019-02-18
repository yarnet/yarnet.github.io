//マーカー変数用意
var marker;
var marker_gps;

$(function() {

  // ボタンに指定したid要素を取得
  var button = $("#map_button");

  // ボタンが押された時の処理
  button.on('click', function() {
    // フォームに入力された住所情報を取得
    var address = $("#address").val();
    // 取得した住所を引数に指定してcodeAddress()関数を実行
    codeAddress(address);
  });

  //読み込まれたときに地図を表示
  $(window).on('load', function(){
    // フォームに入力された住所情報を取得
    var address = $("#address").val();
    // 取得した住所を引数に指定してcodeAddress()関数を実行
    codeAddress(address);
  });

  $('#map-content').on('show.start', function() {
    $('[data-toggle="transition"], [data-toggle="logout"], [title="お気に入り観光地"], [title="設定"]', '#menu-circle').parent().remove();

    if (localStorage['auth']) {
      $('#menu-circle').append(
        $('<li class="circleMenu-item">').append(
          $('<button type="button" class="btn btn-primary" title="お気に入り観光地" data-toggle="modal" data-target="#favorite-spots-modal">').append(
            $('<i class="fas fa-star"></i>')
          )
        )
      );
      $('#menu-circle').append(
        $('<li class="circleMenu-item">').append(
          $('<button type="button" class="btn btn-primary" title="設定" data-toggle="modal" data-target="#user-setting-modal">').append(
            $('<i class="fas fa-wrench"></i>')
          )
        )
      );
      $('#menu-circle').append(
        $('<li class="circleMenu-item">').append(
          $('<button type="button" class="btn btn-primary" title="ログアウト" data-toggle="logout">').append(
            $('<i class="fas fa-sign-out-alt"></i>')
          )
        )
      );
    } else {
      $('#menu-circle').append(
        $('<li class="circleMenu-item">').append(
          $('<button type="button" class="btn btn-primary" title="ログイン" data-toggle="transition" data-target="#signin-content">').append(
            $('<i class="fas fa-user"></i>')
          )
        )
      );
      $('#menu-circle').append(
        $('<li class="circleMenu-item">').append(
          $('<button type="button" class="btn btn-primary" title="新規登録" data-toggle="transition" data-target="#signup-content">').append(
            $('<i class="fas fa-user-plus"></i>')
          )
        )
      );
    }

    $('#menu-circle').circleMenu('init');
    peer = createPeer() || peer;
  });

  $('#sampleModal').on('show.bs.modal', function() {
    $('#video-friends').empty();

    $.ajax({
      cache    : false,
      dataType : 'json',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_users',
    })
    .done(function(data) {
    if (localStorage['auth']) {
        if (data.length) {
          data.forEach(function (user) {
            var $video_user = $('<div class="video_user media py-1 my-2">');
            $video_user.data('user-id', user.id);

            $video_user.append(
                $('<img class="mr-3" src="/img/logo.png" alt="" width="40" height="40">')
            ).append(
                $('<div class="media-body">')
                  .append(
                      $('<h5 class="my-0">').text(user.name)
                  )
                  .append(
                      $('<span class="friends-id">').text(btoa(btoa(btoa(user.id))).slice(0, -1))
                  )
            );

            $('#video-friends').append($video_user);
          });
        }else {
          $('#video-friends').html('<div class="mx-3 my-3">お気に入りユーザーがいません。</div>');
        }
      }
      });


      // for (var i = 0; i < 10; i++) {
      //   $('#video-friends').append(
      //     $('<div class="media py-1 my-2">')
      //       .append(
      //         $('<img class="mr-3" src="/img/logo.png" alt="" width="40" height="40">')
      //       )
      //       .append(
      //         $('<div class="media-body">')
      //         .append(
      //           $('<h5 class="my-0">').text(localStorage['name'])
      //         )
      //         .append(
      //           $('<span class="friends-id">').text(btoa(btoa(btoa('aite'))))
      //         )
      //       )
      //   );
      // }

  });

  $('#video-friends').on('click', '.media', function(){
    $('#callto-id').val($(".friends-id", this).text());

  });

  $(document).on('click', '[data-toggle="logout"]', function() {
    var state = history.state.slice(0);
    state.pop();
    history.replaceState(state, false);

    localStorage.removeItem('auth');
    localStorage['name'] = ('ゲスト-' + (Math.floor(Math.random() * 90000) + 10000));
    alert('ログアウトしました。');
    $('#top-content').transition('fadeOut', 'fadeIn');
  });

  //マップクリック時に半径3km内のホテルを検索
  var markers = [];
  var infowindows = [];
  YarNet.map.addListener('click', function(e){
    var x= e.latLng.lat();
    var y= e.latLng.lng();
    var hotelspot_url='https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426?applicationId=1094029776062152274&datumType=1&searchRadius=3.0&latitude=' + x + '&longitude='+y;
    console.log(hotelspot_url);
    getHotel(hotelspot_url);
  });

  // ホテルの位置
  function getHotel(url) {
    markers.forEach(m => m.setMap(null));
    markers.splice(0, markers.length);
    infowindows.splice(0,infowindows.length);


    $.ajax({
      url:url,
      type:'GET',
      dataType:'json',
      error:function(){
        console.log("miss");
      },
      success:function(data){
        //contactタブのホテル画像をクリア
        $('#hotel_info').empty();

        data.hotels.forEach(hotel => {
          var basicInfo = hotel['hotel'].shift();

          var hotelInfo_url = "";
          var hotelPosition = {
            lat:basicInfo.hotelBasicInfo.latitude,
            lng:basicInfo.hotelBasicInfo.longitude
          };
          var marker = new google.maps.Marker({
            position:hotelPosition,
            map:YarNet.map,
            icon: './img/hotel-marker.png',
          });
          markers.push(marker);
          var infoWindow = new google.maps.InfoWindow({
            //ホテル名は12文字を超えたら..で省略する
            content:'<div class="infowindow" title="'+basicInfo.hotelBasicInfo.hotelName+'">'+basicInfo.hotelBasicInfo.hotelName+'</div>'
            + '電話番号:'+basicInfo.hotelBasicInfo.telephoneNo+'<br>'
            + '<a href=' + basicInfo.hotelBasicInfo.hotelInformationUrl+' target="_blank">楽天トラベルページ</a><br>'
            //+"一泊の値段:"+basicInfo.roomInfo[0].dailyCharge.rakutenCharge+"(円/人)",
          });
          infowindows.push(infoWindow);
          marker.addListener('click',function(e){
            infowindows.forEach(i => i.close());
            infoWindow.open(YarNet.map,marker);
            //TODO ルート検索の呼び出し
            getRoute(e);
          });


          //ホテル検索結果を表示
          var $media = $(
            '<div class="media" style="border-width:1px 0px solid #333333">'+
            '<img src="' + basicInfo.hotelBasicInfo.hotelImageUrl + '" class="HotelImages" style="text-align:center">'+
            '<div class="media-body">'+
            '<h6 class="mt-0" title="'+basicInfo.hotelBasicInfo.hotelName+'">'+basicInfo.hotelBasicInfo.hotelName+'</h6>'+
            '<div class="hotel-address">'+basicInfo.hotelBasicInfo.address1+basicInfo.hotelBasicInfo.address2+'</div>'+basicInfo.hotelBasicInfo.telephoneNo+
            '</div></div>'
          ).appendTo($("#hotel_info"));

//TODO 微妙に位置変更する
          if (hotel['hotel'].length !== 0) {
            $('<div style="position: absolute; top: 0; right: 0; font-weight: bold; width: 20px; height: 20px; line-height: 20px; background: red; color: white; padding: 2px 5px 2px 4px; margin-right: -10px; border-radius: 50%; margin-top: -5px;">可</div>').appendTo($('.media-body', $media));
          }

          //ホテル名クリックでマップの中心移動、mouseEnterで跳ねる
          $('img', $media).on('click',function(){
            window.open(basicInfo.hotelBasicInfo.hotelInformationUrl,'_blank');
          });

          $('.media-body',$media).on('mouseenter', function() {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          });
          $('.media-body',$media).on('mouseleave', function() {
            marker.setAnimation(null);
          });
          //クリックして中心を移動
          $('.media-body',$media).on('click', function() {
            YarNet.map.panTo(marker.position);
          });
        });
      }
    });
  }

  var clickLat;
  var clickLng;

  //マーカー位置を現在地へ
  $('#create_route').on('click', function(){
    if (clickLat == null) {
      return;
    }
    if (clickLng == null) {
      return;
    }
    your_location = [clickLat, clickLng];
    alert("現在地を変更しました");
  });

  var directionsDisplay;
  //ルート削除
  $('#delete_route').on('click', function(){
    if(directionsDisplay == null){
      return;
    }
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
  });

  var select_location;
  var buttonInvisibleControl=true;
  // マップをクリックで位置変更
  YarNet.map.addListener('click', function(e) {
    getRoute(e);
    getClickLatLng(e.latLng, YarNet.map);
    clickLat = e.latLng.lat();
    clickLng = e.latLng.lng();
    if(buttonInvisibleControl){
    $('.geo_button').removeClass('invisible');
      buttonInvisibleControl=false;
    }
    // 住所を取得
    var address = e.placeId;
    if (!address) {
      return;
    }
    room = peer.joinRoom(address);

    $('.right-nav-drawer input, .right-nav-drawer button').removeAttr('disabled');
    $("#chat-roomname").data('address', address);

    //チャット履歴の取得
    $("#chatLog").html("");
    var address = $("#chat-roomname").data('address');

    $.ajax({
      cache       : false,
      dataType    : 'json',
      type        : 'GET',
      url         : 'https://api.yarnet.ml/messages',
      data        : {'address':address},
    })
      .done(function(data) {
        for (var i = 0; i < data.length; i++) {

          if ((localStorage['auth'] || -1) == data[i].user_id) {
            var $message = $(
              '<div class ="right message">' +
              '<div class="body"></div>'+
              '<div class="date">' + data[i].date + '</div>'+
              '</div>'
            ).find('.body').text(data[i].body).end();
            $('#chatLog').append($message);
          } else if (data[i].user_id != 0) {
            var $message = $(
              '<div class ="left message">' +
              '<figure>'+
              '  <figcaption>' + data[i].name + '</figcaption>'+
              '  <a><img src="/img/logo.png"></a>'+
              '</figure>'+
              '<div class="body"></div>'+
              '<div class="date">' + data[i].date + '</div>'+
              '</div>'
            )
              .find('.body').text(data[i].body).end()
              .find('a').data('user-id', data[i].user_id).end();

            if (localStorage['auth']) {
              $('a', $message)
                .attr('href', '#')
                .prepend('<i class="fas fa-plus"></i>');
            }

            $('#chatLog').append($message);
          } else if (data[i].name == localStorage['name']) {
            var $message = $(
              '<div class ="right message">' +
              '<div class="body"></div>'+
              '<div class="date">' + data[i].date + '</div>'+
              '</div>'
            ).find('.body').text(data[i].body).end();
            $('#chatLog').append($message);
          } else {
            var $message = $(
              '<div class ="left message">' +
              '<figure>'+
              '  <figcaption>' + data[i].name + '</figcaption>'+
              '  <a><img src="/img/logo.png"></a>'+
              '</figure>'+
              '<div class="body"></div>'+
              '<div class="date">' + data[i].date + '</div>'+
              '</div>'
            ).find('.body').text(data[i].body).end();
            $('#chatLog').append($message);
          }
        }

        $('#chatLog').scrollTop($('#chatLog').height());
      })
      .fail(function(data){
        console.log("チャットの取得に失敗しました");
      });

    // チャットを受信
    room.on('data', function(data){
      //chatlog('ID: ' + data.src + '> ' + data.data); // data.src = 送信者のpeerid, data.data = 送信されたメッセージ
      var $message = $(
        '<div class ="left message">' +
        '<figure>'+
        '  <figcaption>' + data.data.name + '</figcaption>'+
        '  <a href="#"><img src="/img/logo.png"></a>'+
        '</figure>'+
        '<div class="body"></div>'+
        '<div class="date">' + data.data.date + '</div>'+
        '</div>'
      ).find('.body').text(data.data.body).end();
      $('#chatLog').append($message);
      $('#chatLog').scrollTop($('#chatLog').height());
    });

    var service = new google.maps.places.PlacesService(YarNet.map);
    service.getDetails({placeId: address}, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        //chatlog('<i>' + results.name + '</i>に入室しました');
        $("#chat-roomname").text(results.name);
        $("#address").val(results.name);
        $('#search_form').submit();
      }
    });
  });


  $('#search_form').on('submit', function(){ //クリックしたら
    $('#nav-twitter .tweet').remove();
    if ($('#nav-twitter-tab').hasClass('active')) {
      $.getJSON(YarNet.api + '/tweets', {'q': $("#address").val()}).done(function(tweets) {
        if (!$('#nav-twitter-tab').hasClass('active')) return;

        tweets.forEach(tweet => {
          var $article = $('.tweet-template')
            .clone(true)
            .removeClass('tweet-template')
            .addClass('tweet');

          $('.profile-img', $article).attr('src', tweet.user_profile_img);
          $('.user-name', $article).text(tweet.user_name);
          $('.screen-name', $article).text(tweet.user_screem_name);
          $('.date', $article).text(tweet.date);
          $('.body', $article).text(tweet.body);

          var $photos = $('.tweet-body', $article).addClass('photos_' + tweet.photos.length);

          for (var i = 0; i < tweet.photos.length; i++) {
            var $wrapper = $('<div>').addClass('photos_img_wrapper_' + i);
            $wrapper.append(
              $('<a>')
                .attr('href', tweet.photos[i])
                .attr('data-lightbox', 'image-' + tweet.id)
                .attr('data-title', '')
                .append(
                  $('<img>')
                    .attr('src', tweet.photos[i])
                )
            );

            $photos.append($wrapper);
          }

          $('#nav-twitter').append($article);
        });
      });
    }

    if ($('#nav-wikipedia-tab').hasClass('active')) {
      WikipediaAPI();
    }

    return false;
  });

  $('#search-user-form').on('submit', function() {
    // TODO: ユーザー検索
    $('#nav-search-users').empty();

    $.ajax({
      cache    : false,
      dataType : 'json',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_users',
    })
      .done(function (favorite_users) {
        $.ajax({
          cache    : false,
          data     : {q: $('#search-user-form input').val(), user_id: localStorage['auth'] || ''},
          dataType : 'json',
          url      : YarNet.api + '/users',
        })
          .done(function(data) {
            if (data.length === 0) {
              return;
            }

            data.forEach(function(user) {
              var $media = $('.user-search-template .user').clone();
              $media.data('user-id', user.id);
              $('img', $media).attr('src', '/img/logo.png');
              $('span', $media).text(user.name);

              if (!localStorage['auth']) {
                return;
              }

              if (favorite_users.some(function (favorite_user) { return favorite_user.id == user.id; })) {
                $media.addClass('del');
              } else {
                $media.addClass('add');
              }

              $('#nav-search-users').append($media);
            });
          })
          .fail(function(data) {
            console.log(data);
          });
      })
      .fail(function (data) {
        console.log(data);
      });

    return false;
  });

  $(document).on('click', '.add-favorite-user', function (e) {
    var user_id = $(this).closest('.media').data('user-id');

    $.ajax({
      cache    : false,
      data     : {
        user_id: user_id,
      },
      dataType : 'json',
      type     : 'POST',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_users',
    })
      .done(function(data) {
        alert('お気に入りに追加しました。');
        $('#search-user-form').submit();
      })
      .fail(function(data) {
        console.log(data);
      });
  });

  $('#chatLog').on('click', 'a', function() {
    if (!localStorage['auth']) return false;

    var user_id = $(this).data('user-id');
    if (user_id == null) return false;

    $.ajax({
      cache    : false,
      data     : {
        user_id: user_id,
      },
      dataType : 'json',
      type     : 'POST',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_users',
    })
      .done(function(data) {
        alert('お気に入りに追加しました。');
        $('#search-user-form').submit();
      })
      .fail(function(data) {
        alert('お気に入りに追加済みです。');
      });

    return false;
  });

  //右ドロワー
  // WindowHeight = $(window).height();
  // $('.right-nav-drawer').css('height', WindowHeight); //メニューをwindowの高さいっぱいにする

  $('#right-btn').click(function(){ //クリックしたら
    if($('.right-nav-drawer').is(":animated")){
      return false;
    }else{
      if (room == null) {
        $('.right-nav-drawer input, .right-nav-drawer button').attr('disabled', '');
      } else {
        $('.right-nav-drawer input, .right-nav-drawer button').removeAttr('disabled');
      }

      //チャット履歴の取得
      $("#chatLog").html("");
      var address = $("#chat-roomname").data('address');

      $.ajax({
        cache       : false,
        dataType    : 'json',
        type        : 'GET',
        url         : 'https://api.yarnet.ml/messages',
        data        : {'address':address},
      })
        .done(function(data) {
          for (var i = 0; i < data.length; i++) {

            if ((localStorage['auth'] || -1) == data[i].user_id) {
              var $message = $(
                '<div class ="right message">' +
                '<div class="body"></div>'+
                '<div class="date">' + data[i].date + '</div>'+
                '</div>'
              ).find('.body').text(data[i].body).end();
              $('#chatLog').append($message);
            } else if (data[i].user_id != 0) {
              var $message = $(
                '<div class ="left message">' +
                '<figure>'+
                '  <figcaption>' + data[i].name + '</figcaption>'+
                '  <a><img src="/img/logo.png"></a>'+
                '</figure>'+
                '<div class="body"></div>'+
                '<div class="date">' + data[i].date + '</div>'+
                '</div>'
              )
                .find('.body').text(data[i].body).end()
                .find('a').data('user-id', data[i].user_id).end();

              if (localStorage['auth']) {
                $('a', $message)
                  .attr('href', '#')
                  .prepend('<i class="fas fa-plus"></i>');
              }

              $('#chatLog').append($message);
            } else if (data[i].name == localStorage['name']) {
              var $message = $(
                '<div class ="right message">' +
                '<div class="body"></div>'+
                '<div class="date">' + data[i].date + '</div>'+
                '</div>'
              ).find('.body').text(data[i].body).end();
              $('#chatLog').append($message);
            } else {
              var $message = $(
                '<div class ="left message">' +
                '<figure>'+
                '  <figcaption>' + data[i].name + '</figcaption>'+
                '  <a><img src="/img/logo.png"></a>'+
                '</figure>'+
                '<div class="body"></div>'+
                '<div class="date">' + data[i].date + '</div>'+
                '</div>'
              ).find('.body').text(data[i].body).end();
              $('#chatLog').append($message);
            }
          }

          $('#chatLog').scrollTop($('#chatLog').height());
        })
        .fail(function(data){
          console.log("チャットの取得に失敗しました");
        });

      $('.right-nav-drawer').animate({width:'toggle'}); //animateで表示・非表示
      $(this).toggleClass('peke'); //toggleでクラス追加・削除
      return false;
    }
  });

  $("#chat-back").click(function(event) {
    if($('.right-nav-drawer').is(":animated")){
      return false;
    }else{
      $('.right-nav-drawer').animate({width:'toggle'}); //animateで表示・非表示
      $(this).toggleClass('peke'); //toggleでクラス追加・削除
      return false;
    }
  });


  //Circle Menu
  $('#menu-circle').circleMenu({
    item_diameter: 40,
    circle_radius: 150,
    direction: 'bottom-left'
  });

  $('.left-drawer .nav-link').on('shown.bs.tab', function() {
    if ($(this).attr('href') == '#nav-search-users') {
      $('#search_form').hide();
      $('#search-user-form').show();
      $('#search-user-form').submit();
    } else {
      $('#search-user-form').hide();
      $('#search_form').show();
      $('#search_form').submit();
    }
  });

  function codeAddress(address) {
    // google.maps.Geocoder()コンストラクタのインスタンスを生成
    var geocoder = new google.maps.Geocoder();

    // geocoder.geocode()メソッドを実行
    geocoder.geocode( { 'address': address}, function(results, status) {

      // ジオコーディングが成功した場合
      if (status == google.maps.GeocoderStatus.OK) {

        // 変換した緯度・経度情報を地図の中心に表示
        YarNet.map.setCenter(results[0].geometry.location);
        //ホテル検索
        var hotelspot_url = 'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426?applicationId=1094029776062152274&datumType=1&searchRadius=3.0&latitude=' + results[0].geometry.location.lat() + '&longitude=' + results[0].geometry.location.lng();
        getHotel(hotelspot_url);
        //☆表示している地図上の緯度経度
        //document.getElementById('lat').value=results[0].geometry.location.lat();
        //document.getElementById('lng').value=results[0].geometry.location.lng();


        // マーカー設定
        if (marker) marker.setMap(null);
        marker = new google.maps.Marker({
          map: YarNet.map,
          position: results[0].geometry.location
        });

        // ジオコーディングが成功しなかった場合
      } else {
        console.log('Geocode was not successful for the following reason: ' + status);
      }

    });

  }
  //道のり表示
    directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true,  //デフォルトのABマーカーを削除
    preserveViewport: true, // ルートを表示するときに今までの倍率のままにする
  });

  function getRoute(e){
    if(your_location != null){
      var directionsService = new google.maps.DirectionsService();
      directionsDisplay.setMap(YarNet.map);
      //ルート用タブに表示
      directionsDisplay.setPanel($("#route-panel").get(0));
      var start =new google.maps.LatLng(your_location[0],your_location[1]);
      var end =new google.maps.LatLng(e.latLng.lat(),e.latLng.lng());

      var request = {
        origin:start,
        destination:end,
        travelMode: 'WALKING',
      };
      directionsService.route(request, function(response, status) {
        if (status == 'OK') {
          directionsDisplay.setDirections(response);
        }
      });
      $('.route-massage').remove();
    }
  }

  //wiki
  function WikipediaAPI() {
    //検索語
    var query = $('#address').val();
    //API呼び出し
    $.ajax({
      url: YarNet.api + '/wikipedia',
      data: {
        keyword: query
      },
      type: 'GET',
      dataType: 'jsonp',			//Access-Control-Allow-Origin対策
      success: function(json) {
        if (json != null && json.length > 0) {
          $('#word').html('<div class = wrapper></div>');
          //結果表示

          for (i = 0; i < json.length; i++) {
            $('.wrapper').append(
              '<div class = text_wrapper>' +
              '<div class = wiki-title>' +
              (i + 1) + '：<a href="' +
              json[i].url + '">' +
              json[i].title + '</a>' +
              '</div>' +
              '&nbsp;(' + json[i].datetime +
              ' 更新)' +
                '<p class="text hidden">'+ json[i].body + '</p>' +
                '<div class= show_more > +続きを読む </div>'+
              '</div>'
            );
          }
        } else {
          $('#word').html('検索結果なし');
        }
      }
    });
  }

  var your_location;
  var onSuccess = function(position) {

    your_location=[position.coords.latitude,position.coords.longitude];
    // alert('Latitude: '          + position.coords.latitude          + '\n' +
    //       'Longitude: '         + position.coords.longitude         + '\n' +
    //       'Altitude: '          + position.coords.altitude          + '\n' +
    //       'Accuracy: '          + position.coords.accuracy          + '\n' +
    //       'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
    //       'Heading: '           + position.coords.heading           + '\n' +
    //       'Speed: '             + position.coords.speed             + '\n' +
    //       'Timestamp: '         + position.timestamp                + '\n');

    YarNet.map.setCenter({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });

    // マーカーを設置
    if (marker) marker.setMap(null);
    marker = new google.maps.Marker({
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      map: YarNet.map
    });

    // 座標の中心をずらす
    YarNet.map.panTo({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });

    var hotelspot_url = 'https://app.rakuten.co.jp/services/api/Travel/VacantHotelSearch/20170426?applicationId=1094029776062152274&datumType=1&searchRadius=3.0&latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude;
    getHotel(hotelspot_url);
  };







  //エラーのコールバック
  var onError = function(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
  }

  $("#eventButton").on("click", function() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {enableHighAccuracy: true});
  });

  //左ドロワー処理
  //アイコンの切り替え
  $('.left-drawer-toggle').on('click', function() {
    if ($(this).hasClass('show')) {
      // $('<div>').addClass('drawer-backdrop')
      //   .appendTo('#map-content');
      $('#menu-circle').show();
      $('.left-drawer').removeClass('show');
      $('.left-drawer-toggle').removeClass('show')
      $('.left-drawer-toggle').empty();
      $('.left-drawer-toggle').append("<i class='fas fa-search fa-2x'></i>");
    } else {
      // $('<div>').addClass('drawer-backdrop')
      //   .appendTo('#map-content');
      if ($(window).width() <= 576) {
        $('#menu-circle').hide();
      }
      $('.left-drawer').addClass('show');
      $('.left-drawer-toggle').addClass('show')
      $('.left-drawer-toggle').empty();
      $('.left-drawer-toggle').append("<i class='fas fa-times fa-2x'></i>")
      // 開くと同時に検索する。
      $('#search_form').submit();
    }
  });

  //wiki内容、もっと読む
  $(document).on('click', '.show_more', function() {
          var show_text = $(this).parent('.text_wrapper').find('.text');
          var small_height = 90 //This is initial height.
          var original_height = show_text.css({height : 'auto'}).height();

          show_text.height(small_height).animate({height:original_height},300, function(){
            show_text.height('auto');
          });
          $(this).hide();
  });

  $('.modal').on('show.bs.modal', function(e) {
    YarNet.infowindow.close();
  });

  $('#user-setting-modal').on('show.bs.modal', function(e) {
    $.ajax({
      cache    : false,
      dataType : 'json',
      url      : YarNet.api + '/users/' + localStorage['auth'],
    })
      .done(function(data) {
        $('#user-setting-name').val(data.name);
        $('#user-setting-email').val(data.mail);
      })
      .fail(function(data) {
        console.log(data);
      });

    $('#user-setting-password').val('');
    $('#user-setting-password-confirmation').val('');
  });

  $('#user-setting-modal').on('click', '.btn-primary', function(e) {
    $.ajax({
      cache       : false,
      contentType : false,
      data        : (new FormData($('#user-setting-modal form')[0])),
      dataType    : 'json',
      processData : false,
      type        : 'POST',
      url         : YarNet.api + '/users/' + localStorage['auth'],
    })
      .done(function(data) {
        $('#user-setting-modal').modal('hide');
      })
      .fail(function(data) {
        alert(Object.values(data.responseJSON.error).join("\n"));
      });
  });

});

function getClickLatLng(lat_lng, map) {
  //☆表示している地図上の緯度経度
  //document.getElementById('lat').value = lat_lng.lat();
  //document.getElementById('lng').value = lat_lng.lng();

  // マーカーを設置
  if (marker) marker.setMap(null);
  marker = new google.maps.Marker({
    position: lat_lng,
    map: map
  });

  // 座標の中心をずらす
  map.panTo(lat_lng);
}
