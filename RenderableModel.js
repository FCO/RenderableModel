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
		var compiled_template = "func = function() {\nvar ret = '';\n";
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
		compiled_template += "return ret;\n}";
		eval(compiled_template);
		this.__function__ = func;
	},
};

function Acumulator(agregator_func) {
	this.agregator_func = this.agregator.the_last_one;
	if(agregator_func) {
		if(agregator_func.constructor == Function) {
			this.agregator_func = agregator_func;
		} else {
			if(this.agregator[agregator_func])
				this.agregator_func = this.agregator[agregator_func];
			else
				throw "Agregator function '" + agregator_func + "' does not exists."
		}
	}
	this.groups		= {};
}

Acumulator.prototype = {
	waiting_time:		3000,
	groups:			null,
	agregator: {
		the_last_one:		function(value, callback) {
			this.val	= value;
			this.cb		= callback;
		},
		the_first_one:		function(value, callback) {
			if(this.val == null) this.val	= value;
			if(this.cb  == null) this.cb	= callback;
		},
		acumulate_array:	function(value, callback) {
			if(this.val == null) this.val	= [];
			if(this.cb  == null) this.cb	= [];
			this.val.push(value);
			this.cb.push(callback);
		},
		counter:		function(value, callback) {
			if(this.val == null) this.val	= 0;
			this.val++;
			this.cb		= callback;
		},
		somatory:		function(value, callback) {
			if(this.val == null) this.val	= 0;
			this.val	+= value;
			this.cb		= callback;
		},
	},
	agrupator_func:		function(value){
		return value.toString();
	},
	setAgrupatorFunc:	function(agrupator_func){
		this.agrupator_func = agrupator_func;
	},
	push:			function(value, callback) {
		var group	= this.agrupator_func(value);
		if(!this.groups[group])
			this.groups[group] = {};
		this.agregator_func.call(this.groups[group], value, callback);
		var _this = this;
		if(!this.groups[group].tid) {
			this.groups[group].tid = setTimeout(function(){
				_this.groups[group].tid = null;
				if(_this.groups[group].cb.constructor == Array) {
					if(_this.groups[group].val.constructor == Array) {
						_this.groups[group].cb.forEach(function(cb){
							cb.call(_this, _this.groups[group].val.shift());
						});
					} else {
						_this.groups[group].cb.forEach(function(cb){
							cb.call(_this, _this.groups[group].val);
						});
					}
				} else if(_this.groups[group].cb.constructor == Function) {
					_this.groups[group].cb.call(_this, _this.groups[group].val);
				}
				_this.groups[group].val	= null;
				_this.groups[group].cb	= null;
			}, this.waiting_time);
		}
	},
};


//function RenderableModel(class_name, data) {
//	this.createNewClass(class_name, data);
//}

function RenderableModel(){}

RenderableModel.default_prototype = {
	"new": function(){alert("create new obj!")},
};

RenderableModel.createNewClass = function(class_name, data) {
	new_class = {};
	new_class = RenderableModel.default_prototype;
	new_class.constructor = class_name;
	console.log(new_class);
	return new_class;
};
