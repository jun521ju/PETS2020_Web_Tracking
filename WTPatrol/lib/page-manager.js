const {Cc, Ci, Cu} = require("chrome");
const data = require("sdk/self").data;
var loggingDB = require("./logging-db");
// var events = require("sdk/system/events");

exports.setup = function() {
	// Set up logging
	var createPagesTable = data.load("create_pages_table.sql");
	loggingDB.executeSQL(createPagesTable, false);
};

// if this function be called, means no time out
exports.insertVistedUrl= function(visitID, crawlID, url, isTimeout = false) {
	var update = {};

	update["visitedID"] = "'" + visitID + "'";
	update["crawl_id"] = "'" + crawlID + "'";
	update["url"] = "'" + url + "'";
	update["isTimeout"] = "'" + isTimeout + "'";

	// var deleteStatement = "'DELETE FROM url WHRER id = " + visitID + "'";
	loggingDB.executeSQL(loggingDB.createInsert("pages", update), false);
	// loggingDB.executeSQL(deleteStatement, true);
};

