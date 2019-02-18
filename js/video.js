let peer         = null;
let existingCall = null;
let timeoutID    = null;
let beforeAuth   = 0;

function createPeer() {
  if (existingCall) {
    existingCall.close();
  }

  if (peer != null) {
    peer.disconnect();
  }

  var auth = (localStorage['auth'] ? btoa(btoa(btoa(localStorage['auth']))).slice(0, -1) : null);
  if (auth === beforeAuth) {
    return null;
  }

  beforeAuth = auth;
  var peer = new Peer(auth, {key: '987f8d84-8021-40f2-9bf9-aac9a6722c10', debug: 0});

  peer.on('open', function(id) {
    $('#my-id').text(peer.id);
  });

  peer.on('error', function(err) {
    // alert(err.message);
  });

  peer.on('close', function() {
  });

  peer.on('disconnected', function() {
  });

  peer.on('call', function(call) {
    $('#video-alert').addClass('show');

    // 応答
    $('#answer-call').one('click',function() {
      getLocalStream(function(stream) {
        call.answer(stream);
        setupCallEventHandlers(call);
      });

      $('#video-alert').removeClass('show');
      $('#video-content').transition('fadeOut', 'fadeIn');
    });

    // 拒否
    $('#no-call').one('click',function() {
      call.close();
      setupMakeCallUI();
      $('#video-alert').removeClass('show');
    });
  });

  return peer;
}

// SkyWayのシグナリングサーバと接続する。
$('#make-call').submit(function(e) {
  e.preventDefault();

  var callToId = $('#callto-id').val();
  if (callToId == '') {
    return;
  }

  getLocalStream(function(stream) {
    var call = peer.call(callToId, stream);

    timeoutID = setTimeout(function() {
      if (!call.open) {
        if (existingCall) {
          existingCall.close();
        }

        $('.t-video').removeClass('main-video');
        $('.m-video').removeClass('main-video');
        $('.t-video')[0].srcObject = null;
        $('.m-video')[0].srcObject = null;

        $('#video-content [data-toggle="goBackward"]').click();
      }
    }, 30000);

    setupCallEventHandlers(call);
  });

  $('#sampleModal').modal('hide');
  $('#video-content').transition('fadeOut', 'fadeIn');
});

$('#end-call').on('click', function() {
  if (timeoutID) {
    clearTimeout(timeoutID);
  }

  $('.t-video').removeClass('main-video');
  $('.m-video').removeClass('main-video');
  $('.t-video')[0].srcObject = null;
  $('.m-video')[0].srcObject = null;

  $('#video-content [data-toggle="goBackward"]').click();

  if (existingCall) {
    existingCall.close();
  }

  return false;
});

function setupCallEventHandlers(call) {
  if (existingCall) {
    existingCall.close();
  }

  existingCall = call;

  call.on('stream', function(stream) {
    addVideo(call, stream);
    setupEndCallUI();
    $('#their-id').text(call.remoteId);
  });

  call.on('close', function() {
    setupMakeCallUI();

    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    var state = history.state.slice(-1)[0];
    if (state === 'video-content') {
      $('.t-video').removeClass('main-video');
      $('.m-video').removeClass('main-video');
      $('.t-video')[0].srcObject = null;
      $('.m-video')[0].srcObject = null;

      $('#video-content [data-toggle="goBackward"]').click();
    }
  });
}

function getLocalStream(callback) {
  navigator.mediaDevices.getUserMedia({video: true, audio: true}).catch(console.log).then(function(stream) {
    $('.m-video')[0].srcObject = stream;
    callback(stream);
  });
}

function addVideo(call, stream) {
  $('.t-video')[0].srcObject = stream;
  $('.t-video').addClass('main-video');
  $('.m-video').removeClass('main-video');
}

function setupMakeCallUI() {
  // $('#make-call').show();
  // $('#end-call').hide();
}

function setupEndCallUI() {
  // $('#make-call').hide();
  // $('#end-call').show();
}




// $('#video-content').on('click', 'video', function() {
//   $('.t-video').toggleClass('main-video');
//   $('.m-video').toggleClass('main-video');
// });
