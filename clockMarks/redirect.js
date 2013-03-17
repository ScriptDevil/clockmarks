function redirect() {
    chrome.tabs.create({url: "bmsched.html"});
}


document.addEventListener('DOMContentLoaded', function () {
    //document.getElementById("popupper").addEventListener('click', redirect);
    redirect();
});
