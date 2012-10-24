define([
	"jquery",
	"backbone",
	"underscore",
	"ui",
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
                // Get the facet view.
                var facetView = this.registry[model.id];

                // Trigger removeFacetView event.
                this.trigger('removeFacetView', facetView);

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
                this.registry[facetModel.id] = facetView;

                // Add facet view.
                this.addFacetView(facetView);
            }
        },

        getFacetViewClass: function(facetModel){
            return facetViewClasses[facetModel.get('type')];
        },

        createFacetView: function(facetModel){
            var viewClass = this.getFacetViewClass(facetModel);
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

            // Trigger addFacetView event.
            this.trigger('addFacetView', facetView);
		}
		
	});

	return FacetCollectionView;
});
		
