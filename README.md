# roncli.com

The website for roncli.com.  You can see this site in action at https://roncli.com

## Features

* User account creation and management.
* Third party connections to Blizzard, GitHub, SoundCloud, speedrun.com, Steam, Toofz, and XIVAPI.
* Complete admin section to manage the website.
* Animated résumé page.
* Web server solution through nginx.
* SSL renewal solution through certbot.
* Photo storage solution through PhotoPrism.

## Version History

### v2.1.5 - 11/6/2022
* Sort contacts by title.
* Package updates.

### v2.1.4 - 10/28/2022
* Fixed bug with links in Mastodon posts.
* Fixed bug with HTML in Google calendar event descriptions.
* Package updates.

### v2.1.3 - 10/4/2022
* Fix for Mastodon showing HTML in Discord.
* Fix for Google Calendar deleting and recreating Discord events.
* Fix for GitHub releases and commits when there are no releases and commits available.
* Fix for Glimesh occasionally failing.
* Package updates.

### v2.1.2 - 10/1/2022
* Add Discord scheduled events from the Google calendar for roncli Gaming.
* Minor bug fix with logging into Glimesh.
* Package updates.

### v2.1.1 - 8/25/2022
* Bug fixes for Necrolab.
* Package updates.

### v2.1.0 - 8/20/2022
* Replaced Twitter panel with combined Twitter/Mastodon social media panel.
* Replaced Toofz API calls with Necrolab API calls.
* NecroDancer records now show Synchrony with Amplified records only.
* Discord bot now posts Mastodon posts to the Discord server.
* Discord bot now posts Glimesh go live notifications to the Discord server.
* Dockerfiles now use specific versions instead of latest versions, image versions are now handled by dependabot.
* Fix Tweets to load more than once per application lifetime.
* Fix retweet display from the bot.
* Fix for résumé page on MacOS Safari.
* Fix for comments editor which broke single page application since v2.0.7.
* Package updates.

### v2.0.8 - 7/27/2022

* Discord bot now posts Twitch go live notifications to the Discord server.
* Add exception handling to Twitter notifications.
* More updates for Discord.js v14 compatibility.
* Package updates.

### v2.0.7 - 7/24/2022

* Package updates.

### v2.0.6 - 7/19/2022

* Discord bot now posts tweets to the Discord server.
* Package updates.

### v2.0.5 - 5/26/2022

* Add barebones Discord bot.

### v2.0.4 - 5/22/2022

* Package updates.
* Update PhotoPrism's entry point location.

### v2.0.3 - 3/15/2022

* Fix fonts on résumé page.
* Add links to résumé page.
* Package updates.

### v2.0.2 - 3/11/2022

* Implement database backup.
* Package updates.

### v2.0.1 - 2/12/2022

* Fixed a bug with deleting a redirect.
* Returned to using xivapi's library instead of a fork.
* Package updates.

### v2.0.0 - 12/16/2021

* Various bug fixes found during go live.
* Updated favicon and other meta images.
* Added metadata for sites like Twitter and Facebook to read.
* Package updates.

### v2.0.0 Beta 2 - 12/11/2021

* Various bug fixes found during go live.
* Logging improvements for regular cache check.
* Package updates.

### v2.0.0 Beta 1 - 12/1/2021

This release is a complete rewrite of the website, and is a release candidate for version 2.0.0.

* No longer uses Rendr or Backbone.  Single page application functionality is now custom-built.
* Microsoft SQL Server replaced with MongoDB.
* Designed to work within docker containers.
* Includes web server solution nginx.
* Includes SSL renewal solution certbot.
* Includes photo storage solution PhotoPrism.
* Logs errors to Application Insights.

### v1.0.8 - 7/13/2019

This release sets up the website to work over SSL, removes references to Google Plus, and replaces the captcha system with one that requires less of a setup on Windows.

* Most URLs changed from http to https.
* Replace captchagen with svg-captcha.
* Removed references to Google Plus.
* Replaced Internet Explorer with Edge as a recommended browser.

### v1.0.7 - 1/8/2019

This is a bug fix release.

* Upgrades to many packages to address security issues.
* Replaced battlenet-api with blizzhub to comply with upcoming Battle.Net API requirements.
* Fixed various GitHub issues.
* Removed Node.js domains.
* Fix bug with error labels not on their own line.
* Fix bug with missing blog data crashing the front page.
* Fix bug with improperly cached data not getting refetched.

### v1.0.6 - 5/6/2018

This is a bug fix release.

* Upgrade node.js to version 10.0.0, and upgrade all packages to their current versions.
* Fix bug with dates in GitHub projects.
* Upgrade grunt-contrib-uglify to get gzipped size information on build.
* Fix bug with double clicking login.
* Fix bug with using wrong Steam server for CDN.
* Fix bug with style element showing in CSS previews.
* Fix ignored tags for the default controller.

### v1.0.5 - 12/25/2016

This is a bug fix release.

* Fix bug with IE.
* Remove Twitch player.
* Add Diamond rank to DCL and remove DCL playlists.
* Fix bug with Steam headers not displaying.

### v1.0.4 - 2/7/2016

This is a bug fix release.

* Updated DCL stats to show if a player is unranked as opposed to showing them in position 0.
* Upgraded file upload system for latest multer version.
* Updated DCL YouTube playlist to be configurable.
* Fixed bug with Facebook meta tags not HTML encoding.
* Fixed bug with certain files being unable to be downloaded.

### v1.0.3 - 9/23/2015

This is a bug fix release.

* Removed League of Legends from the site.  The API changed and is not useful for the type of stats I wish to display.
* Fixed issues with gaming APIs not loading that were preventing the home page from loading.

### v1.0.2 - 6/7/2015

This is a bug fix release.

* Fixed the way that files are downloaded from the /files directory so that they may be downloaded from other pages.
* Added favicon.ico to the root for browsers that require it.

### v1.0.1 - 6/7/2015

This is a bug fix release.

* Fixed some bugs with mobile.
* Fixed bugs with Steam games that have achievements, but I haven't achieved any yet.


### v1.0.0 - 6/3/2015

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

### v0.7.0

This version implements the life section, which is essentially just a bunch of links to specific pages on the site.  Included is an administration section.

### v0.6.0

This version implements the gaming section, which makes calls to Battle.Net, Riot Games, Steam, and the DCL.  Also implemented is file uploading, and support for enumerating YouTube playlists.  Included is an RSS feed for the gaming page and an administration section.  Gaming pages also double as HTML pages, meaning that if you create a page with the same URL as a gaming page, that HTML will display on the page along with the rest of the page.

### v0.5.0

This version implements the coding section, which links to GitHub.  Included are RSS feeds for the coding page and each project pages, and an administration section.  Coding pages also double as HTML pages, meaning that if you create a page with the same URL as a coding page, that HTML will display on the page along with the rest of the page.

### v0.4.0

This version implements the music section, which links to SoundCloud.  Included are comments, RSS feeds for the music and each individual tag, and an administration section.  Music pages also double as HTML pages, meaning that if you create a page with the same URL as a music page, that HTML will display on the page along with the rest of the page.

### v0.3.1

This version adds comments to the bottom of pages, and adds an administration section to moderate them.

### v0.3.0

This version implements HTML pages.  Included are page hierarchy with simple navigation, and an administration section.

### v0.2.0

This version implements the blog, which links to Blogger and Tumblr.  Included are comments, RSS feeds for the blog and each individual category, and an administration section.

### v0.1.1

This version introduces the account page where you can change your email, password, or alias.  This version is branched as the ```base``` branch, and will be kept updated as portions of the code pertaining to this branch are updated.

### v0.1.0

This version introduces the bare bones of the website, including the layout, Twitter feed, contacts, and hosted sites. Users can register, login, and request password reset authorizations.

## License Details

All original code is released without license.  This means that you may not distribute the code without the express written consent of the author.

Because the code resides on GitHub, you are permitted via GitHub's [Terms of Service](https://docs.github.com/en/github/site-policy/github-terms-of-service) to view and fork this repository.  Pull requests are always welcome!
