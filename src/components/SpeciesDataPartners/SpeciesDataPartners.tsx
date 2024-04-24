import React, { useMemo } from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useDataPartners } from '@nbn-hooks/useDataPartners';
import { DatasetTable, transformData } from './partners';

// Example of Atlas original:
// https://species.nbnatlas.org/species/NHMSYS0000504624#data-partners

// -----------------------------------------------------------------------------

interface ISpeciesDataPartners {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesDataPartners({ tvk }: ISpeciesDataPartners): React.JSX.Element {

    const { data, error, isLoading} = useDataPartners(tvk);
    // Transform data into format suitable for rendering.
    const datasets = useMemo(() => transformData(data), [data]);

    return (
        <>
        {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (datasets) ? (
              <DatasetTable datasets={datasets}></DatasetTable>
            ) : null)
        }              
        </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
