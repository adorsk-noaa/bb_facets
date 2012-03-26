define([
	"use!backbone",
], 
function(Backbone){

var RangeModel = Backbone.Model.extend({

	defaults: {
		min: 0,
		max: 100,
	},

	initialize: function(){
	},

	getRange: function(){
		return self.get('max') - self.get('min');
	}

});

return RangeModel;

});

