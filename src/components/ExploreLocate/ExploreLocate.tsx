import { useEffect, useState } from 'react';

import { ICoord } from '@hooks/useSearchLocation';
import { ILocation } from '@lib/types';

import { getVcDescription, SearchLocation, SearchRadius } from './locate';

// -----------------------------------------------------------------------------

interface IExploreLocate {

    region: string
    setLocation?: (location: ILocation) => void;
}
// -----------------------------------------------------------------------------

export default function ExploreLocate(props: IExploreLocate): JSX.Element {

    const { region, setLocation } = props;

    const [coord, setCoord] = useState<ICoord>({latitude: 0, longitude: 0});
    const [radius, setRadius] = useState<number>(1);
    const [useSquare, setUseSquare] = useState<boolean>(true);
    
    useEffect(() => {
        const loc: ILocation = {
            isSquare: useSquare,
            latitude: coord.latitude, 
            longitude: coord.longitude, 
            radius: radius
        };
        if (setLocation) {
            setLocation(loc);
        }
    }, [coord, radius, useSquare]);

    const vc = getVcDescription(coord.latitude, coord.longitude);

    return (
      <>
        <div className=''>
        <SearchLocation defaultRegion={region} setCoord={setCoord} />
        <div>
          <p>
            Showing records for: Latitude {coord.latitude.toFixed(4)}, 
              Longitude {coord.longitude.toFixed(4)}
              {(vc.length > 0) ? <><span> in </span>
                <a  
                  className='text-blue-500 hover:underline' 
                  href='https://en.wikipedia.org/wiki/Vice-county' 
                  target='_blank' >
                  vice-county
                </a><span> {vc}</span></> : ''}
          </p>
        </div>
        <SearchRadius checked={useSquare} setRadius={setRadius} setUseSquare={setUseSquare}/>
      </div>
    </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------


