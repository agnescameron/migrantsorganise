// mapHook.js
import React, { createContext, useContext, useReducer } from "react";
const MapStateContext = createContext();
const MapDispatchContext = createContext();

export const MapProvider = ({ children, locations }) => {
	const markers = []
	for (const location of locations) {
		markers.push({
			'lng': location.fields.Longitude, 
			'lat': location.fields.Latitude,
			'icon': 'https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-File.png',
			'notes': location.fields.Notes,
			'name': location.fields.Name,
			'types': location.fields.Type,
			 })
	}
	const [state, dispatch] = useReducer(MapReducer, { markers: markers, origMarkers: markers });
	return (
		<MapStateContext.Provider value={state}>
			<MapDispatchContext.Provider value={dispatch}>
				{children}
			</MapDispatchContext.Provider>
		</MapStateContext.Provider>
	);
};

export const useStateMap = () => {
	const context = useContext(MapStateContext);
	if (context === undefined) {
		throw new Error("place useStateMap within MapProvider");
	}
	return context;
};

export const useDispatchMap = () => {
	const context = useContext(MapDispatchContext);
	if (context === undefined) {
		throw new Error("place useDispatchMap within MapProvider");
	}
	return context;
};

export const MapReducer = (state, action) => {
	switch (action.type) {
		case "RESET":
			return {
				...state,
				markers: state.origMarkers
			};
		case "ADD_MARKER":
			return {
				...state,
				markers: [...state.origMarkers, action.payload.marker]
			};
		case "ADD_MARKER_PERM":
			return {
				...state,
				origMarkers: [...state.origMarkers, action.payload.marker]
			};
		case "REMOVE_MARKER":
			return {
				...state,
				markers: [...state.markers.filter(x =>
					x[0] !== action.payload.marker[0] &&
					x[1] !== action.payload.marker[1]
				)]
			};
	}
	return state;
}