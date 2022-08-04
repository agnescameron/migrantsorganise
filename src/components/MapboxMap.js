import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN

const Map = ({ locations }) => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-0.04);
	const [lat, setLat] = useState(51.47563);
	const [places, setPlaces] = useState([]);
	const [mapClickable, setMapClickable] = useState(false);
	const [zoom, setZoom] = useState(10);
	 
	useEffect(() => {
		if (map.current) return; // initialize map only once
		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [lng, lat],
			zoom: zoom
		});
	});
	 
	useEffect(() => {
	if (!map.current) return; // wait for map to initialize
		map.current.on('move', () => {
			setLng(map.current.getCenter().lng.toFixed(4));
			setLat(map.current.getCenter().lat.toFixed(4));
			setZoom(map.current.getZoom().toFixed(2));
		});
	});
	
	return (
	<div>
	<div className="sidebar">
	Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
	</div>
	<div ref={mapContainer} className="map-container" />
	</div>
	);
}

export default Map;
