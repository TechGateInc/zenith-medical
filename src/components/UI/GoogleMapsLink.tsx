"use client";

import React from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapsLinkProps {
  address: string;
  className?: string;
  children?: React.ReactNode;
}

export default function GoogleMapsLink({ 
  address, 
  className = "inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors",
  children 
}: GoogleMapsLinkProps) {
  // Encode the address for the Google Maps URL
  const encodedAddress = encodeURIComponent(address);
  
  // Create the Google Maps URL
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={`View ${address} on Google Maps`}
    >
      <MapPin className="h-4 w-4 mr-1" />
      {children || 'View on Map'}
    </a>
  );
}
