define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./facet",
	"text!./templates/list_facet.html",
	"text!./templates/list_facet_choices.html",
		],
function($, Backbone, _, ui, _s, FacetView, template, choices_template){

	var ListFacetView = FacetView.extend({

		events: {

			// Run updates when choices change.
			"change .facet-choice": "onChoiceChange",

			// Reset choices when the rest button is clicked.
			"click .facet-reset-button": "resetFilters"
		},

		initialize: function(opts){

			this.controls = opts.controls || {
				'toggle': true,
				'info': true
			};

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

			FacetView.prototype.makeResizeable.call(this);
		},


		// Default choice formatter.
		formatChoices: function(choices){
			if (choices.length == 0){
				return choices;
			}

			var formatted_choices = [];

			// Get count labels.
			var choice_count_labels = this.formatChoiceCountLabels(choices);

			// Get count images.
			var choice_count_images =this.formatChoiceCountImages(choices);

			// Format each choice...
			_.each(choices, function(choice, i){

				// Keep original id and label.
				formatted_choice = {
					id: choice['id'],
					label: choice['label'],
				};

				// Add count label and image.
				formatted_choice['count_label'] = choice_count_labels[i];
				formatted_choice['count_image'] = choice_count_images[i];
				
				formatted_choices.push(formatted_choice);
			});

			return formatted_choices;
		},

		formatChoiceCountLabels: function(choices){
			var choice_count_labels = [];
			_.each(choices, function(choice){
				choice_count_labels.push(choice['count']);	
			});

			return choice_count_labels;
		},

		formatChoiceCountImages: function(choices){
			var choice_count_images= [];

			var total = this.model.get('total');

			_.each(choices, function(choice){
				var scale = choice['count']/total;
				choice_count_images.push(_s.sprintf("<span class='scalebar-container'><span class='scalebar-fill' style='display: block; width:%s%%;'>&nbsp;</span></span>", Math.round(scale * 100)));
			});
			return choice_count_images;
		},

		renderChoices: function(){
			// Get choices from the model.
			choices = this.model.get('choices');

			// Format the choices.
			formatted_choices = this.formatChoices(choices);

			// Update choice elements.
			choices_html = _.template(choices_template, {choices: formatted_choices, controls: this.controls});
			$('.facet-choices', $(this.el)).html(choices_html);

			// Re-select choices which are still present.
			var _this = this;
			$('.facet-choice', $(this.el)).each(function(i, facet_choice_el){
				choice_id = $('input[type=checkbox]', $(facet_choice_el)).data('choice_id');
				if (_this.selected_choices[choice_id]){
					$(facet_choice_el).toggleClass('selected');
					$('input[type=checkbox]', $(facet_choice_el)).attr('checked', true);
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
			$(facet_choice_el).toggleClass('selected');

			// Toggle choice selection state.
			choice_id = $('input[type=checkbox]', $(facet_choice_el)).data('choice_id');
			this.selected_choices[choice_id] = ! this.selected_choices[choice_id];

			this.updateSelection();
			this.updateResetButton();
		},

		updateSelection: function(){
			selected_values = _.keys(this.getWidgetValues());
			selection = [];
			if (selected_values.length > 0){
				selection = [{entity: {expression: this.model.get('grouping_entity').expression}, op: 'in', value: selected_values}];
			}
			this.model.set({selection: selection});
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

		resetFilters: function(){

			// Uncheck all selected, and remove selected class.
			$('.facet-choice input[type=checkbox]:checked', $(this.el)).each(function(i,e){
				$(e).prop('checked', false);
				choice_id = $(e).data('choice_id');
				facet_choice_el = $('#facet-choice--' + choice_id);
				facet_choice_el.removeClass('selected');
			});
			this.selected_choices = {};
			this.updateSelection();
		}

	});

	return ListFacetView;
});
		
