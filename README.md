roncli.com
==========

This is the source repository for the [roncli.com](http://www.roncli.com) website.  This website is written in [node.js](http://nodejs.org) using the [rendr](https://github.com/rendrjs/rendr) library.

Projects
========

There are two parts to the roncli.com project.

The first is the SQL Server database, which is encapsulated in a Visual Studio SQL Server Data Tools 2013 project.

The second is the Node project itself, which is developed via PhpStorm.  I do have a Visual Studio Node.js Tools project setup in the solution, but unfortunately Node.js Tools is really buggy right now, and the JavaScript editor is really clunky compared to PhpStorm.  I do not guarantee that the Visual Studio Node.js Tools project will be up to date, except for releases.

Requirements
============

Be sure to have Visual Studio 2013, and node.js 0.10.28 or later installed with npm.

Windows Installation
====================

To run the website itself, make sure you perform the following steps. (NOTE: THESE ARE NOT WORKING.)

1. Install [Python 2.7.x](https://www.python.org/downloads/).
2. Download the all-in-one bundle for [GTK+ 2.x](http://www.gtk.org/download/win32.php).
3. Unzip the GTK+ 2.x directory to c:\GTK.
4. Add the c:\GTK\bin directory to your system PATH.  (This may require a restart.)
5. From the GTK+ 2.x /bin directory, configure the GTK+ 2.x package:

        pkg-config --cflags gtk+-2.0

6. From an admin command prompt, install node-gyp globally:

        npm install -g node-gyp

7. Install the node modules from the roncli.com directory:

        npm install -msvs_version=2013

License Details
===============

All original code is released without license.  This means that you may not distribute the code without the express written consent of the author.

Because the code resides on GitHub, you are permitted via GitHub's [Terms of Service](http://help.github.com/articles/github-terms-of-service) to view and fork this repository.

©2014 Ronald M. Clifford
