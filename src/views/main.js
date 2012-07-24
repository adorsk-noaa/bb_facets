define([
	"use!underscore",
	"./list_facet",
	"./numeric_facet",
	"./facet_collection",
	"./range_slider",
	"./time_slider_facet"
], 
function(_, ListFacetView, NumericFacetView, FacetCollectionView, RangeSliderView, TimeSliderFacetView){

	views = {
		ListFacetView: ListFacetView,
		NumericFacetView: NumericFacetView,
		FacetCollectionView: FacetCollectionView,
		RangeSliderView: RangeSliderView,
        TimeSliderFacetView: TimeSliderFacetView
	};

	return views;

});
