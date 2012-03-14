define([
	"use!backbone",
], 
function(Backbone){

var FacetModel = Backbone.Model.extend({

	defaults: {
				label: '',
				type: '',
				restrictions: {}
			  },

	initialize: function(){
	}

});

return FacetModel;

});

