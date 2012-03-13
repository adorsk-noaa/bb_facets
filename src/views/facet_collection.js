define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"text!./templates/facet_collection.html",
	"./radio_select_facet"
		],
function($, Backbone, _, template, RadioSelectFacetView){

	var FacetCollectionView = Backbone.View.extend({

		initialize: function(){
			this.model.on('reset', this.renderForm, this);
			this.model.on('reset', this.addAll, this);
			this.model.fetch();
			//this.renderFacetSet();
		},

		renderFacetSet: function(){
			console.log("renderForm");
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
				return new RadioSelectFacetView({
					model: facet
				});
			}
		},
		
	});

	return FacetCollectionView;
});
		
