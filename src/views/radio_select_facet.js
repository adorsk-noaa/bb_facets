define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"./facet",
	"text!./templates/radio_select_facet.html",
		],
function($, Backbone, _, FacetView, template){

	var RadioSelectFacetView = FacetView.extend({

		events: {
			// Update model when widget changes.
			"change .radio-select-facet-widget": 'updateFilters'
		},

		initialize: function(){
			FacetView.prototype.initialize.call(this, arguments);
			this.renderWidget();
		},
		
		renderWidget: function(){
			widget_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(widget_html);
			return this;
		},

		getWidgetValues: function(){
			 widget_values = {};
			 widget_value = $('input[name=' + this.model.id + ']:checked', $(this.el)).val();
			 widget_values[this.model.id] = widget_value;
			 return widget_values;
		},

		updateFilters: function(){
			filters = this.getWidgetValues();
			this.model.set({filters: filters});
		}

	});

	return RadioSelectFacetView;
});
		
