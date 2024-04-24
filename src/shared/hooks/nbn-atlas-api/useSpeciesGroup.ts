import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';
import { getBoundingRectangleWkt } from '../../lib/funcs';
import { ILocation } from '../../lib/types';

// -----------------------------------------------------------------------------

const baseUrl = 'https://records-ws.nbnatlas.org/explore/group/';

function getCommonQry(groupName: string, lat: number, lon: number, radius: number,
                        pageSize: number, families?: string[]): string {

    const pageUrl = `${baseUrl}${groupName}.json?`;
    const baseQry = `fq=(geospatial_kosher:true+AND+-occurrence_status:absent)&sort=count&pageSize=${pageSize}`;
    const familyQry = families ? '&fq=family:' + families.join('+OR+') : '';

    return pageUrl + baseQry + familyQry;
            }
            
function getGroupUrlCircle(groupName: string, lat: number, lon: number, radius: number,
                            pageSize: number, families?: string[]): string {
    
    const commonQry = getCommonQry(groupName, lat, lon, radius, pageSize, families);
    const regionQry = `&lat=${lat}&lon=${lon}&radius=${radius}`;
    return commonQry + regionQry;
}

function getGroupUrlRectangle(groupName: string, lat: number, lon: number, radius: number,
                                pageSize: number, families?: string[]): string {
    
    const commonQry = getCommonQry(groupName, lat, lon, radius, pageSize, families);
    const distance = radius * 1000; // convert from km to m
    const wkt = getBoundingRectangleWkt(lat, lon, distance, distance);        
    const regionQry = `&wkt=${wkt}`;
    return commonQry + regionQry;
}

const groupFetcher = (url: string) => fetcher(url, GroupSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for species API call. Example API call:
// https://records-ws.nbnatlas.org/explore/group/Fungi.json?fq=(geospatial_kosher:true+AND+-occurrence_status:absent)&sort=count&pageSize=50&lat=53.2149&lon=-2.911&radius=5

const SingleSpeciesSchema = z.object({
    commonName: z.string(),
    count: z.number(),
    family: z.string(),
    guid: z.string(),
    kingdom: z.string(),
    name: z.string(),
    rank: z.string()
});

export type TSingleSpeciesSchema = z.TypeOf<typeof SingleSpeciesSchema>;

const GroupSchema = z.array(SingleSpeciesSchema);

export type TGroupSchema = z.TypeOf<typeof GroupSchema>;

// -----------------------------------------------------------------------------
// Define custom hooks.

interface IuseSpeciesGroup {
    data: TGroupSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useSpeciesGroupCircle(groupName: string, lat: number, lon: number, 
                    radius: number, pageSize: number, families?: string[]): IuseSpeciesGroup {
    
    const searchUrl: string = getGroupUrlCircle(groupName, lat, lon, radius, pageSize, 
                                            families);
    const { data, error, isLoading } = 
        useSWR(searchUrl, groupFetcher, {revalidateOnFocus: false});

    const response: IuseSpeciesGroup = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -------------------

export function useSpeciesGroup(groupName: string, loc: ILocation, 
                pageSize: number, families?: string[]): IuseSpeciesGroup {

    const searchUrl: string = (loc.isSquare) ? 
        getGroupUrlRectangle(groupName, loc.latitude, loc.longitude, loc.radius, pageSize, families) :
        getGroupUrlCircle(groupName, loc.latitude, loc.longitude, loc.radius, pageSize, families);
                    
    const { data, error, isLoading } = 
        useSWR(searchUrl, groupFetcher, {revalidateOnFocus: false});

    const response: IuseSpeciesGroup = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
