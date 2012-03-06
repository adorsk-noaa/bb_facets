define([
	// libs
	"use!backbone",
], 
function(Backbone){
var FilterFormModel = Backbone.Model.extend({

	defaults:{
		form_elements:  {},
		filter_values: {},
			 },

	initialize: function(){
				}
});

return FilterFormModel;

});
