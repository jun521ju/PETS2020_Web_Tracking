# WTPatrol
This is the Firefox Addon we used for web tracking measurement on both mobile and desktop environments. 

## Environment Configuration (for both running and developing this addon)
* Install Firefox 53 (64-bit for Ubuntu) and/or Firefox for Android 53
* Create the following folders and files (make sure to grant appropriate permissions):
  * /mnt/sdcard/': the working folder of this addon
  * /mnt/sdcard/urls/urllist': the file contains urls to crawl
* Set 'xpinstall.signatures.required' to 'false' in the about:config page of Firefox browser

## To run
* Simply load or drag the 'WTPatrol.xpi' to the configured Firefox browser, it will automatically run if you've configured the above environment

## To develop
* Following the following official tutorials to set up the development environment:
https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Add-on_SDK
* Clone this repo and play with the source code

# File explanation
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
