define([
	// libs
	"jquery",
	"use!backbone",
	"use!underscore",
	"_s",
	"text!./templates/facet.html",
		],
function($, Backbone, _, _s, template){

	var FacetView = Backbone.View.extend({

		initialize: function(){
            $(this.el).addClass("facet");
            $(this.el).attr("id", _s.sprintf("facet-%s", this.model.cid));
            this.initialRender();
		},

        initialRender: function(){
			var html = _.template(template, {model: this.model});
			$(this.el).html(html);

            // If facet has info, add info control.
            var info = this.model.get('info');
            if (info){
                var $info = $(_s.sprintf('<a class="control facet-info-button info-button" href="javascript:{}">info</a>'));
                $info.appendTo($('.facet-header', this.el));
                var $info_content = $(_s.sprintf('<div class="content">%s</div>', info));
                $info_content.appendTo($info);
            }
        },

        postInitialize: function(){
        },

        // This method should be overriden.
        getSelection: function(){
        },

        // This function will likely be overriden.
        updateFilters: function(){
            var selection = this.getSelection();
            this.model.set('filters', this.formatFilters(selection));
        },

        // This function will likely be overriden in the facet's application context.
        formatFilters: function(selection){
            return selection;
        },

        addResetButton: function(){
            this.$reset = $('<a class="control facet-reset-button" href="javascript:{}" style="visibility:hidden;">reset</a>');
            this.$reset.appendTo($('.facet-header', this.el));
        },

        addInfoButton: function(){
        },
        
		makeResizeable: function(){
			$(".facet-body", $(this.el)).resizable({
				minHeight: 30,
				handles: 's',
				stop: function(event, ui) {
					event.target.style.width = "auto"; // don't force the width
				}
			});
		}

	});

	return FacetView;
});
		
