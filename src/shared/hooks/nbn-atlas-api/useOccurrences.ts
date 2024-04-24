import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';
import { IExploreMap } from '../../lib/types';

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------

const baseSummaryUrl = 'https://records-ws.nbnatlas.org/occurrences/info?q=*%3A*';

// Radius of search is dependent on current zoom level.
const calcRadius = (zoom: number) => (250 * Math.pow(Math.E, (-0.61 * zoom)));

const getLocationUrl = (lat: number, lon: number, zoom: number): string => {   
    const radius = calcRadius(zoom);
    return `&lat=${lat}&lon=${lon}&radius=${radius}&format=json`; 
}

// Return query URL for all taxons.
export const occurrencesSummaryUrl = (lat: number, lon: number, zoom: number): string => {   
    const taxonUrl = '&fq=species_group:*&fq=taxon_name:*';
    return baseSummaryUrl + taxonUrl + getLocationUrl(lat, lon, zoom); 
}

// Return query URL for a specific taxon.
export const occurrencesSummaryTaxonUrl = (lat: number, lon: number, zoom: number, explore: IExploreMap): string => {   
    // Handle unique case of 'ALL_SPECIES'.
    const groupName = (explore.groupName === 'ALL_SPECIES' || explore.groupName === '') ? 
                        '*' : explore.groupName;
    let taxonUrl = `&fq=species_group:${groupName}`;
    if (!explore.isGroup && explore.speciesName) {
        taxonUrl += `&fq=taxon_name:%22${explore.speciesName}%22`;
    }
    
    return baseSummaryUrl + taxonUrl + getLocationUrl(lat, lon, zoom); 
}

export const occurrencesSummaryFetcher = (url: string) => fetcher(url, OccurrencesSummarySchema);

// -----------------------------------------------------------------------------
// Define data artefacts for Atlas API calls: occurrences summary. Example API call:
// https://records-ws.nbnatlas.org/occurrences/info?q=*%3A*&fq=species_group:*&fq=taxon_name:*&zoom=14&lat=53.21346348533944&lon=-2.909402847290039&radius=0.05&format=json

const OccurrencesSummarySchema = z.object({
    count: z.number(),
    occurrences: z.array(z.string()).nullish(),
});

export type TOccurrencesSummarySchema = z.TypeOf<typeof OccurrencesSummarySchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseOccurrencesSummary {
    data: TOccurrencesSummarySchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useOccurrencesSummary(lat: number, lon: number, zoom: number): IuseOccurrencesSummary {
    
    const searchUrl = occurrencesSummaryUrl(lat, lon, zoom);   
    const { data, error, isLoading } = 
        useSWR(searchUrl, occurrencesSummaryFetcher, {revalidateOnFocus: false});
    
    const response: IuseOccurrencesSummary = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// Detail
// -----------------------------------------------------------------------------

const baseDetailUrl = 'https://records-ws.nbnatlas.org/occurrences/';

export const occurrencesDetailUrl = (uuid: string): string => { return baseDetailUrl + uuid; }

export const occurrencesDetailFetcher = (url: string) => fetcher(url, OccurrencesDetailSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for Atlas API calls: occurrences detail. Example API call:
// https://records-ws.nbnatlas.org/occurrences/39f4d76c-31d9-41d0-b6e4-42a98a3a4267.json
  
const ProcessedSchema = z.object({
    attribution: z.object({
        dataProviderName: z.string().nullish(),
        dataResourceName: z.string().nullish(),
    }),
    classification: z.object({
        scientificName: z.string().nullish(),
        vernacularName: z.string().nullish(),
    }).nullish(),
    event: z.object({
        eventDate: z.string().nullish(),
    }).nullish(),
    location: z.object({
        decimalLatitude: z.string().nullish(),
        decimalLongitude: z.string().nullish(),
        gridReference: z.string().nullish(),
        locality: z.string().nullish(),
    }).nullish(),
    occurrence: z.object({
        basisOfRecord: z.string().nullish(),
        recordedBy: z.string().nullish(),
        occurrenceStatus: z.string().nullish(),
    }).nullish(),
});

const OccurrencesDetailSchema = z.object({
    processed: ProcessedSchema.nullish(),
});

export type TOccurrencesDetailSchema = z.TypeOf<typeof OccurrencesDetailSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseOccurrencesDetail {
    data: TOccurrencesDetailSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useOccurrencesDetail(uuid: string): IuseOccurrencesDetail {
    
    const searchUrl = occurrencesDetailUrl(uuid);   
    const { data, error, isLoading } = 
        useSWR(searchUrl, occurrencesDetailFetcher, {revalidateOnFocus: false});
    
    const response: IuseOccurrencesDetail = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
