import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect, useCallback, useRef } from "react";

import Daffodil from '../img/Daffodil.png'; // Tell webpack this JS file uses this image
import Speech from '../img/Speech.png'; // Tell webpack this JS file uses this image
import HomeOffice from '../img/HomeOffice.png'; // Tell webpack this JS file uses this image
import Support from '../img/Support.png'; // Tell webpack this JS file uses this image
import Cross from '../img/Cross.png'; // Tell webpack this JS file uses this image

import "./Map.css"
import GoogleMap from './GoogleMap';
import Airtable from 'airtable';


function SearchBar() {

	const handleApiLoaded = (map, maps, places) => {

	  // Create the search box and link it to the UI element.
	  const input = document.getElementById("search-input");
	  const searchBox = new maps.places.SearchBox(input);

	  // map.controls[maps.ControlPosition.BOTTOM_LEFT].push(input);
	  // Bias the SearchBox results towards current map's viewport.
	  map.addListener("bounds_changed", () => {
	    searchBox.setBounds(map.getBounds());
	  });

	  // Listen for the event fired when the user selects a prediction and retrieve
	  // more details for that place.
	  searchBox.addListener("places_changed", () => {
	    const places = searchBox.getPlaces();

	    if (places.length == 0) {
	      return;
	    }

	    let searchMarkers = []
	    // Clear out the old markers.
	    searchMarkers.forEach((searchMarker) => {
	      searchMarker.setMap(null);
	    });
	    searchMarkers = [];

	    // For each place, get the icon, name and location.
	    const bounds = new maps.LatLngBounds();
	    console.log(bounds)

	    places.forEach((place) => {
	      if (!place.geometry || !place.geometry.location) {
	        console.log("Returned place contains no geometry");
	        return;
	      }

	      const icon = {
	        url: Cross,
	        size: new maps.Size(24, 24),
	        origin: new maps.Point(0, 0),
	        anchor: new maps.Point(11, 11),
	        scaledSize: new maps.Size(25, 25),
	      };

	      // Create a marker for each place.
	      searchMarkers.push(
	        new maps.Marker({
	          map,
	          icon,
	          title: place.name,
	          position: place.geometry.location,
	        })
	      );

	      if (place.geometry.viewport) {
	        // Only geocodes have viewport.
	        bounds.union(place.geometry.viewport);
	      } else {
	        bounds.extend(place.geometry.location);
	      }
	    });
	    map.fitBounds(bounds);
	  });
	}

	return (
		<div>
			<input
		      id="search-input"
		      type="text"
		      placeholder="Search for Locations"
		    />
		</div>
	);
}


export default SearchBar;
