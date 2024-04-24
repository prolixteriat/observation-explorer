import { useState, useEffect } from 'react';

import { z } from 'zod';

import { fetcher } from '../lib/fetcher';

import Boundaries from '../../assets/VC_boundaries.json';

// -----------------------------------------------------------------------------

const baseUrlGridRef= 'https://records-ws.nbnatlas.org/osgrid/lookup.json?q=';

const getGridRefUrl = (gridref: string): string => 
    { return `${baseUrlGridRef}${gridref}`; }

const gridRefFetcher = (url: string) => fetcher(url, GridRefSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for API call. Example API call:
// https://records-ws.nbnatlas.org/osgrid/lookup.json?q=SJ798653

const GridRefSchema = z.object({
    valid: z.boolean(),
    decimalLatitude: z.string().nullish(),
    decimalLongitude: z.string().nullish(),
    maxLat: z.string().nullish(),
    maxLong: z.string().nullish(),
    minLat: z.string().nullish(),
    minLong: z.string().nullish(),
});

type TGridRefSchema = z.TypeOf<typeof GridRefSchema>;

// -----------------------------------------------------------------------------

const baseUrlPostcode = 'https://api.postcodes.io/postcodes/';

const getPostcodeUrl = (postcode: string): string => 
    { return `${baseUrlPostcode}${postcode}`; }

const postcodeFetcher = (url: string) => fetcher(url, PostcodeSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for postcode API call. Example API call:
// https://api.postcodes.io/postcodes/CH21BB
// API documentation: https://postcodes.io/

const ResultSchema = z.object({
    country: z.string(),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
    postcode: z.string(),
}).nullish();

const PostcodeSchema = z.object({
    error: z.string().nullish(),
    result: ResultSchema,
    status: z.number(),
});
// -----------------------------------------------------------------------------

export interface ICoord {
    latitude: number;
    longitude: number;
}
// -----------------------------------------------------------------------------
// Return the centroid of a named region.

interface ISearchLocation {
    coord: ICoord | undefined;
    error: Error | undefined;
}

function getRegionCentroid(vc: string): ISearchLocation {
    
    let found = false;

    const response: ISearchLocation = {
            coord: undefined,
            error: undefined
    };
    const vc_lower = vc.toLowerCase();

    for (const boundary of Boundaries) {
        if (boundary.name.toLowerCase() === vc_lower) {
            const lat = (boundary.ulat + boundary.llat) / 2;
            const lon = (boundary.ulon + boundary.llon) / 2;
            response.coord = {latitude: lat, longitude: lon};
            found = true;
            break;               
        }
    }
    if (!found) {
        response.error = new Error(`Unknown region: ${vc}`);
    }
    return response;
}
// -----------------------------------------------------------------------------
// Return the device's current location.

const getGeolocation = (): Promise<GeolocationCoordinates> => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error)
        );
    });
};
// -----------------------------------------------------------------------------
// Attempt to get lat/lon using a variety of approaches.

async function fetchLocation(searchQuery: string): Promise<ICoord> {

    // Use geolocation
    if (searchQuery.toLowerCase() === 'current') {
        const geoLoc = await getGeolocation();
        const coord: ICoord = {
            latitude: geoLoc.latitude,
            longitude: geoLoc.longitude
        }
        return coord;
    }

    let response: ICoord = { latitude: 0, longitude: 0 };
    try {
        // Use postcode
        const pcUrl = getPostcodeUrl(searchQuery);
        const pc = await postcodeFetcher(pcUrl);
        if (pc.result && pc.result.latitude && pc.result.longitude) {
            // console.debug(`postcode match: ${searchQuery}`);            
            response.latitude = pc.result.latitude;
            response.longitude = pc.result.longitude;
        } else {
            throw new Error('Not a valid postcode');
        }
            
    } catch (error) {
        try {
            // Use gridref
            const grUrl = getGridRefUrl(searchQuery);
            const gr = await gridRefFetcher(grUrl);
            if (gr.decimalLatitude && gr.decimalLongitude) {
                // console.debug(`gridref match: ${searchQuery}`);                
                response.latitude = parseFloat(gr.decimalLatitude);
                response.longitude = parseFloat(gr.decimalLongitude);
            } else {
                throw new Error('Not a valid grid reference');
            }
        } catch (error) {
            // Use region name
            const rc = getRegionCentroid(searchQuery);
            if (rc.coord) {
                // console.debug(`region match: ${searchQuery}`);
                response = rc.coord;
            }
            else if (rc.error) {
                throw new Error(`Failed to locate search term: ${searchQuery}`);
            }
        }
    }  
    return response
}
// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseSearchLocation {
    coord: ICoord | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}

export function useSearchLocation(searchQuery: string): IuseSearchLocation {
    
    const [coord, setCoord] = useState<ICoord>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<Error|undefined>(undefined);    
          
    useEffect(() => {
        if (searchQuery.length < 2) {
            return;
        }
        setIsError(undefined);
        setIsLoading(true);
        fetchLocation(searchQuery)
        .then((data: ICoord) => { 
            setCoord(data); 
        })
        .catch((err) => {
            setIsError(err);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }, [searchQuery]);

    const response: IuseSearchLocation = {
        coord: coord,
        error: isError,
        isLoading: isLoading
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
