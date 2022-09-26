import React, { useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { useStateMap } from "../hooks/MapHooks.js";
import './marker.css';

export const Markers = () => {

	const { markers } = useStateMap();
	const [selectedMarker, setSelectedMarker] = useState(null);

	return (
		<>
			{markers && markers.map((marker, index) => (
				<Marker
					offsetTop={15}
					offsetLeft={15}
					latitude={parseFloat(marker.lat)}
					longitude={parseFloat(marker.lng)}
					notes={marker.notes}
					address={marker.address}
					description={marker.description}
					contact={marker.contact}
					group={marker.group}
					category={marker.category}
			 >
				 <img src={marker.icon} 
					onClick={() => {
						console.log('setting marker')
						setSelectedMarker(marker);
					}}/>
				</Marker>
			))}

			{selectedMarker !== null && (
				<Popup
					latitude={selectedMarker.lat}
					longitude={selectedMarker.lng}
					closeOnClick={false}
					onClose={() => setSelectedMarker(null)}
				>
					<h2>{selectedMarker.name}</h2><p>{selectedMarker.notes}</p><p>{selectedMarker.description}</p><p>{selectedMarker.contact}</p>
				</Popup>
				)}
		</>
	);
};

