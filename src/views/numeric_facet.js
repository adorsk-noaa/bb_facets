define([
       "jquery",
       "backbone",
       "underscore",
       "ui",
       "_s",
       "./facet",
       "./range_slider",
       "text!./templates/numeric_facet_body.html",
],
function($, Backbone, _, ui, _s, FacetView, RangeSliderView, body_template){

  var NumericFacetView = FacetView.extend({

    events: _.extend({}, FacetView.prototype.events, {
      "click .facet-reset-button": "resetFilters",
      "change .selection-input": "onSelectionInputChange"
    }),

    initialize: function(){
      this.subViews = {};

      // Initialize selection and range if not set.
      if (! this.model.get('selection')){
        this.model.set('selection', new Backbone.Model({
          min: 0,
          max: 1
        }));
      }
      this.selection = this.model.get('selection');

      if (! this.model.get('range')){
        this.model.set('selection', new Backbone.Model({
          xmin: 0,
          xmax: 1,
          ymin: -1,
          ymax: 1
        }));
      }
      this.range = this.model.get('range');

      FacetView.prototype.initialize.call(this, arguments);
      $(this.el).addClass("numeric-facet range-facet");
      this.postInitialize();
    },

    initialRender: function(){
      var _this = this;
      FacetView.prototype.initialRender.call(this, arguments);

      // Add reset control to title controls.
      this.addResetButton();

      // Render body.
      var body_html = _.template(body_template, {model: this.model});
      $('.facet-body', this.el).html(body_html);

      // Save shortcuts to text inputs.
      this.selectionInputs = {};
      _.each(['min', 'max'], function(minmax){
        var $input = $(_s.sprintf('.selection-inputs input[name="%s"]', minmax), this.el);
        this.selectionInputs[minmax] = $input;
      }, this);

      // Create slider.
      this.subViews.slider = new RangeSliderView({
        el: $('.slider-widget', this.el),
        model: this.model
      });

      // Create histogram elements in slider's container.
      var $sliderContainer = $('.slider', this.subViews.slider.el).parent();
      $.each(['base', 'filtered'], function(i, category){
        var $histEl = $(_s.sprintf('<div class="histogram %s-histogram"></div>', category));
        $histEl.appendTo($sliderContainer);
        _this['$' + category + 'Histogram'] = $histEl;
      });
    },

    postInitialize: function(){
      FacetView.prototype.postInitialize.call(this, arguments);

      // Listen for events.
      this.selection.on('change', this.onSelectionChange, this);
      this.range.on('change', this.onRangeChange, this);
      this.model.on('change:base_histogram', this.renderBaseHistogram, this);
      this.model.on('change:filtered_histogram', this.renderFilteredHistogram, this);
      this.on('ready', this.onReady, this);
    },

    onSelectionInputChange: function(e){
      var minmax = $(e.target).attr('name');
      var val = this.selectionInputs[minmax].val();
      this.selection.set(minmax, val);
    },

    onSelectionChange: function(model, changes){
      // Update text widgets.
      _.each(['min', 'max'], function(minmax){
        if (changes && changes.changes && changes.changes.hasOwnProperty(minmax)){
          var val = this.selection.get(minmax);
          this.selectionInputs[minmax].val(val);
        }
      }, this);

      // Update reset button.
      this.updateResetButton();

      // Update filters.
      this.updateFilters();

    },

    formatter: function(format, value){
      return _s.sprintf(format, value);
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

    rangeIsValid: function(){
      var _this = this;
      $.each(['x', 'y'], function(i, xy){
        var min = parseFloat(_this.range.get(xy + 'min'));
        var max = parseFloat(_this.range.get(xy + 'max'));

        if (isNaN(min) || isNaN(max) || min > max){
          return false;
        }
      });
      return true;
    },

    renderBaseHistogram: function(){
      if (this.rangeIsValid()){
        this.renderHistogram({
          el: this.$baseHistogram,
          histogram: this.model.get('base_histogram')
        });
      }
    },

    renderFilteredHistogram: function(){
      if (this.rangeIsValid()){
        this.renderHistogram({
          el: this.$filteredHistogram,
          histogram: this.model.get('filtered_histogram')
        });
      }
    },

    renderHistogram: function(options){
      var _this = this;
      histogram_el = $(options['el'], this.el);
      histogram_el.empty();

      histogram = options['histogram'];
      hstats = this.getHistogramStats(this.model.get('base_histogram'));

      console.log(this.range.toJSON());

      var scale = function(xy, v){
        var xyMin = _this.range.get(xy + 'min');
        var xyMax = _this.range.get(xy + 'max');
        return Math.round((v - xyMin)/(xyMax - xyMin) * 100);
      };

      var y0 = scale('y', 0);

      _.each(histogram, function(bucket){
        scaledX = scale('x', bucket['min']);
        scaledWidth = scale('x', bucket['max']) - scale('x', bucket['min']);
        scaledY = scale('y', bucket['count']);

        // Show stub for small fractional values.
        if (scaledY != y0 && scaledY > (y0 - 1) && scaledY < (y0 +1)){
          scaledY = y0 + (scaledY < 0 ) ? -1 : 1;
        }

        // Determine direction.
        var top, bottom;
        if (scaledY < y0){
          top = 100 - y0;
          bottom = scaledY;
        }
        else if (scaledY > y0){
          bottom = y0;
          top = 100 - scaledY;
        }
        else if (scaledY == y0){
          bottom = y0;
          top = 100 - y0;
        }

        bucket_el = $(_s.sprintf("<div class='bar' style='position: absolute; left: %d%%; width:%d%%; bottom: %d%%; top: %d%%;'><div class='bar-body'></div></div>", scaledX, scaledWidth, bottom, top));
        histogram_el.append(bucket_el);
      }, this);

      return this;
    },

    getSelection: function(){
      return {
        min: this.selection.get('min'),
        max : this.selection.get('max')
      };
    },

    onRangeChange: function(){
      this.renderBaseHistogram();
      this.renderFilteredHistogram();
    },

    resetFilters: function(){
      this.selection.set({
        'min': '',
        'max': ''
      });
    },

    onReady: function(){
      this.onSelectionChange();
      $.each(this.subViews, function(id, subView){
        subView.trigger('ready');
      });
    },

    updateResetButton: function(){
      // If anything was selected, show reset button.
      var visibility = 'hidden';
      _.each(['min', 'max'], function(minmax){
        var val = this.selection.get(minmax);
        if (val != null && val != ""){
          visibility = 'visible';
        }
      }, this);
      $('.facet-reset-button', this.el).css('visibility',  visibility);
    },

  });

  return NumericFacetView;
});

