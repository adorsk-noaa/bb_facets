define([
	"use!underscore",
	"./radio_select_facet",
	"./facet_set"
], 
function(_, RadioSelectFacetView, FacetSetView){

	views = {
		RadioSelectFacetView: RadioSelectFacetView,
		FacetSetView: FacetSetView
	};

	return views;

});
