window.Novam = {
	_scriptName: "Novam.js",

	_getScriptLocation: function () {
		var scriptLocation = "";
		var isNM = new RegExp("(^|(.*?\\/))(" + Novam._scriptName + ")(\\?|$)");
				
		var scripts = document.getElementsByTagName('script');
		for (var i=0, len=scripts.length; i<len; i++) {
			var src = scripts[i].getAttribute('src');
			if (src) {
				var match = src.match(isNM);
				if(match) {
					scriptLocation = match[1];
					break;
				}
			}
		}
		return scriptLocation;
	}
};


var jsFiles = new Array(
	"Novam/Utilities.js",
	"Novam/Model.js",
	"Novam/WidgetContainer.js",
	"Novam/Widget.js",
	"Novam/MapControl.js",
	"Novam/StopViewer.js",
	"Novam/SchemeSelector.js",
	"Novam/FeatureControl.js",
	"Novam/Schemes.js",
	"Novam/MapKey.js",
	"Novam/SearchBox.js",
	"Novam/ImportsFinished.js"
);

var host = Novam._getScriptLocation();
for (var i=0, len=jsFiles.length; i<len; i++)
{
	var s = document.createElement("script");
	s.src = host + jsFiles[i];
	s.type = "text/javascript";
	var h = document.getElementsByTagName("head").length ?
	        document.getElementsByTagName("head")[0] :
	        document.body;
	h.appendChild(s);
}

/*
 * Starts the application when the page and all additional 
 * scripts are loaded.
 */
function runApp(func) {
	if (runApp.readyState == 2) {
		func();
	}
	else {
		runApp.func = func;
	}
}

runApp.func = null;
runApp.readyState = 0;

runApp.importsFinished = function() {
	++runApp.readyState;
	if (runApp.readyState == 2) {
		runApp.func();
	}
}

runApp.pageLoaded = function() {
	++runApp.readyState;
	if (runApp.readyState == 2) {
		runApp.func();
	}
}

if (window.addEventListener)
	window.addEventListener("load", runApp.pageLoaded, false);
else if (window.attachEvent)
	window.attachEvent("onload", runApp.pageLoaded);
else
	window.onload = runApp.pageLoaded;
