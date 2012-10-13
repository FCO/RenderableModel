if(!window.setVersion)	window.setVersion	= function(){};
if(!window.depends)	window.depends		= function(){};
setVersion("Model.js", 0.1);

depends({"URI.js": 0.1});

function Model() {
}

Model.getClass = function(className) {
	if(Model.__classes == null)
		Model.__classes = {};
	return Model.__classes[className]
};

Model.parse_method_url = function(string) {
	var args	=	string.split(/\s+/);
	args[1]		=	new URI(args[1]);
	return args;
};

Model.__http_request	= function(method, url, data){
	var AJAX = new XMLHttpRequest();
	if (AJAX) {
		AJAX.open(method, url.render(), false);                             
		AJAX.setRequestHeader('Content-Type' , 'application/json');  
		AJAX.send(JSON.stringify(data));
		return JSON.parse(AJAX.responseText);                                         
	}
},

Model.class = function(className, data) {
	var primaryKey = data.primaryKey || "id";
	var new_class;

	var func	= "\
			   this.primaryKey = data." + primaryKey + ";\
			   this." + primaryKey + " = data." + primaryKey + ";\
			   this.__primaryKey = '" + primaryKey + "';\
			   this.__values = {};\
			   this.__exists = false;\
			   this.__populated_value = {};\
			   for(var key in data) {\
			   	this.__values[key] = data[key];\
				this.__populated_value[key] = true;\
			    }\
			  "
	;

	new_class = new Function("data", func);
	new_class.__primaryKey = primaryKey;
	new_class.how_to_get_all = function(){throw "how_to_get_all not implemented."};
	new_class.how_to_get_all = data.how_to_get_all;

	new_class.forEach = function(func) {
		var elements = new_class.getAll();
		var element;
		while(element = elements.shift()) {
			func.call(element, element);
		}
	};

	new_class.find = function(pk_value) {
		var query = {};
		query[this.__primaryKey] = pk_value;
		console.log(query);
		var arr = new_class.search(query);
		if(arr.length > 1) {
			throw "More than one result for 'find()'.";
		}
		return arr.shift();
	};

	new_class.getAll = function() {
		return new_class.search();
	};

	new_class.search = function(data) {
		console.log("search");
		console.log(data);
		var ret = [];
		var arr = [];
		if(this.how_to_get_all.constructor == Function) {
			arr = this.how_to_get_all.call(this);
		} else {
			var args	=	Model.parse_method_url(this.how_to_get_all);
			var method	=	args[0];
			var url		=	args[1];
			var AJAX = new XMLHttpRequest();
			arr = Model.__http_request(method, url, data);
		}
		for(var i = 0; i < arr.length; i++) {
			ret.push(new new_class(arr[i]));
		}
		return ret;
	};

	new_class.prototype = {
		__values:		null,
		__primaryKey:		null,
		__populated:		false,
		__auto_sync:		(data.auto_sync		|| false),

		how_to_get_data:	(data.how_to_get_data	|| function(){throw "how_to_get_data not implemented."}),
		how_to_create:		(data.how_to_create	|| function(){throw "how_to_create not implemented."}),
		how_to_edit:		(data.how_to_edit	|| function(){throw "how_to_edit not implemented."}),
		how_to_update:		(data.how_to_update	|| function(){throw "how_to_update not implemented."}),

		__get_all:			function(data){
			var args	=	Model.parse_method_url(this.how_to_get_all);
			var method	=	args[0];
			var url		=	args[1];
			for(var key in data) {
				url.value(key, data[key]);
			}
			return Model.__http_request(method, url);
		},
		__get_data:			function(data){
			var args	=	Model.parse_method_url(this.how_to_get_data);
			var method	=	args[0];
			var url		=	args[1];
			for(var key in data) {
				url.value(key, data[key]);
			}
			return Model.__http_request(method, url, this.__values);
		},
		__edit:				function(data){
			var args	=	Model.parse_method_url(this.how_to_edit);
			var method	=	args[0];
			var url		=	args[1];
			for(var key in data) {
				url.value(key, data[key]);
			}
			return Model.__http_request(method,	url, this.__values);
		},
		__create:			function(data){
			var args	=	Model.parse_method_url(this.how_to_create);
			var method	=	args[0];
			var url		=	args[1];
			for(var key in data) {
				url.value(key, data[key]);
			}
			return Model.__http_request(method,	url, this.__values);
		},
		__update:			function(data){
			var args	=	Model.parse_method_url(this.how_to_update);
			var method	=	args[0];
			var url		=	args[1];
			for(var key in data) {
				url.value(key, data[key]);
			}
			return Model.__http_request(method,	url, this.__values);
		},

		save:				function() {
			if(!this.__exists) {
				this.__create(this.how_to_create.constructor == Function ? this.how_to_create() : this.__create());
			} else {
				this.__update(this.how_to_update.constructor == Function ? this.how_to_update() : this.__update());
			}
		},
		__get_data_if_is_needed:	function(key) {
			if(!this.__populated && !this.__populated_value[key]) {
				var data;
				if(this.how_to_get_data.constructor == Function) {
					data = this.how_to_get_data(this.primaryKey)
				} else {
					data = this.__get_data(this.__values);
				}
				for(var dataKey in data) {
					if(data[dataKey].constructor != Function) {
						this.__values[dataKey] = data[dataKey];
						this.__populated_value[dataKey] = true;
					}
				}
				this.__populated = true;
				this.__populated_value[key] = true;
			}
		},
	};
	for(var key in data.defaults) {
		
		var getter = "\
			this.__get_data_if_is_needed('" + key + "');\
			return this.__values." + key + ";\
		";
		var setter = "\
			this.__get_data_if_is_needed();\
			this.__values." + key + " = val;\
		";
		new_class.prototype.__defineGetter__(key, new Function(getter));
		new_class.prototype.__defineSetter__(key, new Function("val", setter));
	}
	if(Model.__classes == null)
		Model.__classes = {};

	Model.__classes[className] = new_class;

	window[className] = new_class;
};
