import React from "react";
import { Marker } from "react-map-gl";
import { useStateMap } from "../hooks/MapHooks.js";
import './marker.css';

export const Markers = () => {
  const { markers } = useStateMap();

  return (
    <>
      {markers && markers.map((marker, index) => (
        <Marker
          offsetTop={-15}
          offsetLeft={-15}
          latitude={marker.lat}
          longitude={marker.lng}
          notes={marker.notes}
       >
         <img src={marker.icon} 
          onClick={() => {
            console.log(marker.notes)
          }}/>
        </Marker>
      ))}
    </>
  );
};

