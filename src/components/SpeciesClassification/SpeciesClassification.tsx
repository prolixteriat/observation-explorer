import React, { useMemo } from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useSpeciesNames } from '@nbn-hooks/useSpeciesNames';
import { makeTaxonomy } from './utils';
import { TaxonList } from './classifications';

// Example page:
// https://species.nbnatlas.org/species/NHMSYS0000504624#classification

// -----------------------------------------------------------------------------

interface ISpeciesClassification {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesClassification({ tvk }: ISpeciesClassification): React.JSX.Element {

    const { data, error, isLoading } = useSpeciesNames(tvk);
    // Transform data returned from API call to a format suitable for display.
    const taxonomy = useMemo(() => makeTaxonomy(data), [data]);
    
    return (
        <>
        {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (data) ? (
                <>
                <div className='text-xl font-bold'>
                    Classification
                </div>
                <br></br>
                <TaxonList taxons={taxonomy} />            
                </>
            ) : null)
        }
    </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
