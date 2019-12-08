var {Cu, Cc, Ci} = require("chrome");
var events = require("sdk/system/events");
var {setInterval, setTimeout, clearInterval, clearTimeout} = require('sdk/timers');
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
const data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var runtimeOS = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).OS;
var isMobileMode = runtimeOS == "Android" ? true : false;

var loggingDB = require("./lib/logging-db");
var pageManager = require("./lib/page-manager");
var httpInstrument = require("./lib/http-instrument");
var cookieInstrument = require("./lib/cookie-instrument");
var jsInstrument = require("./lib/js-instrument");
var cpInstrument = require("./lib/content-policy-instrument");

var intervalID, closeTabTimeoutID, crawlID, visitID = -1, url, finalUrl, curTab;

//************configurations*******************
var urlFile = "/mnt/sdcard/urls/urllist"; // url list file
var respBodyPath = "/mnt/sdcard/respBody/"; // folder for saving response body
var pageSrcPath = "/mnt/sdcard/pageSrc/"; // folder for saving webpage source
var sleepTime = 20000; // must large than 5s
var visitCount = 0;
 
exports.main = function(options, callbacks) {
  console.log("Starting....")
  loggingDB.open();
  crawlID = loggingDB.getCrawlID();
 
  // load url list first 
  readURlsFromLocalFile(urlFile); 

  pageManager.setup();

  cpInstrument.run(crawlID);
  httpInstrument.run(crawlID);
  cookieInstrument.run(crawlID);
  jsInstrument.run(crawlID);

  closeTabTimeoutID = setTimeout(closeExistTabsBeforeCrawling, 5000);
};

function closeExistTabsBeforeCrawling(){
	for (let tab of tabs){
		if(isMobileMode){
			tab.close(); // mobile mode close
		}else{
			if(tabs.length > 1)
	  		tab.close(); // desktop mode close
		}
	}
	clearTimeout(closeTabTimeoutID);
	 
	// after closeTabs, start visit
	startVisit();
}

//******************** common functions *************
let window = Services.wm.getMostRecentWindow("navigator:browser");

function updateVisit(visitID, url, insert_flag = true){
	// visitID += 1;
	jsInstrument.updateVisitAndCrawlID(visitID, crawlID);
	httpInstrument.updateVisitAndCrawlID(visitID, crawlID);
	cookieInstrument.updateVisitAndCrawlID(visitID, crawlID);
	cpInstrument.updateVisitAndCrawlID(visitID, crawlID);

	if (insert_flag)
		pageManager.insertVistedUrl(visitID, crawlID, url);
}

var isSameVisit = true, hasSetTimeout = false; 
events.on("content-document-global-created", function(event) {
	// console.log("content-document-global-created...")
		// //visitID is -1 by defualt indicates no visit(new task) so far.
		if(!isSameVisit && visitID != -1){ // not the same visit
			isSameVisit = true;
		}
		if( isSameVisit && !hasSetTimeout && visitID != -1){ // same visit
			//set timeout for next visit
			setTimeout(startVisit, sleepTime);
			hasSetTimeout = true;
		}
	
}, true);


//********************* startVisit *******************
function startVisit() {
	if(isMobileMode){
		if(curTab != null){
			finalUrl = window.BrowserApp.selectedTab.browser.currentURI.spec;
			loggingDB.updateLastVistedUrl(crawlID, visitID, finalUrl);
			//save resp to file before opening the next tab
			httpInstrument.saveRespBodyToFile(finalUrl, respBodyPath); 
			jsInstrument.savePageSrcToFile(finalUrl,pageSrcPath);
			window.BrowserApp.closeTab(curTab);
			
			isSameVisit = false;
			hasSetTimeout = false;
		}
	}else{
		if(tabs.length > 1){
			finalUrl = tabs[1].url;
			loggingDB.updateLastVistedUrl(crawlID, visitID, finalUrl);
			//save resp to file before opening the next tab
			httpInstrument.saveRespBodyToFile(finalUrl, respBodyPath); 
			jsInstrument.savePageSrcToFile(finalUrl,pageSrcPath);
	  		tabs[1].close();

			isSameVisit = false;
			hasSetTimeout = false;
		}
	}

 
	if(visitID != -1){ //visitID is -1 by defualt indicates no visit(new task) so far.
		loggingDB.deleteByColumn("url","id", visitID);
	}



	var row = loggingDB.selectTop("url");
	if (row["id"] != null){ 
		visitID =  row["id"];
		var url = row["url"];

		updateVisit(visitID, url);
		// curTab = window.BrowserApp.addTab(url);
		if(isMobileMode)
			curTab = window.BrowserApp.addTab(url);
		else
			curTab = tabs.open("http://" + url);
		// curTab = tabs.open( url);
		visitCount++; // visitCount +1 after a new visit
		console.log("visiting No. " + visitID + " ----> "  + url);
	} else{ // row["id"] == null means all urls have been visited.
		//some sites are not visited in pages due to restart
		var row_in_page_table = loggingDB.select_unvisited_from_pages();

		if (row_in_page_table["hasUnvisited"]){
			visitID = row_in_page_table["visitedID"];
			crawlID = row_in_page_table["crawl_id"];
			var url = row_in_page_table["url"];

			updateVisit(visitID, url, false);
			// curTab = window.BrowserApp.addTab(url);
			if(isMobileMode)
				curTab = window.BrowserApp.addTab(url);
			else
				curTab = tabs.open("http://" + url);
			// curTab = tabs.open( url);
			visitCount++; // visitCount +1 after a new visit
			console.log("visiting No. " + visitID + " ----> "  + url);
		}
		else{
			if(isMobileMode)
				window.BrowserApp.quit();
			else{
				for (let tab of tabs)
					tab.close();
			}
			console.log("Crawling completed.");
		}
	}
};

function readURlsFromLocalFile(urlFile){
	//if isContinueVisit is true, do not read file to db 
	if(!isContinueVisit()){
		var file = new FileUtils.File(urlFile);
		var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		istream.init(file, 0x01, 0o444, 0);
		istream.QueryInterface(Ci.nsILineInputStream);

		var createUrlTable = data.load("create_url_table.sql");
	    loggingDB.executeSQL(createUrlTable, false);

		var update = {};
		// read lines into array
		var line = {}, hasmore;
		do {
		  hasmore = istream.readLine(line);
		  
		  update["url"] = "'" + line.value + "'";
		  loggingDB.executeSQL(loggingDB.createInsert("url", update), true);
		  // console.log("url is : " + url + "|||"  + slct);

		  // urls.push(line.value); 
		  // console.log(line.value);
		} while(hasmore);
		istream.close();	
	}
};

//check whether current visit belongs to new task or not
//IDEA: if current visit is triggered by boundary conditions
//	    table "pages" should not be empty.
function isContinueVisit(){
	var row = loggingDB.selectTop("pages", "DESC");
	// crawlId = 1 means it's a new task as 1 is set initially
	if (crawlID != 1){
		// comment as pervious these two line are used for deleting the url on the boundary(restart browser)
		// now have new restart way, so needless
		var visitID =  row["visitedID"];
		loggingDB.deleteByColumn("url","id", visitID); //delete the url visited last time

		crawlID = row["crawl_id"] + 1; //update crawlID if it's a continued work
 		console.log("Current crawlID is " + crawlID);

 		return true;
	} else{
		console.log("******************New task started*****************");
		return false;
	}
}

exports.get_final_url = function(){
	return isMobileMode ? window.BrowserApp.selectedTab.browser.currentURI.spec : tabs[1].url;
}




