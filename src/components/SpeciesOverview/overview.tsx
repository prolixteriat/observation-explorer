import { useMemo, useState } from 'react';

import { Accordion, AccordionBody, AccordionHeader} from '@material-tailwind/react';

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

import { TTaxonConceptSchema } from '@nbn-hooks/useInfoCards';
import { TKvpValueSchema, TRedListSchema } from '@nbn-hooks/useRedListCards';

// -----------------------------------------------------------------------------
// Define card formatting for consistency across cards.

const styleAccordion = 'border rounded-lg shadow-md';
const styleAccordionBody = 'px-2 pb-3 text-base';
const styleAccordionFooter = 'px-2 py-1 text-sm bg-gradient-to-l from-gray-300 to-gray-100 mt-2';
const styleAccordionHeader = 'px-2 text-lg bg-gradient-to-l from-gray-300 to-gray-100';
const styleTableRow=(rowNum: number, totRows: number): string => (
          rowNum === totRows - 1 ? 'border-b-0' : 'border-b'
);
// -----------------------------------------------------------------------------
// Dependent upon a supplied boolean, return an up or down icon.
const getIcon = (open: boolean): React.JSX.Element => (
    (open) ? (<ChevronUpIcon className='h-6 w-6' />) :
             (<ChevronDownIcon className='h-6 w-6' />)
);
// Return a formatted list item link.
const getLI = (url: string, text: string): React.JSX.Element => (
  <li>
      <a className='text-blue-500 hover:underline' 
          href={url} target='_blank' rel='noreferrer'>
        {text}
      </a>
  </li>
);
// Strip HTML tags from a string.
const stripHTML = (str: string): string => str.replace( /(<([^>]+)>)/ig, ''); 

// -----------------------------------------------------------------------------
// Create a datasets cards.

interface IDatasetsCard {
    numDatasets: number;
    sciName: string;
}
// -----

export function DatasetsCard( { numDatasets, sciName } : IDatasetsCard): React.JSX.Element {
    
    const [open, setOpen] = useState<boolean>(true);
    const handleOpen = () => setOpen(!open);

    return (
      <Accordion className={styleAccordion} open={open} icon={getIcon(open)}
                 placeholder='' >
        <AccordionHeader className={styleAccordionHeader} 
                    onClick={() => handleOpen()} placeholder=''>
             Datasets
        </AccordionHeader>            
        <AccordionBody className={styleAccordionBody}>
          <b>{numDatasets}</b> datasets have provided data to the NBN Atlas 
           for the species {sciName}.
        </AccordionBody>
      </Accordion>
    );
   
}
// -----------------------------------------------------------------------------
// Create multiple info cards for a species.

// ------------
// Transform data objects into a format that can be used in the info cards.
function transformData(taxonConcept: TTaxonConceptSchema) {

  const eolBase = 'https://eol.org/pages/';
  const link = taxonConcept.identifier ? eolBase + taxonConcept.identifier : '';

  const data = taxonConcept.dataObjects?.map((dataObj) => {
        const datum = {
            title: stripHTML(dataObj.title ??= 'Description'),
            description: stripHTML(dataObj.description ??= 'Not supplied'),
            rightsHolder: stripHTML(dataObj.rightsHolder ??= 'Not supplied'),
            providedBy: 'Encyclopedia of Life',
            hasLink: (link.length > 0),
            link: link
        };
        return datum
    });
    return data
}
// ------------

interface IInfoCard {
    taxonConcept: TTaxonConceptSchema;
}
// ------------

export function InfoCards( { taxonConcept } : IInfoCard): React.JSX.Element {

    const data = useMemo(() => transformData(taxonConcept), [taxonConcept]);
    // Initialise all InfoCards to an open state.
    const [open, setOpen] = useState<boolean[]>(Array(data?.length).fill(true));

    function handleOpen(cardIndex: number) {
        const newOpen = open.map((state, index) => {  
            return (index === cardIndex) ? !state : state;
        });
        setOpen(newOpen);
    }

    return (
    <>
    {data?.map((datum, index) => (
      <div key={index}>
        <Accordion className={styleAccordion} open={open[index]} 
                    icon={getIcon(open[index])} placeholder='' >
            <AccordionHeader className={styleAccordionHeader}
                             onClick={() => handleOpen(index)} placeholder=''>
                {datum.title}
            </AccordionHeader>            
            <AccordionBody className={styleAccordionBody}>
                {datum.description}
                <br />
                <div className={styleAccordionFooter}>
                Rights holder: {datum.rightsHolder}
                <br />
                Provided by:&nbsp;
                {(datum.hasLink) ? 
                    (<span className='text-blue-500 hover:underline'>
                        <a href={datum.link} target='_blank' 
                            rel='noreferrer'>
                          {datum.providedBy}
                         </a>  
                     </span>) : 
                    (datum.providedBy)
                }
                </div>
            </AccordionBody>
        </Accordion>
      </div>
    ))}
    </>
    );
}
// -----------------------------------------------------------------------------
// Online resources card.

interface IOnlineResourcesCard {
    sciName: string;
    tvk: string;
}
// -----

export function OnlineResourcesCard( { sciName, tvk } : IOnlineResourcesCard): React.JSX.Element {

    // Links to the online resources.
    const linkBHL = `https://www.biodiversitylibrary.org/search?searchTerm=${sciName}#/names`;
    const linkGBIF = `https://www.gbif.org/species/search?q=${sciName}`;
    const linkEOL = `https://eol.org/search?utf8=%E2%9C%93&q=${sciName}`;
    // const linkJSON = `https://species-ws.nbnatlas.org/species/${tvk}.json`;
    const linkPESI = `http://www.eu-nomen.eu/portal/search.php?search=simp&txt_Search=${sciName}`;

    const [open, setOpen] = useState<boolean>(true);
    const handleOpen = () => setOpen(!open);

    return (
        <Accordion className={styleAccordion} open={open} icon={getIcon(open)} 
                  placeholder=''>
          <AccordionHeader className={styleAccordionHeader}
                    onClick={() => handleOpen()} placeholder=''>
            Online Resources
          </AccordionHeader>            
          <AccordionBody className={styleAccordionBody}>
            <div className='flex'>
              <ul className='list-disc pl-5'>
                {getLI(linkGBIF, 'Global Biodiversity Information Facility')}
                {getLI(linkEOL, 'Encyclopedia of Life')}
                {getLI(linkBHL, 'Biodiversity Heritage Library')}
                {getLI(linkPESI, 'Pan-European Species Directories Infrastructure')}
              </ul>
            </div>
          </AccordionBody>
        </Accordion>
    );
}
// -----------------------------------------------------------------------------
// Create an inner table of key/value pairs for a single red list card.

interface IRedlistCard {
    kvps: TKvpValueSchema[];
    listName: string|null|undefined;
}
// -----
function RedlistCard( { kvps, listName } : IRedlistCard): React.JSX.Element {

    const rows = useMemo(() => kvps.map((kvp) => {
        return {
            key: stripHTML(kvp.key ??= 'Not supplied'),
            value: stripHTML(kvp.value ??= 'Not supplied'),        
        }
    }), [kvps]);

    // Default message if there is no data for inner table rows.
    const text = 'A species list provided by ' + (listName ??= 'UNKNOWN');

    return (
      <table className='w-full table-auto'>
        <tbody>
          {(rows.length === 0) ? 
            (<tr>
              <td>{text}</td>
            </tr>) :
            rows.map((row, index) => (
              <tr className={styleTableRow(index, rows.length)} key={index}>
                <td className='px-3 py-1'>{row.key}</td>                            
                <td>{row.value}</td>
              </tr>
              )
            )}
        </tbody>        
      </table>
    );
}
// -----------------------------------------------------------------------------
// Create multiple red list cards for a species. Example:
// https://lists.nbnatlas.org/ws/species/NHMSYS0000504624?isBIE=true

interface IRedlistCards {
    data: TRedListSchema;
}
// -----

export function RedlistCards( { data } : IRedlistCards): React.JSX.Element {

    const link = 'https://lists.nbnatlas.org/speciesListItem/list/';

    // Initialise all RedlistCards to closed state.
    const [open, setOpen] = useState<boolean[]>(Array(data.length).fill(true));

    function handleOpen(cardIndex: number) {
        const newOpen = open.map((state, index) => {  
            return (index === cardIndex) ? !state : state;
        });
        setOpen(newOpen);
    }

    return (
      <>
      {data.map((datum, index) => (
          <Accordion className={styleAccordion} key={index} open={open[index]} 
                      icon={getIcon(open[index])} placeholder='' >
              <AccordionHeader className={styleAccordionHeader}
                            onClick={() => handleOpen(index)} placeholder='' >
                  {datum.list.listName}
              </AccordionHeader>            
              <AccordionBody className={styleAccordionBody}>
                <RedlistCard kvps={datum.kvpValues} listName={datum.list.listName} />
                <div className={styleAccordionFooter}>
                  Provided by:&nbsp;
                  <a className='text-blue-500 hover:underline' 
                    href={link + datum.dataResourceUid} target='_blank' 
                      rel='noreferrer'>
                    {datum.list.listName}
                  </a>  
                </div>
              </AccordionBody>
          </Accordion>
      ))}
      </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
