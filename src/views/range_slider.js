define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"text!./templates/range_slider.html",
		],
function($, Backbone, _, ui, _s, template){

	var RangeSliderView = Backbone.View.extend({

		events: {
			'slidestop .slider': 'onSlideStop'
		},

		initialize: function(){
			this.render();

			this.model.on('change', this.onRangeSelectionChange, this);
		},

		render: function(){
			widget_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(widget_html);

			this.slider_el = $('.slider', this.el);
			this.slider_el.slider({
				range: true,
				min: this.model.get('range_min'),
				max: this.model.get('range_max'),
				values: [ this.model.get('selection_min'), this.model.get('selection_max')],
			});

		},

		onSlideStop: function(){
			slider_values = this.slider_el.slider("values");
			this.model.set({selection_min: slider_values[0], selection_max: slider_values[1]});
		},

		onRangeSelectionChange: function(){
			this.slider_el.slider("option", "min", this.model.get('range_min'));
			this.slider_el.slider("option", "max", this.model.get('range_max'));
			this.slider_el.slider("option", "values", [this.model.get('selection_min'), this.model.get('selection_max')]);
		}

	});

	return RangeSliderView;
});
		
