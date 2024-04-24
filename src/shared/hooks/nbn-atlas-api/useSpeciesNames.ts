import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------

const baseUrl = 'https://species-ws.nbnatlas.org/species/';

export const getSpeciesNameUrl = (tvk: string): string => 
    { return baseUrl + tvk + '.json'; }

export const speciesNameFetcher = (url: string) => fetcher(url, SpeciesNameSchema);

// -----------------------------------------------------------------------------
// Define data artefacts associated with API call. Example AI call:
// https://species-ws.nbnatlas.org/species/BMSSYS0000045962.json

const ClassificationSchema = z.object({
    kingdom: z.string().nullish(),
    kingdomGuid: z.string().nullish(),
    phylum: z.string().nullish(),
    phylumGuid: z.string().nullish(),
    subphylum: z.string().nullish(),
    subphylumGuid: z.string().nullish(),
    class: z.string().nullish(),
    classGuid: z.string().nullish(),
    order: z.string().nullish(),
    orderGuid: z.string().nullish(),
    suborder: z.string().nullish(),
    suborderGuid: z.string().nullish(),
    superfamily: z.string().nullish(),
    superfamilyGuid: z.string().nullish(),
    family: z.string().nullish(),
    familyGuid: z.string().nullish(),
    subfamily: z.string().nullish(),
    subfamilyGuid: z.string().nullish(),
    tribe: z.string().nullish(),
    tribeGuid: z.string().nullish(),
    genus: z.string().nullish(),
    genusGuid: z.string().nullish(),
    scientificName: z.string().nullish(),
    guid: z.string().nullish(),
    species: z.string().nullish(),
    speciesGuid: z.string().nullish(),
});

const CommonNameSchema = z.object({
    infoSourceName: z.string().nullish(),
    language: z.string().nullish(),
    nameString: z.string().nullish(),
    status: z.string().nullish(),
});

const TaxonConceptSchema = z.object({
    nameAuthority: z.string().nullish(),
    nameComplete: z.string().nullish(),
    rankString: z.string().nullish(),
    taxonomicStatus: z.string().nullish(),
});

export type TTaxonConceptSchema = z.TypeOf<typeof TaxonConceptSchema>;

const SynonymSchema = z.object({
    nameAuthority: z.string().nullish(),
    nameComplete: z.string().nullish(),
    nameFormatted: z.string().nullish(),
    nameString: z.string().nullish(),
  });
  
export const SpeciesNameSchema = z.object({
    classification: ClassificationSchema,
    commonNames: z.array(CommonNameSchema),
    establishmentMeans: z.string().nullish(),
    synonyms: z.array(SynonymSchema),
    taxonConcept: TaxonConceptSchema,
});

export type TSpeciesNameSchema = z.TypeOf<typeof SpeciesNameSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseSpeciesNames {
    data: TSpeciesNameSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useSpeciesNames(tvk: string): IuseSpeciesNames {
    
    const searchUrl = getSpeciesNameUrl(tvk);   
    const { data, error, isLoading } = 
        useSWR(searchUrl, speciesNameFetcher, { revalidateOnFocus: false });

    const response: IuseSpeciesNames = { 
        data: data, 
        error: error, 
        isLoading: isLoading };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
