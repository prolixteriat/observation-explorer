import React, { useState } from 'react';

import { ThemeProvider } from '@material-tailwind/react';

import { ILocation } from '@lib/types';
import { TSingleSpeciesSchema } from '@nbn-hooks/useSpeciesGroup';
import { TSingleGroupSchema } from '@nbn-hooks/useSpeciesGroups';

import { exploreThemes, TExploreTheme } from './theme';
import { ExploreLocate, ExploreTab } from '../../components';
import { TTabNames } from '../ExploreTab/tabs';

// Example:
// https://records.nbnatlas.org/explore/your-area#53.2143|-2.9299|12|ALL_SPECIES

// -----------------------------------------------------------------------------

interface IExplorePage {

    filterFamilies? : string[];
    filterGroups? : string[];
    region?: string;
    tabNames?: TTabNames;
    themeName?: TExploreTheme;
}
// -----------------------------------------------------------------------------

export default function ExplorePage(props: IExplorePage): React.JSX.Element {

    const { filterFamilies, filterGroups, region, tabNames, themeName } = props;
    
    const [group, _setGroup] = useState<TSingleGroupSchema|undefined>(undefined);
    const [species, _setSpecies] = useState<TSingleSpeciesSchema|undefined>(undefined);
    const [location, setLocation] = useState<ILocation|undefined>(undefined);
    const [isGroup, setIsGroup] = useState<boolean>(true);
    const [groupName, setGroupName] = useState<string>('');
    const [speciesName, setSpeciesName] = useState<string>('');
    const [theme, _setTheme] = useState<object>(exploreThemes[themeName || 'default']);

    const setGroup = (group: TSingleGroupSchema) => {
        _setGroup(group);
        setIsGroup(true);
        setGroupName(group.name);
    }

    const setSpecies = (species: TSingleSpeciesSchema) => {
        _setSpecies(species);
        setIsGroup(false);
        setSpeciesName(species.name);
    }

    return (
        <ThemeProvider value={theme}>
        <div className='m-4'>
        <ExploreLocate region={region || 'uk'} setLocation={setLocation} />
        {location && (
            <ExploreTab 
                isGroup={isGroup}
                groupName={groupName}
                speciesName={speciesName} 
                location={location} 
                filterFamilies={filterFamilies}
                filterGroups={filterGroups}
                group={group}
                species={species}
                setGroup={setGroup} 
                setSpecies={setSpecies}
                tabNames={tabNames}
                /> 
        )
        }
        </div>
        </ThemeProvider>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
