function Model() {
}

Model.class = function(className, data) {
	var primaryKey = data.primaryKey || "id";
	var new_class;

	var func	= "\
			   this." + primaryKey + " = " + primaryKey + ";\
			   this.__primarykey = '" + primaryKey + "';\
			   this.__values = {};\
			  "
	;

	new_class = new Function(primaryKey, "data", func);
	new_class.how_to_get_all = data.how_to_get_all;
	new_class.getAll = function() {} ;

	new_class.prototype = {
		__values:	null,
		__primarykey:	null,
		__populated:	false,
		__auto_sync:	data.auto_sync || false,
	};
	for(var key in data) {
		new_class.prototype.__difineGetter__(key, function(){
			if(!this.__populated) {
				var data = this.how_to_get_data(this.__primarykey)
				for(var dataKey in data) {
					if(data[dataKey].constructor != Function)
						this.__values[dataKey] = data[dataKey];
				}
			}
		});
	}
	return new_class;
};
