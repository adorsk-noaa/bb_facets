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

	getRestrictions: function(){
		restrictions = {};
		this.each(function(facet_model){
			restrictions[facet_model.id] = facet_model.get('restrictions');
		});
		return restrictions;
	},

});

return FacetCollection;

});

