import React, { useMemo } from 'react';

import { CommonTooltip } from '@common/CommonTooltip';
  
import { makeTabs, TabBar, TTabNames } from './tabs';
import { IExploreSelect  } from '../ExploreSelect/select';

// -----------------------------------------------------------------------------

interface IExploreTab extends IExploreSelect{
    tabNames?: TTabNames;
}
// -----------------------------------------------------------------------------

export default function ExploreTab(props: IExploreTab): React.JSX.Element {

  const { isGroup, groupName, speciesName, tabNames } = props;
  const tabs = useMemo(() => makeTabs(props, tabNames), [props]);
  const name = isGroup ? groupName : speciesName;
  
  return (
    <>
      <div className='font-bold text-lg pt-4 flex items-center'>
         {isGroup ? 'Group: ' : 'Species: '} {name}
         <ExploreTabTooltip />
      </div>
      <TabBar tabs={tabs} />
      </>
  );
}
// -----------------------------------------------------------------------------

function ExploreTabTooltip(): React.JSX.Element {
  const title: React.JSX.Element = <>Explore Species</>;
  const body: React.JSX.Element  = <>
      <p>Click on a group or species name in the tables within the 
         'Explore' tab to display locations on the map where observations 
         have been recorded.</p>
      <hr />
      <p>Clicking on a species name in the table will display additional 
         tabs ('Overview', 'Charts', etc) which provide access to further
         information about the species, both locally and nationally.</p>
      <hr />
      <p>Return to the 'Explore' tab to select a different species.</p>
  </>;

  return (
      <CommonTooltip title={title} body={body} />
  );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
