import { Card, CardBody } from '@material-tailwind/react';

import { celBaseUrl, getCelSummaryUrl, TCelSchema } from '@nbn-hooks/useCEL';

// -----------------------------------------------------------------------------

const bhlBaseUrl = 'https://www.biodiversitylibrary.org/';

// -----------------------------------------------------------------------------

interface IBhlCard {
  sciNames: string[];
}
// ----------------------

export function BhlCard({sciNames}: IBhlCard): React.JSX.Element {

  const searchUrl: string = bhlBaseUrl + 'search?SearchTerm=' 
                            + sciNames.join('+OR+') + '&SearchCat=M#/names';

    return (
      <Card className='col-span-3' placeholder=''>
        <CardBody placeholder=''>
          <span className='text-lg font-semibold'>
            References for this taxon found in the&nbsp;
          </span>
          <span className='text-lg font-semibold text-blue-500 hover:underline'>
            <a href={bhlBaseUrl} target='_blank' rel='noreferrer'>
                Biodiversity Heritage Library
            </a>
          </span>
          <div className=' text-blue-500 hover:underline'>
            <a href={searchUrl} target='_blank' rel='noreferrer'>
                Search BHL for references to {sciNames[0]}
            </a>
          </div>          
      </CardBody>
    </Card>
    );
}
// -----------------------------------------------------------------------------

interface ICelCard {
  data: TCelSchema;
  sciName: string;
}
// ----------------------

export function CelCard({sciName, data}: ICelCard): React.JSX.Element {

    // Get summary string
    const tot: number = data.total_results;
    const plur: string = tot > 1 ? 'are' : 'is';
    const summary: string = 
        `There ${plur} a total of ${tot.toString()} actions and individual studies.`;
    // Map references to an array suitable for rendering
    const refs = data.results.map((res) => {
        return {
            title: res.title ??= 'No title',
            url: res.url ??= '#'
        };
    });
    
    return (
      <Card className='col-span-3' placeholder=''>
        <CardBody placeholder=''>
          <div>
          <span className='text-lg font-semibold'>
            References for this taxon found in the&nbsp;
          </span>
          <span className='text-lg font-semibold text-blue-500 hover:underline'>
            <a href={celBaseUrl} target='_blank' rel='noreferrer'>
              Conservation Evidence Library
            </a>
          </span>
          </div>
          <div>
            <ul className='list-disc pl-5'>
              {refs.map((ref, index) => (
                <li key={index} className='text-blue-500 hover:underline'>
                  <a href={ref.url} target='_blank' rel='noreferrer'>
                    {ref.title}
                  </a>
                </li>
              ))}              
            </ul>
          </div>
          <div className='italic text-blue-500 hover:underline pl-5 pt-3'>
            <a href={getCelSummaryUrl(sciName)} target='_blank' rel='noreferrer'>
              {summary}
            </a>
          </div>
      </CardBody>
    </Card>
    );
}
// -----------------------------------------------------------------------------

interface ITitleCard {
    text: string;
  }
  // ----------------------
  
  export function TitleCard({text}: ITitleCard): React.JSX.Element {
  
      return (
        <Card className='bg-gray-100 col-span-1 h-[6rem]' placeholder=''>
          <CardBody placeholder=''>
            <div className='text-sm font-bold text-green-500'>
              {text}
            </div>
          </CardBody>
        </Card>
      );
}  
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
