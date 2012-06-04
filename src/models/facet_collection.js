define([
	"use!backbone",
	"./facet",
], 
function(Backbone, FacetModel){

var FacetCollection = Backbone.Collection.extend({
	model: FacetModel,

	initialize: function(models, options){

		if (options){
			this.url = options.url;
		}
	},

	getFilters: function(){
		var filters = {};
		this.each(function(facet_model){
			filters[facet_model.id] = facet_model.get('filters');
		});
		return filters;
	},

});

return FacetCollection;

});

