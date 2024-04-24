import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';
import { useSpeciesNames } from './useSpeciesNames';

// -----------------------------------------------------------------------------

const baseUrl = 'https://species.nbnatlas.org/externalSite/eol?';

const getExternalSearchUrl = (tvk: string, sciName: string): string => 
    { return baseUrl + `guid=${tvk}&s=${sciName}`; }

const externalFetcher = (url: string) => fetcher(url, ExternalSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for Atlas API calls: InfoCards. Example API call:
// https://species.nbnatlas.org/externalSite/eol?guid=NHMSYS0000504624&s=Vanessa%20atalanta

const AgentSchema = z.object({
    full_name: z.string().nullish(),
    homepage: z.string().nullish(),
    role: z.string().nullish(),
});

const DataObjectSchema = z.object({
    agents: z.array(AgentSchema),
    description: z.string().nullish(),
    license: z.string().nullish(),
    rightsHolder: z.string().nullish(),
    title: z.string().nullish(),
});

type TDataObjectSchema = z.TypeOf<typeof DataObjectSchema>;

const TaxonConceptSchema = z.object({
    dataObjects: z.array(DataObjectSchema).nullish(),
    identifier: z.number().nullish(),
    scientificName: z.string().nullish(),
});

export type TTaxonConceptSchema = z.TypeOf<typeof TaxonConceptSchema>;

const ExternalSchema = z.object({
    taxonConcept: TaxonConceptSchema,
});

type TExternalSchema = z.TypeOf<typeof ExternalSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseInfoCards {
    data: TExternalSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useInfoCards(tvk: string): IuseInfoCards {
    
    const names = useSpeciesNames(tvk);
    const sciName: string = names.data?.classification.scientificName || '';    
    const searchUrl = getExternalSearchUrl(tvk, sciName);   
    const { data, error, isLoading } = 
            useSWR(sciName.length > 0 ? searchUrl : null, externalFetcher,
                    { revalidateOnFocus: false });
    
    const response: IuseInfoCards = { 
        data: data, 
        error: error || names.error, 
        isLoading: isLoading || names.isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
