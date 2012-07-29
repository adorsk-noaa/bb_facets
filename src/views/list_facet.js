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
			"change .facet-choice": "onChoiceWidgetChange",
			"click .facet-reset-button": "resetFilters"
		},

		initialize: function(opts){

            if (this.model.get('selection') == null){
                this.model.set('selection', new Backbone.Model());
            }
            this.selection = this.model.get('selection');

			this.choice_controls = _.extend({}, {
				'toggle': true,
			}, opts.choice_controls);

			FacetView.prototype.initialize.call(this, arguments);
            $(this.el).addClass("list-facet");

			// For keeping track of selected choices.
			this.selected_choices = {};

			// Re-render when choices or total or selection changes.
			this.model.on('change:choices change:total', this.renderChoices, this);
            this.selection.on('change', this.onSelectionChange, this);

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
                    widget_id: this.getChoiceWidgetId(choice.id),
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
				choice_id = $('input[type=checkbox]', facet_choice_el).data('choice_id');
				if (_this.selection.get(choice_id)){
					$(facet_choice_el).toggleClass('selected');
					$('input[type=checkbox]', facet_choice_el).attr('checked', true);
				}
			});

			// Update choices count.
			$('.choices-count', $(this.el)).html(choices.length);

            this.onSelectionChange();
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

		onChoiceWidgetChange: function(event){
			$choice_widget = $(event.currentTarget);
			var choice_id = $('input[type=checkbox]', $choice_widget).data('choice_id');
            var selected = $choice_widget.hasClass('selected');

            // Toggle state in selection model.
            if (selected){
                this.selection.unset(choice_id);
            }
            else{
                this.selection.set(choice_id, true);
            }
		},

        onSelectionChange: function(){
            _.each(this.model.get('choices'), function(choice){
                $choice_widget = this.getChoiceWidgetById(choice.id);
                var selected = this.selection.get(choice.id);
                this.setChoiceWidgetState($choice_widget, selected);
            }, this);

			this.updateResetButton();
			this.updateFilters();
        },

        setChoiceWidgetState: function($choice_widget, selected){
            if (selected){
                $choice_widget.addClass('selected');
                $('input[type=checkbox]', $choice_widget).attr('checked', true);
            }
            else{
                $choice_widget.removeClass('selected');
                $('input[type=checkbox]', $choice_widget).removeAttr('checked');
            }
        },

        getChoiceWidgetId: function(choice_id){
            return _s.sprintf("facet-choice--facet-%s--choice-%s", this.model.cid, choice_id);
        },

        getChoiceWidgetById: function(choice_id){
            var widget_id = this.getChoiceWidgetId(choice_id);
            $facet_choice = $('#' + widget_id);
            return $facet_choice;
        },

		updateResetButton: function(){
			// If anything was checked, show reset button.
            var visibility = 'hidden';
            _.each(this.selection.toJSON(), function(selected, choice_id){
                if (selected){
                    visibility = 'visible';
                }
            }, this);
            $('.facet-reset-button', this.el).css('visibility',  visibility);
		},

		resetFilters: function(){
			this.selection.clear();
			this.updateFilters();
		}

	});

	return ListFacetView;
});
		
