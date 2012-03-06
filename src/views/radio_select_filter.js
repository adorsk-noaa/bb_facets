define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"./filter",
	"text!./templates/radio_select_filter.html",
		],
function($, Backbone, _, FilterView, template){

	var RadioSelectFilterView = FilterView.extend({

		events: {
					// Update model when widget changes.
					"change .radio-select-filter-widget": 'updateRestrictions'
				},

		initialize: function(){
						FilterView.prototype.initialize.call(this, arguments);
						console.log('RadioSelectFilterView:initialize');
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

		updateRestrictions: function(){
									this.model.updateRestrictions(this.getWidgetValues());
							}

	});

	return RadioSelectFilterView;
});
		
