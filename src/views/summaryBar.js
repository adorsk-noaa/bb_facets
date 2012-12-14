define(
  [
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "Util",
    "text!./templates/summaryBar.html"
],
function($, Backbone, _, _s, ui, Util, template){

  var SummaryBarView = Backbone.View.extend({

    initialize: function(opts){
      // Set default formatter if none given.
      if (! opts.formatter){
        this.formatter = _s.sprintf;
      }

      this.initialRender();

      // Trigger update when model data changes.
      this.model.on('change:data', this.onDataChange, this);

      // Listen for ready events.
      this.on('ready', this.onReady, this);

      // Listen for resize events.
      this.on('resize', this.resize, this);
      this.on('resizeStop', this.resizeStop, this);
    },

    initialRender: function(){
      $(this.el).html(_.template(template));
    },

    onDataChange: function(){
      var data = this.model.get('data');

      // Do nothing if data is incomplete.
      if (! data || data.selected == null || data.total == null){
        return;
      }

      var format = '%s';
      var qField = this.model.get('quantity_field');
      if (qField){
        format = qField.get('format');
      }

      var formatted_selected = this.formatter(format, data.selected);
      var formatted_total = this.formatter(format, data.total);
      var percentage;
      if (data.total == 0 && data.selected == 0){
        percentage = 100.0;
      }
      else{
        percentage = 100.0 * data.selected/data.total;
      }

      $(".text .selected", this.el).html(formatted_selected);
      $(".text .total", this.el).html(_s.sprintf('(<span class="pct">%.1f%%</span> of %s total)', percentage, formatted_total));
      $('.scalebar-fill', this.el).css('width', percentage + '%');

      this.trigger('change:size');

    },

    // Update display on ready.
    onReady: function(){
      this.onDataChange();
    }


  });

  return SummaryBarView;
});

