define([
	"use!backbone",
	"./filter",
], 
function(Backbone, FilterModel){

var FilterCollection = Backbone.Collection.extend({
	model: FilterModel,

	initialize: function(){
		this.on('change', this.getRestrictions, this);
	},

	getRestrictions: function(){
		restrictions = this.map(function(filter_model){
			return filter_model.get('restrictions');
		});
		formatted_restrictions = this.formatRestrictions(restrictions);
		return formatted_restrictions;
	},

	formatRestrictions: function(restrictions){
		return _.filter(restrictions,function(r){return r != null;}).join('&');
	}

});

return FilterCollection;

});

