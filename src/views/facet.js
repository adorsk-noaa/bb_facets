define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"./filter",
		],
function($, Backbone, _){

	var FilterView = Backbone.View.extend({

		initialize: function(){
						console.log('FilterView:initialize');
					},
	});

	return FilterView;
});
		
