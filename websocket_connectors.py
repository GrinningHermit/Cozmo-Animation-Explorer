import datetime
import logging

from flask import render_template, session, request

flask_socketio_installed = False
try:
    from flask_socketio import SocketIO, emit, disconnect
    flask_socketio_installed = True
except ImportError:
    logging.warning(
        'Cannot import from flask_socketio: Do `pip3 install --user flask-socketio` to install\nProgram runs without flask_socketio, but without event monitoring')

eventlet_installed = False
try:
    import eventlet

    eventlet_installed = True
except ImportError:
    logging.warning(
        'Cannot import from eventlet: Do `pip3 install --user eventlet` to install\nEvent monitoring works, but performance is decreased')


def init_socketio(app):
    if flask_socketio_installed:
        async_mode = None
        socketio = SocketIO(app, async_mode=async_mode)
        def print_queue(qval):
            while qval.qsize() > 0:
                timestamp = '[{:%H:%M:%S.%f}'.format(datetime.datetime.now()) + '] '
                message = qval.get()
                print(timestamp + message)
                socketio.emit('my_response',
                    {'data': timestamp + message, 'type': 'event'},
                    namespace='/test')


        def background_thread(qval):
            while True:
                if not qval.empty():
                    print_queue(qval)
                socketio.sleep(.1)


        @app.route('/')
        def index():
            return render_template('eventmonitor-websocket.html', async_mode=socketio.async_mode)


        @socketio.on('my_event', namespace='/test')
        def test_message(message):
            session['receive_count'] = session.get('receive_count', 0) + 1
            emit('my_response',
                 {'data': message['data'], 'count': session['receive_count']})


        @socketio.on('my_broadcast_event', namespace='/test')
        def test_broadcast_message(message):
            session['receive_count'] = session.get('receive_count', 0) + 1
            emit('my_response',
                 {'data': message['data'], 'count': session['receive_count']},
                 broadcast=True)


        @socketio.on('disconnect_request', namespace='/test')
        def disconnect_request():
            session['receive_count'] = session.get('receive_count', 0) + 1
            emit('my_response',
                 {'data': 'SERVER: Disconnected!', 'count': session['receive_count']})
            disconnect()


        @socketio.on('my_ping', namespace='/test')
        def ping_pong():
            emit('my_pong')


        @socketio.on('connect', namespace='/test')
        def test_connect():
            global thread
            if thread is None:
                thread = socketio.start_background_task(background_thread, q)
            emit('my_response', {'data': 'SERVER: Connected', 'count': 0})


        @socketio.on('disconnect', namespace='/test')

        def test_disconnect():
            print('Client disconnected', request.sid)
    else:
        @app.route('/')
        def index():
            return render_template('index.html', randomID=rndID, animations=animations, triggers=triggers, behaviors=behaviors)