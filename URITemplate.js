function URITemplate(template) {
	this.template = template;
	this.regex = new RegExp(template.replace(/\{\s*\w+\s*\}/g, "([\\w\\/.+-]*)"));
	this.values = {};
	this.var_order = [];
	var values = this.values;
	var var_order = this.var_order;
	template.replace(/\{\s*(\w+)\s*\}/g, function(val){var val = val.replace(/^\{\s*|\s*}$/g, ""); values[val] = ""; var_order.push(val)});
}

URITemplate.prototype = {
	toString:	function() {
		return this.render();
	},
	render:		function(data) {
		for(var key in data) {
			this.values[key] = data[key];
		}
		var values = this.values;
		return this.template.replace(/\{\s*(\w+)\s*\}/g, function(val){var val = val.replace(/^\{\s*|\s*}$/g, ""); return values[val]});
	},
	getValuesFrom:	function(url) {
		var resp = url.match(this.regex);
		for(var i = 1; i < resp.length; i++) {
			var key = this.var_order[i - 1];
			this.values[key] = resp[i];
		}
	},
};
