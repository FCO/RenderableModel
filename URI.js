function URI(string, orig) {
	if(!orig) orig = window.location.href;

	this.protocol	=	orig.protocol || "file";
	this.hostname	=	orig.hostname;
	if(this.protocol == "file")
		this.hostname = "";
	this.port	=	orig.port;
	this.path	=	orig.path;
	if(orig.search) this.query	=	orig.search();

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
	set absolute(string) {
		ths.setURI(string);
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
	set relative(string) {
		ths.setURI(string);
	},
	get relative() {
		return this.getRelative(window.location.href.toString());
	},
	getRelative:	function(relative_of) {
		var relative_of_obj = new URI(relative_of);

		if(
			this.protocol		!= relative_of_obj.protocol
			|| this.username	!= relative_of_obj.username
			|| this.password	!= relative_of_obj.password
			|| this.hostname	!= relative_of_obj.hostname
			|| this.port		!= relative_of_obj.port
		) {
			return this.absolute;
		}
		var t_path = this.path.split("/");
		var r_path = relative_of_obj.path.split("/");

		var file = t_path.pop();
		r_path.pop();

		var equal = true;
		var path = "";
		if(t_path[0] != r_path[0]) {
			path = this.path;
		} else {
			var new_path = [];
			while(r_path.length > 0) {
				var t = t_path.shift();
				var r = r_path.shift();
				if(t != r) equal = false;
				if(!equal) {
					path += "../";
					new_path.push(t);
				}
			}
			while(t_path.length > 0) new_path.push(t_path.shify());
			path += new_path.join("/") + "/";
		}
		path = path.replace(/\/{2,}/, "/") + file;
		if(this.query) path += "?" + this.query;
		return path
	}
};
