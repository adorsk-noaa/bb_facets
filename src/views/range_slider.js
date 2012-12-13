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
      'change input': 'onInputChange'
    },

    input_attrs: ['min', 'max'],

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

      this.initialRender();

      this.range.on('change', this.onRangeChange, this);
      this.selection.on('change', this.onSelectionChange, this);
      this.on('ready', this.onReady, this);

    },

    initialRender: function(){
      $(this.el).html(_.template(template));
      this.$slider = $('.slider', this.el);

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

    onInputChange: function(e){
      var $input = $(e.currentTarget);
      var attr = $input.data('attr');
      var value = parseFloat($input.val());
      this.model.get('range').set(attr, value);
    },

    setInput: function(attr){
      var $input = $(_s.sprintf('input.%s', attr), this.el);
      $input.val(this.model.get('range').get(attr));
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
      var opts = {
        min: this.range.get('min'),
        max: this.range.get('max')
      }
      opts.step = (opts.max - opts.min)/100.0;
      _.each(opts, function(val, opt){
        this.$slider.slider("option", opt, val);
        this.setInput(opt);
      },this);
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

