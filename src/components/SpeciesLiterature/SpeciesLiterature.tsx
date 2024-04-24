import React from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useCEL } from '@nbn-hooks/useCEL';
import { useSpeciesNames } from '@nbn-hooks/useSpeciesNames';

import { BhlCard, CelCard, TitleCard } from './literature';

// Example of Atlas original:
// https://species.nbnatlas.org/species/NHMSYS0000504624#literature

// -----------------------------------------------------------------------------

interface ISpeciesLiterature {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesLiterature({ tvk }: ISpeciesLiterature): React.JSX.Element {

    // Get search terms for BHL site. Consists of an array of the scientific 
    // name plus any synonyms
    const names = useSpeciesNames(tvk);
    const sciNames: string[] = [names.data?.classification.scientificName || ''];
    names.data?.synonyms.forEach((syn) => sciNames.push(syn.nameString ??= ''))
    // Get the CEL references.
    const cel = useCEL(sciNames[0]);
    
    return (
      <>
        {(names.isLoading || cel.isLoading) ? (<CommonSpinner />) : 
          ((names.error || cel.error) ? ('Error fetching data') : 
            (names.data && cel.data) ? (
                <div className='grid md:grid-cols-4 gap-4'>
                  <TitleCard text='Biodiversity Heritage Library'></TitleCard>
                  <BhlCard sciNames={sciNames}></BhlCard>
                  <TitleCard text='Conservation Evidence Library'></TitleCard>
                  <CelCard sciName= {sciNames[0]} data={cel.data}></CelCard>
                </div>
            ) : null)
          }
      </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
