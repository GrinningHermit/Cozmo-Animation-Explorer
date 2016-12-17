# Cozmo Animation Explorer
Interface to test all animations of the robot Cozmo from Anki
---
While finding out how the SDK of Cozmo works and how to build stuff with it, it appeared there was no listing provided for all the built-in animations the robot can do. This project attempts to remedy that.  

What does it do exactly?
-
Running the script 'animation-explorer.py' in python will open a web page listing all the animations Cozmo has. A user can click a listed animation and Cozmo will execute it. It is also possible to search for a particular animation and buttons are provided to group animations based on their naming convention. A sample script (play_animation.py) is also provided to show how to use an animation name.

What do you need to use it?
-
1. Cozmo himself (http://anki.com/cozmo)
2. A PC and a mobile device
3. A little knowledge about Python
4. Knowledge of the Cozmo SDK (http://cozmosdk.anki.com/docs)
5. The files in this repository

If you know how to run an example file from the Cozmo SDK, you should be able to run this script. 

System requirements
-
- PC with Windows OS, mac OSX or Linux
- Python 3.5.1 or later
- WiFi connection
- An iOS or Android mobile device with the Cozmo app installed, connected to the PC via USB cable

Installation notes
-
- Running 'animation-explorer.py' will cause a browser window to open. This is similar to  'remote_control_cozmo.py' from the Cozmo SDK examples.
- Install the entire project, not just the .py file, or it won't work.
