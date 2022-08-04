import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useDispatchMap } from "../hooks/MapHooks.js";
import { Markers } from "./Markers.js";
import ReactMapGL from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

const Map = ({ locations }) => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-0.04);
	const [lat, setLat] = useState(51.47563);
	const [places, setPlaces] = useState([]);
	const [mapClickable, setMapClickable] = useState(false);
	const [zoom, setZoom] = useState(10);
	const mapDispatch = useDispatchMap();

	const [mapViewport, setMapViewport] = useState({
		height: "100vh",
		width: "100wh",
		longitude: 2.571606,
		latitude: 45.226913,
		zoom: 5
	});

	// useEffect(() => {
	// 	if (map.current) return; // initialize map only once
	// 	map.current = new mapboxgl.Map({
	// 		container: mapContainer.current,
	// 		style: 'mapbox://styles/mapbox/streets-v11',
	// 		center: [lng, lat],
	// 		zoom: zoom
	// 	});
	// });
	 
	// useEffect(() => {
	// if (!map.current) return; // wait for map to initialize
	// 	map.current.on('move', () => {
	// 		setLng(map.current.getCenter().lng.toFixed(4));
	// 		setLat(map.current.getCenter().lat.toFixed(4));
	// 		setZoom(map.current.getZoom().toFixed(2));
	// 	});
	// 	map.current.on('click', function(e) {
	// 		console.log('event', e, e.lngLat )
	// 		mapDispatch({ type: "ADD_MARKER", 
	// 			payload: { marker: e.lngLat } });
	// 	});
	// });
	console.log(mapboxToken)
	return (
		<ReactMapGL
			{...mapViewport}
			onMove={evt => setMapViewport(evt.mapViewport)}
			onClick={evt => {
				console.log('event', evt)
				mapDispatch({ type: "ADD_MARKER", 
					payload: { marker: evt.lngLat } });
				}
			}
			style={{width: "100vw", height: "100vh"}}
			mapboxAccessToken={mapboxToken}
			mapStyle="mapbox://styles/mapbox/streets-v11"
			onViewportChange={setMapViewport}
		>
			<Markers/>
		</ReactMapGL>
	);
}

export default Map;
