import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect } from "react";

import "./Map.css"

// examples:
import GoogleMap from './GoogleMap';

import Airtable from 'airtable';

const LOS_ANGELES_CENTER = [34.0522, -118.2437]

const base = new Airtable({apiKey: 'keyz2t9LWEHzBGzLy'}).base('apprhdoJVORTEvqLg');
var recordsArr = [];

const getInfoWindowString = (place) => `
	<div>

	  <div style="font-size: 14px;">
		<span style="color: grey;">
		${place.comment}
		</span>
		<span style="color: orange;">${String.fromCharCode(9733).repeat(Math.floor(place.rating))}</span><span style="color: lightgrey;">${String.fromCharCode(9733).repeat(5 - Math.floor(place.rating))}</span>
	  </div>
	  <div style="font-size: 14px; color: grey;">
		${place.latitude}
	  </div>
	  <div style="font-size: 14px; color: green;">
		${place.longitude}
	  </div>
	</div>`;


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
					infowindows[i].open(map, marker);
				});
			});
	}


	//new marker dialog opens on map click
	const newMarkerForm = (evt, map, maps, places) => {

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
	}

	useEffect(() => {

		base('Table 1').select({
			maxRecords: 1000,
			view: "Grid view"
		}).eachPage(function page(records, fetchNextPage) {

		records.forEach(function(record) {
			recordsArr.push({
				id: record.id,
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
					defaultZoom={5}
					defaultCenter={LOS_ANGELES_CENTER}
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