define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./facet",
	"uiExtras",
    ],
function($, Backbone, _, ui, _s, FacetView, uiExtras){

	var TimeSliderFacetView = FacetView.extend({

		initialize: function(opts){
			this.selected_choice = null;

			FacetView.prototype.initialize.call(this, arguments);
            $(this.el).addClass("time-slider-facet");

		},

        postInitialize: function(){
            // Create select slider.
            this.$selectSlider = $('<div class="select-slider"></div>');
            this.$selectSlider.appendTo($('.facet-body > .inner', this.el));

            var _this = this;
            this.$selectSlider.selectSlider({
                'showTics': true,
                'showLabels': true,
                'tooltips': false,
                'labelInterval': null,
                'change': function(e, ui){
                    _this.onSliderChange();
                }
            });
            this.renderChoices();

            // Listen for events.
            this.model.on('change:choices', this.renderChoices, this);
        },

        renderChoices: function(){
            var preparedChoices = this._prepareChoices(this.model.get('choices'));
            this.$selectSlider.selectSlider('option', {'choices': preparedChoices});

			// Re-select choice if still present.
			if (this.selected_value){
                this.$selectSlider.selectSlider('value', this.selected_value);
            }

            // Otherwise select the first choice.
            else{
                if (preparedChoices.length > 0){
                    this.$selectSlider.selectSlider('value', preparedChoices[0].value);
                }
            }
        },

        _prepareChoices: function(choices){
            var preparedChoices = [];
            _.each(choices, function(choice, i){
                preparedChoices.push(_.extend({}, choice, {
                    'value': choice.id,
                    'label': choice.label
                }));
            }, this);

            // Show labels on first and last choices.
            if (preparedChoices[0]){
                preparedChoices[0].showLabel = true;
            }
            if (preparedChoices.length > 1){
                preparedChoices[preparedChoices.length - 1].showLabel = true;
            }

            return preparedChoices;
        },

		onSliderChange: function(event){
            this.selected_value = this.$selectSlider.selectSlider('option', 'value');
			this.updateFilters();
		},

		getWidgetValue: function(){
			selected_value = this.$selectSlider.selectSlider('option', 'value');

            var value_type = this.model.get('value_type');
            if (value_type == 'numeric'){
                selected_value = parseFloat(selected_value);
            }

            return selected_value;
		}

	});

	return TimeSliderFacetView;
});
		
