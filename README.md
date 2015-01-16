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

Be sure to have Visual Studio 2013, and node.js 0.10.31 or later installed with npm.

Database Setup
==============

To setup the database, make sure you have Microsoft SQL Server installed.  I use 2014, but I imagine any version will work.

1. Create an empty database.
2. Open the Visual Studio solution and do a schema comparison against the database using your admin account.
3. Right click on the database project and do a Schema Comparison.
4. Press the Compare button to start the comparison.
5. Press the Update button to update the database with the schema from the database.

Windows Installation
====================

To run the website on Windows, make sure you perform the following steps.

1. Install [Visual Studio 2013 Express](http://download.microsoft.com/download/7/2/E/72E0F986-D247-4289-B9DC-C4FB07374894/wdexpress_full.exe) if you do not already have Visual Studio 2013 installed.
2. Install [Python 2.7.x](https://www.python.org/downloads/).
3. Download the all-in-one bundle for [GTK+ 2.x x86](http://www.gtk.org/download/win32.php) or [GTK+ 2.x x64](http://www.gtk.org/download/win64.php).
4. Unzip the GTK+ 2.x directory to c:\GTK.  It is important that the files are in this directory, as that is where the canvas npm package will be looking for it.
5. Add the c:\GTK\bin\ directory to your system PATH.  (This may require a restart.)
6. From an admin command prompt, install node-gyp and grunt-cli globally:

        npm install -g node-gyp grunt-cli

7. Install the node modules from the /roncli.com directory:

        npm install -msvs_version=2013

8. Add /roncli.com/server/privateConfig.js.  See below for file contents.
9. Apply the following patches:
    - https://github.com/roncli/remapify/compare/roncli:master...issue-24-from-1.4.4 - This fixes a bug with the ```remapify``` module in order to use it with the latest versions of the ```grunt-browserify``` module.
    - https://github.com/rendrjs/rendr-handlebars/pull/36 - This updates rendr-handlebars to use the latest version of handlebars.
10. If using [iisnode](https://github.com/tjanczuk/iisnode):
    - Point an IIS application to the inner /roncli.com directory
    - Run ```grunt``` from the same directory when installing and after every time you change code.
    - Be sure to create the directory "logs" in the root of the application and give your application pool write permission.  For instance, if your application pool is ```roncli.com```, you'll give permissions to the account ```IIS AppPool\roncli.com```.
    - Don't forget to restart the application from within IIS after you run ```grunt```.

    Otherwise, run using a standalone installation by running the following command to compile and run the web server:
    
        grunt all

Other Installations
===================

1. The roncli.com website requires the [Cairo](https://github.com/LearnBoost/node-canvas/wiki) library to be installed.  Make sure you follow the Cairo installation instructions for your operating system.
2. From an admin command prompt, install grunt-cli globally:

        npm install -g grunt-cli

3. Install the node modules from the /roncli.com directory:

        npm install

4. Add /roncli.com/server/privateConfig.js.  See below for file contents.
5. Apply the following patches:
    - https://github.com/roncli/remapify/compare/roncli:master...issue-24-from-1.4.4 - This fixes a bug with the ```remapify``` module in order to use it with the latest versions of the ```grunt-browserify``` module.
    - https://github.com/rendrjs/rendr-handlebars/pull/36 - This updates rendr-handlebars to use the latest version of handlebars.
6. Run the following command to compile and run the web server:

        grunt all

privateConfig.js
================
The following should be the contents of privateConfig.js:

        module.exports = {
            server: {
                secret: "(A random secret key that you create)",
            },
            twitter: {
                consumer_key: "(Your Twitter API key)",
                consumer_secret: "(Your Twitter API secret)",
                access_token_key: "(Your Twitter access token key)",
                access_token_secret: "(Your Twitter access token secret)"
            },
            database: {
                server: "(Your SQL Server hostname)",
                port: (Your SQL Server port),
                user: "(Your SQL Server login name)",
                password: "(Your SQL Server login password)",
                database: "(Your SQL Server database name)",
                pool: {
                    min: 0,
                    max: 50,
                    idleTimeoutMillis: 30000
                }
            },
            smtp: {
                host: "(Your SMTP server hostname)"
            },
            redis: {
                host: "(Your redis server hostname)",
                port: (Your redis server hostname),
                password: "(Your redis server password)"
            },
            google: {
                blog_id: "(Your Google Blogger blog ID)",
                api_key: "(Your Google Blogger API key)"
            },
            tumblr: {
                consumer_key: "(Your Tumblr consumer key)",
                consumer_secret: "(Your Tumblr consumer secret)",
                token: "(Your Tumblr token)",
                token_secret: "(Your Tumblr token secret)"
            }
        };

Version History
===============

0.1.1
-----

This version introduces the account page where you can change your email, password, or alias.  This version is branched as the ```base``` branch, and will be kept updated as portions of the code pertaining to this branch are updated.

0.1
---

This version introduces the bare bones of the website, including the layout, Twitter feed, contacts, and hosted sites. Users can register, login, and request password reset authorizations.

Planned Versions
================

0.2
---

* Implement Blogger integration.

0.3
---

* Implement HTML pages.

0.3.1
-----

* Implement comments system for HTML pages.

0.4
---

* Implement Music section.

0.5
---

* Implement Coding section with GitHub connectivity.

0.6
---

* Implement Gaming section with Battle.Net, Steam, and other gaming functionality.

0.7
---

* Implement Life section.

1.0
---

* Website launch.

License Details
===============

All original code is released without license.  This means that you may not distribute the code without the express written consent of the author.

Because the code resides on GitHub, you are permitted via GitHub's [Terms of Service](http://help.github.com/articles/github-terms-of-service) to view and fork this repository.

©2014 Ronald M. Clifford
