import useSWR from 'swr';
import { z } from "zod";
import { fetchFacetResults, FacetResultSchema } from '../../lib/facet-fetcher';

// Define the schema for a single data resource
export const DataResourceSchema = z.object({
  name: z.string(),
  uid: z.string(),
  count: z.number(),
  urn: z.string(),
  fq: z.string(),
});

// Define the type for a single data resource
export type DataResource = z.infer<typeof DataResourceSchema>;

// Define the hook
// KPM: added isLoading to the returned object
export const useDataResource = (apiUrl: string): 
  { dataResources: DataResource[] | undefined, 
    error: any, 
    isValidating: boolean,
    isLoading: boolean } => {
  // Add &facets=data_resource_uid&flimit=-1&pageSize=0 to the API URL
  const url = new URL(apiUrl);
  const params = url.searchParams;
  params.set('facets', 'data_resource_uid');
//   params.set('flimit', '-1');
  params.set('pageSize', '0');
  const transformedApiUrl = url.toString();

  // Fetch, cache, and revalidate the facet results from the API using useSWR
  const { data: facetResults, error, isValidating, isLoading } = useSWR(transformedApiUrl, fetchFacetResults, { revalidateOnFocus: false });

  // Transform the facet results into data resources
  const dataResources = facetResults?.[0]?.fieldResult.map(fieldResult => {
    const uid = fieldResult.i18nCode.split('.').pop();

    return DataResourceSchema.parse({ 
      name: fieldResult.label,
      uid,
      count: fieldResult.count,
      fq: fieldResult.fq,
      urn: `https://registry.nbnatlas.org/ws/dataResource/${uid}`
    });
  });

  return { dataResources, error, isValidating, isLoading };
};
