var bookmarks = null;

window.onload = getList;


function getDuration(elem, url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8000/get/"+ encodeURIComponent(url), true);
    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    console.log(url + ": \t" + xhr.responseText);
	    v = JSON.parse(xhr.responseText);
	    // WARNING! Might be injecting a malicious script!
	    console.log("Duration of " + url + " : " + v["duration"]);
	    var editField = document.createElement("span");
	    editField.setAttribute("contenteditable", "true");
	    if(v["duration"] == "unknown") {
		editField.innerHTML="??:??";
	    }
	    else {
		minutes = Math.floor(v["duration"]/60);
		seconds = Math.floor(v["duration"]%60);
		if(minutes < 10) {
		    minutes = "0" + minutes;
		}
		if(seconds < 10) {
		    seconds = "0" + seconds;
		}
		editField.innerHTML = minutes + ":" + seconds;
	    }
	    elem.appendChild(editField);
	    var sendButton = document.createElement("img");
	    sendButton.setAttribute("src", "checkmark.png");
	    sendButton.setAttribute("alt", "OK");
	    sendButton.setAttribute("width", "16");
	    sendButton.addEventListener("click", function() {
		var text = elem.innerText;
		var arr = text.split(":");
		console.log("text = " + text)
		var min_user = Math.floor(arr[0]);
		var sec_user = Math.floor(arr[1]);
		var total = min_user * 60;
		
		if(sec_user) {
		    if(total) {
			total += sec_user;
		    }
		}
		console.log("total = " + total +"min = " + min_user + "; sec = " + sec_user );
		
		if(total){
		    var updateXHR = new XMLHttpRequest;
		    updateXHR.open("GET", "http://localhost:8000/update/url/"+ encodeURIComponent(url) + "/time/"+total, true);
		    sendButton.setAttribute("style", "display:none;");
		    updateXHR.send();
		}
		else {
		    editField.innerHTML="??:??";
		}
	    });
	    elem.appendChild(sendButton);
	    // elem.innerHTML = "??:??"
	}
    }
    xhr.send();
}

function getList() {
    bookmarks  = [];
    chrome.bookmarks.getTree(function(marks) {
	FillBookmarks(marks[0], "");
	genReport();
    });
}

String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};

function FillBookmarks(node, path) {
    for(var i = 0; i < node.children.length; i++){
	var child = node.children[i];
	var url = child.url;
	if(url == null) {
	    FillBookmarks(child, path + ">" +child.title.trim());
	}
	else {
	    child.path = path;
	    bookmarks.push(child);
	}
    }
}

function genReport() {
    text = "";
    v = document.getElementById("bmarks_table");
    for(var i=0; i<bookmarks.length; i++) {
	var row_elem = document.createElement("tr");
	var path_elem = document.createElement("td");
	var bmark_elem = document.createElement("td");
	var duration_elem = document.createElement("td");
	
	
	b = bookmarks[i];
	path = b.path
	url = b.url;
	title = b.title

	path_elem.innerHTML = path;
	bmark_elem.innerHTML = "<a href=\"" + url + "\">" + title + "</a>";
	
	getDuration(duration_elem, url);
	
	row_elem.appendChild(path_elem);
	row_elem.appendChild(bmark_elem);
	row_elem.appendChild(duration_elem);
	v.appendChild(row_elem);
    }
}
