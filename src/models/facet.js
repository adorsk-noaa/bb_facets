define([
	"use!backbone",
], 
function(Backbone){

var FacetModel = Backbone.Model.extend({

	defaults: {
		label: '',
		type: '',
		filters: {},
	},

	initialize: function(){
	},

	getData: function(){
	}

});

return FacetModel;

});

