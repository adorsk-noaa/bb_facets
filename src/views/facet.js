define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
		],
function($, Backbone, _){

	var FacetView = Backbone.View.extend({

		initialize: function(){
						console.log('FacetView:initialize');
					},
	});

	return FacetView;
});
		