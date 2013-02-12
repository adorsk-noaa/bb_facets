define([
       // libs
       "jquery",
       "backbone",
       "underscore",
       "ui",
       "_s",
       "./facet",
       "text!./templates/list_facet_choices.html",
],
function($, Backbone, _, ui, _s, FacetView, choices_template){

  var ListFacetView = FacetView.extend({

    events: _.extend({}, FacetView.prototype.events, {
      "change .facet-choice": "onChoiceWidgetChange",
      "click .facet-reset-button": "resetFilters"
    }),

    initialize: function(opts){

      if (this.model.get('selection') == null){
        this.model.set('selection', new Backbone.Model());
      }
      this.selection = this.model.get('selection');

      this.choice_controls = _.extend({}, {
        'toggle': true,
      }, opts.choice_controls);

      FacetView.prototype.initialize.call(this, arguments);
      $(this.el).addClass("list-facet");


      this.postInitialize();
    },

    initialRender: function(){
      var _this = this;
      FacetView.prototype.initialRender.call(this, arguments);

      // Make resizable.
      FacetView.prototype.makeResizeable.call(this);

      // Add reset control to title controls.
      this.addResetButton();

      // Add choice count to status.
      var $count = $('<span><span class="choices-count"></span> choices</span>');
      $count.appendTo($('.facet-status', this.el));

      // Add choices container to body.
      var $choices = $('<div class="facet-choices"></div>');
      $choices.appendTo($('.facet-body > .inner', this.el));

      // Render initial choices.
      this.renderChoices();
    },

    postInitialize: function(){
      FacetView.prototype.postInitialize.call(this, arguments);

      // Re-render when choices or total or selection changes.
      this.model.on('change:choices change:total', this.renderChoices, this);
      this.selection.on('change', this.onSelectionChange, this);

    },

    // Default choice formatter.
    formatChoices: function(choices){
      if (! choices || choices.length == 0){
        return [];
      }

      var formatted_choices = [];

      // Get count images.
      var choice_count_images =this.formatChoiceCountImages(choices);

      // Format each choice...
      _.each(choices, function(choice, i){

        // Keep original id and label.
        formatted_choice = {
          widget_id: this.getChoiceWidgetId(choice.id),
          id: choice['id'],
          label: this.formatter(choice['label']),
          count_label: this.formatter(choice['count_label'] || choice['count'])
        };

        // Add image.
        formatted_choice['count_image'] = choice_count_images[i];

        formatted_choices.push(formatted_choice);
      }, this);

      var sortBy = this.model.get('sort_by') || 'label';
      var sortedChoices = _.sortBy(formatted_choices, function(choice){
        return choice[sortBy];
      });

      return sortedChoices;
    },

    formatChoiceCountImages: function(choices){
      var qField = this.model.get('quantity_field');
      var scale_type = 'sequential';
      if (qField && qField.get('scale_type')){
        scale_type = qField.get('scale_type');
      }
      if (scale_type  == 'diverging'){
        return this.formatDivergingChoiceImages(choices);
      }
      else{
        return this.formatSequentialChoiceImages(choices);
      }
    },

    formatDivergingChoiceImages: function(choices){
      var qField = this.model.get('quantity_field');
      var images = [];
      var mid = qField.get('scale_mid') || 0;
      var total = this.model.get('total');
      if (! $.isNumeric(total)){
        total = 0;
      }

      var r = Math.abs(total);

      _.each(choices, function(choice, i){
        var scale = (total == 0 || r == 0) ? 0 : choice['count']/r;
        var neg = (scale < 0);
        var $sbContainer = $('<span class="scalebar-container diverging"></span>');
        $('<span class="scalebar-fill mid-line"></span>').appendTo($sbContainer);
        var $sbFill = $('<span class="scalebar-fill"></span>').appendTo($sbContainer);
        var right = neg ? '50%' : '';
        var left = neg ? '' : '50%';
        $sbFill.toggleClass('negative', neg);
        $sbFill.css({
          left: left,
          right: right,
          width: Math.abs((scale * 50)) + '%',
        })
        images.push($sbContainer[0].outerHTML);
      });
      return images;
    },

    formatSequentialChoiceImages: function(choices){
      var images = []
      var total = this.model.get('total');
      _.each(choices, function(choice){
        var scale = (total == 0) ? 0 : choice['count']/total;
        var $sbContainer = $('<span class="scalebar-container sequential"></span>');
        var $sbFill = $('<span class="scalebar-fill"></span>').appendTo($sbContainer);
        $sbFill.css({
          left: 0,
          width: (scale * 100) + '%'
        });
        images.push($sbContainer[0].outerHTML);
      });
      return images;
    },

    renderChoices: function(){
      // Get choices from the model.
      choices = this.model.get('choices');

      // Format the choices.
      this.formattedChoices = this.formatChoices(choices);

      // Update choice elements.
      choices_html = _.template(choices_template, {choices: this.formattedChoices, choice_controls: this.choice_controls});
      $('.facet-choices', $(this.el)).html(choices_html);

      // Re-select choices which are still present.
      var _this = this;
      $('.facet-choice', $(this.el)).each(function(i, facet_choice_el){
        choice_id = $('input[type=checkbox]', facet_choice_el).data('choice_id');
        if (_this.selection.get(choice_id)){
          $(facet_choice_el).toggleClass('selected');
          $('input[type=checkbox]', facet_choice_el).attr('checked', true);
        }
      });

      // Update choices count.
      var choiceCount = 0;
      if (choices && choices.length){
        choiceCount = choices.length;
      }
      $('.choices-count', $(this.el)).html(choiceCount);

      this.onSelectionChange();
      this.updateResetButton();
    },

    getSelection: function(){
      var selection = [];
      _.each(this.selection.toJSON(), function(formattedChoice){
        selection.push(formattedChoice);
      });
      return selection;
    },

    onChoiceWidgetChange: function(event){
      $choice_widget = $(event.currentTarget);
      var choice_id = $('input[type=checkbox]', $choice_widget).data('choice_id');
      var selected = $choice_widget.hasClass('selected');

      // Toggle state in selection model.
      if (selected){
        this.selection.unset(choice_id);
      }
      else{
        var formattedSelection;
        for (var i in this.formattedChoices){
          var formattedChoice = this.formattedChoices[i];
          if (formattedChoice.id == choice_id){
            formattedSelection = formattedChoice;
            break;
          }
        }
        this.selection.set(choice_id, formattedSelection);
      }
    },

    onSelectionChange: function(){
      _.each(this.model.get('choices'), function(choice){
        $choice_widget = this.getChoiceWidgetById(choice.id);
        var selected = Boolean(this.selection.get(choice.id));
        this.setChoiceWidgetState($choice_widget, selected);
      }, this);

      this.updateResetButton();
      this.updateFilters();
    },

    setChoiceWidgetState: function($choice_widget, selected){
      if (selected){
        $choice_widget.addClass('selected');
        $('input[type=checkbox]', $choice_widget).attr('checked', true);
      }
      else{
        $choice_widget.removeClass('selected');
        $('input[type=checkbox]', $choice_widget).removeAttr('checked');
      }
    },

    getChoiceWidgetId: function(choice_id){
      return _s.sprintf("facet-choice--facet-%s--choice-%s", this.model.cid, choice_id);
    },

    getChoiceWidgetById: function(choice_id){
      var widget_id = this.getChoiceWidgetId(choice_id);
      $facet_choice = $('#' + widget_id);
      return $facet_choice;
    },

    updateResetButton: function(){
      // If anything was checked, show reset button.
      var numSelections = _.size(this.selection.toJSON());
      var visibility = numSelections ? 'visible' : 'hidden';
      $('.facet-reset-button', this.el).css('visibility',  visibility);
    },

    resetFilters: function(){
      this.selection.clear();
      this.updateFilters();
    }

  });

  return ListFacetView;
});

