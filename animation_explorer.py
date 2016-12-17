#!/usr/bin/env python3

'''
    List all Cozmo animations on a web page with buttons to try the animations.
    In order to run this script, you also need all the other files inside the project.
    If that is the case, running this script will load the interface.
'''

from flask import Flask, render_template, request
import flask_helpers
import sys
import cozmo
import json
import random
import time

cozmoEnabled = True
flask_app = Flask(__name__)
randomID = random.randrange(1000000000, 9999999999)
anim_names = ''
animation_playing = {}


@flask_app.route('/')
def index():
    return render_template('index.html', randomID=randomID, animNames=anim_names)


@flask_app.route('/play_animation', methods=['POST'])
def program_list():
    global robot

    # Handling of received animation
    animation = json.loads(request.data.decode('utf-8'))
    if cozmoEnabled:
        robot.play_anim(animation).wait_for_completed()
    else:
        time.sleep(1)

    return 'true'


def run(sdk_conn):
    '''
        The run method runs once Cozmo is connected.
    '''

    global robot

    robot = sdk_conn.wait_for_robot()

    try:
        global anim_names
        for a in robot.conn.anim_names:
            anim_names += a + ','
        flask_helpers.run_flask(flask_app)

    except KeyboardInterrupt:
        print("")
        print("Exit requested by user")

if __name__ == '__main__' and cozmoEnabled:
    cozmo.setup_basic_logging()
    cozmo.robot.Robot.drive_off_charger_on_connect = True  # Cozmo can stay on his charger for this example
    try:
        cozmo.connect(run)
    except cozmo.ConnectionError as e:
        sys.exit("A connection error occurred: %s" % e)

else:
    print('Robot testing disabled')
    flask_helpers.run_flask(flask_app)