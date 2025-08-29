"use client";

import React from 'react';

interface GoogleMapsClientProps {
  address: string;
  className?: string;
  height?: string;
  width?: string;
}

export default function GoogleMapsClient({ 
  address, 
  className = "w-full h-96 rounded-lg shadow-lg",
  height = "400px",
  width = "100%"
}: GoogleMapsClientProps) {
  // Encode the address for the Google Maps URL
  const encodedAddress = encodeURIComponent(address);
  
  // Create the Google Maps embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}`;

  return (
    <div className={className}>
      <iframe
        width={width}
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title="Clinic Location"
        className="rounded-lg"
      />
    </div>
  );
}
