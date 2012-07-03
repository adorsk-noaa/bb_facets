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

        // This method should be overriden.
        getWidgetValues: function(){
        },

        // This function will likely be overriden.
        updateFilters: function(){
            var selected_values = this.getWidgetValues();
            this.model.set('filters', this.formatFilters(selected_values));
        },

        // This function will likely be overriden in the facet's application context.
        formatFilters: function(selected_values){
            return selected_values;
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
		
