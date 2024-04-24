import React, { ChangeEvent, KeyboardEvent, useMemo, useState } from 'react';

import { IconButton, Input } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { useAutoComplete } from '@nbn-hooks/useAutoComplete';

import { ISpecies, transformData } from './autocomplete';

// -----------------------------------------------------------------------------

interface ISpeciesAutoComplete {
    /** Optional seed for search term to pre-populate search box. */
    initialSearchQuery?: string;
    /** Optional callback function which will be called when a list item is
     * clicked. */
    setSpecies?: (species: ISpecies) => void;
  }
// ---------------------------
  
export function SpeciesAutoComplete({ initialSearchQuery, setSpecies }: ISpeciesAutoComplete): React.JSX.Element {
  
    const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  
    const { data, error } = useAutoComplete(searchQuery);
    const dedupe = useMemo(() => transformData(data?.autoCompleteList), 
                            [data?.autoCompleteList]);

    // Event handlers.
    const handleButtonClick = () => {
      setSearchQuery('');
    }
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setSearchQuery('');
      }
    }

    const handleSelection = (itemKey: string) => {
        if (setSpecies) {
            // Send selected species to parent component.
            const species: ISpecies = dedupe[itemKey];
            setSpecies(species);
        }        
        setSearchQuery(itemKey);
    };

    return (
      <div className='relative m-4 w-full max-w-[36rem]'>
        <Input 
          type='text'
          color='blue'
          size='lg'
          label='Search for species'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={searchQuery}
          crossOrigin=''
        />
        <IconButton 
          className='!absolute right-1 top-1'
          variant='text' size='sm' placeholder=''
          onClick={handleButtonClick} >
          <XMarkIcon className='h-6 w-6' />
        </IconButton>
        {((error) ? (`Error fetching data: ${error.message}`) : 
            (
            <>
            {Object.keys(dedupe).length > 0 && (
              <ul className='absolute z-50 w-[36rem] max-h-72 border overflow-y-auto rounded-lg text-gray-700 dark:text-gray-200'>
                {Object.keys(dedupe).map((selection, index) => (
                  <li className='bg-white py-1 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white'
                    key={index}
                    onClick={() => handleSelection(selection)}
                  >
                    {selection}
                  </li>
                ))}
              </ul>
            )}
            </>
        ))}
      </div>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
