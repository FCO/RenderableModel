function Model() {
}

Model.class = function(className, data) {
	var primaryKey = data.primaryKey || "id";
	var new_class;

	var func	= "\
			   this." + primaryKey + " = " + primaryKey + ";\
			   this.__primarykey = '" + primaryKey + "';\
			   this.__values = {};\
			   this.__exists = false;\
			  "
	;

	new_class = new Function(primaryKey, "data", func);
	new_class.how_to_get_all = function(){throw "how_to_get_all not implemented."};
	new_class.how_to_get_all = data.how_to_get_all;

	new_class.getAll = function() {} ;

	new_class.prototype = {
		__values:		null,
		__primarykey:		null,
		__populated:		false,
		__auto_sync:		(data.auto_sync		|| false),

		how_to_get_data:	(data.how_to_get_data	|| function(){throw "how_to_get_data not implemented."}),
		how_to_create:		(data.how_to_create	|| function(){throw "how_to_create not implemented."}),
		how_to_edit:		(data.how_to_edit	|| function(){throw "how_to_edit not implemented."}),
		how_to_update:		(data.how_to_update	|| function(){throw "how_to_update not implemented."}),

		__get_all:			function(data){
			return this.__http_request(this.how_to_get_all.method,	(new URITemplate(this.how_to_get_all.url)).render(data));
		},
		__get_data:			function(data){
			return this.__http_request(this.how_to_create.method,	(new URITemplate(this.how_to_create.url	)).render(data), this.__values);
		},
		__edit:				function(data){
			return this.__http_request(this.how_to_edit.method,	(new URITemplate(this.how_to_create.url	)).render(data), this.__values);
		},
		__create:			function(data){
			return this.__http_request(this.how_to_create.method,	(new URITemplate(this.how_to_create.url	)).render(data), this.__values);
		},
		__update:			function(data){
			return this.__http_request(this.how_to_update.method,	(new URITemplate(this.how_to_update.url	)).render(data), this.__values);
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
				var data = this.how_to_get_data(this.__primarykey)
				for(var dataKey in data) {
					if(data[dataKey].constructor != Function)
						this.__values[dataKey] = data[dataKey];
				}
				this.__populated = true;
			}
		},
	};
	for(var key in data.defaults) {
		new_class.prototype.__defineGetter__(key, function(){
			this.__get_data_if_is_needed();
			return this.__values[key];
		});
		new_class.prototype.__defineSetter__(key, function(val){
			this.__get_data_if_is_needed();
			this.__values[key] = val;
		});
	}
	return new_class;
};
