import React, { useEffect, useMemo, useState } from 'react';

import { CommonSpinner } from '@common/CommonSpinner';
import { CommonTooltip } from '@common/CommonTooltip';
import { IExploreMap, ILocation } from '@lib/types';
import { TGroupSchema, TSingleSpeciesSchema, useSpeciesGroup } from '@nbn-hooks/useSpeciesGroup';
import { TSingleGroupSchema, TGroupsSchema } from '@nbn-hooks/useSpeciesGroups';
import { SpeciesMap } from '../../components';

// -----------------------------------------------------------------------------

export interface IExploreSelect extends IExploreMap {
    filterFamilies?: string[];
    filterGroups?: string[];
    group?: TSingleGroupSchema;
    location: ILocation;
    species?: TSingleSpeciesSchema; 
    setGroup?: (group: TSingleGroupSchema) => void;
    setSpecies?: (species: TSingleSpeciesSchema) => void;
}
// -----------------------------------------------------------------------------
// Return a text component formatted according to a group.

function getGroupTypography(group: TSingleGroupSchema, minLevel: number): React.JSX.Element {
    
    const level = group.level - minLevel;
    const fontWeight = (level === 0) ? 'font-bold' : 
                    ((level === 1) ? 'font-semibold' : 'font-medium');

    const fontStyle = (level === 2) ? 'italic' : 'non-italic';
    
    const marginArray = ['', 'ml-[1rem]', 'ml-[2rem]', 'ml-[3rem]', 'ml-[4rem]'];
    const margin = (level < marginArray.length) ? marginArray[level] : '';  

    return (
        <span className={`${fontWeight} ${fontStyle} ${margin}`}>
            {group.name}        
        </span>
    );
}
// -----------------------------------------------------------------------------

export function ExploreMap(props: IExploreMap): React.JSX.Element {

    return (
        <>
        <div className='px-4'>
            <SpeciesMap search={props} 
                        h={'400'} 
                        w={'400'}
                        clickable={'0'}
                        interactive={'0'} 
                        logo={'2'} 
                        pointSize={'6'}
                        unconfirmed={'1'}
                        map_id={'exploremap-map'} />
        <ExploreMapTooltip />
        </div>
        </>
    );
}
// -----------------------------------------------------------------------------

function ExploreMapTooltip(): React.JSX.Element {
    
    const title: React.JSX.Element = <>Display Record Detail</>;
    const body: React.JSX.Element = <>
            <p>Switch to the 'Map' tab for an expanded, interactive map view
            where you can click on a location where an observation has 
            been recorded to display further information relating to 
            that record.</p>
            <hr />
            <p>Use the map controls to select different map layers, zoom in
            and out, and pan around the map.</p>
            </>;
    return (
        <CommonTooltip title={title} body={body} />
      );
}
// -----------------------------------------------------------------------------

interface IExploreTableTooltip {
    isSpecies: boolean;
}

function ExploreTableTooltip({isSpecies}: IExploreTableTooltip): React.JSX.Element {

    const title: React.JSX.Element = <>{(isSpecies) ? 'Species Count' : 'Record Count'}</>
    const body: React.JSX.Element = <>
            {(isSpecies) ?
                <>
                <p>The 'Species Count' column shows the number of individual 
                    species within each taxon group that have been recorded 
                    within the currently selected search area.</p>
                <hr />
                <p>Click on any taxon group to display the range of individual 
                    species recorded within that group.</p>
                </>
                    :
                <p>The 'Record Count' columns shows the number of records for 
                    each individual species for the currently selected taxon 
                    group within the currently selected search area.</p>
                }
        </>;
    

    return (
        <CommonTooltip title={title} body={body} />
    );
}
// -----------------------------------------------------------------------------

interface IGroupsTable {
    location: ILocation;
    groups: TGroupsSchema;
    setGroup?: (group: TSingleGroupSchema) => void;
}
// ----------------

export function GroupsTable(props: IGroupsTable): React.JSX.Element {
    
    const { location, groups, setGroup } = props;
    const [selectedRow, setSelectedRow] = useState<number>(0);

    
    useEffect(() => {
        handleRowClick(0);
    }, [location]);
    
    const handleRowClick = (id: number): void => { 
        setSelectedRow(id); 
        if (setGroup && id >= 0) {
            setGroup(groups[id]);
        }
    }; 
    // Get the minimum value of level (to allow correct indentation).
    const minLevel = groups.reduce((min, obj) => obj.level < min ? obj.level : min, groups[0].level);
    return (
        <div className='pb-4 w-fit max-w-[350px]'>
        <table className='border text-sm'>
        <thead className='border-b-4'>
          <tr className='bg-blue-50'>
            <th className='text-left px-2'>Group</th>
            <th className='text-right px-2 flex items-center'>Species Count
            <ExploreTableTooltip isSpecies={true} />
            </th>
          </tr>
        </thead>
        <tbody className=''>
          {groups.map((group, index) => (
            <tr key={index} 
                className={`border-b cursor-pointer 
                    ${index === selectedRow ? 'bg-gray-300' : 'hover:bg-gray-100'}`} 
                onClick={() => handleRowClick(index)} >
              <td className='px-2' >
                {getGroupTypography(group, minLevel)}                 
              </td>
              <td className='text-right px-2'>{group.speciesCount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>        
      </table>
      </div>
    );
}
// -----------------------------------------------------------------------------

interface ISpeciesTable {
    exploreSelect: IExploreSelect;
    group: TSingleGroupSchema | null;
    showGroupsTable: boolean;   // true if parent groups table is displayed
    setSpecies?: (species: TSingleSpeciesSchema) => void;
}
// ----------------

export function SpeciesTable(props: ISpeciesTable): React.JSX.Element {
    
    const { exploreSelect, group, showGroupsTable, setSpecies } = props;
    const loc = exploreSelect.location;

    const pageInitial = 50;
    const pageInc = 25;
    const [pageSize, setPageSize] = useState<number>(pageInitial);
    const [selectedRow, setSelectedRow] = useState<number>(-1);
    
    const { data, error, isLoading } = useSpeciesGroup(group?.name ?? '', 
                loc, pageSize, exploreSelect.filterFamilies);
    const filteredGroup = useMemo(() => transformGroup(data, 
                exploreSelect.filterFamilies), 
                [exploreSelect.filterFamilies, data]);
    
    useEffect(() => {
        // Automatically select first species in table if no associated groups table
        if (!showGroupsTable && data && data.length > 0) {
            setSelectedRow(0);
            if (setSpecies) { 
                setSpecies(data[0]);
            }
        }
        else {
            setSelectedRow(-1);
        }
        // Reset page size to initial value.
        // setPageSize(pageInitial);
        
    }, [group, loc, data]);
    
    const handleRowClick = (id: number): void => { 
        setSelectedRow(id); 
        if (setSpecies && data && id >= 0) {
            setSpecies(data[id]);
        }
    }; 

    return (
        <>
        {(isLoading) ? (<CommonSpinner />) : 
          ((error) ? (`Error fetching data: ${error.message}`) : 
            (filteredGroup) ? (
            <div className='mb-4 w-fit max-w-[400px] max-h-[650px] overflow-y-auto'>
            <table className='border mx-2 text-sm font-normal'>
                <thead className='border-b-4 sticky top-0'>
                <tr className='bg-blue-50'>
                    <th className='text-left px-2'></th>
                    <th className='text-left px-2'>Common Name</th>
                    <th className='text-left px-2'>Species</th>
                    <th className='text-right px-2 flex items-center'>Record Count
                        <ExploreTableTooltip isSpecies={false} />
                    </th>
                </tr>
                </thead>
                <tbody className=''>
                {filteredGroup.map((species, index) => (
                    <tr key={index}                 
                        className={`border-b cursor-pointer 
                            ${index === selectedRow ? 'bg-gray-300' : 'hover:bg-gray-100'}`} 
                        onClick={() => handleRowClick(index)} >
                        <td className='text-center px-2'>
                            {index+1}
                        </td>
                        <td className='px-2'>
                            {species.commonName.length > 0 ? species.commonName : '[Not supplied]'}
                        </td>
                        <td className='px-2'>
                            {species.name}
                        </td>
                        <td className='text-right px-4'>
                            {species.count.toLocaleString()}
                        </td>

                    </tr>
                ))}
                </tbody>
                {(data?.length === pageSize) && (
                    <tfoot>
                        <tr>
                            <td colSpan={4} className='text-center'>
                                <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm'
                                    onClick={() => setPageSize(pageSize + pageInc)}>
                                    {'Show more species'}
                                </button>
                            </td>
                        </tr>
                    </tfoot>  
                )}             
            </table>            
            </div>
            ) : null)
        } 
        </>
    );
}
// -----------------------------------------------------------------------------
// Filter the members of a 'TGroupSchema' to return only those where 'family' 
// matches a member of a provided 'filterFamilies' array.

function transformGroup(group?: TGroupSchema, filterFamilies?: string[]): TGroupSchema|undefined {
    
    const filtered = (filterFamilies && filterFamilies.length > 0) ? 
            group?.filter((species) => 
                filterFamilies.some(family => 
                    family.toLowerCase() === species.family.toLowerCase())) :
            group;

    return filtered;
}
// -----------------------------------------------------------------------------
// Filter the members of a 'TGroupsSchema' to return only those where 'name' 
// matches a member of a provided 'filterGroups' array.

export function transformGroups(groups?: TGroupsSchema, filterGroups?: string[]): TGroupsSchema|undefined {
    
    const filtered = (filterGroups && filterGroups.length > 0) ? 
            groups?.filter((group) => 
                filterGroups.some(name => 
                        name.toLowerCase() === group.name.toLowerCase())) :
            groups;

    return filtered;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
