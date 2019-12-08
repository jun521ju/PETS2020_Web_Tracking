const {Cc, Ci} = require("chrome");
var timers = require("sdk/timers");
var dbConnection = null;
var asyncCallsMade = false;
var asyncQueue = [];
const MAX_ASYNC_QUEUE = 1000;
const ASYNC_INTERVAL_MS = 1000;
const FILE_NAME = "data.sqlite";  //database name
var intervalID;
var time = new Date();

var processAsyncQueue = function() {
	if(asyncQueue.length > 0) {
		dbConnection.executeAsync(asyncQueue, asyncQueue.length);
		asyncQueue = [];
	}
}

exports.open = function() {
	// Build the path for the SQLite file
	var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	file.initWithPath("/mnt/sdcard");
	file.append(FILE_NAME);
	
	// If the file already exists, delete it
	// if(file.exists())
	// 	file.remove(true);
	
	// Setup the database connection
	var storageService = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);
	dbConnection = storageService.openDatabase(file);
	
	// Setup async queue timer
	intervalID = timers.setInterval(processAsyncQueue, ASYNC_INTERVAL_MS);
};

exports.close = function() {
	if(dbConnection) {
		if(asyncCallsMade)
			dbConnection.asyncClose();
		else
			dbConnection.close();
	}
	dbConnection = null;
	asyncCallsMade = false;
	timers.clearInterval(intervalID);
};

exports.executeSQL = function(statement, async) {
	try {
		if(!async){
			dbConnection.executeSimpleSQL(statement);
		}
		else {
			asyncCallsMade = true;
			asyncQueue.push(dbConnection.createAsyncStatement(statement));

			if(asyncQueue.length >= MAX_ASYNC_QUEUE){
				processAsyncQueue();
			}
		}
	}
	catch(error) {
		console.log("Logging error: " + error);
		console.log("Error statement: " + statement);
	}
};

exports.select_unvisited_from_pages = function(){
	var row = {};
	row["hasUnvisted"] = false;
	var stmtStr = "SELECT * FROM pages";
	try{
		var statement = dbConnection.createStatement(stmtStr);
		while (statement.executeStep()) {
			if (statement.row.isTimeout == "false" && 
				statement.row.finalUrl == null){
				row["id"] = statement.row.id;
				row["url"] = statement.row.url;
				row["crawl_id"] = statement.row.crawl_id;
				row["visitedID"] = statement.row.visitedID;
				row["hasUnvisited"] = true;
				break;
			}
			
	  	}
  		statement.finalize();
  	}catch(error){
  		console.log("LoggingDB selectTop: " + error);
  	}
  	finally{
		return row;
	}
}

var selectTop = function(table, order = "ASC"){
	var row = {};
	var stmtStr = "SELECT * FROM " + table + " ORDER BY id " + order + " LIMIT 1";
	try{
		var statement = dbConnection.createStatement(stmtStr);
		while (statement.executeStep()) {
			row["id"] = statement.row.id;
			row["url"] = statement.row.url;

			//specified content in pages table
			if(table == "pages"){
				row["visitedID"] = statement.row.visitedID;
				row["crawl_id"] = statement.row.crawl_id;
			}
	  	}
  		statement.finalize();
  	}catch(error){
  		console.log("LoggingDB selectTop: " + error);
  	}
  	finally{
		return row;
	}
}
exports.selectTop = selectTop;

exports.deleteByColumn = function(table, column, value){
  var str = "DELETE FROM " + table + " WHERE " + column +" = " + value;
  try{
  	var statement = dbConnection.createStatement(str);
  	while (statement.executeStep()) { }
  	statement.finalize();
  }catch(error){
  	console.log("Delete exception. One reason of this is the table is empty now.");
  }
};

exports.updateLastVistedUrl= function(crawlID, visitedID, finalUrl) {
  var str = "UPDATE pages SET isTimeout = 'true' , finalUrl = '" + finalUrl 
  			+ "' WHERE crawl_id = " + crawlID
  			+ " AND visitedID = " + visitedID;

  // console.log(str);
  var statement = dbConnection.createStatement(str);
  while (statement.executeStep()) { }
  statement.finalize();
};

exports.escapeString = function(string) {
	// Convert to string if necessary
	if(typeof string != "string")
		string = "" + string;

	// Go character by character doubling 's
	var escapedString = [ ];
	escapedString.push("'");
	for(var i = 0; i < string.length; i++) {
		var currentChar = string.charAt(i);
		if(currentChar == "'")
			escapedString.push("''");
		else
			escapedString.push(currentChar);
	}
	escapedString.push("'");
	return escapedString.join("");
};

exports.boolToInt = function(bool) {
	return bool ? 1 : 0;
};

exports.createInsert = function(table, update) {
	var statement = "INSERT INTO " + table + "(";
	var values = "VALUES (";
	var first = true;
	for(var field in update) {
		statement += (first ? "" : ", ") + field;
		values += (first ? "" : ", ") + update[field];
		first = false;
	}
	statement = statement + ") " + values + ")";
	return statement;
};

exports.logError = function(msg) {
    console.log(msg);
};

exports.saveContent = function(content, contentHash) {
	console.log("saveContent error at Line 111 logging-db.js saveContent()");
};

var getCrawlID = function(){
	var row = selectTop("pages", "DESC");
	var crawlID = row["crawl_id"];
	return crawlID == null ? 1 : crawlID + 1;
}
exports.getCrawlID = getCrawlID;

