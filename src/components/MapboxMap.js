import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useDispatchMap, useStateMap } from "../hooks/MapHooks.js";
import { Markers } from "./Markers.js";
import ReactMapGL from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

const Map = () => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-0.04);
	const [lat, setLat] = useState(51.47563);
	const [mapClickable, setMapClickable] = useState(false);
	const [zoom, setZoom] = useState(10);
	const mapDispatch = useDispatchMap();

	const [mapViewport, setMapViewport] = useState({
		height: "100vh",
		width: "100wh",
		longitude: lng,
		latitude: lat,
		zoom: zoom
	});

	return (
		<ReactMapGL
			{...mapViewport}
			onMove={evt => setMapViewport(evt.mapViewport)}
			onClick={evt => {
				mapClickable && mapDispatch({ type: "ADD_MARKER", 
					payload: { marker: {...evt.lngLat, icon: "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-File.png"} }});
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
