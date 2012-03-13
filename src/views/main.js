define([
	"use!underscore",
	"./radio_select_facet",
	"./list_facet",
	"./facet_collection"
], 
function(_, RadioSelectFacetView, ListFacetView, FacetCollectionView){

	views = {
		RadioSelectFacetView: RadioSelectFacetView,
		ListFacetView: ListFacetView,
		FacetCollectionView: FacetCollectionView
	};

	return views;

});
