define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
    "./facetViewClasses",
	"text!./templates/facet_collection.html",
		],
function($, Backbone, _, ui, facetViewClasses, template){

	var FacetCollectionView = Backbone.View.extend({

		initialize: function(){

            // Registry.
            this.registry = {};

            // Initial render.
            this.initialRender();

            // Listen for add/remove events.
            this.model.on('add', function(model, collection, idx){
                this.addFacet(model);
            }, this);

            this.model.on('destroy', function(model, collection){
                // Unregister the facet.
                delete this.registry[model.id];
            }, this);
		},
        
        initialRender: function(){
            // Setup facet container.
            this.renderFacetContainer();

            // Add initial facets.
            _.each(this.model.models, function(facetModel){
                this.addFacet(facetModel);
            }, this);
        },

		renderFacetContainer: function(){
			form_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(form_html);
			$('.facet-widgets', this.el).sortable({
                handle: '.facet-header',
                containment: this.el
            });
			return this;
		},

        addFacet: function(facetModel){
            var facetView = this.createFacetView(facetModel);
            if (facetView){
                // Add to registry.
                this.registry[facetModel.id] = {
                    model: facetModel,
                    view: facetView
                };
                // Add facet view.
                this.addFacetView(facetView);
            }
        },

        createFacetView: function(facetModel){
            var viewClass = facetViewClasses[facetModel.get('type')];
            if (viewClass){
                return new viewClass({
                    model: facetModel
                });
            }
        },

		addFacetView: function(facetView) {
			$(".facet-widgets", $(this.el)).append(facetView.el);
			facetView.render();
			$('.facet-widgets', this.el).sortable('refresh');
		}
		
	});

	return FacetCollectionView;
});
		
