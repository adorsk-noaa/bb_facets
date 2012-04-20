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

			// Add divs to the left and right of the slider.
			$('.ui-slider-range', this.el).before('<div class="ui-slider-range-left" style="position: absolute;"></div>');
			$('.ui-slider-range', this.el).after('<div class="ui-slider-range-right" style="position: absolute;"></div>');

			// Set initial widths of the divs.
			this.slider_el.slider("option", "values", [this.model.get('selection_min'), this.model.get('selection_max')]);

			// Have divs track the slider.
			var _this = this;
			this.slider_el.on('slide slidechange', function(){
				_this.updateRangeLeftRight();
			});
			
		},

		getSliderBounds: function(){
			var slider_range = $('.ui-slider-range', this.el);
			var range_pos = slider_range.position();
			var range_width = slider_range.width();
			var range_height = slider_range.height();
			return {
				top: range_pos.top, 
				right: range_pos.left + range_width, 
				bottom: range_pos.top + range_height, 
				left: range_pos.left,
				width: range_width,
				height: range_height
			};
		},

		updateRangeLeftRight: function(){
			var slider_bounds = this.getSliderBounds();
			$('.ui-slider-range-left', this.el).css('width', slider_bounds.left);
			$('.ui-slider-range-right', this.el).css('width', $('.ui-slider', this.el).width() - slider_bounds.right);
			$('.ui-slider-range-right', this.el).css('left', slider_bounds.right);
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
		
