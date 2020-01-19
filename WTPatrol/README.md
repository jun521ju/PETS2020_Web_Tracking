# WTPatrol
This is the Firefox Addon we used for web tracking measurement on both mobile and desktop environments. 

## Environment Configuration (for both running and developing this addon)
### Part A. Configuration on the desktop Environment(Ubuntu 18.04)
* 1. Download Firefox 53 from Google Drive (the Firefox used in our study):  
 ``https://drive.google.com/open?id=1zdoYYBZZGZpL1EO7tLr824wztOv7rRat``
* 2. Extract the tar package  
 ``tar -xJf firefox53.0.3.tar.xz``
* 3. Delete Firefox updater so that it will not keep asking you to update  
 ``sudo rm -rf firefox/update*``
* 4. Move the Firefox folder to /opt  
 ``sudo mv firefox /opt/firefox53``
* 5. Create Symbolic link for New Firefox as default  
 ``sudo mv /usr/bin/firefox  /usr/bin/firefoxold``
 ``sudo ln -s /opt/firefox53/firefox /usr/bin/firefox``
* 6. Now you should have Firefox 53 installed on your Ubuntu 18.04, open Firefox from Terminal with command ``firefox``
* 7. In Firefox, go to ``about:config`` and set ``xpinstall.signatures.required`` to ``false`` 
* 8. Create following folders and files in Terminal  
 ``sudo mkdir /mnt/sdcard/ && sudo mkdir /mnt/sdcard/urls/``  
 ``sudo chmod -R 777 /mnt && sudo echo -e 'google.com\nfacebook.com' > /mnt/sdcard/urls/urllist``
 
### Part B. Configuration on the mobile Environment(Android 8)
, or Firefox for Android 53 to your Android
* Create the following folders and files (make sure to grant appropriate permissions):
  * '/mnt/sdcard/': the working folder of this addon
  * '/mnt/sdcard/urls/urllist': the file contains urls that you would like to crawl
* Set 'xpinstall.signatures.required' to 'false' in the about:config page of Firefox browser

## To run
* Simply load or drag the 'WTPatrol.xpi' to the configured Firefox browser, it will automatically run if you've configured the above environment

## To develop
* Following the following official tutorials to set up the development environment:
https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Add-on_SDK
* Clone this repo and play with the source code
* run ``jpm run`` to build and test your addon

## File explanation
* 'data/content.js' : the content script that will be injected to each webpage.
* 'data/create_*.sql' : SQL statements for creating different tables in the sqlite database
* 'lib/content-policy-instrument.js' : background script for content policy instrumentation
* 'lib/cookie-instrument.js' : background script for cookie instrumentation
* 'lib/http-instrument.js' : background script for http request/response instrumentation
* 'lib/http-post-parser.js' : background script for parsing http post
* 'lib/js-instrument.js' : background script for logging JavaScript API access
* 'lib/logging-db.js' : background script for sqlite database operations
* 'lib/page-manager.js' : background script for webpage management
* 'lib/resp-body-saver.js' : background script for saving response body and webpage source locally
* 'WTPatrol.xpi' : the corresponding addon that is ready to use
* 'index.js' : the addon entrance
* 'package.json' : the addon manifest
