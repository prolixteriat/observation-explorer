import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';
import { getBoundingRectangleWkt } from '../../lib/funcs';
import { ILocation } from '../../lib/types';

// -----------------------------------------------------------------------------

const baseUrl = 'https://records-ws.nbnatlas.org/explore/groups.json?fq=(geospatial_kosher:true+AND+-occurrence_status:absent)';

const getGroupsUrlCircle = (lat: number, lon: number, radius: number): string => { 
    return `${baseUrl}&lat=${lat}&lon=${lon}&radius=${radius}`; 
}

const getGroupsUrlRectangle = (lat: number, lon: number, radius: number): string => {   
    const distance = radius * 1000;
    const wkt = getBoundingRectangleWkt(lat, lon, distance, distance);
    return `${baseUrl}&wkt=${wkt}`; 
}

const groupsFetcher = (url: string) => fetcher(url, GroupsSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for groups API call. Example API call:
// https://records-ws.nbnatlas.org/explore/groups.json?fq=(geospatial_kosher:true+AND+-occurrence_status:absent)&lat=53.2149&lon=-2.9110&radius=5

const SingleGroupSchema = z.object({
    count: z.number(),
    level: z.number(),
    name: z.string(),
    speciesCount: z.number(),
});

export type TSingleGroupSchema = z.TypeOf<typeof SingleGroupSchema>;

const GroupsSchema = z.array(SingleGroupSchema);

export type TGroupsSchema = z.TypeOf<typeof GroupsSchema>;

// -----------------------------------------------------------------------------
// Define custom hooks.

interface IuseSpeciesGroups {
    data: TGroupsSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useSpeciesGroupsCircle(lat: number, lon: number, radius: number): IuseSpeciesGroups {
    
    const searchUrl: string = getGroupsUrlCircle(lat, lon, radius);
    const { data, error, isLoading } = 
        useSWR(searchUrl, groupsFetcher, {revalidateOnFocus: false});

    const response: IuseSpeciesGroups = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -------------------

export function useSpeciesGroups(loc: ILocation): IuseSpeciesGroups {
    
    const searchUrl: string = (loc.isSquare) ? 
            getGroupsUrlRectangle(loc.latitude, loc.longitude, loc.radius) :
            getGroupsUrlCircle(loc.latitude, loc.longitude, loc.radius);
    
    const { data, error, isLoading } = 
        useSWR(searchUrl, groupsFetcher, {revalidateOnFocus: false});

    const response: IuseSpeciesGroups = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
