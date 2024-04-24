import React from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useSpeciesNames } from '@nbn-hooks/useSpeciesNames';

// -----------------------------------------------------------------------------

interface ISpeciesTitle {

    tvk: string;
}
// -----------------------------------------------------------------------------

export default function SpeciesTitle({ tvk }: ISpeciesTitle): React.JSX.Element {

    const { data, error, isLoading } = useSpeciesNames(tvk);

    let authority, comName, estab, rank, sciName, status;
    if (data) {
        authority = data.taxonConcept.nameAuthority ??= '';
        estab = data.establishmentMeans ??= '';
        rank = data.taxonConcept.rankString ??= '';
        status = data.taxonConcept.taxonomicStatus ??= '';
        sciName = data.taxonConcept.nameComplete ??= '';
        comName = (data.commonNames && data.commonNames.length > 0 &&
                        data.commonNames[0].nameString) ?
                        data.commonNames[0].nameString : '';
    }
    return (
      <>
        {(isLoading) ? (<CommonSpinner />): 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (data) ? (
              <>
                <div className='text-2xl font-bold'>
                  {sciName}
                </div>
                <br></br>
                <div className='text-xl'>
                  {comName}
                </div>
                <br></br>
                <div className='flex'>
                  {rank}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {status}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <b>Name authority:</b>&nbsp;{authority}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <b>Establishment means:</b>&nbsp;{estab}
                </div>
                <br></br>
              </>
            ) : null)
        }
    </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------


