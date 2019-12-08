var {Cc,Ci,Cu}=require("chrome");  //for jetpack sdk.
Cu.import("resource://gre/modules/NetUtil.jsm");  
Cu.import("resource://gre/modules/FileUtils.jsm"); 

function asyncSave(file,data,callbackDone){    
    var ostream = FileUtils.openSafeFileOutputStream(file); 
    let istream = Cc["@mozilla.org/io/string-input-stream;1"].
                  createInstance(Ci.nsIStringInputStream);
    istream.setData(data, data.length); 

      // optional: callbackSaved(status).  
    NetUtil.asyncCopy(istream, ostream, callbackSaved); 
    function callbackSaved (status) {     
        if(callbackDone){
            if(status===0)callbackDone( file.path, file.leafName, status);  //sucess.
            else callbackDone( null, null, status); //failure.
        }; 
    }
}

function onDone(path,leafName,statusCode){
    console.log("                    " + leafName + "    response/page saved.");
}

var localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
exports.saveToLocalFile = function(fileName,content,path){
    localFile.initWithPath(path);                 
    //otherwise specifiy directory, create it if necessary, and append leaf.
	if(!localFile.exists()){
	    localFile.create(localFile.DIRECTORY_TYPE,FileUtils.PERMS_DIRECTORY);
	}
	localFile.append(fileName);

	asyncSave(localFile,content,onDone);
}

