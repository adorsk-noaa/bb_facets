define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"./facet",
	"text!./templates/list_facet.html",
	"text!./templates/list_facet_choices.html",
		],
function($, Backbone, _, ui, FacetView, template, choices_template){

	var ListFacetView = FacetView.extend({

		events: {

			// Run updates when choices change.
			"change .facet-choice": "onChoiceChange",

			// Reset choices when the rest button is clicked.
			"click .facet-reset-button": "resetRestrictions"
		},

		initialize: function(){
			FacetView.prototype.initialize.call(this, arguments);

			// For keeping track of selected choices.
			this.selected_choices = {};

			// Re-render when choices change.
			this.model.on('change:choices', this.renderChoices, this);
		},

		render: function(){
			this.renderWidget();
			this.renderChoices();
			return this;
		},
		
		renderWidget: function(){
			widget_html = _.template(template, {model: this.model.toJSON()});
			$(this.el).html(widget_html);

			// Make the main container resizeable.
			r = $(".facet-body", $(this.el)).resizable({
				minHeight: 30,
				handles: 's',
				stop: function(event, ui) {
					event.target.style.width = "auto"; // don't force the width
				}
			});


			return this;
		},

		renderChoices: function(){

			// Get choices from model.
			choices = this.model.get('choices');

			// Update choices.
			choices_html = _.template(choices_template, {choices: choices});
			$('.facet-choices', $(this.el)).html(choices_html);

			// Re-select choices which are still present.
			var _this = this;
			$('.facet-choice', $(this.el)).each(function(i, facet_choice_el){
				console.log(facet_choice_el);
				choice_id = $('input[type=checkbox]', $(facet_choice_el)).data('choice_id');
				if (_this.selected_choices[choice_id]){
					$(facet_choice_el).toggleClass('facet-choice-selected');
				}
			});

			// Update choices count.
			$('.choices-count', $(this.el)).html(choices.length);

			this.updateResetButton();

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

		onChoiceChange: function(event){

			// Toggle selected class on choice.
			facet_choice_el = event.currentTarget;
			$(facet_choice_el).toggleClass('facet-choice-selected');

			// Toggle choice selection state.
			choice_id = $('input[type=checkbox]', $(facet_choice_el)).data('choice_id');
			this.selected_choices[choice_id] = ! this.selected_choices[choice_id];

			this.updateRestrictions();
			this.updateResetButton();
		},

		updateRestrictions: function(){
			restrictions = _.values(this.getWidgetValues());
			this.model.set({restrictions: restrictions});
		},

		updateResetButton: function(){
			// If anything was checked, show reset button.
			if( $('.facet-choice input[type=checkbox]:checked', $(this.el)).length > 0 ){
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
			this.update();
		}

	});

	return ListFacetView;
});
		
