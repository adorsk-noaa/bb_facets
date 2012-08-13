define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"Menus",
	"Util",
	"./facet_collection",
	"./summaryBar",
	"text!./templates/facetsEditor.html"
		],
function($, Backbone, _, _s, ui, Menus, Util, FacetCollectionView, SummaryBarView, template){

	var FacetsEditorView = Backbone.View.extend({
        events: {
            'click .tab .title': 'toggleConfigurationEditor',
        },

		initialize: function(){
            $(this.el).addClass('facets-editor');

            // Initialize sub-collections if not provided.
            _.each(['quantity_fields', 'base_facets', 'primary_facets', 'predefined_facets'], function(attr){
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

            // Registry for sub-views.
            this.subViews = {};

            this.initialRender();

            // Listen for ready events.
            this.on('ready', this.onReady, this);
		},

        initialRender: function(){
            var html = _.template(template, {model: this.model});
            $(this.el).html(html);

            this.qFieldSelect = new Util.views.InfoSelectView({
                el : $('.quantity-field-selector', this.el),
                model: this.model.get('qfield_select')
            });

            // Render summary bar.
            this.subViews.summaryBar = new SummaryBarView({
                el: $('.summary-bar', this.el),
                model: this.model.get('summary_bar')
            });

            // Render facet collections.
            _.each(['base', 'primary'], function(facetCategory){
                var view = new FacetCollectionView({
                    el: $('.' + facetCategory + '-facets', this.el),
                    model: this.model.get(facetCategory + '_facets')
                });
                this.subViews[facetCategory + '_facets'] = view;
            }, this);

            // Render add primary facets menu.
            this.renderAddFacetsMenu();

            // Do initial resize.
            this.resize();
        },

        renderAddFacetsMenu: function(){

            // Define a function that adds a facet to the primary facet collection,
            // given a facet definition.
            var _this = this;
            var addPrimaryFacet = function(facetModel){
                _this.model.get('primary_facets').add(facetModel);
            };

            // Format menu items from predefined facets.
            var menuItems = [];
            _.each(this.model.get('predefined_facets').models, function(facetDef){
                var $content = $('<span>' + facetDef.get('facetDef').label + '</span>');
                // Assign create facet function to content.
                $content.on('click', function(){
                    (function(def){
                        // Create model from definition.
                        var facetModel = _this.createFacetModelFromDef(def.get('facetDef'));
                        addPrimaryFacet(facetModel);
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
                el: $('.add-primary-facet-button', this.el),
                model: menuModel
            });

        },

        formatQFieldChoices: function(){
            var choices = [];
            _.each(this.model.get('quantity_fields').models, function(model){
                choices.push({
                    value: model.id,
                    label: model.get('label'),
                    info: model.get('info')
                });
            }, this);
            return choices;
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

        toggleConfigurationEditor: function(){
            var $tab = $('.tab', this.el);
            var $editorCell = $('.configuration-editor-cell', this.el);
            var $table = $('> .inner > .body > .table', this.el);

            // Do nothing if currently changing.
            if ($editorCell.hasClass('changing')){
                return;
            }


            // Calculate how much to change dimension.
            var delta = parseInt($editorCell.css('maxWidth'), 10) - parseInt($editorCell.css('minWidth'), 10);
            // Determine whether to expand or contract.
            var expanded = $editorCell.hasClass('expanded');
            if (expanded){
                delta = -1 * delta;
            }


            // Toggle button text
            var button_text = ($('button.toggle', $tab).html() == '\u25B2') ? '\u25BC' : '\u25B2';
            $('button.toggle', $tab).html(button_text);

            // Execute animations and save deferreds.
            var deferreds = [];

            // Animate field container dimension.

            $editorCell.addClass('changing');

            var deferreds = [];

            var cellDeferred = $editorCell.animate(
                    {
                        width: $editorCell.width() + delta
                    },
                    {
                        complete: function(){
                            $editorCell.removeClass('changing');

                            if (! expanded){
                                $editorCell.addClass('expanded')
                            }
                            else{
                                $editorCell.removeClass('expanded');
                            }
                        }
                    }
                    ).promise();

            deferreds.push(cellDeferred);

            // Animate table dimension.
            var tableDeferred = $table.animate(
                    {
                        width: $table.width() + delta
                    }
                    ).promise();
            deferreds.push(tableDeferred);

            // Return combined deferred.
            return $.when.apply($, deferreds);
        },

        resize: function(){
            var $table = $('.facets-editor-table', this.el);
            Util.util.fillParent($table);
            this.resizeVerticalTab($('.tab', this.el)); 
        },

        resizeVerticalTab: function($vt){
            var $rc = $('.rotate-container', $vt);
            $rc.css('width', $rc.parent().height());
            $rc.css('height', $rc.parent().width());
        },

        onReady: function(){
            _.each(this.subViews, function(subView){
                subView.trigger('ready');
            });
        }

	});

	return FacetsEditorView;
});
		
