import React, { useMemo } from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useSpeciesNames } from '@nbn-hooks/useSpeciesNames';

import { TaxonBreadcrumb } from './classifications';
import { makeTaxonomy } from './utils';

// -----------------------------------------------------------------------------

interface ISpeciesBreadcrumb {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesBreadcrumb({ tvk }: ISpeciesBreadcrumb): React.JSX.Element {

    const { data, error, isLoading } = useSpeciesNames(tvk);
    // Map returned data to a format suitable for display
    const taxonomy = useMemo(() => makeTaxonomy(data), [data]);

    return (
        <>
        {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (data) ? (
                <>
                <TaxonBreadcrumb taxons={taxonomy}></TaxonBreadcrumb>            
                <br />
                </>
            ) : null)
        }
    </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
