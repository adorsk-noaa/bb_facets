define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"./facet",
	"text!./templates/list_facet.html",
		],
function($, Backbone, _, FacetView, template){

	var ListFacetView = FacetView.extend({

		events: {
			// Update model when widget changes.
		},

		initialize: function(){
			FacetView.prototype.initialize.call(this, arguments);
			this.renderWidget();
		},
		
		renderWidget: function(){
			widget_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(widget_html);
			return this;
		},

		getWidgetValues: function(){
		},

		updateRestrictions: function(){
		}

	});

	return ListFacetView;
});
		
