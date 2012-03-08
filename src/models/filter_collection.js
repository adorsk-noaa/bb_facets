define([
	"use!backbone",
	"./filter",
], 
function(Backbone, FilterModel){

var FilterCollection = Backbone.Collection.extend({
	model: FilterModel,
});

return FilterCollection;

});

