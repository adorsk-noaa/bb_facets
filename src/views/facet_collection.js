define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"text!./templates/facet_collection.html",
		],
function($, Backbone, _, ui, template){

	var FacetCollectionView = Backbone.View.extend({

		initialize: function(){
			this.renderFacetContainer();
			this.model.on('change:selection', this.onSelectionChange, this);
		},

		renderFacetContainer: function(){
			form_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(form_html);
			$('.facet-widgets', this.el).sortable({handle: '.facet-header'});
			return this;
		},

		addFacetView: function(facet_view) {
			$(".facet-widgets", $(this.el)).append(facet_view.el);
			facet_view.render();
			$('.facet-widgets', this.el).sortable('refresh');
		},	

		onSelectionChange: function(event_source){
			this.updateFacets({event_source: event_source});
		},

		updateFacets: function(opts){
			opts = opts || {};
			this.model.each(function(m){

				var combined_selections = this.model.getSelections();
				
				// Update facets except for facet which triggered the change.
				if ( opts.force || (m.cid != opts.event_source.id) ){

					// Facets should not use their own selections as filters.
					var filters = [];
					_.each(combined_selections, function(v, k){
						if (k != m.cid){
							filters = filters.concat(v);
						}
					});
					m.set({filters: filters}, {silent: true});

                    if (m.getData){
                        m.getData();
                    }
				}
			} ,this);

		}
		
	});

	return FacetCollectionView;
});
		
