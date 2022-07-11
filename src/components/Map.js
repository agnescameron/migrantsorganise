import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect } from "react";
import $ from 'jquery';


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
const id = "tblJiQgivlyOpMfIc"
const base = new Airtable({apiKey: 'keyz2t9LWEHzBGzLy'}).base('apprhdoJVORTEvqLg');
let recordsArr = [];
let groupsArr = [];
let typesArr = [];

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
let lastOpened = []
let markerDisplay = []

// ****************************************** main Map function ************************************************* //

function Map() {

	// State variables to store
	const [places, setPlaces] = useState([]);
	const [latLng, setLatLng] = useState({});
	const [markerForm, setMarkerForm] = useState(false);
	const [mapClickable, setMapClickable] = useState(false);
	const [center, setCenter] = useState(ORIGIN);
	const [zoom, setZoom] = useState(15);



	// function for airtable API into loaded map 
	// Refer to https://github.com/google-map-react/google-map-react#use-google-maps-api
	const handleApiLoaded = (map, maps, places) => {

	// ******************** populate markers and infowindows ****************** //
		
		// array of markers and info windows
		let markers = [];
		const infowindows = [];

		// click listener to create new marker input form 

		let mapclicker = false

		$("#addLocation").click(function() {

			mapclicker = !mapclicker

			if(mapclicker === true) {
				map.addListener('click', (mapsMouseEvent) => {
					newMarkerForm(mapsMouseEvent, map, maps, places)
					console.log("markerForm: ", markerForm)
				});
			} else {
				// how to remove the listener now?
			}
			console.log("mapclicker: ", mapclicker)
		})

		


		// with array of places, 
		let image = ""


		places.forEach(place => {

			// choose icon to render based on type
			if( Array.isArray(place.type) ){
				if ( place.type.includes("A Hopeful Experience") ) {
					image = Daffodil
				} else if ( place.type.includes("A Memory") ) {
					image = Speech
				} else if ( place.type.includes("Home Office/Hostile Environment Location") ) {
					image = HomeOffice
				} else if ( place.type.includes("A Place of Support") ) {
					image = Support
				}
				else {
					image = null
				}
			}
			else {
				image = null
			}

			// push latest latlng/icon to a google.maps.marker object -- the displayed marker and its corresponding infowindow are independent 
			markers.push(new maps.Marker({
			position: {
				lat: place.latitude,
				lng: place.longitude,
			},
				map,
				icon: image,
				display: false,
				"group" : place.group,
				"name" : place.name,
				"key": place.id
			}));

			// pushes latest place and description to array of infowindows
			infowindows.push(new maps.InfoWindow({
				content: getInfoWindowString(place),
			}));

			// console.log("pushing infowindows to ", infowindows)
			// console.log("pushing markers to ", markers)

						// filtering


			$(".filterButton").click(function() {

				let type = $(this).attr("value")
				console.log("found type as", type)
				if( place.type === type ) {
					markers.push(new maps.Marker({
						position: {
							lat: place.latitude,
							lng: place.longitude,
						},
							map,
							icon: image,
							display: false,
							"group" : place.group,
							"name" : place.name,
						}));

					}
				})

		});

		// click listener to display marker
		markers.forEach((marker, i) => {
			marker.addListener('click', () => {
				setMarkerDisplay(marker, i)
				updateMarkers()
			});

		});

		let currentGroupMember = 0;

		$(".narrativeGroup").click(function() {
			let groupValue = $(this).attr("value")
			let currentGroup = []

			markers.forEach((marker, i) => { // goes thru all the markers to filter out the corresponding group ones

				if (marker.group === groupValue) {
					currentGroup.push(marker) // make a currentGroup array containing all the ones to cycle through
					console.log("markergroup: ", marker.group[0], "groupValue: ", groupValue)
				} else {
					marker.display = false
				}
			})

			let len = currentGroup.length
			// console.log(len, currentGroupMember)

			if (currentGroupMember < len) {
				resetMarkers()
				currentGroup[currentGroupMember].display = true
				currentGroupMember++
			} else {
				resetMarkers()
				currentGroupMember = 0
				currentGroup[currentGroupMember].display = true
			}
			updateMarkers()
		})

		$(".individualPlace").click(function() {
			let place = $(this).attr("value")

			markers.forEach((marker, i) => { // goes thru all the markers to filter out the corresponding group ones
				
				if (place === marker.name) {
					setMarkerDisplay(marker, i)
				}
			})
			updateMarkers()
		})

		// sets marker display true and false
		const setMarkerDisplay = (marker, i) => {

			marker.display = !marker.display // toggle display attr
			// console.log("set marker", i, "to", marker.display)

			let clickedMarker = marker
			let cloneMarkerDisplay = markers.slice() 
			cloneMarkerDisplay.splice(i, 1)
			cloneMarkerDisplay.forEach((cloneMarker, j) => { cloneMarker.display = false})
			cloneMarkerDisplay.splice(i, 0, clickedMarker)
			markers = cloneMarkerDisplay

			setMarkerForm(false)
			// console.log("closed marker form")
		}

		// displays marker based on whether true or false
		const updateMarkers = () => {
			for (let i=0; i < markers.length; i++) {
				if (markers[i].display === true) {
					console.log("opened", i, markers[i].display, markers[i].name)
					infowindows[i].open(map, markers[i]);
					setZoom(15) // PROBLEM -- this setzoom stops working after bounds change

				// map.addListener('bounds_changed', function(event) {
				//   if (this.getZoom() < 15) {
				//     this.setZoom(15);
				//   }
				// });

				} else if (markers[i].display === false) {
					infowindows[i].close(map, markers[i])
				}
			}
		}

		const resetMarkers = () => {
			for (let i=0; i < markers.length; i++) {
				markers[i].display = false
			}
		}
	}

	const toggleMapClickable = () => {
		!mapClickable ? setMapClickable(true) : console.log("map: ", mapClickable)
	}


	// ******************* interactions with markers ********************** //

	const newMarkerForm = (evt, map, maps, places) => {

		// closeLastMarker(lastOpened[lastOpened.length - 1])

		setLatLng(evt.latLng)

		// If no marker form the open it, otherwise print markerForm boolean status
		!markerForm ? setMarkerForm(true) : console.log("markerForm: ", markerForm)

		// make a temp Marker with current clicked position
		const tempMarker = new maps.Marker({
				position: evt.latLng,
				map,
			})

		console.log("temp marker: ", tempMarker)

		map.addListener('click', (mapsMouseEvent) => {
			tempMarker.setMap(null)
		});
	}

	// ******************* creating markers into airtable ********************** //


	// new marker submission to airtable on form submit
	const createMarker = (evt) => {
		evt.preventDefault()

		// make array of checked attributes
		let attributes = []
		evt.target.type.forEach( (check, i) => {
			if (check.checked === true) {
				attributes.push(check.value)
			}
		})

		var name = ""
		
		if(evt.target.placename.value !== "") {
			name = evt.target.placename.value
			console.log("awww", name)
		} else {
			name = attributes
			console.log("whyyy", name[0], evt.target.placename.value, attributes)
		}

		console.log(' New marker: \n', "Name: ", name[0] + "\n", "Type: ", attributes + "\n", "Notes: ", evt.target.notes.value + "\n", "Co-ordinates: ", evt.target.lat.value, evt.target.lng.value + "\n",  )

		base('Locations V0').create([
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

		base('Locations V0').select({
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
				group: record.get('Group'),
				time: record.get('Created').substring(0,10)
			})

			// make an array of new groups
			let group = record.get('Group')
			if ( group !== undefined && groupsArr.includes(group[0]) === false) {
				groupsArr.push(group[0])
				console.log("found new group called ", group)
				console.log(groupsArr.includes(group))
			} 

			// make an array of new types
			let type = record.get('Type')
			if ( type !== undefined && typesArr.includes(type[0]) === false) {
				typesArr.push(type[0])
				console.log("found new group called ", type)
				console.log(typesArr.includes(type))
			} 
		});

			fetchNextPage();
			return;
		}, function done(err) {
			if (err) { console.error(err); 
				return;
			} else {
				setPlaces(recordsArr); // State mutation react hook to append a new location to here.!!
				console.log("loaded " + recordsArr.length + " records")
				console.log("loaded " + groupsArr.length + " groups")
				console.log("loaded " + typesArr.length + " types")
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

			<div className="narrativeGroupContainer">
				{recordsArr && groupsArr.map((group) =>	
			    	<div>
				    	<div className="narrativeGroup navButton" value={group}>{group}</div>
			    	</div>
		    	)}



		{/*		<div className="narrativeGroup navButton" id="scams">
					Scams
				</div>
				<div className="narrativeGroup navButton" id="control">
					Control
				</div>
				<div className="narrativeGroup navButton" id="time">
					Time and Uncertainty
				</div>
				<div className="narrativeGroup navButton" id="life">
					Making Life Impossible
				</div>*/}

			</div>

			<div className="navButton" id="addLocation">
				Add a Location, Memory or Sighting
			</div>

			<div className="navButton" id="toggleMap">
				Toggle all map locations
			</div>




		 	<div className="showMenu">
		 		Menu
		 	</div>

		    {/*<div className="menuList">

			    {recordsArr && typesArr.map((type) =>
				    
				    	<div className="locationItem filterButton" value={type}>Filter Type: {type}</div>
			    	)
			}


			    {recordsArr && groupsArr.map((group) =>	

			    	<div>
				    	<div className="locationItem markerGroup" value={group}>Narrative Group: {group}</div>
			    	</div>

			    	)}

			    {recordsArr && recordsArr.map((record, index) =>
				    	<div className="locationItem individualPlace" value={record.name} onClick={function() { setCenter([record.latitude, record.longitude]); setZoom(zoom) }}>
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
			</div>*/}

		</div>
	);
}

export default Map;