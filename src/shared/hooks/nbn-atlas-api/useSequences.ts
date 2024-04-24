import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';
import { useSpeciesNames } from './useSpeciesNames';

// -----------------------------------------------------------------------------

const baseUrl = 'https://species.nbnatlas.org/externalSite/genbank?s=';

const getGenBankUrl = (sciName: string): string => { return baseUrl + sciName; }

const genBankFetcher = (url: string) => fetcher(url, GenBankSchema);

// -----------------------------------------------------------------------------
// Define data artefacts associated with the API call. Example API call:
// https://species.nbnatlas.org/externalSite/genbank?s=Vanessa+atalanta

const SequenceSchema = z.object({
    description: z.string().nullish(),
    furtherDescription: z.string().nullish(),
    link: z.string().nullish(),
    title: z.string().nullish(),
});

const GenBankSchema = z.object({
    results: z.array(SequenceSchema),
    resultsUrl: z.string().nullish(),
    total: z.string().nullish(),
});

export type TGenBankSchema = z.TypeOf<typeof GenBankSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseSequences {
    data: TGenBankSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useSequences(tvk: string): IuseSequences {
    
    const names = useSpeciesNames(tvk);
    const sciName: string = names.data?.classification.scientificName || '';    
    const searchUrl = getGenBankUrl(sciName);   
    const { data, error, isLoading } = 
        useSWR(sciName.length > 0 ? searchUrl : null, genBankFetcher, 
                { revalidateOnFocus: false });
    
    const response: IuseSequences = { 
        data: data, 
        error: error || names.error, 
        isLoading: isLoading || names.isLoading
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
