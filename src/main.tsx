import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { ExplorePage } from './components';
import { TTabNames } from './components/ExploreTab/tabs';

// -----------------------------------------------------------------------------

const groupButterflies = ['insects'];
const familyButterflies = ['Hesperiidae', 'Lycaenidae', 'Nymphalidae', 
  'Papilionidae', 'Pieridae', 'Riodinidae'];

// const filterGroups = undefined;
// const filterFamilies = undefined;

const filterGroups = groupButterflies;
const filterFamilies = familyButterflies;

const tabNames: TTabNames = ['explore', 'map', 'charts', 'overview', 'gallery',
  'names', 'classification', 'literature', 'sequences', 'data'];

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ExplorePage 
      themeName={'default'}
      tabNames={tabNames}
      region='SJ47A'
      filterFamilies={filterFamilies} 
      filterGroups={filterGroups} />
  </React.StrictMode>
);

// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
