define([
       // libs
       "jquery",
       "backbone",
       "underscore",
       "_s",
       "text!./templates/facet.html",
],
function($, Backbone, _, _s, template){

  var FacetView = Backbone.View.extend({

    events: {
      'click .close-button' : 'remove'
    },

    initialize: function(opts){
      $(this.el).addClass("facet");
      $(this.el).attr("id", _s.sprintf("facet-%s", this.model.cid));

      this.initialRender();
    },

    initialRender: function(){
      var html = _.template(template, {model: this.model});
      $(this.el).html(html);

      // If facet can be closed, add close button.
      if (! this.model.get('noClose')){
        $('.facet-header .close-cell', this.el).append('<span class="close-button"></span>');
      }

      // If facet has info or info link, add info control.
      var infoLink = this.model.get('infoLink');
      var info = this.model.get('info');
      if (infoLink || info){
        var $info = $(_s.sprintf('<a class="control facet-info-button info-button" href="javascript:{}">info</a>'));
        $info.appendTo($('.facet-header .controls-cell', this.el));
        if (infoLink){
          $info.attr('href', this.formatter(infoLink));
          $info.attr('target', '_blank');
        }
        else{
          var $info_content = $(_s.sprintf('<div class="content">%s</div>', this.formatter(info)));
          $info_content.appendTo($info);
        }
      }
    },

    // Format a content string.
    // This is here to be overridden, e.g. for replacing tokens in strings.
    formatter: function(s){
      return s;
    },

    postInitialize: function(){
    },

    // This method should be overriden.
    getSelection: function(){
    },

    // This function will likely be overriden.
    updateFilters: function(){
      var selection = this.getSelection();
      this.model.set('filters', this.formatFilters(selection));
    },

    // This function will likely be overriden in the facet's application context.
    formatFilters: function(selection){
      return selection;
    },

    addResetButton: function(){
      this.$reset = $('<a class="control facet-reset-button" href="javascript:{}" style="visibility:hidden;">reset</a>');
      this.$reset.appendTo($('.facet-header .controls-cell', this.el));
    },

    addInfoButton: function(){
    },

    makeResizeable: function(){
      $(".facet-body", $(this.el)).resizable({
        minHeight: 30,
        handles: 's',
        stop: function(event, ui) {
          event.target.style.width = "auto"; // don't force the width
        }
      });
    },

    remove: function(){
      Backbone.View.prototype.remove.apply(this, arguments);
      this.model.trigger('destroy', this.model, this.model.collection);
      this.off()
    }

  });

  return FacetView;
});

