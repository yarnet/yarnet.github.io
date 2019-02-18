var YarNet = {};

$(function() {

  YarNet.api = 'https://api.yarnet.ml';

  YarNet.map = new google.maps.Map($('#map')[0], {
    center : {
      lat :  34.98584900000000, // 京都駅の緯度
      lng : 135.75876670000002, // 京都駅の経度
    },
    fullscreenControl : false,
    mapTypeControl    : false,
    streetViewControl : false,
    zoom              : 15,
  });

  YarNet.infowindow = new google.maps.InfoWindow({
    content : $('#infowindow-content')[0],
  });

  if (!localStorage['auth']) {
    localStorage['name'] = ('ゲスト-' + (Math.floor(Math.random() * 90000) + 10000));
  }

  if (!Array.isArray(history.state)) {
    history.replaceState([], false);
  }

  var state = history.state.slice(0);
  state.push('top-content');
  history.replaceState(state, false);

  /**
   * 画面遷移を行うメソッドです。
   *
   * @param {string} hideMethod   - 前画面のアニメーションメソッド
   * @param {string} showMethod   - 次画面のアニメーションメソッド
   * @param {number} hideDuration - 前画面のアニメーション時間 (default: 200ms)
   * @param {number} showDuration - 次画面のアニメーション時間 (default: 400ms)
   */
  $.fn.transition = function(hideMethod, showMethod, hideDuration, showDuration) {
    if (!$.prototype[hideMethod]) throw new ReferenceError(hideMethod + ' は定義されていません。');
    if (!$.prototype[showMethod]) throw new ReferenceError(showMethod + ' は定義されていません。');

    hideDuration = (hideDuration || 200); // default: 200ms
    showDuration = (showDuration || 400); // default: 400ms

    var hide = function($content) { $content.trigger('hide.start')[hideMethod](hideDuration, function() { $(this).trigger('hide.end'); }); };
    var show = function($content) { $content.trigger('show.start')[showMethod](showDuration, function() { $(this).trigger('show.end'); }); };

    // 現在開いているセクションを閉じたあと新しいセクションを開きます。
    hide($('.content:visible').one('hide.end', show.bind(null, this)));
  };

  $(document).on('click', '[data-toggle="transition"]', function(e) {
    $($(this).attr('data-target')).transition('fadeOut', 'fadeIn');
  });

  $(document).on('click', '[data-toggle="goBackward"]', function(e) {
    var state = history.state.slice(0);
    state.pop();
    history.replaceState(state, false);

    $('#' + history.state.slice(-1)[0])
      .transition('fadeOut', 'fadeIn');
  });

  $('.content').on('show.start', function(e) {
    var lastState = history.state.slice(-1);
    if (lastState[0] == e.target.id) return;

    var state = history.state.slice(0);
    state.push(e.target.id);
    history.replaceState(state, false);
  });

});
