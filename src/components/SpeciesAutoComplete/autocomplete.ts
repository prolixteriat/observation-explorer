import { TDataItemSchema } from '@nbn-hooks/useAutoComplete';

// -----------------------------------------------------------------------------

export interface ISpecies {
    commonName: string | null;
    rank: string;
    scientificName: string;
    tvk: string;
}
// -----------------------------------------------------------------------------
// Transform data returned from API call to format suitable for display by
// SpeciesAutoComplete component.

interface IAssocArray {
[key: string]: ISpecies;
}

export function transformData(items: TDataItemSchema[]|undefined): IAssocArray {

    const data: IAssocArray = {};
    if (!items) {
        return data;
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.rankString.toLowerCase() === 'species') {
            const species: ISpecies = {
                tvk: item.guid,
                scientificName: item.name,
                commonName: item.commonName || '',
                rank: item.rankString,
            }            
            const str: string = `${item.name} (${item.guid})`;
            if (!(str in data)) {
                data[str] = species;
            }
            if (item.commonName) {
                const str: string = `${item.commonName} (${item.guid})`;
                if (!(str in data)) {
                    data[str] = species;
                }
            }
        }
    }
    return data;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
