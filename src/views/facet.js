define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"text!./templates/facet.html",
		],
function($, Backbone, _, _s, template){

	var FacetView = Backbone.View.extend({

		initialize: function(){
            $(this.el).addClass("facet");
            $(this.el).attr("id", _s.sprintf("facet-%s", this.model.cid));
            this.initialRender();
            this.postInitialize();
		},

        initialRender: function(){
			var html = _.template(template, {model: this.model});
			$(this.el).html(html);
        },

        postInitialize: function(){
        },

        // This method should be overriden.
        getWidgetValue: function(){
        },

        // This function will likely be overriden.
        updateFilters: function(){
            var widget_value = this.getWidgetValue();
            this.model.set('filters', this.formatFilters(widget_value));
        },

        // This function will likely be overriden in the facet's application context.
        formatFilters: function(selected_values){
            return selected_values;
        },

        addResetButton: function(){
            var $reset = $('<a class="control facet-reset-button" href="javascript:{}" style="visibility:hidden;">reset</a>');
            $reset.appendTo($('.facet-header', this.el));
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
		
