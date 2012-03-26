define([
	"use!backbone",
], 
function(Backbone){

var RangeSelectionModel = Backbone.Model.extend({

	defaults: {
		range_min: 0,
		range_max: 100,
		selection_min: 0,
		selection_max: 100,
	},

	initialize: function(){
	},

	getRangeRange: function(){
		return self.get('range_max') - self.get('range_min');
	},

	getSelectionRange: function(){
		return self.get('selection_max') - self.get('selection_min');
	}

});

return RangeSelectionModel;

});

