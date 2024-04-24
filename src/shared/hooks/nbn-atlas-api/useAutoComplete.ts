import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------

const baseUrl = 'https://species-ws.nbnatlas.org/search/auto?idxType=TAXON&limit=50&q=';

const getAutoCompleteUrl = (searchQuery: string): string => 
        (baseUrl + searchQuery);

const autoCompleteFetcher = (url:string) => fetcher(url, DataObjectSchema);

// -----------------------------------------------------------------------------
// Define data artefacts associated with API call. Example:
// https://species-ws.nbnatlas.org/search/auto?idxType=TAXON&limit=50&q=red
  
const DataItemSchema = z.object({
    guid: z.string(),
    commonName: z.string().nullish(),
    name: z.string(),
    rankString: z.string()
});
  
export type TDataItemSchema = z.TypeOf<typeof DataItemSchema>;
  
const DataObjectSchema = z.object({
    autoCompleteList: z.array(DataItemSchema)
});

type TDataObjectSchema = z.TypeOf<typeof DataObjectSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseAutoComplete {
    data: TDataObjectSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useAutoComplete(searchQuery: string): IuseAutoComplete {
    
    const searchUrl = getAutoCompleteUrl(searchQuery);
    // Ensure that the minimum length criterion is met before searching.
    const minLenOk: boolean = searchQuery.length > 1;
    const { data, error, isLoading } = 
        useSWR(minLenOk ? searchUrl : null, autoCompleteFetcher, 
                { revalidateOnFocus: false });

    const response: IuseAutoComplete = { 
        data: data, 
        error: error, 
        isLoading: isLoading
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
