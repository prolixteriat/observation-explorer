import React, { useMemo } from 'react';

import { CommonSpinner } from '@common/CommonSpinner';

import { useSpeciesGroups } from '@nbn-hooks/useSpeciesGroups';

import { ExploreMap, IExploreSelect, GroupsTable, SpeciesTable, transformGroups } 
    from './select';

// -----------------------------------------------------------------------------

export default function ExploreSelect(props: IExploreSelect): React.JSX.Element {
  const { filterFamilies, filterGroups, location, group, setGroup, setSpecies } = props;

  const { data, error, isLoading } = useSpeciesGroups(location);
  const filteredGroups = useMemo(() => transformGroups(data, filterGroups), 
                    [filterGroups, data]);

  const showTable = (filterGroups && filterGroups.length > 0) || 
                    !filterFamilies || filterFamilies.length === 0;

  return (
      <>
      {(isLoading) ? (<CommonSpinner />) : 
        ((error) ? (`Error fetching data: ${error.message}`) : 
          (filteredGroups) ? (
            <div className='flex flex-wrap'>
              {(showTable) &&
              <GroupsTable groups={filteredGroups} 
                  location={props.location}
                  setGroup={setGroup} />}
              <SpeciesTable group={group || filteredGroups[0]} 
                  exploreSelect={props} 
                  showGroupsTable={showTable}
                  setSpecies={setSpecies} />
              {(props.isGroup != null) && (<ExploreMap {...props} />)}
             
            </div>
          ) : null)
      } 
      </>
  );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------


