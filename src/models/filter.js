define([
	"use!backbone",
], 
function(Backbone){

var FilterModel = Backbone.Model.extend({

	defaults: {
				  restrictions: {}
			  }

});

return FilterModel;

});

