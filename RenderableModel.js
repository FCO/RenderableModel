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
