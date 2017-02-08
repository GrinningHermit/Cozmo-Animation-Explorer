init_websocket = function() {
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('my_response', function (msg) {
        console.log(msg.data);
        var stamp = ''
        if(msg.time != undefined){
            if($('#checkbox-2').is(':checked')) {
                stamp = '<li><span>' + msg.time + '</span>'
            } else {
                stamp = '<li><span class="hidden">' + msg.time + '</span>'
            }
        }
        $('#event-content').prepend(stamp + msg.data + '</li>');
    });

};
