import React from 'react';
import isEmpty from 'lodash.isempty';
import { useState, useEffect } from "react";

// examples:
import GoogleMap from './GoogleMap';

import Airtable from 'airtable';

// consts: [34.0522, -118.2437]
// import LOS_ANGELES_CENTER from '../const/la_center';

const LOS_ANGELES_CENTER = [34.0522, -118.2437]

const base = new Airtable({apiKey: 'keyz2t9LWEHzBGzLy'}).base('apprhdoJVORTEvqLg');
var recordsArr = [];

const getInfoWindowString = (place) => `
    <div>

      <div style="font-size: 14px;">
        <span style="color: grey;">
        ${place.comment}
        </span>
        <span style="color: orange;">${String.fromCharCode(9733).repeat(Math.floor(place.rating))}</span><span style="color: lightgrey;">${String.fromCharCode(9733).repeat(5 - Math.floor(place.rating))}</span>
      </div>
      <div style="font-size: 14px; color: grey;">
        ${place.latitude}
      </div>
      <div style="font-size: 14px; color: green;">
        ${place.longitude}
      </div>
    </div>`;


// Refer to https://github.com/google-map-react/google-map-react#use-google-maps-api
const handleApiLoaded = (map, maps, places) => {
  const markers = [];
  const infowindows = [];

  places.forEach(place => {
  	console.log(places)
    markers.push(new maps.Marker({
      position: {
        lat: place.latitude,
        lng: place.longitude,
      },
      map,
    }));

    infowindows.push(new maps.InfoWindow({
      content: getInfoWindowString(place),
    }));
  });

  markers.forEach((marker, i) => {
    marker.addListener('click', () => {
      infowindows[i].open(map, marker);
    });
  });

let infoWindow = new maps.InfoWindow({
    content: "",
    position: "",
  });

  infoWindow.open(map);
  // Configure the click listener.
  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    infoWindow.close();
    // Create a new InfoWindow.
    infoWindow = new maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });

    var currentLatLng = mapsMouseEvent.latLng.toJSON()
    infoWindow.setContent(
      JSON.stringify(currentLatLng)
    );

    infoWindow.open(map);
    console.log(currentLatLng.lat, currentLatLng.lng)

	base('Table 1').create([
	  {
	    "fields": {
	      "Location": "",
	      "Notes": "",
	      "Latitude": currentLatLng.lat,
	      "Longitude": currentLatLng.lng,
	    }
	  },
	], function(err, records) {
	  if (err) {
	    console.error(err);
	    return;
	  }
	  records.forEach(function (record) {
	    console.log(record.getId());
	  });
	});


  });

};


// const getCurrentLatLng = (map, maps, places) => {

  

// }

function Map() {

	const [places, setPlaces] = useState([{
			id: "123",
			comment: "met a friend here",
			latitude: 1.56,
			longitude: 52.0,
		}]);

	useEffect(() => {

		base('Table 1').select({
		    maxRecords: 1000,
			view: "Grid view"
		}).eachPage(function page(records, fetchNextPage) {

		records.forEach(function(record) {
			recordsArr.push({
				id: record.id,
				longitude: record.get('Longitude'),
				latitude: record.get('Latitude'),
			})
		});

		    fetchNextPage();
			return;
		}, function done(err) {
    		if (err) { console.error(err); 
    			return;
    		} else {
				setPlaces(recordsArr);
				console.log(places)
    		}
		});
	}, []);		

    return (
  		<div style={{ height: '100vh', width: '100%' }}>
          {places.length > 1 && (
          <GoogleMap
            defaultZoom={5}
            defaultCenter={LOS_ANGELES_CENTER}
            bootstrapURLKeys={{ key: process.env.REACT_APP_MAP_KEY }}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, places)}
            // onGoogleApiLoaded={({ map, maps }) => getCurrentLatLng(map, maps, places)}

          />
          )}
      </div>
    );
  // }
}

export default Map;