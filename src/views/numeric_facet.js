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
      FacetView.prototype.initialize.call(this, arguments);
      $(this.el).addClass("numeric-facet range-facet");
      this.postInitialize();
    },

    postInitialize: function(){
      FacetView.prototype.postInitialize.call(this, arguments);

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

      this.slider = new RangeSliderView({
        el: $('.slider-widget', this.el),
        model: this.model
      });


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

    onRangeChange: function(){
      return;
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
      var rmin = parseFloat(this.range.get('min'));
      var rmax = parseFloat(this.range.get('max'));

      if (isNaN(rmin) || isNaN(rmax) || rmin > rmax){
        return false;
      }
      else{
        return true;
      }
    },

    renderBaseHistogram: function(){
      if (this.rangeIsValid()){
        this.renderHistogram({
          el: $('.base-histogram', this.el),
          histogram: this.model.get('base_histogram')
        });
      }
    },

    renderFilteredHistogram: function(){
      if (this.rangeIsValid()){
        this.renderHistogram({
          el: $('.filtered-histogram', this.el),
          histogram: this.model.get('filtered_histogram')
        });
      }
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

    getSelection: function(){
      return {
        min: this.selection.get('min'),
        max : this.selection.get('max')
      };
    },

    resetFilters: function(){
      this.selection.set({
        'min': '',
        'max': ''
      });
    },

    onReady: function(){
      this.onSelectionChange();
      this.onRangeChange();
      this.slider.trigger('ready');
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

