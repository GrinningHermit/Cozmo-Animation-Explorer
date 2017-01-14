#!/usr/bin/env python3

"""
    List all Cozmo animations on a web page with buttons to try the animations.
    In order to run this script, you also need all the other files inside the project.
    If that is the case, running this script will load the interface.
"""

from flask import Flask, render_template, request
import flask_helpers
import cozmo
import json
import random
import time
import logging
logging.basicConfig(format='%(asctime)s Animation Explorer %(levelname)s %(message)s', level=logging.INFO)

robot = None
cozmoEnabled = True
return_to_pose = False
flask_app = Flask(__name__)
rndID = random.randrange(1000000000, 9999999999)
animations = ''
triggers = ''
behaviors = ''
action = []
pose = None


@flask_app.route('/')
def index():
    return render_template('index.html', randomID=rndID, animations=animations, triggers=triggers, behaviors=behaviors)


@flask_app.route('/toggle_pose', methods=['POST'])
def toggle_pose():
    global return_to_pose
    # Toggle for returning to pose after finishing animation
    return_to_pose = not return_to_pose
    logging.info('return_to_pose is set to: ' + str(return_to_pose))
    return str(return_to_pose)


@flask_app.route('/play_animation', methods=['POST'])
def play_animation():
    # Handling of received animation
    global pose
    animation = json.loads(request.data.decode('utf-8'))
    if cozmoEnabled:
        pose = robot.pose
        robot.play_anim(animation).wait_for_completed()
        logging.info('animation \'' + animation + '\' started')
        check_pose_return()
    else:
        time.sleep(2)

    return 'true'


@flask_app.route('/play_trigger', methods=['POST'])
def play_trigger():
    # Handling of received trigger
    global pose
    trigger = json.loads(request.data.decode('utf-8'))
    if cozmoEnabled:
        pose = robot.pose
        robot.play_anim_trigger(getattr(cozmo.anim.Triggers, trigger)).wait_for_completed()
        logging.info('trigger \'' + trigger + '\' started')
        check_pose_return()
    else:
        time.sleep(2)

    return 'true'


@flask_app.route('/play_behavior', methods=['POST'])
def play_behavior():
    # Handling of received behavior
    global pose
    global action
    behavior = json.loads(request.data.decode('utf-8'))
    if cozmoEnabled:
        pose = robot.pose
        action = [robot.start_behavior(getattr(cozmo.behavior.BehaviorTypes, behavior)), behavior]
        logging.info('behavior \'' + behavior + '\' started')

    else:
        time.sleep(2)

    return 'true'


@flask_app.route('/stop', methods=['POST'])
def stop():
    global action
    if action is not []:
        robot.stop_freeplay_behaviors()
        logging.info('behavior \'' + action[1] + '\' stopped')
        action = []
        check_pose_return()
    else:
        robot.abort_all_actions()

    return 'false'


def check_pose_return():
    if return_to_pose:
        robot.go_to_pose(pose)
        logging.info('Cozmo returning to pose he had before animation started')


def cozmo_program(_robot: cozmo.robot.Robot):
    global robot
    robot = _robot

    try:
        global animations
        global triggers
        global behaviors
        for a in robot.conn.anim_names:
            animations += a + ','
        animations = animations[:-1]
        for t in dir(cozmo.anim.Triggers):
            if '__' not in t:
                triggers += t + ','
        triggers = triggers[:-1]
        for b in dir(cozmo.behavior.BehaviorTypes):
            if '__' not in b:
                behaviors += b + ','
        behaviors = behaviors[:-1]
        flask_helpers.run_flask(flask_app)

    except KeyboardInterrupt:
        print("\nExit requested by user")

try:
    cozmo.run_program(cozmo_program)
except SystemExit as e:
    cozmoEnabled = False
    try:
        flask_helpers.run_flask(flask_app)
    except KeyboardInterrupt:
        print("\nExit requested by user")

    print('e = "%s"' % e)
    print('\nNo Cozmo detected')
