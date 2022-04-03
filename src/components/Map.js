import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect } from "react";

import Daffodil from '../img/Daffodil.png'; // Tell webpack this JS file uses this image
import Notebook from '../img/Notebook.png'; // Tell webpack this JS file uses this image
import HomeOffice from '../img/HomeOffice.png'; // Tell webpack this JS file uses this image
import Support from '../img/Support.png'; // Tell webpack this JS file uses this image

import "./Map.css"

import GoogleMap from './GoogleMap';

import Airtable from 'airtable';

const BIG_SAINSBURYS = [51.47563, -0.04]

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

let lastOpened = ""

function Map() {
	const [places, setPlaces] = useState([]);
	const [latLng, setLatLng] = useState({});
	const [markerForm, setMarkerForm] = useState(false);

	// function for airtable API into loaded map 
	// Refer to https://github.com/google-map-react/google-map-react#use-google-maps-api
	const handleApiLoaded = (map, maps, places) => {
		const markers = [];
		const infowindows = [];
		// var markerId = ""

		console.log(places)

		map.addListener('click', (mapsMouseEvent) => {
			console.log('clicked!', mapsMouseEvent.latLng)
			newMarkerForm(mapsMouseEvent, map, maps, places);
		});

		// makes places list from Airtable and displays when API loaded

		let images = []
		let image = ""

		places.forEach(place => {

			if (place.type == "Hope") {
				image = Daffodil
			} else if (place.type == "Memory") {
				image = Notebook
			} else if (place.type == "Home Office") {
				image = HomeOffice
			} else if (place.type == "Support") {
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


				});
			});
	}

	const closeLastMarker = (lastOpened) => {

		lastOpened != "" && lastOpened != undefined ? lastOpened.close() : console.log("no lastOpened exists")
	
	}

	//new marker dialog opens on map click
	const newMarkerForm = (evt, map, maps, places) => {

		closeLastMarker(lastOpened)


		setLatLng(evt.latLng)
		!markerForm ? setMarkerForm(true) : console.log("markerForm: ", markerForm)
		console.log('setting lat lng', evt.latLng)

		const tempMarker = new maps.Marker({
				position: evt.latLng,
				map,
				icon: "http://maps.google.com/mapfiles/ms/icons/blue.png"
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

		console.log(' New marker: \n', "Name: ", evt.target.placename.value + "\n", "Type: ", attributes + "\n", "Notes: ", evt.target.notes.value + "\n", "Co-ordinates: ", evt.target.lat.value, evt.target.lng.value + "\n",  )

		base('Table 1').create([
		  {
			"fields": {
			  "Location": evt.target.placename.value,
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
				setPlaces(recordsArr);
				console.log("loading " + recordsArr.length + " records from airtable")
			}
		});
	}, []); 

	return (
		<div style={{ height: '100vh', width: '100%' }}>
			{ markerForm && (
				<div id="markerFormContainer">
					<form id="newMarkerForm" onSubmit={createMarker}>
						<input id="placenameInput" type="text" name="placename" placeholder="Enter Place Name"/>
						<input id="placeNotesInput" type="text" name="notes" placeholder="Enter Notes"/>

						<span><input type="radio" id="hope" name="type" value="Hope" />
  						<label for="vehicle1"> <span id="formIcon">🌸</span> <em>A hopeful experience</em> </label></span>
  						<span><input type="radio" id="support" name="type" value="Support" />
  						<label for="vehicle1"> <span id="formIcon">✊</span> <em>A place of support</em> </label></span>
  						<span><input type="radio" id="memory" name="type" value="Memory" />
  						<label for="vehicle1"> <span id="formIcon">📝</span> <em>A memory or anecdote</em> </label></span>
  						<span><input type="radio" id="Home Office Location" name="type" value="Home Office" />
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
					defaultZoom={10}
					defaultCenter={BIG_SAINSBURYS}
					bootstrapURLKeys={{ key: process.env.REACT_APP_MAP_KEY }}
					yesIWantToUseGoogleMapApiInternals
					onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, places)}
				/>
			)}
		</div>
	);
  // }
}

export default Map;