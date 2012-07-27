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
		}
		
	});

	return FacetCollectionView;
});
		
