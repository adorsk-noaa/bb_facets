define([
	"use!backbone",
], 
function(Backbone){

var FacetModel = Backbone.Model.extend({

	defaults: {
		label: '',
		type: '',
		restrictions: {},
		parameters: {},
	},

	initialize: function(){
	}

});

return FacetModel;

});

