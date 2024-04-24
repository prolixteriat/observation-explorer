import useSWR from 'swr';
import { z } from "zod";
import { fetcher } from '../../lib/fetcher';

export const OccurrenceSchema = z.object({
  uuid: z.string(),
  occurrenceID: z.string(),
  scientificName: z.string().optional(),
  vernacularName: z.string().optional(),
  taxonRank: z.string().optional(),
  eventDate: z.number().optional(),
  country: z.string().optional(),
  stateProvince: z.string().optional(),
  gridReference: z.string().optional(),
  dataResourceName: z.string().optional(),
  basisOfRecord: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  thumbWidth: z.string().optional(),
  thumbHeight: z.string().optional(),
});

export const OccurrenceSearchResultSchema = z.object({
  pageSize: z.number(),
  startIndex: z.number(),
  totalRecords: z.number(),
  sort: z.string(),
  dir: z.string(),
  status: z.string(),
  occurrences: z.array(OccurrenceSchema),
});

export type Occurrence = z.TypeOf<typeof OccurrenceSchema>;
export type OccurrenceSearchResult = z.TypeOf<typeof OccurrenceSearchResultSchema>;

const occurrenceFetcher = (url: string) => fetcher(url, OccurrenceSearchResultSchema);

// Define the hook
export const useOccurrenceSearch = (occurrenceSearchApiUrl: string):  { occurrenceSearchResult: OccurrenceSearchResult | undefined, error: any, isValidating: boolean } => {
  const { data, error, isValidating } = useSWR(occurrenceSearchApiUrl, occurrenceFetcher, { revalidateOnFocus: false });

 

  return { occurrenceSearchResult:data, error, isValidating };
};
