$(function() {

  $('#signin-content').on('show.start', function(e) {
    var lastState = history.state.slice(-1);
    if (lastState[0] == e.target.id) return;

    $('input', this).val('');
  });

  $('#signin-content').on('submit', 'form', function(e) {
    e.preventDefault();

    $.ajax({
      cache       : false,
      contentType : false,
      data        : (new FormData(this)),
      dataType    : 'json',
      processData : false,
      type        : 'POST',
      url         : YarNet.api + '/signin',
    })
      .done(function(data) {
        var state = history.state.slice(0);
        state.pop();
        history.replaceState(state, false);

        console.log(data);
        localStorage['auth'] = data.id;
        localStorage['name'] = data.name;
        alert('ログインに成功しました。');
        $('#map-content').transition('fadeOut', 'fadeIn');
      })
      .fail(function(data) {
        console.log(data);
        alert('ログインに失敗しました。');
      });
  });

});
