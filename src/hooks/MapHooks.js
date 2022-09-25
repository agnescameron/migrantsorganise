// mapHook.js
import React, { createContext, useContext, useReducer } from "react";
const MapStateContext = createContext();
const MapDispatchContext = createContext();

export const MapProvider = ({ children, events, locations }) => {
	const markers = []

	// let locationIdArray = []
	// let matchedLocations = {}
	// let match = ""
	// // make an array of locationIDs
	// locations.map(( location, key ) => {
	// 	locationIdArr.push(location.fields.id)
	// })

	// locations.map(( location, key ) => {
	// 	matchedLocations[location] = "" // adds this location object as a key with empty string
	// 	console.log(location.id)
	// 	match = events.filter(event => event.fields.Location[0] === location.id) // Matches event.location with location IDs in Locations; returns array of FULL event objects 
	// 	console.log(match)
	// })

	// events.map(( event, key ) => {
	// 	// console.log(event.fields.Longitude)
	// 	let match = events.filter(event => event.fields.Location === location.id) 
	// 	// console.log(match)
	// })



// aim: merge locationTable data with eventsTable
// get events and match them to locations via location IDs
// add relevant location data to events Object
// this way it will be easier to 

	
	// console.log(match)



	const mappedEvents = events.filter(event => event.fields.Latitude != undefined && event.fields.Longitude != undefined)
	const mappedLocations = locations.filter(location => location.fields.Lat != undefined && location.fields.Lng != undefined)
	const floatingEvents = events.filter(event => event.fields.Latitude === undefined && event.fields.Longitude === undefined)

	console.log(locations, events)

	for (const event of mappedEvents) {
		markers.push({
			'name': event.fields.Location, 
			'lng': parseFloat(event.fields.Longitude) + Math.random() * 0.001, 
			'lat': parseFloat(event.fields.Latitude) + Math.random() * 0.001,
			'icon': 'https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-File.png',
			'notes': event.fields.Event,
			'tags': event.fields.Tags,
			'narrative': event.fields["Narrative Theme"],
		 })
	}

	console.log(markers)

	// for (const location of mappedLocations) {
	// 	markers.push({
	// 		'event': location.fields.Location, 
	// 		'lng': location.fields.Lng, 
	// 		'lat': location.fields.Lat,
	// 		'icon': 'https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-PNG-File.png',
	// 		'notes': location.fields.Location,
	// 		 })
	// }

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

//do things to displayed markers
export const MapReducer = (state, action) => {
	switch (action.type) {
		case "RESET":
			return {
				...state,
				markers: state.origMarkers
			};
		case "TEMP_MARKER":
			return {
				...state,
				markers: [...state.origMarkers, action.payload.marker]
			};
		case "ADD_MARKER":
			return {
				...state,
				origMarkers: [...state.origMarkers, action.payload.marker]
			};
		case "MARKER_SUBGROUP":
			return {
				...state,
				markers: action.payload.markers
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