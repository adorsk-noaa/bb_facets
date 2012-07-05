define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./facet",
	"./../models/range_selection",
	"./range_slider",
	"text!./templates/numeric_facet.html",
		],
function($, Backbone, _, ui, _s, FacetView, RangeSelectionModel, RangeSliderView, template){

	var NumericFacetView = FacetView.extend({

		events: {

			// Reset button.
			"click .facet-reset-button": "resetFilters",
		},

		initialize: function(){
			FacetView.prototype.initialize.call(this, arguments);

			this.range_selection = new RangeSelectionModel();
			this.updateRange();

			this.range_selection.on('change', this.onRangeChange, this);
			this.model.on('change:base_histogram', this.renderBaseHistogram, this);
			this.model.on('change:filtered_histogram', this.renderFilteredHistogram, this);
		},

		updateRange: function(){
			var base_histogram_stats = this.getHistogramStats(this.model.get('base_histogram'));
			var filtered_histogram_stats = this.getHistogramStats(this.model.get('filtered_histogram'));
			this.range_selection.set({
				range_min: base_histogram_stats['x_min'],
				range_max: base_histogram_stats['x_max'],
				selection_min: filtered_histogram_stats['x_min'],
				selection_max: filtered_histogram_stats['x_max'],
			});

			$('.facet-controls .range', this.el).html(_s.sprintf("%.1f to %.1f", base_histogram_stats['x_min'], base_histogram_stats['x_max']));
		},

		getHistogramStats: function(histogram){
			var stats = {
				x_min: 0,
				x_max: 0,
				y_min: 0,
				y_max: 0
			}
			if (histogram.length > 0){
				stats['x_min'] = _.min(histogram, function(bucket){return bucket['min']})['min'];
				stats['x_max'] = _.max(histogram, function(bucket){return bucket['max']})['max'];
				stats['y_min'] = _.min(histogram, function(bucket){return bucket['count']})['count'];
				stats['y_max'] = _.max(histogram, function(bucket){return bucket['count']})['count'];
			}

			return stats;
		},

		render: function(){
			this.renderWidget();
			this.renderSlider();
			this.renderTextInputs();
			return this;
		},

		renderBaseHistogram: function(){
			this.updateRange();
			this.renderHistogram({
				el: '.base-histogram',
				histogram: this.model.get('base_histogram')
			});
			return this;
		},

		renderFilteredHistogram: function(){
			this.renderHistogram({
				el: '.filtered-histogram',
				histogram: this.model.get('filtered_histogram')
			});
			return this;
		},
		
		renderWidget: function(){
			widget_html = _.template(template, {model: this.model});
			$(this.el).html(widget_html);
			return this;
		},

		renderHistogram: function(options){
			histogram_el = $(options['el'], this.el);
			histogram_el.empty();

			histogram = options['histogram'];

			histogram_stats = this.getHistogramStats(this.model.get('base_histogram'));

			x_min = histogram_stats['x_min'];
			x_max = histogram_stats['x_max'];
			x_range = x_max - x_min;

			y_min = histogram_stats['y_min'];
			y_max = histogram_stats['y_max'];
			y_range = y_max - y_min;

			_.each(histogram, function(bucket){
				bucket_x = Math.round((bucket['min'] - x_min)/x_range * 100.0);
				bucket_width = Math.round((bucket['max'] - bucket['min'])/x_range * 100.0);
				bucket_y = Math.round((bucket['count'] - y_min)/y_range * 100.0);

				// Show stub for small fractional values.
				if (bucket_y < 1 && bucket_y > 0){
					bucket_y = 1;
				}

				bucket_el = $(_s.sprintf("<div class='bar' style='position: absolute; left: %d%%; bottom: 0; width:%d%%; height: %d%%;'><div class='bar-body'></div></div>", bucket_x, bucket_width, bucket_y));
				histogram_el.append(bucket_el);
			}, this);

			return this;
		},

		renderSlider: function(){
			this.slider = new RangeSliderView({
				model: this.range_selection,
				el: '.slider-widget'
			});
		},

		renderTextInputs: function(){
			RangeTextInputsView = Backbone.View.extend({
				events: {'change input': 'onInputChange'},
				initialize: function(options){
					this.render();
					this.model.on('change', this.onRangeSelectionChange, this);
					this.onRangeSelectionChange();
				},
				render: function(){
					$(this.el).html('<input name="selection_min" type="text"><span class="label">&le; ' + this.options.label + ' &le; </span><input name="selection_max" type="text">');
				},
				onInputChange: function(){
					var min_el = $('input[name="selection_min"]', this.el);
					var max_el = $('input[name="selection_max"]', this.el);

					min = parseFloat($(min_el).attr('value'));
					max = parseFloat($(max_el).attr('value'));

					// Basic validation.
					if (min < this.model.get('range_min')){
						min = this.model.get('range_min');
						$(min_el).attr('value', min);
					}
					else if (min > this.model.get('range_max')){
						min = this.model.get('range_max');
						$(min_el).attr('value', min);
					}
					
					if (max < this.model.get('range_min')){
						max = this.model.get('range_min');
						$(max_el).attr('value', max); 
					}
					else if (max > this.model.get('range_max')){
						max = this.model.get('range_max');
						$(max_el).attr('value', max); 
					}

					if (min > max){
						$(min_el).attr('value', max);
					}
					else if (max < min){
						$(max_el).attr('value', min);
					}

					min = parseFloat($(min_el).attr('value'));
					max = parseFloat($(max_el).attr('value'));

					this.model.set({
						selection_min: min,
						selection_max: max
					});
				},
				onRangeSelectionChange: function(){
					$('input[name="selection_min"]').attr('value', _s.sprintf("%.1f", this.model.get('selection_min')));
					$('input[name="selection_max"]').attr('value', _s.sprintf("%.1f", this.model.get('selection_max')));
				}
			});

			this.text_inputs = new RangeTextInputsView({
				model: this.range_selection,
				el: '.textinputs-widget',
				label: 'Depth'
			});
		},

		onRangeChange: function(){
			// Show reset button if the full range is not selected.
			if ((this.range_selection.get('selection_min') != this.range_selection.get('range_min')) ||
				(this.range_selection.get('selection_max') != this.range_selection.get('range_max'))){
				$('.facet-reset-button', $(this.el)).css('visibility', 'visible');
			}
			else{
				$('.facet-reset-button', $(this.el)).css('visibility', 'hidden');
			}
			this.updateSelection();		
		},

		getWidgetValue: function(){
			return {
				selection_min: this.range_selection.get('selection_min'),
				selection_max : this.range_selection.get('selection_max')
			};
		},

		resetFilters: function(){
			this.range_selection.set({
				selection_min: this.range_selection.get('range_min'),
				selection_max: this.range_selection.get('range_max')
			});
		}

	});

	return NumericFacetView;
});
		
