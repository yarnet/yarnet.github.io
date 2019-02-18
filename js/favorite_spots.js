$(function() {

  YarNet.map.addListener('click', function (e) {
    if (!e.placeId) return false;

    e.stop();

    var service = new google.maps.places.PlacesService(YarNet.map);
    service.getDetails({placeId: e.placeId}, function (place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) return;

      YarNet.infowindow.close();

      var $content = $(YarNet.infowindow.content);
      $content.data('place-id', e.placeId);
      $content.data('place-icon', place.icon);
      $content.data('place-name', place.name);
      $content.data('place-lat', place.geometry.location.lat());
      $content.data('place-lng', place.geometry.location.lng());

      $content.removeClass('add');
      $content.removeClass('del');

      // 観光地アイコン
      $content.find('.place-icon')
        .attr('src', place.icon);

      // 観光地名
      $content.find('.place-title')
        .text(place.name);

      // 国名
      $content.find('.place-country')
        .text(place.address_components[place.address_components.length - 2].long_name);

      // 住所
      $content.find('.place-address')
        .text(place.address_components[place.address_components.length - 1].long_name + ' ' + place.vicinity);

      if (localStorage['auth']) {
        $.ajax({
          cache    : false,
          dataType : 'json',
          url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_spots',
        })
          .done(function (data) {
            if (data.some(function (place) { return place.place_id == e.placeId; })) {
              $content.removeClass('add').addClass('del');
            } else {
              $content.removeClass('del').addClass('add');
            }
          })
          .fail(function (data) {
            console.log(data);
          });
      }

      YarNet.infowindow.setPosition(place.geometry.location);
      YarNet.infowindow.open(YarNet.map);
    });
  });

  $(document).on('click', '.add-favorite-spot', function (e) {
    var placeId = $(YarNet.infowindow.content).data('place-id');

    $.ajax({
      cache    : false,
      data     : {
        place_id: placeId,
        place_icon: $(YarNet.infowindow.content).data('place-icon'),
        place_name: $(YarNet.infowindow.content).data('place-name'),
        place_lat: $(YarNet.infowindow.content).data('place-lat'),
        place_lng: $(YarNet.infowindow.content).data('place-lng'),
      },
      dataType : 'json',
      type     : 'POST',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_spots',
    })
      .done(function(data) {
        // alert('お気に入りに追加しました。');

        $(YarNet.infowindow.content).removeClass('add').addClass('del');
      })
      .fail(function(data) {
        console.log(data);
      });
  });

  $(document).on('click', '.del-favorite-spot', function (e) {
    var $place = $(this).closest('.place');

    if ($place.length) {
      var placeId = $place.data('place-id');
      if (!confirm('本当に解除してよろしいですか？')) {
        return;
      }
    } else {
      var placeId = $(YarNet.infowindow.content).data('place-id');
    }

    $.ajax({
      cache    : false,
      data     : {place_id: placeId},
      dataType : 'json',
      type     : 'DELETE',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_spots',
    })
      .done(function(data) {
        // alert('お気に入りを解除しました。');

        if ($place.length) {
          $place.remove();

          if (!$('#favorite-spots-modal .place').length) {
            $('#favorite-spots-modal .modal-body').html('<div class="mx-3 my-3">お気に入り観光地がありません。</div>');
          }
        } else {
          $(YarNet.infowindow.content).removeClass('del').addClass('add');
        }
      })
      .fail(function(data) {
        console.log(data);
      });
  });

  $('#favorite-spots-modal').on('show.bs.modal', function (e) {
    $.ajax({
      cache    : false,
      dataType : 'json',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_spots',
    })
      .done(function(data) {
        if (data.length) {
          $('#nav-spot').html('');

          var service = new google.maps.places.PlacesService(YarNet.map);

          data.forEach(function (place) {
            var $place = $('<div class="place">');
            $place.attr('id', place.place_id);
            $place.data('place-id', place.place_id);
            $place.data('place-lat', place.place_lat);
            $place.data('place-lng', place.place_lng);

            $place.append(
              $('<img class="place-icon" width="30" height="30">')
                .attr('src', place.place_icon)
            );

            $place.append(
              $('<div class="place-title">')
                .text(place.place_name)
            );

            $place.append(
              $('<button class="btn btn-danger btn-sm del-favorite-spot" type="button">')
                .text('お気に入り解除')
            );

            $('#nav-spot').append($place);
          });
        } else {
          $('#nav-spot').html('<div class="mx-3 my-3">お気に入り観光地がありません。</div>');
        }
      })
      .fail(function(data) {
        console.log(data);
      });
  });

  $('#favorite-spots-modal').on('click', '.place', function (e) {
    if ($(e.target).hasClass('del-favorite-spot')) {
      return;
    }

    var lat = $(this).data('place-lat');
    var lng = $(this).data('place-lng');

    getClickLatLng(new google.maps.LatLng(lat, lng), YarNet.map);
    $('#favorite-spots-modal').modal('hide');
  });

  $('#nav-spot').sortable({containment : 'document'});
  $('#nav-spot').on('sortupdate', function (e) {
    $.ajax({
      cache    : false,
      data     : $(this).sortable('serialize', {key : 'place_id[]', expression : '(.+)'}),
      dataType : 'json',
      type     : 'PUT',
      url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_spots/reorder',
    })
      .done(function(data) {
        console.log(data);
      })
      .fail(function(data) {
        console.log(data);
      });
  });

});
