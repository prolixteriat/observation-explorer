import useSWR from 'swr';
import { z } from 'zod';
import { GeoJsonObject } from 'geojson';
import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------
// useVcFromCoord
// -----------------------------------------------------------------------------

const baseUrlVcFromCoord = 'https://layers.nbnatlas.org/ws/intersect/cl14/';

export const getVcFromCoordUrl = (latitude: number, longitude: number): string => 
     `${baseUrlVcFromCoord}${latitude}/${longitude}`; 

export const vcFromCoordFetcher = (url: string) => fetcher(url, VcFromCoordSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for API call. Example API call:
// https://layers.nbnatlas.org/ws/intersect/cl14/53.2356/-2.5450

const VcFromCoordSchema = z.array(z.object({
    field: z.string().nullish(),
    description: z.string().nullish(),
    layername: z.string().nullish(),
    pid: z.string().nullish(),
    value: z.string().nullish()
}));

export type TVcFromCoordSchema = z.TypeOf<typeof VcFromCoordSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseVcFromCoord {
    data: TVcFromCoordSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useVcFromCoord(latitude: number, longitude: number): IuseVcFromCoord {
    
    const searchUrl: string = getVcFromCoordUrl(latitude, longitude);
    const { data, error, isLoading } = 
        useSWR(searchUrl, vcFromCoordFetcher, {revalidateOnFocus: false});

    const response: IuseVcFromCoord = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// useVcFromPid
// -----------------------------------------------------------------------------

const baseUrlVcFromPid = 'https://layers.nbnatlas.org/ws/object/';

export const getVcFromPidUrl = (pid: string): string => `${baseUrlVcFromPid}${pid}`; 

export const vcFromPidFetcher = (url: string) => fetcher(url, VcFromPidSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for API call. Example API call:
// https://layers.nbnatlas.org/ws/object/2694

const VcFromPidSchema = z.object({
    area_km: z.number().nullish(),
    bbox: z.string().nullish(),
    description: z.string().nullish(),
    fid: z.string().nullish(),
    fieldname: z.string().nullish(),
    id: z.string().nullish(),
    name: z.string().nullish(),
    pid: z.string().nullish(),
    wmsurl: z.string().nullish()
});

export type TVcFromPidSchema = z.TypeOf<typeof VcFromPidSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseVcFromPid {
    data: TVcFromPidSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useVcFromPid(pid: string): IuseVcFromPid {
    
    const searchUrl: string = (pid.length > 0) ? getVcFromPidUrl(pid) : '';
    const { data, error, isLoading } = 
        useSWR(searchUrl, vcFromPidFetcher, {revalidateOnFocus: false});

    const response: IuseVcFromPid = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// useVcBoundary
// -----------------------------------------------------------------------------

const baseUrlVcBoundary = 'https://layers.nbnatlas.org/ws/shape/geojson/';

export const getVcBoundaryUrl = (pid: string): string => `${baseUrlVcBoundary}${pid}`; 

export const vcBoundaryFetcher = (url: string) => fetcher(url, VcBoundarySchema);

// -----------------------------------------------------------------------------
// Define data artefacts for API call. Example API call:
// https://layers.nbnatlas.org/ws/shape/geojson/2694

const CoordSchema = z.array(z.array(z.array(z.array((z.number(), z.number())))));
const VcBoundarySchema = z.object({
    type: z.string().nullish(),
    coordinates: CoordSchema.nullish()

});

type TVcBoundarySchema = z.TypeOf<typeof VcBoundarySchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseVcBoundary {
    data: TVcBoundarySchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useVcBoundary(pid: string): IuseVcBoundary {
    
    const searchUrl: string = getVcBoundaryUrl(pid);
    const { data, error, isLoading } = 
        useSWR(searchUrl, vcBoundaryFetcher, {revalidateOnFocus: false});

    const response: IuseVcBoundary = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
