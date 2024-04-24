import React from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useSpeciesNames } from '@nbn-hooks/useSpeciesNames';

import { TableAcceptedName, TableCommonNames, TableSynonyms } from './names';

// Example of Atlas original:
// https://species.nbnatlas.org/species/NHMSYS0000504624#names

// -----------------------------------------------------------------------------

interface ISpeciesNames {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesNames({ tvk }: ISpeciesNames): React.JSX.Element {

    const { data, error, isLoading } = useSpeciesNames(tvk);

    return (
      <>
        {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (data) ? (
                <>
                <div className='text-xl font-bold'>
                  Names and sources
                  </div>
                <br></br>
                <TableAcceptedName {...data.taxonConcept} />
                <br></br>
                <TableSynonyms {...data} />
                <br></br>
                <TableCommonNames {...data} />
                </>
            ) : null)
        }
      </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
