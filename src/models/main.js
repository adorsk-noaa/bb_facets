define([
	"use!underscore",
	"./select_filter",
	"./filter_collection",
], 
function(_, SelectFilterModel, FilterCollection){

	models = {
		'SelectFilterModel': SelectFilterModel,
		'FilterCollection': FilterCollection
	};

	return models;

});
