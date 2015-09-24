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

Be sure to have [Visual Studio 2013](http://www.visualstudio.com) with [Node.js Tools for Visual Studio](http://nodejstools.codeplex.com). and node.js 0.10.36 or later installed with npm.

Database Setup
==============

To setup the database, make sure you have Microsoft SQL Server installed.  I use 2014, but I imagine any version will work.

1. Create an empty database.
2. Open the Visual Studio solution.
3. Right click on the database project and do a Schema Comparison.
4. Press the Compare button to start the comparison.
5. Press the Update button to update the database with the schema from the database.

Windows Installation
====================

To run the website on Windows, make sure you perform the following steps.

1. Install [Python 2.7.x](https://www.python.org/downloads/).
2. Download the all-in-one bundle for [GTK+ 2.x x86](http://ftp.acc.umu.se/pub/gnome/binaries/win32/gtk+/2.24/gtk+-bundle_2.24.10-20120208_win32.zip) or [GTK+ 2.x x64](http://ftp.acc.umu.se/pub/gnome/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip).
3. Unzip the GTK+ 2.x directory to c:\GTK.  It is important that the files are in this directory, as that is where the canvas npm package will be looking for it.
4. Add the c:\GTK\bin\ directory to your system PATH.  (This may require a restart.)
5. From an admin command prompt, install node-gyp and grunt-cli globally:

        npm install -g node-gyp grunt-cli

6. Install the node modules from the /roncli.com directory:

        npm install -msvs_version=2013

7. Add /roncli.com/assets/js/publicConfig.js and /roncli.com/server/privateConfig.js.  See below for file contents.
8. Install the node modules from the /ronc.li directory:

        npm install

9. If using [iisnode](https://github.com/tjanczuk/iisnode):
    - Point an IIS application to the inner /roncli.com directory
    - Point another IIS application to the /ronc.li directory
    - Run ```grunt``` from the same directory when installing and after every time you change code.
    - Be sure to create the directory "logs" in the root of both of the applications and give the application pools write permission.  For instance, if your application pool is ```roncli.com```, you'll give permissions to the account ```IIS AppPool\roncli.com```.
    - Don't forget to restart the application from within IIS after you run ```grunt```.

    Otherwise, run using a standalone installation by running the following command from within /roncli.com to compile and run the web server:

            grunt all

    If you also wish to run the ronc.li application, run the following command from /ronc.li to run the web server:

            node index.js

Other Installations
===================

1. The roncli.com website requires the [Cairo](https://github.com/LearnBoost/node-canvas/wiki) library to be installed.  Make sure you follow the Cairo installation instructions for your operating system.
2. From an admin command prompt, install grunt-cli globally:

        npm install -g grunt-cli

3. Install the node modules from the /roncli.com directory:

        npm install

4. Install the node modules from the /ronc.li directory:

        npm install

4. Add /roncli.com/assets/js/publicConfig.js and /roncli.com/server/privateConfig.js.  See below for file contents.
5. Run the following command to compile and run the web server:

        grunt all

    If you also wish to run the ronc.li application, run the following command from /ronc.li to run the web server:

        node index.js

publicConfig.js
===============
The following should be the contents of publicConfig.js:

        window.siteConfig = {
            soundcloud: {
                client_id: "(Your SoundCloud Client ID)"
            }
        };
        
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
            files: {
                path: "(A path to a directory that the application has read and write access to for file storage)"
            },
            google: {
                blog_id: "(Your Google Blogger blog ID)",7
                api_key: "(Your Google Blogger API key)"
            },
            tumblr: {
                consumer_key: "(Your Tumblr consumer key)",
                consumer_secret: "(Your Tumblr consumer secret)",
                token: "(Your Tumblr token)",
                token_secret: "(Your Tumblr token secret)"
            },
            soundcloud: {
                id: "(Your SoundCloud Client ID)"
            },
            github: {
                type: "oauth",
                key: "(Your Github client ID)",
                secret: "(Your Github client secret)"
            },
            battlenet: {
                apikey: "(Your Battle.Net API key)"
            },
            steam: {
                apikey: "(Your Steam API key)"
            }
        };

Version History
===============

1.0.3 - 9/23/2015
-----------------

This is a bug fix release.

* Removed League of Legends from the site.  The API changed and is not useful for the type of stats I wish to display.
* Fixed issues with gaming APIs not loading that were preventing the home page from loading.

1.0.2 - 6/7/2015
----------------

This is a bug fix release.

* Fixed the way that files are downloaded from the /files directory so that they may be downloaded from other pages.
* Added favicon.ico to the root for browsers that require it.

1.0.1 - 6/7/2015
----------------

This is a bug fix release.

* Fixed some bugs with mobile.
* Fixed bugs with Steam games that have achievements, but I haven't achieved any yet.


1.0 - 6/3/2015
--------------

This is the initial release of the roncli.com website!

* Added Twitch to the front page - When I am live on twitch.tv, my Twitch feed will show up on the front page.
* Added a listing of RSS feeds to the front page.
* ronc.li redirect service - URL shortener for my own use.
* jQuery Validation remote method - I removed my custom jQuery Validation method for remote validation and replaced it with the jQuery Validation remote method.
* Added an awesome roncli Productions logo loader between pages.
* Reduced number of instances where the font doesn't load right sometimes.
* Fixed bug with Twitter loading before the user login which resulted in logins from a cookie not always working.
* Moved allowed YouTube playlists into the database.
* Images can be no wider than 100% of the container it is in.
* Updated some models, moving them to collections to allow for caching.

0.7
---

This version implements the life section, which is essentially just a bunch of links to specific pages on the site.  Included is an administration section.

0.6
---

This version implements the gaming section, which makes calls to Battle.Net, Riot Games, Steam, and the DCL.  Also implemented is file uploading, and support for enumerating YouTube playlists.  Included is an RSS feed for the gaming page and an administration section.  Gaming pages also double as HTML pages, meaning that if you create a page with the same URL as a gaming page, that HTML will display on the page along with the rest of the page.

0.5
---

This version implements the coding section, which links to GitHub.  Included are RSS feeds for the coding page and each project pages, and an administration section.  Coding pages also double as HTML pages, meaning that if you create a page with the same URL as a coding page, that HTML will display on the page along with the rest of the page.

0.4
---

This version implements the music section, which links to SoundCloud.  Included are comments, RSS feeds for the music and each individual tag, and an administration section.  Music pages also double as HTML pages, meaning that if you create a page with the same URL as a music page, that HTML will display on the page along with the rest of the page.

0.3.1
-----

This version adds comments to the bottom of pages, and adds an administration section to moderate them.

0.3
---

This version implements HTML pages.  Included are page hierarchy with simple navigation, and an administration section.

0.2
---

This version implements the blog, which links to Blogger and Tumblr.  Included are comments, RSS feeds for the blog and each individual category, and an administration section.

0.1.1
-----

This version introduces the account page where you can change your email, password, or alias.  This version is branched as the ```base``` branch, and will be kept updated as portions of the code pertaining to this branch are updated.

0.1
---

This version introduces the bare bones of the website, including the layout, Twitter feed, contacts, and hosted sites. Users can register, login, and request password reset authorizations.

Planned Versions
================

1.1
---

* Allow for a directory structure in the files section.
* Add résumé page.

License Details
===============

All original code is released without license.  This means that you may not distribute the code without the express written consent of the author.

Because the code resides on GitHub, you are permitted via GitHub's [Terms of Service](http://help.github.com/articles/github-terms-of-service) to view and fork this repository.

©2014-2015 Ronald M. Clifford
