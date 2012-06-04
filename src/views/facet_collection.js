define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"text!./templates/facet_collection.html",
	"./radio_select_facet",
	"./list_facet"
		],
function($, Backbone, _, ui, template, RadioSelectFacetView, ListFacetView){

	var FacetCollectionView = Backbone.View.extend({

		initialize: function(){
			this.renderFacetContainer();
			this.model.on('change:filters', this.updateFacets, this);
		},

		renderFacetContainer: function(){
			form_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(form_html);
			$('.facet-widgets', this.el).sortable({handle: '.facet-title'});
			return this;
		},

		addFacetView: function(facet_view) {
			$(".facet-widgets", $(this.el)).append(facet_view.el);
			facet_view.render();
			$('.facet-widgets', this.el).sortable('refresh');
		},	

		updateFacets: function(event_source){
			this.model.each(function(m){

				var combined_filters = this.model.getFilters();

				// Update facets except for facet which triggered the change.
				if (m.id != event_source.id){

					// Facets should not use their own filters.
					var filters = {};
					_.each(combined_filters, function(v, k){
						if (k != m.id){
							parameters[k] = v;
						}
					});
					m.set({filters: filters}, {silent: true});
					m.getData();
				}
			} ,this);

		}
		
	});

	return FacetCollectionView;
});
		
