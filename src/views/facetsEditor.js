define(
  [
    "jquery",
    "backbone",
    "underscore",
    "_s",
    "ui",
    "Menus",
    "tabble",
    "Util",
    "./facet_collection",
    "./summaryBar",
    "text!./templates/facetsEditor.html"
],
function($, Backbone, _, _s, ui, Menus, Tabble, Util, FacetCollectionView, SummaryBarView, template){

  var FacetsEditorView = Backbone.View.extend({
    initialize: function(){
      $(this.el).addClass('facets-editor');

      // Initialize sub-collections if not provided.
      _.each(['quantity_fields', 'facets', 'predefined_facets'], function(attr){
        var collection = this.model.get(attr);
        if (! collection){
          collection = new Backbone.Collection();
          this.model.set(attr, collection);
        }
      }, this);

      // Initialize summary bar model if not provided.
      var summaryBarModel = this.model.get('summary_bar');
      if (! summaryBarModel){
        this.model.set('summary_bar', new Backbone.Model());
      }

      // Initialize qfield selector model if not provided.
      // @TODO: should probably encapsulate this as
      // 'this.model.get('selected_quantity_field') later...
      /*
      var qFieldSelectModel = this.model.get('qfield_select');
      if (! qFieldSelectModel){
        // Create choices.
        var choices = this.formatQFieldChoices();
        // Create model.
        qFieldSelectModel = new Backbone.Model({
          choices: choices
        });
        this.model.set('qfield_select', qFieldSelectModel);
      }
      */

      // Registry for sub-views.
      this.subViews = {};

      this.initialRender();

      // Listen for ready events.
      this.on('ready', this.onReady, this);

      // Listen for qfield change events.
      this.model.on('change:selected_qfield', this.onSelectedQFieldChange, this);

      // Listen for resize events.
      this.on('resize', this.resize, this);
      this.on('resizeStop', this.resizeStop, this);
    },

    initialRender: function(){
      $(this.el).html(_.template(template, {model: this.model}));
      this.$table = $(this.el).find('> table').eq(0);
      this.$table.tabble({
        stretchTable: true
      });

      this.renderSelectParameterMenu();

      // Render summary bar.
      this.subViews.summaryBar = new SummaryBarView({
        el: $('.summary-bar', this.el),
        model: this.model.get('summary_bar')
      });

      // Render facet collection.
      var collection_view_class = this.getFacetCollectionViewClass();
      var view = new collection_view_class({
        el: $('.facets', this.el),
        model: this.model.get('facets')
      });
      this.subViews.facets = view;

      // Render add facets menu.
      this.renderAddFacetsMenu();

      // Do initial resize.
      this.resize();
      this.resizeStop();
    },

    // This is intended to be overriden to allow
    // for formatting decoration.
    formatter: function(s){
      return s;
    },

    getFacetCollectionViewClass: function(){
      return FacetCollectionView;
    },

    renderSelectParameterMenu: function(){

      // Define a function that adds a facet to the facet collection,
      // given a facet definition.
      var _this = this;

      // Format menu items from quantity fields.
      var menuItems = [];

      _.each(this.model.get('quantity_fields').models, function(qfieldModel){
        var $content = $('<div>' + qfieldModel.get('label') + '</div>');
        // Assign select parameter function to content.
        $content.on('click', function(){
          (function(qfieldModel){
            _this.model.set('selected_qfield', qfieldModel);
          })(qfieldModel);
        });
        var menuItem = {
          content: $content,
          id: qfieldModel.id
        };

        // Add menu item to list.
        menuItems.push(menuItem);
      }, this);

      // Create menu with 'Select Parameter..' menu item.
      var menu = {
        items: [{content: 'Select Parameter...', items: menuItems}]
      };

      // Create menu model.
      var menuModel = new Backbone.Model({
        menu: menu
      });

      // Create menu view.
      var menuView = new Menus.views.TooltipMenuView({
        el: $('.select-parameter-button', this.el),
        model: menuModel
      });

    },

    renderAddFacetsMenu: function(){

      // Define a function that adds a facet to the facet collection,
      // given a facet definition.
      var _this = this;
      var addFacet = function(facetModel){
        _this.model.get('facets').add(facetModel);
      };

      // Format menu items from predefined facets.
      var menuItems = [];
      _.each(this.model.get('predefined_facets').models, function(facetDef){
        var $content = $('<div>' + facetDef.get('facetDef').label + '</div>');
        // Assign create facet function to content.
        $content.on('click', function(){
          (function(def){
            // Create model from definition.
            var facetModel = _this.createFacetModelFromDef(def.get('facetDef'));
            addFacet(facetModel);
          })(facetDef);
        });
        var menuItem = {
          content: $content,
          id: facetDef.id
        };

        // Add menu item to list.
        menuItems.push(menuItem);
      }, this);

      // Create menu with 'Add Facet..' menu item.
      var menu = {
        items: [{content: 'Add Facet', items: menuItems}]
      };

      // Create menu model.
      var menuModel = new Backbone.Model({
        menu: menu
      });

      // Create menu view.
      var menuView = new Menus.views.TooltipMenuView({
        el: $('.add-facet-button', this.el),
        model: menuModel
      });

    },

    createFacetModelFromDef: function(facetDef){
      var facetModel = new Backbone.Model(_.extend({
      }, facetDef));

      // Set id if none was given.
      if (! facetModel.get('id')){
        facetModel.set('id', facetModel.cid);
      }

      return facetModel;
    },

    onSelectedQFieldChange: function(){
      var qfieldModel = this.model.get('selected_qfield');
      $('.selected-parameter-title', this.el).html(qfieldModel.get('label'));
    },

    resize: function(){
      _.each(this.subViews, function(subView){
        subView.trigger('resize');
      });
    },

    resizeStop: function(){
      this.$table.tabble('resize');
      _.each(this.subViews, function(subView){
        subView.trigger('resizeStop');
      });
    },

    onReady: function(){
      this.resize();
      this.resizeStop();
      _.each(this.subViews, function(subView){
        subView.trigger('ready');
      });
    }

  });

  return FacetsEditorView;
});

