define([
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"use!ui",
	"Util",
		],
function($, Backbone, _, _s, ui, Util){

	var SummaryBarView = Backbone.View.extend({

        initialize: function(opts){
            // Set default formatter if none given.
            if (! opts.formatter){
                this.formatter = _s.sprintf;
            }
    
            this.initialRender();

            // Trigger update when model data changes.
            this.model.on('change:data', this.onDataChange, this);
        },

        initialRender: function(){
            $(this.el).html('<div class="inner"><div class="text"><div><span class="field"></span>:<div class="selected"></div><div class="total"></div></div></div>');
        },

        onDataChange: function(){
            var format = this.model.get('quantity_field').get('format') || "%s";
            var data = this.model.get('data');

            // Do nothing if data is incomplete.
            if (data.selected == null || data.total == null){
                return;
            }

            var formatted_selected = this.formatter(format, data.selected);
            var formatted_total = this.formatter(format, data.total);
            var percentage;
            if (data.total == 0 && data.selected == 0){
                percentage = 100.0;
            }
            else{
                percentage = 100.0 * data.selected/data.total;
            }

            $(".text .field", this.el).html(_s.sprintf("'%s'", this.model.get('quantity_field').get('label')));
            $(".text .selected", this.el).html(formatted_selected);
            $(".text .total", this.el).html(_s.sprintf('(%.1f%% of %s total)', percentage, formatted_total));

            this.trigger('change:size');

        }

	});

	return SummaryBarView;
});
		