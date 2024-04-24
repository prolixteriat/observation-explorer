import { z } from 'zod';

import { fetcher } from './fetcher'

export const FieldResultSchema = z.object({
  label: z.string(),
  i18nCode: z.string(),
  count: z.number(),
  fq: z.string(),
});

export const FacetResultSchema = z.object({
  fieldName: z.string(),
  fieldResult: z.array(FieldResultSchema),
});

const ApiResponseSchema = z.object({
  facetResults: z.array(FacetResultSchema),
});


type FacetResult = z.infer<typeof FacetResultSchema>;

export async function fetchFacetResults(url: string): Promise<FacetResult[]> {
    const response = await fetcher(url, ApiResponseSchema);
    return response.facetResults;
}
