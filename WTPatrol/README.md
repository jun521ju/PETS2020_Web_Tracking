# WTPatrol
This is the Firefox Addon we used for web tracking measurement on both mobile and desktop environments. 

## Environment Configuration (for both running and developing this addon)
### Part A. Configuration on the desktop Environment(tested on Ubuntu 18.04)
* 1. Download Firefox 53 from our Google Drive (the Firefox used in our study):  
 ``https://drive.google.com/open?id=1zdoYYBZZGZpL1EO7tLr824wztOv7rRat``
* 2. Extract the tar package  
 ``tar -xJf firefox53.0.3.tar.xz``
* 3. Move the Firefox folder to /opt  
 ``sudo mv firefox53.0.3 /opt/firefox53``
* 4. Create Symbolic link for New Firefox as default  
 ``sudo mv /usr/bin/firefox  /usr/bin/firefoxold && sudo ln -s /opt/firefox53/firefox /usr/bin/firefox``
* 5. Create following folders and files in Terminal  
 ``sudo mkdir /mnt/sdcard/ && sudo mkdir /mnt/sdcard/urls/``  
 ``sudo chmod -R 777 /mnt && sudo echo -e 'google.com\nfacebook.com' > /mnt/sdcard/urls/urllist``
* 6. Now you should have the correct envrionment configured on your Ubuntu 18.04, open Firefox from Terminal with command ``firefox`` 
* 7. Drag the ``WTPatrol.xpi`` into Firefox, it will be automatically installed and will run after restarting your Firefox as prompted.
 
### Part B. Configuration on the mobile Environment(Android 8)
* 1. Download and install Firefox for Android 53 from our Google Drive (the Firefox used in our study):  
 ``https://drive.google.com/open?id=197VeXUxsrfD-p9D_bRn1X4OMgRWfERmk``
* 2. Once installed, manulaly grant the file access permission in Android app setting
* 3. Open Firefox and set ``xpinstall.signatures.required`` to ``false`` in the about:config page 
* 4. Create following folders and files via [ADB](https://developer.android.com/studio/command-line/adb)
 ``adb shell mkdir /mnt/sdcard/urls/ && adb shell echo -e 'google.com\nfacebook.com' > /mnt/sdcard/urls/urllist``
* 5. Push WTPatrol.xpi to Android device via ADB
 `` adb push path/to/WTPatrol.xpi /sdcard``
* 6. In Firefox browser, navigate to ``file:///sdcard`` and click ``WTPatrol.xpi`` to install WTPatrol.
* 7. After installation, WTPatrol should automatically run.  

Note that configuration on the mobile environment is quite similar to that on the desktop environment. The big difference here is that we use ADB instead of Terminal to communicate with our mobile device.

## Input and Output format  
### Input
On the first run, WTPatrol will read the input URLs from ``/mnt/sdcard/urls/urllist`` and save them to the ``url`` table of ``data.sqlite`` (automatically created in the folder ``/mnt/sdcard/`` when running WTPatrol). The URL format in ``/mnt/sdcard/urls/urllist`` should not contain http or https scheme at the beginning of a URL by default. However, it is easy to take as the input a URL with http or https scheme by modifying Line 135 and 153 of ``index.js``.  
Note that WTPatrol only read URLs from ``/mnt/sdcard/urls/urllist`` on the first run. On the latter runs, it will visied each url saved in the ``url`` table. It will stop and close the browser if the ``url`` table is empty.  
### Output
WTPatrol has three outputs: (1) the ``/mnt/sdcard/pageSrc/`` folder, in which saves the webpage source of each visited website; (2) the ``/mnt/sdcard/respBody/`` folder, in which saves the HTTP response body of each visited website; and (3) the ``/mnt/sdcard/data.sqlite`` sqlite database file.  
There are 6 tables in ``data.sqlite`` that are used in our study:  
* 'url' : the URL list read from ``/mnt/sdcard/urls/urllist``. WTPatrol keeps deleting the record in this table on each visit.
* 'pages' : all the visited URLs. WTPatrol moves the records from table url to this table per each visit. 
* 'javascript_cookies' : contains all the cookies processed using JavaScript on each visited webpage
* 'javascript' : contains all the JavaScript API calls on each visited webpage
* 'http_requests' : contains all the HTTP request of each visit
* 'http_responses' : contains all the HTTP response of each visit

## To develop
* Following the following official tutorials to set up the development environment:
https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Add-on_SDK
* Clone this repo and play with the source code
* run ``jpm run`` to build and test your addon

## WTPatrol source file explanation
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
