define([
	"use!underscore",
	"./radio_select_facet",
	"./list_facet",
	"./numeric_facet",
	"./facet_collection",
	"./range_slider"
], 
function(_, RadioSelectFacetView, ListFacetView, NumericFacetView, FacetCollectionView, RangeSliderView){

	views = {
		RadioSelectFacetView: RadioSelectFacetView,
		ListFacetView: ListFacetView,
		NumericFacetView: NumericFacetView,
		FacetCollectionView: FacetCollectionView,
		RangeSliderView: RangeSliderView,
	};

	return views;

});
