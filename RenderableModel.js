setVersion("RenderableModel.js", 0.6);

depends({
	"Template.js":		0.4,
	"Acumulator.js":	0.4,
});

function RenderableModel(){}

RenderableModel.default_prototype = {
	"new": function(){alert("create new obj!")},
};

RenderableModel.createNewClass = function(class_name, data) {
	new_class = {};
	new_class = RenderableModel.default_prototype;
	new_class.constructor = class_name;
	return new_class;
};
