import { CommonSpinner } from '@common/CommonSpinner';

import { useInfoCards } from '@nbn-hooks/useInfoCards';
import { useRedListCards } from '@nbn-hooks/useRedListCards';
import { useSpeciesNames } from '@nbn-hooks/useSpeciesNames';

import { InfoCards, OnlineResourcesCard, 
        RedlistCards } from './overview';
import { SpeciesGallery } from '../SpeciesGallery';
import { SpeciesMap } from '../SpeciesMap';

// Example of Atlas original:
// https://species.nbnatlas.org/species/NHMSYS0000504624#overview

// -----------------------------------------------------------------------------

interface ISpeciesOverview {

    tvk: string;
}
// ------

export default function SpeciesOverview({ tvk }: ISpeciesOverview): React.JSX.Element {

    const names = useSpeciesNames(tvk);
    const sciName: string = names.data?.classification.scientificName || '';
    const info = useInfoCards(tvk);
    const red = useRedListCards(tvk);

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        <SpeciesGallery tvk={tvk} maxRows={2} />
        <SpeciesMap search={tvk}
                    clickable='0'
                    h={'400'} 
                    interactive={'1'} 
                    logo={'2'}
                    unconfirmed={'1'}
                    map_id={'speciesoverview-map'} />

        {(names.isLoading) ? (<CommonSpinner />) : 
            (names.data) ? (
                <OnlineResourcesCard sciName={sciName} tvk={tvk} />
            ) : null
        }
        {(info.isLoading) ? (<CommonSpinner />) : 
            (info.data && info.data.taxonConcept.dataObjects) ? (
                <InfoCards taxonConcept={info.data.taxonConcept} />
            ) : null
        }    
         
        {(red.isLoading) ? (<CommonSpinner />) : 
            (red.data) ? (
                <RedlistCards data={red.data} />
            ) : null
        }
      </div>
    );
}
/*
  const datasets = useDataPartners(tvk);

    {(datasets.isLoading) ? (<CommonSpinner />) : 
        ((datasets.error) ? (`Error fetching data (datasets): ${datasets.error.message}`) : 
          (names.data && datasets.data) ? (
            <DatasetsCard numDatasets={datasets.data.length}
              sciName={sciName} />
          ) : null)
    }   

return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
        <SpeciesGallery tvk={tvk} maxRows={2} />
        <SpeciesMap search={tvk}
                    clickable='0'
                    h={'400'} 
                    interactive={'1'} 
                    logo={'2'}
                    unconfirmed={'1'}
                    map_id={'speciesoverview-map'} />

        {(names.isLoading) ? (<CommonSpinner />) : 
          ((names.error) ? (`Error fetching data (names): ${names.error.message}`) : 
            (names.data) ? (
                <OnlineResourcesCard sciName={sciName} tvk={tvk} />
            ) : null)
        }
        {(info.isLoading) ? (<CommonSpinner />) : 
          ((info.error) ? (`Error fetching data (info): ${info.error.message}`) : 
            (info.data && info.data.taxonConcept.dataObjects) ? (
                <InfoCards taxonConcept={info.data.taxonConcept} />
            ) : null)
        }    
         
        {(red.isLoading) ? (<CommonSpinner />) : 
          ((red.error) ? (`Error fetching data (red): ${red.error.message}`) : 
            (red.data) ? (
                <RedlistCards data={red.data} />
            ) : null)
        }
      </div>
    );    
*/
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
