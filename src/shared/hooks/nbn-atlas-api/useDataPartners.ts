import { DataResource, useDataResource } from './useDataResource';

// -----------------------------------------------------------------------------
// Example API call:
// https://records-ws.nbnatlas.org/occurrences/search.json?q=lsid:NHMSYS0000504624&pageSize=0&flimit=-1&facet=on&facets=data_resource_uid

const baseUrl = 'https://records-ws.nbnatlas.org/occurrences/search.json?pageSize=0&flimit=-1&facet=on&facets=data_resource_uid&q=lsid:';

const getPartnersUrl = (tvk: string): string => { return baseUrl + tvk; }

// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseDataPartners {
    data: DataResource[] | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useDataPartners(tvk: string): IuseDataPartners {
    
    const searchUrl = getPartnersUrl(tvk);   
    const { dataResources, error, isLoading } = useDataResource(searchUrl);
    
    const response: IuseDataPartners = { 
        data: dataResources, 
        error: error, 
        isLoading: isLoading 
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
