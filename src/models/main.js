define([
	"use!underscore",
	"./facet",
	"./facet_collection",
], 
function(_, FacetModel, FacetCollection){

	models = {
		'FacetModel': FacetModel,
		'FacetCollection': FacetCollection,
	};

	return models;

});
