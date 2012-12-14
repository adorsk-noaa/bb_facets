define([
       "jquery",
       "backbone",
       "underscore",
       "ui",
       "_s",
       "text!./templates/range_slider.html",
],
function($, Backbone, _, ui, _s, template){

  var RangeSliderView = Backbone.View.extend({

    events: {
      'slidestop .slider': 'onSlideStop',
      'change .range-input': 'onRangeInputChange'
    },

    rangeInputAttrs: ['xmin', 'xmax', 'xfit', 'ymin', 'ymax', 'yfit'],

    initialize: function(opts){
      var _this = this;
      opts = opts || {};
      opts = $.extend({}, {
        rangeLabelFormat: '%.1e',
        showFitCheckboxes: false
      }, opts);
      this.rangeLabelFormat = opts.rangeLabelFormat;
      this.showFitCheckboxes = opts.showFitCheckboxes;
      if (opts.formatter){
        this.formatter = opts.formatter;
      }

      $(this.el).addClass('range-slider');

      // Initialize selection and range if not set.
      if (! this.model.get('selection')){
        this.model.set('selection', new Backbone.Model({
          min: null,
          max: null
        }));
      }
      this.selection = this.model.get('selection');

      if (! this.model.get('range')){
        this.model.set('range', new Backbone.Model({
          xmin: 0,
          xmax: 1,
          ymin: 0,
          ymax: 1
        }));
      }
      this.range = this.model.get('range');

      this.initialRender();

      this.onRangeChange();

      this.range.on('change', this.onRangeChange, this);
      this.selection.on('change', this.onSelectionChange, this);
      this.on('ready', this.onReady, this);

    },

    formatter: function(format, value){
      return _s.sprintf(format, value);
    },

    initialRender: function(){
      var _this = this;
      $(this.el).html(_.template(template, {model: this.model}));

      if (! this.showFitCheckboxes){
        $.each(['x', 'y'], function(i, xy){
          $('.' + xy + 'fit-input', _this.el).remove();
        });
      }

      this.$table = $(this.el).find('> table').eq(0);
      this.$table.tabble({
        invertToggleArrows: true
      });
      this.$slider = $('.slider', this.el);

      this.$slider.slider({
        range: true,
        min: this.selection.get('min') || 0,
        max: this.selection.get('max') || 1,
        values: [this.range.get('xmin') || 0, this.range.get('xmax') || 1]
      });
      this.$slider.removeClass('ui-corner-all');

      // Add divs to the left and right of the slider.
      $('.ui-slider-range', this.el).before('<div class="ui-slider-range-left" style="position: absolute;"></div>');
      $('.ui-slider-range', this.el).after('<div class="ui-slider-range-right" style="position: absolute;"></div>');

      // Have divs track the slider.
      var _this = this;
      this.$slider.on('slide', function(){
        _this.updateRangeLeftRight();
      });

    },

    onRangeInputChange: function(e){
      var _this = this;
      var $input = $(e.currentTarget);
      var attr = $input.data('attr');
      var value = null;
      if (attr == 'xfit' || attr == 'yfit'){
        var xy = attr.substr(0,1);
        var value = $input.is(':checked');
        $('.' + xy + '-inputs input[type="text"]', this.el).each(
          function(i, textEl){
            $(textEl).prop('disabled', value);
          }
        );
      }
      else{
        value = parseFloat($input.val());
      }
      this.range.set(attr, value);
    },

    setRangeInput: function(attr){
      var _this = this;
      var value = this.range.get(attr);
      var $input = $(_s.sprintf('.range-input.%s', attr), this.el);
      if ($input.length){
        if ($input.attr('type') == 'checkbox'){
          $input.attr('checked', value);
        }
        else{
          $input.val(value);
        }
      }

      // Set formatted text on tabs for min/max.
      var xy = attr.substr(0,1);
      var minmax = attr.substr(1);
      var $tab = $('.' + xy + 'tab', this.el);
      var formattedValue = ($.isNumeric(value)) ? value.toPrecision(2) : '';
      $tab.find('> h3 > .' + minmax).html(formattedValue);
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

      var set_obj = {};
      // Don't change if slider is at range bounds
      // and currently selected values exceed bounds or are null.
      if ( ! (slider_values[0] == this.range.get('min')
              && (this.selection.get('min') < this.range.get('min') 
                  || this.selection.get('min') == null
                 )
             )
         ){
           set_obj['min'] = slider_values[0];
         }
         if ( ! (slider_values[1] == this.range.get('max')
                 && (this.selection.get('max') > this.range.get('max') 
                     || this.selection.get('max') == null
                    )
                )
            ){
              set_obj['max'] = slider_values[1];
            }

            this.selection.set(set_obj);
    },

    onRangeChange: function(){
      var _this = this;

      // Update range inputs.
      $.each(this.rangeInputAttrs, function(i,attr){
        _this.setRangeInput(attr);
      });

      var opts = {
        min: this.range.get('xmin'),
        max: this.range.get('xmax')
      }
      opts.step = (opts.max - opts.min)/100.0;
      _.each(opts, function(val, opt){
        this.$slider.slider("option", opt, val);
        this.setRangeInput(opt);
      },this);
      this.onSelectionChange();
    },

    onSelectionChange: function(){
      var sanitized = {};
      // Shortcut for range.
      var xRange = {
        min: this.range.get('xmin'),
        max: this.range.get('xmax')
      };
      _.each(['min', 'max'], function(minmax){
        val = parseFloat(this.selection.get(minmax));
        // If invalid or exceeds bound, set to xRange bound.
        if (isNaN(val)){
          sanitized[minmax] = xRange[minmax];
        }
        else if (minmax =='min' && (sanitized.min < xRange.min)){
          sanitized.min = xRange.min;
        }
        else if( minmax == 'max' && (sanitized.max > xRange.max)){
          sanitized.max = xRange.max;
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
      this.$table.tabble('resize');
      this.onRangeChange();
      this.onSelectionChange();
    }

  });

  return RangeSliderView;
});

