define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
		],
function($, Backbone, _){

	var FacetView = Backbone.View.extend({

		initialize: function(){
			//console.log('FacetView:initialize');
		},

		makeResizeable: function(){
			$(".facet-body", $(this.el)).resizable({
				minHeight: 30,
				handles: 's',
				stop: function(event, ui) {
					event.target.style.width = "auto"; // don't force the width
				}
			});
		}

	});

	return FacetView;
});
		
