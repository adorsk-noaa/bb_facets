define([
	"use!backbone",
	"./facet",
], 
function(Backbone, FacetModel){

var FacetCollection = Backbone.Collection.extend({
	model: FacetModel,

	initialize: function(models, options){
		this.url = options.url
		this.on('change', this.getRestrictions, this);
	},

	getRestrictions: function(){
		restrictions = this.map(function(facet_model){
			return facet_model.get('restrictions');
		});
		return restrictions;
	},

});

return FacetCollection;

});

