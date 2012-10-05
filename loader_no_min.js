var depender_url = "Depender.js";
var depender_ver = "0.1";
if(localStorage) {
	var script = document.createElement("script");
	var depender_code = localStorage.getItem(depender_url + "_" + depender_ver);
	document.body.appendChild(script);
	if(depender_code) {
		script.innerHTML = depender_code;
	} else {
		var AJAX = new XMLHttpRequest();
		if (AJAX) {
			AJAX.open("GET", depender_url, false);                             
			AJAX.send(null);
			content = AJAX.responseText;                                         
		}
		script.innerHTML = content;
		localStorage.setItem(depender_url, content);
	}
} else {
	window.setVersion = function(){};
	window.depends =
		new Function("data", "callback",
			  ""
			+ "for(var url in data) {"
			+ "alert(url);"
			+ "	var script = document.createElement('script');"
			+ "	script.src = url;"
			+ "	document.body.appendChild(script);"
			+ "}"
			+ "callback();"
		);
}
