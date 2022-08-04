// import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import Map from './components/MapboxMap.js';
import { MapProvider } from "./hooks/MapHooks.js";

function App() {
	const airtableDataRef = useRef([])

	// Pagination
	const [currentPage, setCurrentPage] = useState(0)
	const [numPages, setNumPages] = useState(1)
	const [entries, setEntries] = useState([]);
	const PER_PAGE = 100 // to make things simpler, lets stick to the max number of records we receive from Airtable, which is 100
	const paginationOffset = currentPage * PER_PAGE

	// Airtable API
	const airtableApiKey = process.env.REACT_APP_AIRTABLE_KEY
	const airtableBase = process.env.REACT_APP_AIRTABLE_BASE
	const airtableTable = process.env.REACT_APP_AIRTABLE_TABLE
	const airtableUrl = process.env.REACT_APP_AIRTABLE_URL
	const [airtableOffset, setAirtableOffset] = useState('')
	const request = `${airtableUrl}/${airtableBase}/${airtableTable}?offset=${airtableOffset}`

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
		fetchData(request)
			.then(data => {
				const { records, offset } = data
				
				if (!records) return

				if (offset) {
					setAirtableOffset(offset)
					fetchData(request)
						.then(_data => {
							airtableDataRef.current.push(_data.records)
						})
				}
				else {
					airtableDataRef.current.push(records)
				}
				setNumPages(airtableDataRef.current.length)
				setEntries(airtableDataRef.current[0])
			})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [airtableOffset])

	return (
		<div className="App">
			<header className="App-header">			</header>
				{entries.length > 0 ? <MapProvider><Map locations={entries}/></MapProvider> : 
					<div className='loading'>Loading map...</div>}
		</div>
	);


}

export default App;
