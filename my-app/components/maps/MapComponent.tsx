'use client';
import { useEffect, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export default function MapComponent() {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setOptions({
            key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!,
            v: 'weekly',
        });

        const initMap = async () => {
            const { Map } =
                await importLibrary("maps") as google.maps.MapsLibrary;

            if (mapRef.current) {

                new Map(mapRef.current, {
                    center: {
                        lat: 22.5726,
                        lng: 88.3639,
                    },
                    zoom: 12,
                });
            }
        };

        initMap();
    }, []);

    return <div ref={mapRef} className='w-full h-125' />;
}