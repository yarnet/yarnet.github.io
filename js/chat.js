
// 入室
let room = null;

$('#join').click(function(){

});

// チャットを送信
$('#send').click(function(){
  if($('#msg').val()==""){
    return;
  }
    var msg = $('#msg').val();
    $('#msg').val("");



    //送信したチャットをデータベースに格納
    $.ajax({
      cache       : false,
      dataType    : 'json',
      type        : 'POST',
      url         : 'https://api.yarnet.ml/messages',
      data        : {'user_id':localStorage['auth'] || null,'name':localStorage['name'],'body':msg,'address':$("#chat-roomname").data('address')},
    })
      .done(function(data){
        //データベースに送信
        console.log(data);

        //chatlog('自分> ' + msg, 'mychat');
        var $message = $(
          '<div class ="right message">' +
          '<div class="body"></div>'+
          '<div class="date">' + data.date + '</div>'+
          '</div>'
        ).find('.body').text(data.body).end();
        $('#chatLog').append($message);
        room.send({
          'name': localStorage['name'],
          'date': data.date,
          'body': data.body,
        });

      })
      .fail(function(data){
        console.log("チャットの送信に失敗しました");
      });
});

// 退室
$('#leave').click(function(){
    room.close();
    chatlog('<i>' + $('#roomName').val() + '</i>から退室しました', 'system');
})

$('#chat-form').on("submit",function(){
  return false;
});

// チャットログに記録するための関数
function chatlog(msg, type){
    $('#chatLog').append('<div class="' + type + '">' + '<p>' + msg + '</p>' + '</div>');

}
