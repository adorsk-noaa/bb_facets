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
			"change .facet-choices": "updateRestrictions",

			// Reset choices.
			"click .facet-reset-button": "resetRestrictions"
		},

		initialize: function(){
			FacetView.prototype.initialize.call(this, arguments);
		},

		render: function(){
			this.renderWidget();
			return this;
		},
		
		renderWidget: function(){
			widget_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(widget_html);

			// Toggle class when facets change.
			$('.facet-choice', $(this.el)).on('change', function(event){
				facet_choice_el = event.delegateTarget;
				$(facet_choice_el).toggleClass('facet-choice-selected');
			});
			return this;
		},

		getWidgetValues: function(){
			 widget_values = {};
			 $('.facet-choice input[type=checkbox]:checked', $(this.el)).each(function(i,e){
				 choice_id = $(e).data('choice_id');
				 val = $(e).val();
				 widget_values[choice_id] = val;
			 });
			 return widget_values;
		},

		updateRestrictions: function(){
			console.log('updateRestrictions');
			restrictions = this.getWidgetValues();
			this.model.set({restrictions: restrictions});
		},

		resetRestrictions: function(){

			// Uncheck all selected, and remove selected class.
			$('.facet-choice input[type=checkbox]:checked', $(this.el)).each(function(i,e){
				$(e).prop('checked', false);
				choice_id = $(e).data('choice_id');
				facet_choice_el = $('#facet-choice--' + choice_id);
				facet_choice_el.removeClass('facet-choice-selected');
			});
			this.updateRestrictions();
		}

	});

	return ListFacetView;
});
		
