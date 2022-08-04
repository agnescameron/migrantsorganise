import React from "react";
import { Marker } from "react-map-gl";
import { useStateMap } from "../hooks/MapHooks.js";

export const Markers = () => {
  const { markers } = useStateMap();
  console.log('markers', markers)
  return (
    <>
      {markers && markers.map((marker, index) => (
        <Marker
          offsetTop={-48}
          offsetLeft={-24}
          latitude={marker.lat}
          longitude={marker.lng}
       >
         <img src=" https://img.icons8.com/color/48/000000/marker.png" />
        </Marker>
      ))}
    </>
  );
};

