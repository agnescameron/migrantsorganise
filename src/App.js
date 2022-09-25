// import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import Map from './components/Map.js';
import { MapProvider } from "./hooks/MapHooks.js";

function App() {
	const airtableEventsDataRef = useRef([])
	const airtableLocationsDataRef = useRef([])

	// Pagination
	const [currentPage, setCurrentPage] = useState(0)
	const [numPages, setNumPages] = useState(1)
	const [events, setEvents] = useState([]);
	const [locations, setLocations] = useState([]);
	const PER_PAGE = 100 // to make things simpler, lets stick to the max number of records we receive from Airtable, which is 100
	const paginationOffset = currentPage * PER_PAGE

	// Airtable API
	const airtableApiKey = process.env.REACT_APP_AIRTABLE_KEY
	const airtableBase = process.env.REACT_APP_AIRTABLE_BASE
	const airtableTable = process.env.REACT_APP_AIRTABLE_TABLE
	const airtableTableLocations = process.env.REACT_APP_AIRTABLE_TABLE_LOCATIONS
	const airtableUrl = process.env.REACT_APP_AIRTABLE_URL
	const [airtableOffset, setAirtableOffset] = useState('')
	const eventsRequest = `${airtableUrl}/${airtableBase}/${airtableTable}?offset=${airtableOffset}`
	const locationsRequest = `${airtableUrl}/${airtableBase}/${airtableTableLocations}?offset=${airtableOffset}`

	const fetchData = async (request) => {
		const res = await fetch(request, {
			method: 'GET',
			"headers": { "Authorization": `Bearer ${airtableApiKey}` },
			'content-type': 'application/json'
		});
		const data = await res.json();
		return data
	}

	useEffect(() => {
			fetchData(eventsRequest)
			.then(data => {
				const { records, offset } = data
				// console.log(records)
				if (!records) return
				if (offset) {
					console.log("offset found on Events!")
					setAirtableOffset(offset)
					fetchData(eventsRequest)
						.then(_data => {
							airtableEventsDataRef.current.push(_data.records)
						})
				}
				else {
					airtableEventsDataRef.current.push(records)
				}
				setNumPages(airtableEventsDataRef.current.length)
				setEvents(airtableEventsDataRef.current[0])
			})

			fetchData(locationsRequest)
			.then(data => {
				const { records, offset } = data
				// console.log(records)
				if (!records) return
				if (offset) {
					console.log("offset found on Locations!")
					setAirtableOffset(offset)
					fetchData(locationsRequest)
						.then(_data => {
							airtableLocationsDataRef.current.push(_data.records)
						})
				}
				else {
					airtableLocationsDataRef.current.push(records)
				}
				setNumPages(airtableLocationsDataRef.current.length)
				setLocations(airtableLocationsDataRef.current[0])
			})
			// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [airtableOffset])


	return (
		<div className="App">
			<header className="App-header">			</header>
				{events.length > 0 && locations.length > 0 ? <MapProvider events={events} locations={locations}><Map/></MapProvider> : 
					<div className='loading'>Loading map...</div>}
		</div>
	);


}

export default App;
