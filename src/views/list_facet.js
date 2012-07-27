define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./facet",
	"text!./templates/list_facet_choices.html",
		],
function($, Backbone, _, ui, _s, FacetView, choices_template){

	var ListFacetView = FacetView.extend({

		events: {
			"change .facet-choice": "onChoiceChange",
			"click .facet-reset-button": "resetFilters"
		},

		initialize: function(opts){

			this.choice_controls = _.extend({}, {
				'toggle': true,
			}, opts.choice_controls);

			FacetView.prototype.initialize.call(this, arguments);
            $(this.el).addClass("list-facet");

			// For keeping track of selected choices.
			this.selected_choices = {};

			// Re-render when choices or total changes.
			this.model.on('change:choices change:total', this.renderChoices, this);

            this.postInitialize();
		},

        postInitialize: function(){
            FacetView.prototype.postInitialize.call(this, arguments);

            // Make resizable.
			FacetView.prototype.makeResizeable.call(this);

            // Add reset control to title controls.
            this.addResetButton();

            // Add choice count to status.
            var $count = $('<span><span class="choices-count"></span> choices</span>');
            $count.appendTo($('.facet-status', this.el));

            // Add choices container to body.
            var $choices = $('<div class="facet-choices"></div>');
            $choices.appendTo($('.facet-body > .inner', this.el));
        },
		
		// Default choice formatter.
		formatChoices: function(choices){
			if (choices.length == 0){
				return choices;
			}

			var formatted_choices = [];

			// Get count images.
			var choice_count_images =this.formatChoiceCountImages(choices);

			// Format each choice...
			_.each(choices, function(choice, i){

				// Keep original id and label.
				formatted_choice = {
                    widget_id: _s.sprintf("facet-%s--choice-%s", this.model.cid, choice.id),
					id: choice['id'],
					label: choice['label'],
                    count_label: choice['count_label'] || choice['count']
				};

				// Add image.
				formatted_choice['count_image'] = choice_count_images[i];
				
				formatted_choices.push(formatted_choice);
			}, this);

			return formatted_choices;
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
			choices_html = _.template(choices_template, {choices: formatted_choices, choice_controls: this.choice_controls});
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

		getWidgetValue: function(){
			 widget_values = [];
			 $('.facet-choice input[type=checkbox]:checked', $(this.el)).each(function(i,e){
				 choice_id = $(e).data('choice_id');
				 val = $(e).val();
				 widget_values.push(val);
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

			this.updateFilters();
			this.updateResetButton();
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
			this.updateFilters();
		}

	});

	return ListFacetView;
});
		
