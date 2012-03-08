define([
	"use!backbone",
], 
function(Backbone){

var FilterModel = Backbone.Model.extend({

	defaults: {
				type: '',
				restrictions: {}
			  }

});

return FilterModel;

});

