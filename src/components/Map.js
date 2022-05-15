import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect, useCallback, useRef } from "react";

import Daffodil from '../img/Daffodil.png'; // Tell webpack this JS file uses this image
import Notebook from '../img/Notebook.png'; // Tell webpack this JS file uses this image
import HomeOffice from '../img/HomeOffice.png'; // Tell webpack this JS file uses this image
import Support from '../img/Support.png'; // Tell webpack this JS file uses this image
import Cross from '../img/Cross.png'; // Tell webpack this JS file uses this image


import "./Map.css"

import GoogleMap from './GoogleMap';

import Airtable from 'airtable';

const ORIGIN = [51.47563, -0.04]
const id = "21fc52ecdc3f25ef"

const base = new Airtable({apiKey: 'keyz2t9LWEHzBGzLy'}).base('apprhdoJVORTEvqLg');

var recordsArr = [];

const getInfoWindowString = (place) => `
	<div class="infoWindows">
	  <div class="infoWindowName">
		${place.name}
	  </div>
  	  <div class="infoWindowNotes">
		${place.notes}
	  </div>
	</div>`;

// manages last opened info dialogue
let lastOpened = ""

function Map() {
	const [places, setPlaces] = useState([]);
	const [latLng, setLatLng] = useState({});
	const [markerForm, setMarkerForm] = useState(false);
	const [center, setCenter] = useState(ORIGIN);
	const [zoom, setZoom] = useState(15);

	// function for airtable API into loaded map 
	// Refer to https://github.com/google-map-react/google-map-react#use-google-maps-api
	const handleApiLoaded = (map, maps, places) => {
		const markers = [];
		const infowindows = [];

		// console.log(places)

		map.addListener('click', (mapsMouseEvent) => {
			newMarkerForm(mapsMouseEvent, map, maps, places);
		});

		let image = ""

		places.forEach(place => {

			// choose icon to render based on type
			if (place.type == "A Hopeful Experience") {
				image = Daffodil
			} else if (place.type == "A Memory") {
				image = Notebook
			} else if (place.type == "Home Office/Hostile Environment Location") {
				image = HomeOffice
			} else if (place.type == "A Place of Support") {
				image = Support
			} else {
				image = null
			}

			markers.push(new maps.Marker({
			position: {
				lat: place.latitude,
				lng: place.longitude,
			},
				map,
				icon: image,

			}));

			infowindows.push(new maps.InfoWindow({
				content: getInfoWindowString(place),
			}));

		});

		// SEARCH BAR CODE

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

	  // END OF SEARCH

		markers.forEach((marker, i) => {

		// 	const openInfoWindow = (window) => {
		// 	infowindows[window].open(map, marker)

		// 	//close submission form dialog
		// 	setMarkerForm(false)

		// 	// check lastOpened is valid and close it
		// 	closeLastMarker(lastOpened)

		// 	// set new lastOpened to currently open marker
		// 	lastOpened = infowindows[window]

		// }

			marker.addListener('click', () => {

					// open new marker 
					infowindows[i].open(map, marker);

					//close submission form dialog
					setMarkerForm(false)

					// check lastOpened is valid and close it
					closeLastMarker(lastOpened)

					// set new lastOpened to currently open marker
					lastOpened = infowindows[i]

					console.log("lastopened = ", lastOpened)
				});
			});

	}

	// close last marker stored in lastOpened (global var)
	const closeLastMarker = (lastOpened) => {
		lastOpened != "" && lastOpened != undefined ? lastOpened.close() : console.log("no lastOpened")
	}

	//new marker dialog opens on map click
	const newMarkerForm = (evt, map, maps, places) => {

		closeLastMarker(lastOpened)

		setLatLng(evt.latLng)
		!markerForm ? setMarkerForm(true) : console.log("markerForm: ", markerForm)
		// console.log('setting lat lng', evt.latLng)

		const tempMarker = new maps.Marker({
				position: evt.latLng,
				map,
			})

		map.addListener('click', (mapsMouseEvent) => {
			tempMarker.setMap(null)
		});
	}

	// new marker submission to airtable on form submit
	const createMarker = (evt) => {
		evt.preventDefault()

		// make array of checked attributes
		let attributes = []
		evt.target.type.forEach( (check, i) => {
			if (check.checked == true) {
				attributes.push(check.value)
			}
		})


		var name = ""
		
		if(evt.target.placename.value != "") {
			name = evt.target.placename.value
			console.log("awww", name)
		} else {
			name = attributes
			console.log("whyyy", name[0], evt.target.placename.value, attributes)
		}

		console.log(' New marker: \n', "Name: ", name[0] + "\n", "Type: ", attributes + "\n", "Notes: ", evt.target.notes.value + "\n", "Co-ordinates: ", evt.target.lat.value, evt.target.lng.value + "\n",  )

		base('Table 1').create([
		  {
			"fields": {
			  "Location": name[0],
			  "Notes": evt.target.notes.value,
			  "Latitude": parseFloat(evt.target.lat.value),
			  "Longitude": parseFloat(evt.target.lng.value),
			  "Type": attributes,
			}
		  },
		], function(err, records) {
		if (err) {
			console.error(err);
			return;
		}
		})

		setMarkerForm(false)
	}

	useEffect(() => {

		base('Table 1').select({
			maxRecords: 1000,
			view: "Grid view"
		}).eachPage(function page(records, fetchNextPage) {

		records.forEach(function(record) {
			recordsArr.push({
				id: record.id,
				name: record.get("Location"),
				notes: record.get("Notes"),
				longitude: record.get('Longitude'),
				latitude: record.get('Latitude'),
				type: record.get('Type')
			})
		});

			fetchNextPage();
			return;
		}, function done(err) {
			if (err) { console.error(err); 
				return;
			} else {
				setPlaces(recordsArr); // State mutation react hook to append a new location to here.!!
				console.log("loaded " + recordsArr.length + " records")
				console.log(recordsArr)
			}
		});
	}, []);


	return (
		<div style={{ height: '100vh', width: '100%' }}>
			{ markerForm && (
				<div id="markerFormContainer">
					<form id="newMarkerForm" onSubmit={createMarker}>
						<input id="placenameInput" type="text" name="placename" placeholder="Enter Place Name"/>
						<textarea id="placeNotesInput" type="text" name="notes" placeholder="Enter Notes"></textarea>

						<span><input type="radio" id="hope" name="type" value="A Hopeful Experience" />
  						<label for="vehicle1"> <span id="formIcon">🌸</span> <em>A hopeful experience</em> </label></span>
  						<span><input type="radio" id="support" name="type" value="A Place of Support" />
  						<label for="vehicle1"> <span id="formIcon">✊</span> <em>A place of support</em> </label></span>
  						<span><input type="radio" id="memory" name="type" value="A Memory" />
  						<label for="vehicle1"> <span id="formIcon">📝</span> <em>A memory or anecdote</em> </label></span>
  						<span><input type="radio" id="Home Office Location" name="type" value="Home Office/Hostile Environment Location" />
  						<label for="vehicle1"> <span id="formIcon">🛂</span> <em>A Home Office location</em> </label></span>

						<input type="hidden" name="lat" value={latLng.lat()} />
						<input type="hidden" name="lng" value={latLng.lng()} />
						<input id="submitButton" type="submit" value="Add New Note to Map" />
						<input id="closeFormButton" type="button" value="Close Form" onClick={function() {setMarkerForm(false)}} />
					</form>
				</div>
			)}
			{ !isEmpty(places) && (
				<GoogleMap
					defaultZoom={zoom}
					center={center}
					bootstrapURLKeys={{ key: process.env.REACT_APP_MAP_KEY }}
					yesIWantToUseGoogleMapApiInternals
					onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, places)}
		            options={{ mapId: id }}
                    fullscreenControl={false}
				/> 
			)}

				<input
			      id="search-input"
			      type="text"
			      placeholder="Search for Locations"
			    />

		 	<div className="showMenu">
		 		Menu
		 	</div>

		    <div className="menuList">
			    {recordsArr && recordsArr.map((record) =>
				    	<div className="locationItem" onClick={function() { console.log("centering!", center, zoom); setCenter([record.latitude, record.longitude]); setZoom(zoom) }}>
					    	<div className="locationItemInfo">
								<div className="locationItemName">
						    		{record.name}
						    	</div>
						    	<div className="locationItemNotes">
						    		{record.notes}
						    	</div>
					    	</div>
				    		
				    	</div>
			    	)
				}
			</div>

		</div>
	);
}

export default Map;