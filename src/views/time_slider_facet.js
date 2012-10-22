define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"use!ui",
	"_s",
	"./facet",
	"use!uiExtras",
    ],
function($, Backbone, _, ui, _s, FacetView, uiExtras){

	var TimeSliderFacetView = FacetView.extend({

		events: _.extend({}, FacetView.prototype.events, {
        }),

		initialize: function(opts){
			FacetView.prototype.initialize.call(this, arguments);
            $(this.el).addClass("time-slider-facet");

            this.postInitialize();
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
            this.model.on('change:selection', this.onSelectionChange, this);
            this.model.on('change:choices', this.renderChoices, this);
        },

        renderChoices: function(){
            var preparedChoices = this._prepareChoices(this.model.get('choices'));
            this.$selectSlider.selectSlider('option', {'choices': preparedChoices});

			// Re-select choice if still present.
            var selection = this.model.get('selection');
			if (selection != null){
                this.$selectSlider.selectSlider('value', selection);
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

		onSliderChange: function(){
            this.model.set('selection', this.$selectSlider.selectSlider('option', 'value'));
		},

        onSelectionChange: function(){
			// Re-select choice if still present.
            var selection = this.model.get('selection');
			if (selection != null){
                this.$selectSlider.selectSlider('value', selection);
            }
            this.updateFilters();
        },

		getSelection: function(){
			var selection = this.$selectSlider.selectSlider('option', 'value');
            var value_type = this.model.get('value_type');
            if (value_type == 'numeric'){
                selection = parseFloat(selection);
            }
            return selection
		}

	});

	return TimeSliderFacetView;
});
		
