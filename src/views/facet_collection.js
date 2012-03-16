define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"text!./templates/facet_collection.html",
	"./radio_select_facet",
	"./list_facet"
		],
function($, Backbone, _, template, RadioSelectFacetView, ListFacetView){

	var FacetCollectionView = Backbone.View.extend({

		initialize: function(){
			this.renderFacetCollection();
			this.model.on('reset', this.addAll, this);
			this.model.on('change:restrictions', this.updateFacets, this);
		},

		renderFacetCollection: function(){
			form_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(form_html);
			return this;
		},

		addOne: function(facet) {
		  var view = this.getViewForFacet(facet);
		  widget_el = view.render().el;
		  $(".facet-widgets", $(this.el)).append(widget_el);
		},	

		addAll: function() {
		  this.model.each(this.addOne, this);
		},

		getViewForFacet: function(facet){

			// Select facets.	
			if (facet.get('type') == 'select'){
				return new RadioSelectFacetView({
					model: facet
				});
			}

			// Multiselect facets.	
			if (facet.get('type') == 'multiselect'){
				return new ListFacetView({
					model: facet
				});
			}
		},

		// @TODO: perhaps temporarily unbind the change listener, then rebind?
		updateFacets: function(event_source){
			this.model.each(function(m){

				// Get combined restrictions.
				combined_restrictions = this.model.getRestrictions();

				// Update facets except for facet which triggered the change.
				if (m.id != event_source.id){

					// Set facet parameters to be combined facet restrictions
					// sans the restrictions for the facet itself.
					parameters = {};
					_.each(combined_restrictions, function(v, k){
						if (k != m.id){
							parameters[k] = v;
						}
					});
					m.set({parameters: parameters}, {silent: true});
					m.fetch();
				}
			} ,this);

		}
		
	});

	return FacetCollectionView;
});
		
