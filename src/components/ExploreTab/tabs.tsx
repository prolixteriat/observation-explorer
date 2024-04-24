import { lazy, Suspense, useState } from 'react';

import {
  Tab,
  Tabs,
  TabsBody,
  TabsHeader,
  TabPanel,
} from '@material-tailwind/react';

import { CommonSpinner } from '@common/CommonSpinner';
import { IExploreSelect } from '../ExploreSelect/select';

// Dynamically import the components used by tabs as not all tabs may be used.
const ExploreCharts = lazy(() => import('../ExploreCharts/ExploreCharts'));
const ExploreSelect = lazy(() => import('../ExploreSelect/ExploreSelect'));
const SpeciesClassification = lazy(() => import('../SpeciesClassification/SpeciesClassification'));
const SpeciesDataPartners = lazy(() => import('../SpeciesDataPartners/SpeciesDataPartners'));
const SpeciesGallery = lazy(() => import('../SpeciesGallery/SpeciesGallery'));
const SpeciesLiterature = lazy(() => import('../SpeciesLiterature/SpeciesLiterature'));
const SpeciesMap = lazy(() => import('../SpeciesMap/SpeciesMap'));
const SpeciesNames = lazy(() => import('../SpeciesNames/SpeciesNames'));
const SpeciesOverview = lazy(() => import('../SpeciesOverview/SpeciesOverview'));
const SpeciesSequences = lazy(() => import('../SpeciesSequences/SpeciesSequences'));


// -----------------------------------------------------------------------------

interface ITab {
    id: string;
    title: string;
    component: React.JSX.Element;
}

interface ITabBarProps {
    tabs: ITab[];
}

// Use lowercase for tab names.
type TTabName = 'charts' | 'classification' | 'data' | 'explore' | 'gallery' |
                'literature' | 'map' | 'names' | 'overview' | 'sequences';
export type TTabNames = Array<TTabName>;

// -----------------------------------------------------------------------------

export function TabBar({ tabs }: ITabBarProps): React.JSX.Element {
    
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  
  return (
    <>
      <Tabs value={activeTab}>
          <TabsHeader className='overflow-x-auto border-b-2 bg-transparent'
            placeholder=''
            indicatorProps={{
              className:
                'bg-transparent border-b-2 border-gray-900 shadow-none rounded-none',
            }}>
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                className={activeTab === tab.id ? 'font-bold text-blue-800' : ''}
                value={tab.id}
                onClick={() => setActiveTab(tab.id)}
                placeholder=''
              >
                {tab.title}
              </Tab>
            ))}
          </TabsHeader>
          <TabsBody placeholder=''>
            {tabs.map((tab, index) => (
              <TabPanel key={index} value={tab.id}>
                {tab.component}
              </TabPanel>
            ))}
          </TabsBody>
        </Tabs>
    </>
  );
};
// -----------------------------------------------------------------------------
// Create and return a single tab object, based upon the supplied tab name.

export function makeTab(props: IExploreSelect, tabName: TTabName): ITab|null {
  
    const capital = (s: string): string => (s.charAt(0).toUpperCase() + s.slice(1));
    // Some tabs are only feasible for species (as opposed to groups)
    const isSpecies: boolean = props.isGroup === false && props.species != null;
    const tvk: string = props.species?.guid || '';

    switch (tabName) {
        case 'charts': {
            return {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <ExploreCharts {...props} />
                </Suspense>
              </>
            };
        }

        case 'classification': {
            return isSpecies ? {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesClassification tvk={tvk} />
                </Suspense>
              </>
            } : null;
        }
        case 'data': {
            return isSpecies ? {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesDataPartners tvk={tvk} />
                </Suspense>
              </>
            } : null;
        }
               
        case 'explore': {
            return {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <ExploreSelect {...props} />
                </Suspense>
              </>
            };
        }
               
        case 'gallery': {
            return isSpecies ? {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesGallery tvk={tvk} />
                </Suspense>
              </>
            } : null;
        }
               
        case 'literature': {
            return isSpecies ? {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesLiterature tvk={tvk} />
                </Suspense>
              </>
            } : null;
        }
               
        case 'map': {
            return {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesMap search={props} 
                        bg={'vc'} 
                        clickable={'1'}
                        h={'800'} 
                        interactive={'1'}
                        logo={'1'} 
                        map_id={'interactive-map'}  
                        pointSize={'6'}                  
                        region={'1'}
                        scrollZoom={'1'}
                        unconfirmed={'1'} />
                </Suspense>
              </>
            };
        }
               
        case 'names': {
            return isSpecies ? {
                title: capital(tabName), 
                id: tabName, 
                component: 
                <>
                  <Suspense fallback={<CommonSpinner />}>
                      <SpeciesNames tvk={tvk} />
                  </Suspense>
                </>
              } : null;
          }
               
        case 'overview': {
            return isSpecies ? {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesOverview tvk={tvk} />
                </Suspense>
              </>
            } : null;
        }
               
        case 'sequences': {
            return isSpecies ? {
              title: capital(tabName), 
              id: tabName, 
              component: 
              <>
                <Suspense fallback={<CommonSpinner />}>
                    <SpeciesSequences tvk={tvk} />
                </Suspense>
              </>
            } : null;
        }
               
        default: {
            console.error(`Unknown tab name: ${tabName}`);
      }
    }
    return null
}

// -----------------------------------------------------------------------------

export function makeTabs(props: IExploreSelect, tabNames?: TTabNames): ITab[] {

  const tabs: ITab[] = [];
  // Select default tabs if none provided.
  const tabNamesToUse = tabNames ??= ['explore', 'overview'];
  for (const tabName of tabNamesToUse) {
      const tab: ITab|null = makeTab(props, tabName);
      if (tab) {
          tabs.push(tab);
      }
  }
  // Add 'explore' tab if no others exist.
  if (tabs.length === 0) {    
      const tab: ITab|null = makeTab(props, 'explore');
      if (tab) {
          tabs.push(tab);
      }
  }
  return tabs;
}  
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
