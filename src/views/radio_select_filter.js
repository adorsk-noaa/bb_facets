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

	});

	return RadioSelectFilterView;
});
		
