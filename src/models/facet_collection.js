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

	getSelections: function(){
		var selections = {};
		this.each(function(facet_model){
			selections[facet_model.cid] = facet_model.get('selection');
		});
		return selections;
	},

});

return FacetCollection;

});

