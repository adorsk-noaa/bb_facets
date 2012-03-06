define([
	"use!underscore",
	"use!backbone",
	"./filter",
], 
function(_, Backbone, FilterModel){
var SelectFilterModel = FilterModel.extend({

	defaults: _.extend({}, FilterModel.prototype.defaults,
				{
				  'options': {}
			  })

});

return SelectFilterModel;

});
