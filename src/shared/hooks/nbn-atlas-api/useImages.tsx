import { useEffect, useState } from 'react';

import { Image } from 'react-grid-gallery';
import { z } from 'zod';

import { fetcher } from '../../lib/fetcher';

// -----------------------------------------------------------------------------
// Data artefacts for image searching for a given TVK. Example API call:
// https://records-ws.nbnatlas.org/occurrences/search.json?fq=multimedia:%22Image%22&pageSize=1000&q=lsid:NHMSYS0000504624

const searchUrlBase = 'https://records-ws.nbnatlas.org/occurrences/search.json?fq=multimedia:%22Image%22&pageSize=1000&q=lsid:';

const searchFetcher = (url:string) => fetcher(url, SearchResultSchema);

export const SearchItemSchema = z.object({
    collector: z.string().nullish(),
    dataResourceName: z.string().nullish(),
    dataResourceUid: z.string().nullish(),
    gridReference: z.string().nullish(),
    latLong: z.string().nullish(),
    month: z.string().nullish(),
    namesLsid: z.string().nullish(),
    raw_occurrenceRemarks: z.string().nullish(),
    speciesGuid: z.string().nullish(),
    scientificName: z.string(),
    vernacularName: z.string().nullish(),
    year: z.number().nullish(),
    image: z.string(),
    imageUrl: z.string(),
    largeImageUrl: z.string().nullish(),
    smallImageUrl: z.string().nullish(),
    thumbnailUrl: z.string().nullish(),
});

const SearchResultSchema = z.object({
    totalRecords: z.number(),
    occurrences: z.array(SearchItemSchema),
});
// -----------------------------------------------------------------------------
// Data artefacts for info searching on a single image. Example API call:
// https://images.nbnatlas.org/ws/image/55e20bc0-7182-4cb0-b577-9aa5d40e1a83

const infoUrlBase = 'https://images.nbnatlas.org/ws/image/';

const infoFetcher = (url:string) => fetcher(url, ImageInfoSchema);

const ImageInfoSchema = z.object({
    creator: z.string(),
    dateTaken: z.string(),
    height: z.number(),
    license: z.string(),
    rightsHolder: z.string(),
    width: z.number(),
    title: z.string(),
});
// -----------------------------------------------------------------------------
// Data artefacts for display of images and associated information.

export interface CustomImage extends Image {
    creator: string, 
    dateTaken: string, 
    largeUrl: string;
    licence: string;
    location: string,
    namesLsid: string;
    remarks: string;
    originalUrl: string;
    thumbnailUrl: string;
    title: string;
}

export interface Slide {
    description: string;
    height: number;
    src: string;
    title: string;
    width: number;
}
// -----------------------------------------------------------------------------
// Fetch images associated with the provided TVK.

export async function fetchImages(tvk: string): Promise<CustomImage[]> {

  const images: CustomImage[] = [];
  // Fetch all images associated with the provided TVK.
  const searchUrl = searchUrlBase + tvk;
  const data = await searchFetcher(searchUrl);
  // Process the fetched image data into a format suitable for Gallery.
  for (const i in data.occurrences) {
      const datum = data.occurrences[i];
      // Fetch metadata associated with the current image.
      const infoUrl = infoUrlBase + datum.image;
      const info = await infoFetcher(infoUrl);
      // Create image object.
      const img: CustomImage = {
          src: datum.imageUrl ??= '',
          dateTaken: info.dateTaken,
          largeUrl: datum.largeImageUrl ??= '',
          licence: `${info.license} (${info.rightsHolder})`,
          location: datum.gridReference ??= '',
          originalUrl: datum.imageUrl ??= '',
          remarks: datum.raw_occurrenceRemarks ??= '',
          thumbnailUrl: datum.thumbnailUrl ??= '',
          creator: datum.collector ??= '',
          height: info.height, 
          namesLsid: datum.namesLsid ??= '',
          title: info.title,
          width: info.width,
      }
      img.customOverlay = (
          <div className='custom-overlay__caption'>
            <div>{img.title}</div>
            <div className='custom-overlay__tag'>{img.creator}</div>
          </div>
        );
      images.push(img);
  }
  return images;
}
// -----------------------------------------------------------------------------
// Define custom hook.

interface IuseImages {
    data: CustomImage[];
    error: Error | undefined;
    isLoading: boolean;
}   
// -------------------

export function useImages(tvk: string): IuseImages {
    
    const [images, setImages] = useState<CustomImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<Error|undefined>(undefined);
    
    useEffect(() => {
        setImages([]);
        setIsError(undefined);
        setIsLoading(true);
        fetchImages(tvk)
        .then((data: CustomImage[]) => { 
            setImages(data); 
        })
        .catch((err) => {
            setIsError(err);
        })
        .finally(() => {
            setIsLoading(false);
        })
    }, [tvk]);

    const response: IuseImages = {
        data: images,
        error: isError,
        isLoading: isLoading
    };

    return response;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
