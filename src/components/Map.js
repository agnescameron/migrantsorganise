import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect } from "react";

import "./Map.css"

// examples:
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
		places.forEach(place => {
			markers.push(new maps.Marker({
			position: {
				lat: place.latitude,
				lng: place.longitude,
			},
				map,
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
		console.log(' New marker: \n', "Name: ", evt.target.placename.value + "\n", "Notes: ", evt.target.notes.value + "\n", "Co-ordinates: ", evt.target.lat.value, evt.target.lng.value + "\n",  )
		// console.log(evt.target.lat.value, typeof(evt.target.lat.value))

		base('Table 1').create([
		  {
			"fields": {
			  "Location": evt.target.placename.value,
			  "Notes": evt.target.notes.value,
			  "Latitude": parseFloat(evt.target.lat.value),
			  "Longitude": parseFloat(evt.target.lng.value),
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