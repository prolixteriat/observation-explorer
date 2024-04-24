import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------

const baseUrl = 'https://lists.nbnatlas.org/ws/species/';

const getRedListSearchUrl = (tvk: string): string => 
    { return baseUrl + `${tvk}?isBIE=true`; }

const redListFetcher = (url: string) => fetcher(url, RedListSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for Atlas API calls: RedListCard. Example API call:
// https://lists.nbnatlas.org/ws/species/NHMSYS0000504624?isBIE=true

const ListSchema = z.object({
    listName: z.string().nullish(),
    username: z.string().nullish(),
});

const KvpValueSchema = z.object({
    key: z.string().nullish(),
    value: z.string().nullish(),
});

export type TKvpValueSchema = z.TypeOf<typeof KvpValueSchema>;

const RedListObjectSchema = z.object({
    dataResourceUid: z.string().nullish(),
    guid: z.string().nullish(),
    list: ListSchema,
    kvpValues: z.array(KvpValueSchema),
});

const RedListSchema = z.array(RedListObjectSchema);

export type TRedListSchema = z.TypeOf<typeof RedListSchema>;

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseRedListCards {
    data: TRedListSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useRedListCards(tvk: string): IuseRedListCards {
    
    const searchUrl = getRedListSearchUrl(tvk);   
    const { data, error, isLoading } = 
            useSWR(searchUrl, redListFetcher, { revalidateOnFocus: false });

    const response: IuseRedListCards = { 
        data: data, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
