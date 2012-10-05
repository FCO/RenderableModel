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
		console.log(".getDep(" + file + ", " + version + ")");
		var content;
		if((content = this.getVersionedFile(file, version)) == null) {
			var AJAX = new XMLHttpRequest();
			if (AJAX) {
				AJAX.open("GET", file, false);                             
				AJAX.send(null);
				content = AJAX.responseText;                                         
			}
			this.store(file, content);
		} else {
			console.log("stored!!!");
			console.log(content);
		}
		var scriptTag = document.createElement("script");
		scriptTag.innerHTML = content;
		document.body.appendChild(scriptTag);
	},
	getDeps:		function(data, callback) {
		console.log("getDeps");
		for(var file in data) {
			this.getDep(file, data[file]);
		}
	}
};

function depends(deps, callback) {
	console.log("depends()");
	Depender.get_instance().getDeps(deps);
	if(callback) callback(window);
}

function setVersion(file, version) {
	Depender.get_instance().changeVersion(file, version);
}
