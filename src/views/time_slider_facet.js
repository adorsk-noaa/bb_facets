define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./facet",
	"uiExtras",
	"text!./templates/time_slider_facet.html"
		],
function($, Backbone, _, ui, _s, FacetView, uiExtras, template){

	var TimeSliderFacetView = FacetView.extend({

		initialize: function(opts){
			// For keeping track of selected choice.
			this.selected_choice = null;

            this.initialRender();
            this.model.on('change:choices', this.renderChoices, this);
		},

        initialRender: function(){
            $(this.el).html(_.template(template, {model: this.model}));
            this.$selectSlider = $('.select-slider', this.el);
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
        },

        renderChoices: function(){
            var preparedChoices = this._prepareChoices(this.model.get('choices'));
            this.$selectSlider.selectSlider('option', {'choices': preparedChoices});

			// Re-select choice if still present.
			if (this.selected_value){
                this.$selectSlider.selectSlider('value', this.selected_value);
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
		
