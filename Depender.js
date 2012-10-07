function Depender() {
}

Depender.get_instance = function() {
	if(!Depender.instance)
		Depender.instance = new Depender();
	return Depender.instance;
}

Depender.prototype = {
	storage:		window.localStorage,
	deps:			null,
	has_ver_table:		null,
	loaded:			null,
	addLoadedFile:		function(filename) {
		if(this.loaded == null)
			this.loaded = {};
		this.loaded[filename] = true;
	},
	setDeps:		function(deps) {
		this.deps = deps;
	},
	canUseLocalStorage:	function() {
		return(this.storage != null)
	},
	hasVersionTable:	function() {
		if(this.has_ver_table != null) {
			return this.has_ver_table;
		}
		if(this.canUseLocalStorage()) {
			if(!this.storage.versionTable)
				this.storage.versionTable = "{}";
			this.has_ver_table = this.storage.versionTable != null;
			return this.has_ver_table;
		}
		return false;
	},
	get versionTable() {
		if(!this.hasVersionTable()) {
			if(this.canUseLocalStorage()) {
				this.versionTable = {};
			} else {
				throw "This browser has no local storage.";
			}
		}
		return JSON.parse(this.storage.versionTable);
	},
	set versionTable(table) {
		if(!this.hasVersionTable())
			throw "This browser has no local storage.";
		this.storage.versionTable = JSON.stringify(table);
	},
	changeVersion:		function(file, version) {
		var table = this.versionTable;
		table[file] = version;
		this.versionTable = table;
	},
	getStoredVersion:	function(file) {
		if(this.hasVersionTable()) {
			return this.versionTable[file];
		}
		return null;
	},
	isStored:		function(file, version) {
		if(version) {
			var storedVer = this.getStoredVersion(file);
			if(storedVer >= version) {
				return true;
			}
		}
		return false;
	},
	construct_file_label:	function(filename) {
		return "__FILE__ " + filename;
	},
	store:			function(file, content) {
		this.storage.setItem(this.construct_file_label(file), content);
	},
	getStoredFile:		function(file) {
		return this.storage[this.construct_file_label(file)];
	},
	
	getVersionedFile:	function(file, version) {
		if(this.isStored(file, version)) {
			return this.getStoredFile(file);
		}
		return null;
	},
	getDep:			function(file, version) {
		if(this.loaded && this.loaded[file]) {
			console.log("Skipping file: " + file);
			console.log("already loaded...");
			return;
		}
		file = (new URI(file)).absolute;
		var content;
		if((content = this.getVersionedFile(file, version)) == null) {
			var AJAX = new XMLHttpRequest();
			if (AJAX) {
				AJAX.open("GET", file, false);                             
				AJAX.send(null);
				content = AJAX.responseText;                                         
			}
			this.store(file, content);
		}
		var scriptTag = document.createElement("script");
		scriptTag.innerHTML = content;
		document.body.appendChild(scriptTag);
	},
	getDeps:		function(data, callback) {
		for(var file in data) {
			this.getDep(file, data[file]);
		}
	}
};

function depends(deps, callback) {
	Depender.get_instance().getDeps(deps);
	if(callback) callback(window);
}

function setVersion(file, version) {
	file = (new URI(file)).absolute;
	var depender = Depender.get_instance();
	depender.addLoadedFile(file);
	depender.changeVersion(file, version);
}

function URI(string, orig) {
	// Minimal Version
	if(!orig) orig = window.location.href;

	this.protocol	=	orig.protocol || "file";
	this.hostname	=	orig.hostname;
	if(this.protocol == "file")
		this.hostname = "";
	this.port	=	orig.port;
	this.path	=	orig.path;
	if(orig.search)
		this.query = orig.search();

	this.setURI(string);
}

URI.prototype = {
	protocol:	"",
	username:	null,
	password:	null,
	hostname:	"",
	port:		80,
	path:		"",
	query:		"",
	setURI:		function(string) {
		var parts = string.match(/^(?:(?:(\w{3,}):\/\/)(?:([\w.+-]+)(?::([\w.+-]+))?@)?([\w+.-]+)(?::(\d+))?|(file):\/\/)?(\/?[\w\/.+-]+)?(?:\?(.*))?$/);
		if(parts) {
			if(parts[1]) this.protocol = parts[1];
			else if(parts[6]) this.protocol = parts[6];
			if(parts[2]) this.username = parts[2];
			if(parts[3]) this.password = parts[3];
			if(parts[4]) this.hostname = parts[4];
			if(parts[5]) this.port = parts[5];
			if(parts[7].substr(0, 1) == "/" || this.protocol == "file") {
				this.path = parts[7]; 
			} else if(parts[7]){
				var dir = "";
				if(this.path) dir = this.path.replace(/\/[\w.+-]+$/, "");
				this.path = dir + "/" + parts[7];
			} else {
			}
			if(parts[8]) this.query = parts[8];
		} else {
			throw "URI not recognized.";
		}
		if(!this.protocol || this.hostname == null) {
			throw "No protocol or hostname defined.";
		}
	},
	get absolute() {
		if(this.protocol == "file")
			return this.path;
		var uri = this.protocol + "://";
		var user_pass = "";
		if(this.password) user_pass = ":" + this.password;
		if(this.username) uri += this.username + user_pass + "@";
		uri += this.hostname;
		if(this.port) uri += ":" + this.port;
		uri += this.path;
		if(this.query) uri += "?" + this.query;

		return uri
	},
};
