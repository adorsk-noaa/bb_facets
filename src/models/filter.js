define([
	"use!backbone",
], 
function(Backbone){

var FilterModel = Backbone.Model.extend({

	defaults: {
				type: '',
				formatted_restrictions: {}
			  },

	initialize: function(){
		// Unformatted restrictions.
		this._restrictions = {};
	}
	

});

return FilterModel;

});

