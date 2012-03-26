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
			"click .facet-reset-button": "resetRestrictions",
		},

		initialize: function(){
			FacetView.prototype.initialize.call(this, arguments);

			var histogram_stats = this.getHistogramStats();
			this.range_selection = new RangeSelectionModel({
				range_min: histogram_stats['x_min'],
				range_max: histogram_stats['x_max'],
				selection_min: histogram_stats['x_min'],
				selection_max: histogram_stats['x_max'],
			});
			this.range_selection.on('change', this.onRangeChange, this);
		},

		getHistogramStats: function(){
			histogram = this.model.get('histogram');
			return{
				x_min : _.min(histogram, function(bucket){return bucket['min']})['min'],
				x_max : _.max(histogram, function(bucket){return bucket['max']})['max'],
				y_min : _.min(histogram, function(bucket){return bucket['count']})['count'],
				y_max : _.max(histogram, function(bucket){return bucket['count']})['count']
			};
		},

		render: function(){
			this.renderWidget();
			this.renderSlider();
			this.renderTextInputs();
			this.renderHistogram();
			return this;
		},
		
		renderWidget: function(){
			widget_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(widget_html);

			return this;
		},

		renderHistogram: function(){
			histogram_el = $('.histogram', this.el);
			histogram_el.empty();

			histogram = this.model.get('histogram');
			histogram_stats = this.getHistogramStats();

			x_min = histogram_stats['x_min'];
			x_max = histogram_stats['x_max'];
			x_range = x_max - x_min;

			y_min = histogram_stats['y_min'];
			y_max = histogram_stats['y_max'];
			y_range = y_max - y_min;

			_.each(histogram, function(bucket){
				bucket_x = (bucket['min'] - x_min)/x_range * 100.0;
				bucket_width = (bucket['max'] - bucket['min'])/x_range * 100.0;
				bucket_y = (bucket['count'] - y_min)/y_range * 100.0;
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
					$(this.el).html('<input name="selection_min" type="text"> &le; ' + this.options.label + ' &le; <input name="selection_max" type="text">');
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
					$('input[name="selection_min"]').attr('value', this.model.get('selection_min'));
					$('input[name="selection_max"]').attr('value', this.model.get('selection_max'));
				}
			});

			this.text_inputs = new RangeTextInputsView({
				model: this.range_selection,
				el: '.textinputs-widget',
				label: 'Depth'
			});
		},

		onRangeChange: function(){
			console.log('on range change');
		},

		getWidgetValues: function(){
			return {
				selection_min: this.range_selection.get('selection_min'),
				selection_max : this.range_selection.get('selection_max')
			};
		},

		updateRestrictions: function(){
			console.log('numeric:updateRestrictions');
		},

		resetRestrictions: function(){
			console.log('numeric:resetRestrictions');
		}

	});

	return NumericFacetView;
});
		
