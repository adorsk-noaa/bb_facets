define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"./facet",
	"text!./templates/list_facet.html",
		],
function($, Backbone, _, ui, FacetView, template){

	var ListFacetView = FacetView.extend({

		events: {

			// Update model when widget changes.
			"change .facet-choices": "updateRestrictions",

			// Update reset button when widget changes.
			"change .facet-choices": "updateResetButton",

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

			// Make the main container resizeable.
			//
			r = $(".facet-body", $(this.el)).resizable({
				minHeight: 30,
				handles: 's',
				stop: function(event, ui) {
					event.target.style.width = "auto"; // don't force the width
				}
			});
			console.log(ui);

			// Toggle classes on facets when they change.
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
			restrictions = this.getWidgetValues();
			this.model.set({restrictions: restrictions});
		},

		updateResetButton: function(){

			// If anything was checked, show reset button.
			if( $('.facet-choice input[type=checkbox]:checked', $(this.el)) ){
				$('.facet-reset-button', $(this.el)).css('visibility', 'visible');
			}
			// Otherwise hide reset button.
			else{
				$('.facet-reset-button', $(this.el)).css('visibility', 'hidden');
			}
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
			$('.facet-reset-button', $(this.el)).css('visibility', 'hidden');
		}

	});

	return ListFacetView;
});
		
