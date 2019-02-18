$(document).on('click', '.del-favorite-user', function() {
  var $user = $(this).closest('.user');

  if ($user.length) {
    var userId = $user.data('user-id');
    if (!confirm('本当に解除してよろしいですか？')) {
      return;
    }
  } else {
    return;
  }

  $.ajax({
    cache    : false,
    data     : {user_id: userId},
    dataType : 'json',
    type     : 'DELETE',
    url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_users',
  })
    .done(function(data) {
      if ($user.length) {
        if (!$user.closest('#nav-search-users').length) {
          $user.remove();
        }

        if (!$('#favorite-spots-modal .user').length) {
          $('#nav-users').html('<div class="mx-3 my-3">お気に入りユーザーがいません。</div>');
        }

        $('#search-user-form').submit();
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
    url      : YarNet.api + '/users/' + localStorage['auth'] + '/favorite_users',
  })
    .done(function(data) {
      if (data.length) {
        $('#nav-users').html('');
        data.forEach(function (user) {
          var $user = $('<div class="user">');
          $user.data('user-id', user.id);

          $user.append(
            $('<i class="fas fa-user"></i>')
          );
          $user.append(
            $('<div class="user-name">')
            .text(user.name)
          );
          $user.append(
            $('<button class="btn btn-danger btn-sm del-favorite-user" type="button">')
              .text('お気に入り解除')
          );

          $('#nav-users').append($user);
        });
      }else {
        $('#nav-users').html('<div class="mx-3 my-3">お気に入りユーザーがいません。</div>');
      }

    });
  });
