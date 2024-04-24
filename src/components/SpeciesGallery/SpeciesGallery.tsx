import React, { useMemo, useState } from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { Gallery } from 'react-grid-gallery';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import './sg.css';

import { CustomImage, Slide, useImages } from '@nbn-hooks/useImages';

// External library documentation:
// https://benhowell.github.io/react-grid-gallery/
// https://www.npmjs.com/package/yet-another-react-lightbox
// https://yet-another-react-lightbox.com/plugins/captions

// Example page:
// https://species.nbnatlas.org/species/NHMSYS0000504624#gallery

// -----------------------------------------------------------------------------
// Map images to slides array suitable for display by Lightbox.
  
function makeSlides(images: CustomImage[]): Slide[] {

  const slides = images.map((img) => ({
    description: `${img.namesLsid}\n${img.creator}\n${img.dateTaken}\n${img.location}\n${img.licence}`,
    height: img.height,
    src: img.originalUrl,
    title: img.title,
    width: img.width,
  })); 
  return slides;
}
// -----------------------------------------------------------------------------

interface ISpeciesImage {

  /** Maximum number of rows to display. 50 if not supplied. */
  maxRows?: number;
  tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesGallery({ maxRows, tvk }: ISpeciesImage): React.JSX.Element {

  const numRows = maxRows ??= 50;
  const [index, setIndex] = useState(-1);

  const handleClick = (index: number, /*item: CustomImage*/) => setIndex(index);

  const { data, error, isLoading } = useImages(tvk);
  const slides = useMemo(() => makeSlides(data), [data] );
  const noImages: boolean = (tvk !== '') && (data.length === 0);

  return (
    <div className='sg_div'>
      {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            ((noImages) ? ('No images available') : 
            ((data) ? (
              <>
              <Gallery
                images={data}
                onClick={handleClick}
                enableImageSelection={false}
                maxRows={numRows}
              />
              <Lightbox
                slides={slides}
                open={index >= 0}
                index={index}
                close={() => setIndex(-1)}
                plugins={[Captions]}
                captions={{ showToggle: true, descriptionMaxLines: 5 }}
              />
              </>
              ) : null)))}
    </div>
  );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
