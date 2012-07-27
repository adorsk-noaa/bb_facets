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
            $(this.el).addClass('range-slider');

            // Initialize selection and range if not set.
            _.each(['selection', 'range'], function(attr){
                var attr_model = this.model.get(attr);
                if (! attr_model){
                    attr_model = new Backbone.Model({
                        min: null,
                        max: null
                    });
                    this.model.set(attr, attr_model);
                }
                this[attr] = attr_model;
            }, this);

			this.render();

			this.range.on('change', this.onRangeChange, this);
			this.selection.on('change', this.onSelectionChange, this);
			this.on('ready', this.onReady, this);
		},

		render: function(){
			this.$slider = $('<div class="slider"></div>');
            this.$slider.appendTo(this.el);

			this.$slider.slider({
				range: true,
				min: 0,
				max: 100,
				values: [0, 100]
            });

			// Add divs to the left and right of the slider.
			$('.ui-slider-range', this.el).before('<div class="ui-slider-range-left" style="position: absolute;"></div>');
			$('.ui-slider-range', this.el).after('<div class="ui-slider-range-right" style="position: absolute;"></div>');

			// Have divs track the slider.
			var _this = this;
			this.$slider.on('slide', function(){
				_this.updateRangeLeftRight();
			});
			
		},

		getSliderBounds: function(){
			var slider_range = $('.ui-slider-range', this.el);
			var range_pos = slider_range.position();
			var range_width = slider_range.width();
			var range_height = slider_range.height();
			var bounds = {
				top: range_pos.top, 
				right: range_pos.left + range_width, 
				bottom: range_pos.top + range_height, 
				left: range_pos.left,
				width: range_width,
				height: range_height
			};
            return bounds;
		},

		updateRangeLeftRight: function(){
			var slider_bounds = this.getSliderBounds();
			$('.ui-slider-range-left', this.el).css('width', slider_bounds.left);
			$('.ui-slider-range-right', this.el).css('width', $('.ui-slider', this.el).width() - slider_bounds.right);
			$('.ui-slider-range-right', this.el).css('left', slider_bounds.right);
		},

		onSlideStop: function(){
			slider_values = this.$slider.slider("values");
            // Don't change if slider is at bounds
            // and existing values exceed bounds.
            if ( slider_values[0] == this.range.get('min')
                    && this.selection.get('min') < slider_values[0] ){
                slider_values[0] = this.selection.get('min');
            }
            if ( slider_values[1] == this.range.get('max')
                    && this.selection.get('max') > slider_values[1] ){
                slider_values[1] = this.selection.get('max');
            }

			this.selection.set({
                min: slider_values[0], 
                max: slider_values[1]
            });
        },

		onRangeChange: function(){
			this.$slider.slider("option", "min", this.range.get('min'));
			this.$slider.slider("option", "max", this.range.get('max'));
            this.onSelectionChange();
		},

        onSelectionChange: function(){
            var sanitized = {};
            // Shortcut for range.
            var range = {
                min: this.range.get('min'),
                max: this.range.get('max')
            };
            _.each(['min', 'max'], function(minmax){
                val = parseFloat(this.selection.get(minmax));
                // If invalid or exceeds bound, set to range bound.
                if (isNaN(val)){
                    sanitized[minmax] = range[minmax];
                }
                else if (minmax =='min' && (sanitized.min < range.min)){
                    sanitized.min = range.min;
                }
                else if( minmax == 'max' && (sanitized.max > range.max)){
                    sanitized.max = range.max;
                }
                else{
                    sanitized[minmax] = val;
                }
            }, this);

            // If min > max, set to max.
            if (sanitized.min > sanitized.max){
                sanitized.min = sanitized.max;
            }

            this.$slider.slider("option", "values", [sanitized.min, sanitized.max]);
            this.updateRangeLeftRight();
        },

        onReady: function(){
            this.onRangeChange();
            this.onSelectionChange();
        }

	});

	return RangeSliderView;
});
		
