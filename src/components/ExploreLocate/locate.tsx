import { KeyboardEvent, useEffect, useState } from 'react';

import { Button, Checkbox, Input } from '@material-tailwind/react';
import { CommonTooltip } from '@common/CommonTooltip';

import { ICoord, useSearchLocation } from '@hooks/useSearchLocation';
import { useVcFromCoord, useVcFromPid } from '@nbn-hooks/useVCs';

// -----------------------------------------------------------------------------
// Return a text string with the VC name and number for a given coordinate.

export function getVcDescription(latitude: number, longitude: number): string {

    const vcCoord = useVcFromCoord(latitude, longitude);
    const vcPid = useVcFromPid(vcCoord.data?.[0]?.pid || '');
    const vc = (vcCoord.data?.[0]?.description && vcPid.data?.id) ?
                `VC${vcPid.data?.id} ${vcCoord.data?.[0]?.description}` :
                '';
    return vc;
}
// -----------------------------------------------------------------------------

interface ISearchLocationProps {
    defaultRegion?: string;
    setCoord: (coord: ICoord) => void;
}

export function SearchLocation(props: ISearchLocationProps): React.JSX.Element {

    const { defaultRegion, setCoord } = props;

    // State variables. Search parameters entered by the user.
    const [inputValue, setInputValue] = useState<string>(defaultRegion || '');
    const [isChecked, setIsChecked] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>(defaultRegion || '');
    
    // Event handlers.
    const handleCheckboxChange = () => {
        const checked = !isChecked;
        setIsChecked(checked);
        setSearchQuery(checked ? 'current' : inputValue);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setInputValue('');
        } else if (event.key === 'Enter') {
            handleSearchButtonClick();
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSearchButtonClick = () => {
        setSearchQuery(isChecked ? 'current' : inputValue);
    };

    // Hooks.
    const location = useSearchLocation(searchQuery);
    
    useEffect(() => {   
        if (location.error) {
            alert(location.error.message);
            const region = defaultRegion || 'uk';
            setSearchQuery(region);
            setInputValue(region);
            if (isChecked) {
                handleCheckboxChange();
            }
        }
        else if (location.coord) {
            setCoord(location.coord)
        }

    }, [location])

    return (
        <>
        {!isChecked && 
        <div className='flex relative items-center max-w-[36rem] text-blue'>
            <Input 
                className='h-10 text-xl'
                size='md'
                type='outlined'
                color='blue'
                label='Search for location'
                aria-label='Search for location'
                value={inputValue}
                disabled={isChecked}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                crossOrigin=''
            />
            <Button
                className='h-10 normal-case'
                color='blue'
                onClick={handleSearchButtonClick}
                placeholder=''>
                Search
            </Button>
        </div>
        }
        <div className='flex items-center'>
            <Checkbox
                label='Use current location'
                checked={isChecked}
                onChange={handleCheckboxChange}
                crossOrigin=''
                />
            
            <SearchTooltip />
        </div>
        </>
    );
}
// -----------------------------------------------------------------------------

interface ISearchRadiusProps {
    checked: boolean;
    setRadius: (radius: number) => void;
    setUseSquare: (useSquare: boolean) => void;
}

export function SearchRadius(props: ISearchRadiusProps): React.JSX.Element {

    const { checked, setRadius, setUseSquare } = props;

    const text_circle = 'km diameter circle. ';
    const text_square = 'km wide square. ';

    const [isChecked, setIsChecked] = useState(checked);
    const [selected, setSelected] = useState('2');
    const [text, setText] = useState(text_square);
    
    // Event handlers.
    const handleCheckboxChange = () => {
        const t = (text === text_circle) ? text_square : text_circle;
        setText(t);
        const checked = !isChecked;
        setIsChecked(checked);
        setUseSquare(checked);
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(event.target.value);
        setRadius(parseFloat(event.target.value)/2);
    };

    return (
        <div className='flex items-center'>
            Display records in a&nbsp;
            <div className='w-12'>
                <select aria-label='Select search radius' value={selected}
                    className='h-8 border rounded-lg focus:border-blue-500'
                        onChange={handleSelectChange} >
                    <option>1</option>
                    <option>2</option>
                    <option>10</option>
                </select>
            </div>
            &nbsp;{text}&nbsp;&nbsp;&nbsp;
            <Checkbox
                label='Use a square search area'
                checked={isChecked}
                onChange={handleCheckboxChange}
                crossOrigin=''
                />
        </div>
    );
}
// -----------------------------------------------------------------------------

function SearchTooltip(): React.JSX.Element {
    const title: React.JSX.Element = <>Search for a Location</>;
    const body: React.JSX.Element = <>
        <p>Enter a location such as a postcode, OS grid reference, 
           Watsonian Vice County, or country. <i>Note that all locations 
           must be within the UK.</i></p>
        <p>Press the <b>'Search'</b> button to find the location.</p>
        <hr />
        <p>Alternatively, select the <b>'Use current location'</b> 
           checkbox to use your current location.</p>
    </>;
    
    return (
        <CommonTooltip title={title} body={body} />
      );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
