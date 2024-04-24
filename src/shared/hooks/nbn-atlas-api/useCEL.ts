import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------
// Required as a workaround for CORS protection on conservationevidence.com:
const corsProxyUrl = 'https://corsproxy.io/?';

export const celBaseUrl = 'https://www.conservationevidence.com/';

const getCelSearchUrl = (sciName: string): string => 
  { return corsProxyUrl + celBaseUrl + 
            `binomial/nbnsearch?name=${sciName}&action=1&total=8`; }

export const getCelSummaryUrl = (sciName: string): string => 
    { return celBaseUrl + `data/index?terms=${sciName}#summaries`; }

const celFetcher = (url: string) => fetcher(url, CelSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for API call. Example API call:
// https://www.conservationevidence.com/binomial/nbnsearch?name=Vanessa+atalanta&action=1&total=8

const CelResultSchema = z.object({
    title: z.string().nullish(),
    url: z.string().nullish(),
});

export const CelSchema = z.object({
    results: z.array(CelResultSchema),
    results_url: z.string().nullish(),
    total_results: z.number(),
    total_results_copy: z.string().nullish(),
});

export type TCelSchema = z.TypeOf<typeof CelSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseCEL {
    data: TCelSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useCEL(sciName: string): IuseCEL {
    
    const searchUrl = getCelSearchUrl(sciName);
    const { data, error, isLoading } = 
        useSWR(sciName.length > 0 ? searchUrl : null, celFetcher, 
                { revalidateOnFocus: false });
    
    const response: IuseCEL = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
