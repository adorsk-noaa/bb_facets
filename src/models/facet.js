define([
	"use!backbone",
], 
function(Backbone){

var FacetModel = Backbone.Model.extend({

	defaults: {
				type: '',
				restrictions: {}
			  },

	initialize: function(){
	}

});

return FacetModel;

});

