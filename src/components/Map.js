import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect, useCallback, useRef } from "react";

import Daffodil from '../img/Daffodil.png'; // Tell webpack this JS file uses this image
import Speech from '../img/Speech.png'; // Tell webpack this JS file uses this image
import HomeOffice from '../img/HomeOffice.png'; // Tell webpack this JS file uses this image
import Support from '../img/Support.png'; // Tell webpack this JS file uses this image
import Cross from '../img/Cross.png'; // Tell webpack this JS file uses this image

import "./Map.css"
import SearchBar from './SearchBar'
import GoogleMap from './GoogleMap';
import Airtable from 'airtable';

// values
const ORIGIN = [51.47563, -0.04]
const id = "21fc52ecdc3f25ef"
const base = new Airtable({apiKey: 'keyz2t9LWEHzBGzLy'}).base('apprhdoJVORTEvqLg');
var recordsArr = [];

// rendering infoWindow
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

// ****************************************** main Map function ************************************************* //

function Map() {

	// State variables to store
	const [places, setPlaces] = useState([]);
	const [latLng, setLatLng] = useState({});
	const [markerForm, setMarkerForm] = useState(false);
	const [center, setCenter] = useState(ORIGIN);
	const [zoom, setZoom] = useState(15);

	// function for airtable API into loaded map 
	// Refer to https://github.com/google-map-react/google-map-react#use-google-maps-api
	const handleApiLoaded = (map, maps, places) => {
		
		// array of markers and info windows
		const markers = [];
		const infowindows = [];

		// click listener to create new marker input form 
		map.addListener('click', (mapsMouseEvent) => {
			newMarkerForm(mapsMouseEvent, map, maps, places);
		});

		// with array of places, 
		let image = ""

		places.forEach(place => {

			// choose icon to render based on type
			if (place.type == "A Hopeful Experience") {
				image = Daffodil
			} else if (place.type == "A Memory") {
				image = Speech
			} else if (place.type == "Home Office/Hostile Environment Location") {
				image = HomeOffice
			} else if (place.type == "A Place of Support") {
				image = Support
			} else {
				image = null
			}

			// push latest latlng/icon to a google.maps.marker object -- so the displayed marker and its corresponding infowindow are independent 
			markers.push(new maps.Marker({
			position: {
				lat: place.latitude,
				lng: place.longitude,
			},
				map,
				icon: image,
			}));

			// pushes latest place and description to array of infowindows
			infowindows.push(new maps.InfoWindow({
				content: getInfoWindowString(place),
			}));

			// console.log("pushing infowindows to ", infowindows)
			console.log("pushing markers to ", markers)

		});

		markers.forEach((marker, i) => {

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
				type: record.get('Type'),
				time: record.get('Created').substring(0,10)
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
					zoom={zoom}
					center={center}
					bootstrapURLKeys={{ key: process.env.REACT_APP_MAP_KEY }}
					yesIWantToUseGoogleMapApiInternals
					onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, places)}
		            options={{ mapId: id }}
                    fullscreenControl={false}
				/> 
			)}

				<SearchBar />


		 	<div className="showMenu">
		 		Menu
		 	</div>

		    <div className="menuList">
			    {recordsArr && recordsArr.map((record) =>
				    	<div className="locationItem" onClick={function() { setCenter([record.latitude, record.longitude]); setZoom(zoom) }}>
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