import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useDispatchMap, useStateMap } from "../hooks/MapHooks.js";
import { Markers } from "./Markers.js";
import Airtable from 'airtable';
import ReactMapGL from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import "./Map.css";
import fetch from 'node-fetch';

import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;

// mapboxgl.workerClass = MapboxWorker;

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN
const base = new Airtable({apiKey: process.env.REACT_APP_AIRTABLE_KEY}).base(process.env.REACT_APP_AIRTABLE_BASE);

const Map = () => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-0.04);
	const [lat, setLat] = useState(51.47563);
	const [placeList, setPlaceList] = useState([]);
	const [showSearch, setShowSearch] = useState(false);
	const [mapClickable, setMapClickable] = useState(false);
	const [markerForm, setMarkerForm] = useState(false);
	const [zoom, setZoom] = useState(10);
	const mapDispatch = useDispatchMap();
	const { markers, origMarkers } = useStateMap();

	const [mapViewport, setMapViewport] = useState({
		height: "100vh",
		width: "100wh",
		longitude: lng,
		latitude: lat,
		zoom: zoom
	});

	const toggleMapClickable = () => {
		if (mapClickable) {
			setMarkerForm(false);
			mapDispatch({ type: "RESET"});
		}

		setMapClickable(!mapClickable)
	}

	const showNarrative = (evt) => {
		evt.preventDefault()
		const group = evt.target.innerText;
		const markerGroup = origMarkers.filter(marker => marker.group !== undefined && marker.group.includes(group) )
		mapDispatch({ type: "MARKER_SUBGROUP", payload:{
			markers: markerGroup
		}})
	}

	const hideSearch = (evt) => {
		evt.preventDefault()
		setShowSearch(false);
	}

	const submitSearch = (evt) => {
		evt.preventDefault();
		zoomToPlace(placeList[0]);
		setPlaceList([]);
	}

	const zoomToPlace = async (prediction) => {
		// console.log(prediction.place_id)
		// const details = await Places.details({placeid: prediction.place_id});
		const res = await fetch('/api/details.js', {
		    method: 'POST',
		    body: JSON.stringify({placeid: prediction.place_id}),
		    headers: { 'Content-Type': 'application/json' },
		  });
		const detailJson = await res.json();
		const details = detailJson.body;
		console.log(details);
		setMapViewport({
		height: "100vh",
		width: "100wh",
		longitude: details.result.geometry.location.lng,
		latitude: details.result.geometry.location.lat,
		zoom: 15
	})
	}

	const findPlace = async (evt) => {
		evt.preventDefault()
		const place = evt.target.value;
		// const search = await Places.autocomplete({input: place, location: lat + "," + lng, radius: zoom*10});
		const res = await fetch('/api/autocomplete.js', {
		    method: 'POST',
		    body: JSON.stringify({input: place, location: lat + "," + lng, radius: zoom*10}),
		    headers: { 'Content-Type': 'application/json' },
		  });
		const searchJson = await res.json();
		const search = searchJson.body;
		console.log(search);
		setPlaceList(search.predictions);
		setShowSearch(true);
	}

	// new marker submission to airtable on form submit
	const createMarker = (evt) => {
		evt.preventDefault()

		if(evt.target.placename.value == "") {
			alert("site must have a name")
			return;
		}

		// make array of checked attributes
		let attributes = []
		evt.target.type.forEach( (check, i) => {
			if (check.checked === true) {
				attributes.push(check.value)
			}
		})

		// base(process.env.REACT_APP_AIRTABLE_TABLE).create([
		// 	{
		// 		"fields": {
		// 			// "Location": evt.target.placename.value,
		// 			"Event": evt.target.notes.value,
		// 			"Latitude": parseFloat(evt.target.lat.value),
		// 			"Longitude": parseFloat(evt.target.lng.value),
		// 			"Type": attributes,
		// 		}
		// 	},
		// ], function(err, records) {
		// if (err) {
		// 		console.error(err);
		// 		return;
		// 	}
		// })

		base(process.env.REACT_APP_AIRTABLE_TABLE_LOCATIONS).create([
			{
				"fields": {
					"Location": evt.target.placename.value,
					"Lat": parseFloat(evt.target.lat.value),
					"Lng": parseFloat(evt.target.lng.value),
					// "Event Link": evt.target.notes.value,
					// "Comments" : "",
					// "Contact Details" : "",
					// "Description" : ""
				}
			},
		], function(err, records) {
		if (err) {
				console.error(err);
				return;
			}
		})

		mapDispatch({ type: "ADD_MARKER", 
			payload: { marker: { 
				name: evt.target.placename.value,
				notes: evt.target.notes.value,
				lat: parseFloat(evt.target.lat.value),
				lng: parseFloat(evt.target.lng.value),
				type: attributes,
				icon: "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-Pic.png"} 
			}});

		toggleMapClickable()
	}

	return (
		<ReactMapGL
			{...mapViewport}
			onMove={evt => { (() =>{
				setMapViewport(evt.mapViewport);
				setLat(evt.viewState.latitude);
				setLng(evt.viewState.longitude);
			})();
		}
			}
			onClick={evt => {
				mapClickable && (() =>{
					setLat(evt.lngLat.lat);
					setLng(evt.lngLat.lng);
					mapDispatch({ type: "TEMP_MARKER", 
						payload: { marker: 
							{...evt.lngLat, 
								icon: "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-Free-Download-PNG.png"} 
							}});
					setMarkerForm(true);
					})();
				}
			}
			style={{width: "100vw", height: "100vh"}}
			mapboxAccessToken={mapboxToken}
			mapStyle="mapbox://styles/mapbox/streets-v11"
			onViewportChange={setMapViewport}
		>
			<Markers/>

			{ markerForm && (
				<div id="markerFormContainer">
					<form id="newMarkerForm" onSubmit={createMarker}>
						<input id="placenameInput" type="text" name="placename" placeholder="Enter Place Name"/>
						<textarea id="placeNotesInput" type="text" name="notes" placeholder="Enter Notes"></textarea>

						<span><input type="radio" id="hope" name="type" value="A Hopeful Experience" />
						<label htmlFor="vehicle1"> <span id="formIcon">🌸</span> <em>A hopeful experience</em> </label></span>
						<span><input type="radio" id="support" name="type" value="A Place of Support" />
						<label htmlFor="vehicle1"> <span id="formIcon">✊</span> <em>A place of support</em> </label></span>
						<span><input type="radio" id="memory" name="type" value="A Memory" />
						<label htmlFor="vehicle1"> <span id="formIcon">📝</span> <em>A memory or anecdote</em> </label></span>
						<span><input type="radio" id="Home Office Location" name="type" value="Home Office/Hostile Environment Location" />
						<label htmlFor="vehicle1"> <span id="formIcon">🛂</span> <em>A Home Office location</em> </label></span>

						<input type="hidden" name="lat" value={lat} />
						<input type="hidden" name="lng" value={lng} />
						<input id="submitButton" type="submit" value="Add New Note to Map" />
						<input id="closeFormButton" type="button" value="Close Form" onClick={function() {setMarkerForm(false)}} />
					</form>
				</div>
			)}

			<div className="narrativeGroupContainer">
				{origMarkers && origMarkers.reduce(function(groups, marker){ 
					// selects the list of possible groups that the markers can belong to
					if(marker.group !== undefined){
						marker.group.forEach(group => {
							if (!groups.includes(group)) {
								groups.push(group);
								}
							})
						}
						return groups;
					}, [])
					.map((group) =>
						<div>
							<div className="narrativeGroup navButton" value={group} onClick={showNarrative}>{group}</div>
						</div>
					)}
			</div>

			<div className="navButton" id="addLocation" onClick={() => toggleMapClickable()}>
				{ mapClickable ? "Cancel" : "Add a Location, Memory or Sighting" }
			</div>

			<div className="navButton" id="toggleMap" onClick={() => mapDispatch({ type: "RESET"})}>
				Show all map locations
			</div>


			<div id="search-input" className="searchBox" onMouseLeave={hideSearch} onMouseEnter={() => setShowSearch(true)}>
				{placeList.length > 0 && showSearch &&
					<ul className="noPoints">
					{ placeList.map( (prediction) => 
						<li onClick={e => zoomToPlace(prediction)}>{prediction.description}</li>
					)}
					</ul>
				}
				<form onSubmit={submitSearch}>
					<input type="text" id="placeSearch" onChange={findPlace}/>
				</form>
			</div>

		</ReactMapGL>
	);
}

export default Map;
