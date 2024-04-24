import useSWR from 'swr';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

import { getBoundingRectangleWkt } from '../../lib/funcs';
import { IExploreMap } from '../../lib/types';

// -----------------------------------------------------------------------------
// Define the types of chart data that may be returned.
type TChartData = 'country' | 'dataset' | 'decade' | 'family' | 'genus' | 
                    'licence' | 'month'| 'partner' |'since1990' | 'vc';
// Define the query strings associated with each type of chart data.
const dataTypeQuery: { [k in TChartData]: string } = {
    'country': 'cl28',
    'dataset': 'data_resource_uid',
    'decade': 'decade',
    'family': 'family',
    'genus': 'genus',
    'licence': 'license',
    'month': 'month',
    'partner': 'data_provider_uid',
    'since1990': 'year&fq=year:[1990%20TO%20*]',
    'vc': 'cl256'
};

// -----------------------------------------------------------------------------
// Define Atlas API calls. 

const baseUrl = 'https://records-ws.nbnatlas.org/chart.json?';

interface IChartData {
    dataType: TChartData; 
    sciName?: string; 
    tvk?: string;
}

// Return the query string segment which relates to the taxon name.
const getTaxonQuery = (explore: IExploreMap): string => {
    const groupName = (!explore.groupName || explore.groupName === 'ALL_SPECIES') ? '*' : explore.groupName;
    const speciesName = (explore.isGroup || !explore.speciesName) ? '*' : `%22${explore.speciesName}%22`;
    const query = `q=taxon_name%3A${speciesName}&fq=species_group%3A${groupName}`;
    return query;
}

// Return a URL specific to the type of query
const getLocationUrl = (explore: IExploreMap, {dataType}: IChartData): string => { 
    const loc= explore.location;
    const taxon = getTaxonQuery(explore);
    const common = '&qc=&xother=false&fq=(geospatial_kosher:true+AND+-occurrence_status:absent)';
    let region: string;
    if (loc.isSquare) {
        const distance = loc.radius * 1000;
        const wkt = getBoundingRectangleWkt(loc.latitude, loc.longitude, distance, distance);
        region = `&wkt=${wkt}`;
    } else {
        region = `&lat=${loc.latitude}&lon=${loc.longitude}&radius=${loc.radius}`;
    }
    const variable = `&x=${dataTypeQuery[dataType]}`;
    const url = baseUrl + taxon + common + region + variable;
    return url; 
}

// Return a URL specific to the type of query: taxon (scientific name or TVK)
const getTaxonUrl = (explore: IExploreMap, {dataType}: IChartData): string => {
    const taxon = getTaxonQuery(explore);
    const common = '&qc=&xmissing=false';
    const url = baseUrl + taxon + common + `&x=${dataTypeQuery[dataType]}`;
    return url;
}

const chartFetcher = (url: string) => fetcher(url, ChartSchema);

// -----------------------------------------------------------------------------
// Define data artefacts for Atlas API calls. Example API calls:
// TVK...
// https://records-ws.nbnatlas.org/chart.json?q=lsid:NHMSYS0000080188&x=cl256&qc=&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=lsid:NHMSYS0000080188&x=data_provider_uid&qc=&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=lsid:NHMSYS0000080188&x=data_resource_uid&qc=
// https://records-ws.nbnatlas.org/chart.json?q=lsid:NHMSYS0000080188&x=decade&qc=&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=lsid:NHMSYS0000080188&x=month&qc=&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=lsid:NHMSYS0000080188&x=year&qc=&fq=year:[1990%20TO%20*]
// Location...
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=family&qc=&xother=false&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=genus&qc=&xother=false&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=license&qc=&xother=false&xmissing=false
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=month&qc=&xother=false
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=decade&qc=&xother=false
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=year&qc=&xother=false&xmissing=false&fq=year:[1990%20TO%20*]
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=cl256&qc=&xother=false
// https://records-ws.nbnatlas.org/chart.json?q=*%3A*&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)&lat=52.9548&lon=1.1581&radius=5.0&x=cl28&qc=&xother=false

const DataSchema = z.object({
    count: z.number().nullish(),
    fq: z.string().nullish(),
    i18nCode: z.string().nullish(),
    label:  z.string().nullish(),
});

const ContainerSchema = z.object({
    data: z.array(DataSchema),
    label: z.string().nullish(),
});

export type TContainerSchema = z.TypeOf<typeof ContainerSchema>;

export const ChartSchema = z.object({
    data: z.array(ContainerSchema),
    x: z.string().nullish(),
    xLabel: z.string().nullish(),
});

type TChartSchema = z.TypeOf<typeof ChartSchema>;

// -----------------------------------------------------------------------------
// Define custom hooks.

export interface IuseChartData {
    data: TChartSchema | undefined;
    error: Error | undefined;
    isLoading: boolean | undefined;
}   
// -------------------

export function useChartDataTaxon(explore: IExploreMap, props: IChartData): IuseChartData {
    
    const searchUrl = getTaxonUrl(explore, props);
    const { data, error, isLoading } = 
        useSWR(searchUrl, chartFetcher, { revalidateOnFocus: false });

    const response: IuseChartData = { 
        data: data, 
        error: error, 
        isLoading: isLoading
    };

    return response;
}

// -------------------
// Return a specific type of chart data for a given location, with the option of
// restricting returned data to a specific taxon (scientific name or tvk).

export function useChartDataLoc(explore: IExploreMap, props: IChartData): IuseChartData {
    
    const searchUrl = getLocationUrl(explore, props);
    const { data, error, isLoading } =
        useSWR(searchUrl, chartFetcher, { revalidateOnFocus: false });

    const response: IuseChartData = { 
        data: data, 
        error: error, 
        isLoading: isLoading
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
