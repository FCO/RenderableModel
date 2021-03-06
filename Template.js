setVersion("Template.js", 0.4);

function Template(code) {
	this._templates = {};
	this.setTemplate(code);
	this.compileTemplate();
}

Template.prototype = {
	_templates: 		null,
	render:			function(data) {
		return this.__function__.call(data);
	},
	setTemplate:		function(template) {
		this.code = template;
	},
	compileTemplate:	function() {
		var splitted = this.code.split(/<%\s*|\s*%>/);
		var template_hashes = [];
		while(splitted.length > 0) {
			var data = splitted.shift();
			var code = splitted.shift();
			template_hashes.push({code: code, data: data});
		}
		var func;
		var compiled_template = "var ret = '';\n";
		for(var i = 0; i < template_hashes.length; i++) {
			if(template_hashes[i].data != null)
				compiled_template += "ret += '" + template_hashes[i].data + "';\n";
			if(/^\s*=\s*/.test(template_hashes[i].code)) {
				compiled_template += "ret += ";
				compiled_template += template_hashes[i].code.replace(/^\s*=\s*/, "") + ";\n";
			} else {
				compiled_template += template_hashes[i].code + ";\n";
			}
		}
		compiled_template += "return ret;\n";
		this.__function__ =  new Function(compiled_template);
	},
};
