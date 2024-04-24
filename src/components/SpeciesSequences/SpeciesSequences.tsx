import React from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useSequences } from '@nbn-hooks/useSequences';

import { GenbankCards, GenbankTitle } from './sequences';

// Example of Atlas original:
// https://species.nbnatlas.org/species/NHMSYS0000504624#sequences

// -----------------------------------------------------------------------------

interface ISpeciesSequences {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesSequences({ tvk }: ISpeciesSequences): React.JSX.Element {

    const { data, error, isLoading }= useSequences(tvk);
    
    return (
        <>
        {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (data) ? (
                <>
                <GenbankTitle genBank={data}></GenbankTitle>
                <GenbankCards genBank={data}></GenbankCards>
                </>
            ) : null)
          }
        </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------


