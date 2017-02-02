init_websocket = function() {
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

/*
    socket.on('connect', function () {
        socket.emit('my_event', {data: 'CLIENT: Websocket connection established'});
    });
*/

    socket.on('my_response', function (msg) {
        if($('#log').length) {
            $('#log').prepend($('<div/>').text(msg.data).html() + '<br>');
        }
    });

/*
    var ping_pong_times = [];
    var start_time;
    window.setInterval(function () {
        start_time = (new Date).getTime();
        socket.emit('my_ping');
    }, 1000);
*/

/*
    socket.on('my_pong', function () {
        var latency = (new Date).getTime() - start_time;
        ping_pong_times.push(latency);
        ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        var sum = 0;
        for (var i = 0; i < ping_pong_times.length; i++)
            sum += ping_pong_times[i];
        $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
    });
*/

/*
    $('form#disconnect').submit(function (event) {
        socket.emit('disconnect_request');
        return false;
    });
*/
};
