setVersion("Model.js", 0.1);

depends({"URI.js": 0.1});

function Model() {
}

Model.getClass = function(className) {
	if(Model.__classes == null)
		Model.__classes = {};
	return Model.__classes[className]
};

Model.class = function(className, data) {
	var primaryKey = data.primaryKey || "id";
	var new_class;

	var func	= "\
			   this.primaryKey = data." + primaryKey + ";\
			   this." + primaryKey + " = data." + primaryKey + ";\
			   this.__primaryKey = '" + primaryKey + "';\
			   this.__values = {};\
			   this.__exists = false;\
			   for(var key in data) {\
			   	this.__values[key] = data[key];\
			    }\
			  "
	;

	new_class = new Function("data", func);
	new_class.how_to_get_all = function(){throw "how_to_get_all not implemented."};
	new_class.how_to_get_all = data.how_to_get_all;

	new_class.forEach = function(func) {
		var elements = new_class.getAll();
		var element;
		while(element = elements.shift()) {
			func.call(element, element);
		}
	};

	new_class.getAll = function() {
		var ret = [];
		var arr = [];
		if(this.how_to_get_all.constructor == Function) {
			arr = this.how_to_get_all.call(this);
		} else {
			var AJAX = new XMLHttpRequest();
			if (AJAX) {
				AJAX.open(method, url, false);                             
				AJAX.setRequestHeader('Content-Type' , 'application/json');  
				AJAX.send(JSON.stringify(data));
				arr = JSON.parse(AJAX.responseText);                                         
			}
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
			var url = new URI(this.how_to_get_all.url);
			for(var key in data) {
				url.value(key, data[key]);
			}
			return this.__http_request(this.how_to_get_all.method,	url.absolute);
		},
		__get_data:			function(data){
			var url = new URI(this.how_to_get_data.url);
			for(var key in data) {
				url.value(key, data[key]);
			}
			return this.__http_request(this.how_to_create.method,	url.absolute, this.__values);
		},
		__edit:				function(data){
			var url = new URI(this.how_to_edit.url);
			for(var key in data) {
				url.value(key, data[key]);
			}
			return this.__http_request(this.how_to_edit.method,	url.absolute, this.__values);
		},
		__create:			function(data){
			var url = new URI(this.how_to_create.url);
			for(var key in data) {
				url.value(key, data[key]);
			}
			return this.__http_request(this.how_to_create.method,	url.absolute, this.__values);
		},
		__update:			function(data){
			var url = new URI(this.how_to_update.url);
			for(var key in data) {
				url.value(key, data[key]);
			}
			return this.__http_request(this.how_to_update.method,	url.absolute, this.__values);
		},
		__http_request:			function(method, url, data){
			var AJAX = new XMLHttpRequest();
			if (AJAX) {
				AJAX.open(method, url, false);                             
				AJAX.setRequestHeader('Content-Type' , 'application/json');  
				AJAX.send(JSON.stringify(data));
				return JSON.parse(AJAX.responseText);                                         
			}
		},

		save:				function() {
			if(!this.__exists) {
				this.__create(this.how_to_create.constructor == Function ? this.how_to_create() : this.__create());
			} else {
				this.__update(this.how_to_update.constructor == Function ? this.how_to_update() : this.__update());
			}
		},
		__get_data_if_is_needed:	function() {
			if(!this.__populated) {
				var data = this.how_to_get_data(this.primaryKey)
				for(var dataKey in data) {
					if(data[dataKey].constructor != Function)
						this.__values[dataKey] = data[dataKey];
				}
				this.__populated = true;
			}
		},
	};
	for(var key in data.defaults) {
		
		var getter = "\
			this.__get_data_if_is_needed();\
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

	return new_class;
};
