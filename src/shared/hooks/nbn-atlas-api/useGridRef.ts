import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------

const baseUrl = 'https://records-ws.nbnatlas.org/osgrid/lookup.json?q=';

export const getGridRefUrl = (gridref: string): string => 
    { return `${baseUrl}${gridref}`; }

export const gridRefFetcher = (url: string) => fetcher(url, GridRefSchema);

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

export type TGridRefSchema = z.TypeOf<typeof GridRefSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseGridRef {
    data: TGridRefSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useGridRef(gridref: string): IuseGridRef {
    
    const searchUrl: string = getGridRefUrl(gridref);
    const { data, error, isLoading } = 
        useSWR(searchUrl, gridRefFetcher, {revalidateOnFocus: false});

    const response: IuseGridRef = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
