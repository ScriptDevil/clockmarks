var bookmarks = null;
var data_table = {};
var catList = {};
var pageHeight = $(window).height();

window.onload = init;

function init() {
    getList();
    setupLinks();
    hideList(["analytics", "filter"]);
    showList(["list"]);
}

function hideList(ids) {
    ids.forEach(function(i) {
	var t = document.getElementById(i);
	t.style.display = 'none';
    });
}
function showList(ids) {
    ids.forEach(function(i) {
	var t = document.getElementById(i);
	t.style.display = 'block';
    });
}

function setupFilter(){
    var catOpts = document.getElementById("categSel");
    getAnalytics();

    catOpts.innerHTML="";
    var tempOpt = document.createElement("option");
    tempOpt.setAttribute("value", "any");
    tempOpt.innerHTML = "any";
    catOpts.appendChild(tempOpt);
    for(var key in catList) {
	var tempOpt = document.createElement("option");
	tempOpt.setAttribute("value", key);
	tempOpt.innerHTML = key;
	catOpts.appendChild(tempOpt);
    }
}

function getFilter() {
    var catOpts = document.getElementById("categSel");
    var filteredText = document.getElementById("filterButton");
    var filteredTable = document.getElementById("filtered_table");
    filteredTable.innerHTML=" <tr><th width=\"15%\">Category</th><th width=\"75%\">Bookmark</th><th width=\"8%\" class=\"durationelem\">Duration</th></tr>";
    var minTextLink = document.getElementById("minLength");
    var maxTextLink = document.getElementById("maxLength");
    var contentSpan = document.getElementById("filtererrors");

    contentSpan.innerHTML = "";
    var minLength = Math.floor(minTextLink.value*60.0);
    var maxLength = Math.floor(maxTextLink.value*60.0);

    selOption = catOpts.options[catOpts.selectedIndex].value;
    if((minLength == undefined) || (maxLength == undefined)){
	contentSpan.innerHTML = "<span class=\"error\">Check lengths"
    }
    else {
	for (var key in data_table) {
	    if (data_table.hasOwnProperty(key)) {
		var o = data_table[key];
		var cat = o.category;
		var url = o.url;
		var title = o.title;
		var duration = o.duration;
		if((duration >= minLength) &&
		   (duration <= maxLength) &&
		   (selOption == "any" || cat == selOption))
		{
		    var newRowElem = document.createElement("tr");
		    var newCatCell = document.createElement("td");
		    var newMarkCell = document.createElement("td");
		    var newDurationCell = document.createElement("td");
		    newRowElem.appendChild(newCatCell);
		    newRowElem.appendChild(newMarkCell);
		    newRowElem.appendChild(newDurationCell);
		    newCatCell.innerHTML = cat;
		    newMarkCell.innerHTML = "<a href=\"" + url + "\">" + title + "</a>"
		    newDurationCell.innerHTML = Math.floor(duration/60.0) + ":" + Math.floor(duration%60);
		    filteredTable.appendChild(newRowElem);
		}
	    }
	}
    }
}
function setupLinks() {
    var bodydiv = document.getElementById("realbody");
    bodydiv.setAttribute("height", pageHeight+"px");
    var allLink = document.getElementById("show_all");
    var listLink = document.getElementById("list_link");
    var analyticsLink = document.getElementById("analytics_link");
    var filterLink = document.getElementById("filter_link");
    var filterButtonLink = document.getElementById("filterButton");
    filterButtonLink.addEventListener("click", function() {
	getFilter();
    });
    allLink.addEventListener("click", function() {
	showAll();
    });
    listLink.addEventListener("click", function() {
	hideList(["analytics", "filter"]);
	showList(["list"]);
    });
    analyticsLink.addEventListener("click", function() {
	hideList(["list", "filter"]);
	showList(["analytics"]);
	getAnalytics();
    });
    filterLink.addEventListener("click", function() {
	hideList(["list", "analytics"]);
	showList(["filter"]);
	setupFilter();
    });
}

function getAnalytics() {
    for (var key in data_table) {
	// console.log(key);
	var e = data_table[key];
	var cat = e.category;
	if (data_table.hasOwnProperty(key)) {
	    if(catList[cat]) {
		catList[cat].push({
		    url: e.url,
		    title: e.title,
		    duration: e.duration
		});
	    }
	    else {
		catList[cat] = new Array();
		catList[cat].push({
		    url: e.url,
		    title: e.title,
		    duration: e.duration
		});
	    }
	}
    }

    var catNames = new Array();
    var totalDurationList = new Array();
    for(var key in catList) {
	var g = catList[key];
	var d = 0;
	g.forEach(function(k){
	    // console.log(k.title + "\t" + k.duration);
	    d += k.duration;
	});
	catNames.push(key);
	totalDurationList.push(d);
    }

    var toBeCleaned = document.getElementById("holder");
    toBeCleaned.innerHTML = "";
    var r = Raphael("holder"),

    
    pie = r.piechart(400, 150, 100, totalDurationList, { legend: catNames, legendpos: "west"});

    // r.text(320, 100, "Interactive Pie Chart").attr({ font: "20px sans-serif" });

    pie.hover(function () {
        this.sector.stop();
        this.sector.scale(1.1, 1.1, this.cx, this.cy);

        if (this.label) {
            this.label[0].stop();
            this.label[0].attr({ r: 7.5 });
            this.label[1].attr({ "font-weight": 800 });
        }
    }, function () {
        this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

        if (this.label) {
            this.label[0].animate({ r: 5 }, 500, "bounce");
            this.label[1].attr({ "font-weight": 400 });
        }
    });
}
function showAll() {
    getAnalytics();
    setupFilter();
    showList(["list", "analytics", "filter"]);
}

function getDuration(elem, tickElem, url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://localhost:8000/get/"+ encodeURIComponent(url), true);
    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    // console.log(url + ": \t" + xhr.responseText);
	    v = JSON.parse(xhr.responseText);
	    // WARNING! Might be injecting a malicious script!
	    // console.log("Duration of " + url + " : " + v["duration"]);
	    var editField = document.createElement("span");
	    editField.setAttribute("contenteditable", "true");
	    if(v["duration"] == "unknown") {
		editField.innerHTML="??:??";
		data_table[url]['duration'] = 0;
	    }
	    else {
		data_table[url]['duration'] = Math.floor(v["duration"]);
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
	    sendButton.setAttribute("src", "sync.png");
	    sendButton.setAttribute("alt", "OK");
	    sendButton.setAttribute("width", "16");
	    sendButton.addEventListener("click", function() {
		var text = elem.innerText;
		var arr = text.split(":");
		// console.log("text = " + text)
		var min_user = Math.floor(arr[0]);
		var sec_user = Math.floor(arr[1]);
		var total = min_user * 60;
		
		if(sec_user) {
		    if(total) {
			total += sec_user;
		    }
		}
		// console.log("total = " + total +"min = " + min_user + "; sec = " + sec_user );
		
		if(total){
		    data_table[url].duration = total;
		    var updateXHR = new XMLHttpRequest;
		    updateXHR.open("GET", "http://localhost:8000/update/url/"+ encodeURIComponent(url) + "/time/"+total, true);
		    sendButton.setAttribute("style", "display:none;");
		    updateXHR.send();
		}
		else {
		    editField.innerHTML="??:??";
		}
	    });
	    tickElem.appendChild(sendButton);
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
	    // FillBookmarks(child, path + ">" +child.title.trim());
	    FillBookmarks(child, child.title.trim());
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
	duration_elem.setAttribute("class", "durationelem");
	var update_elem = document.createElement("td");
	update_elem.setAttribute("class", "checkelem");
	
	var b = bookmarks[i];
	var path = b.path
	var url = b.url;
	var title = b.title

	data_table[url] = {
	    category: path,
	    url: url,
	    title: title,
	    duration: 0
	};

	if(title.trim() == "") {
	    title = url;
	}
	path_elem.innerHTML = path;
	bmark_elem.innerHTML = "<a href=\"" + url + "\">" + title + "</a>";
	
	getDuration(duration_elem, update_elem, url);
	
	row_elem.appendChild(path_elem);
	row_elem.appendChild(bmark_elem);
	row_elem.appendChild(duration_elem);
	row_elem.appendChild(update_elem);
	v.appendChild(row_elem);
    }
}
