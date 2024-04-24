import { Card, Chip } from '@material-tailwind/react';

import { TSpeciesNameSchema, TTaxonConceptSchema } from '@nbn-hooks/useSpeciesNames';

// -----------------------------------------------------------------------------

const missing = 'Not supplied';

// Define formatting to be used within each of the three tables.
const styleCard = 'h-full w-full';
const styleTable = 'w-full min-w-max table-auto text-left text-sm border';
const styleTableHead = 'border-b border-blue-gray-100 bg-blue-gray-50/50';
const styleLastCol = 'w-32 py-2';
const styleRow = 'border';
const styleCell = 'flex gap-2 py-1';

// -----------------------------------------------------------------------------
// Standard chip component.

interface IChipName {
    value: string;
}

// ----------------------------

function ChipName({value}: IChipName): JSX.Element {
    return (
        <Chip variant='ghost' size='sm' color='gray' 
                className='rounded-full normal-case font-normal' 
                value={value} />
    );
}
// -----------------------------------------------------------------------------
// Create the 'accepted name' table component.

export function TableAcceptedName({nameAuthority, nameComplete}: TTaxonConceptSchema): JSX.Element {

    const acceptedName: string = nameComplete ??= missing;
    const source: string = nameAuthority ??= missing;

    return (
        <Card className={styleCard} placeholder='' >
        <table className={styleTable}>
            <thead className={styleTableHead}>
            <tr>
                <th>Accepted Name</th>
                <th className={styleLastCol}>Source</th>
            </tr>
            </thead>
            <tbody>
            <tr className={styleRow}>
                <td className={styleCell}>{acceptedName}</td>
                <td><li>{source}</li></td>                
            </tr>
            </tbody>
        </table>
        </Card>        
    );
}
// -----------------------------------------------------------------------------
// Create the 'common name' table component.

export function TableCommonNames({ commonNames }: TSpeciesNameSchema): JSX.Element {

    const names = commonNames.map((com) => {
        // Get language label
        const langCode: string = (com.language ??= '').toLowerCase();
        let langStr: string;
        if (langCode === 'en') {
            langStr = '';
        } else if (langCode === 'cy') {
            langStr = 'Welsh';
        } else if (langCode === 'gd') {
            langStr = 'Gaelic';        
        } else {
            langStr = langCode;
        }
        return {
            name: com.nameString ??= missing,
            source: com.infoSourceName ??= missing,
            status: com.status ??='',
            language: langStr
        };
    });

    return (
        <Card className={styleCard} placeholder='' >
        <table className={styleTable}>
            <thead className={styleTableHead}>
            <tr>
                <th>Common Name</th>
                <th className={styleLastCol}>Source</th>
            </tr>
            </thead>
            <tbody>
                {names.map((row, index) => (
                    <tr key={index} className={styleRow}>
                        <td className={styleCell}>
                            {row.name}
                            {(row.language) ?
                                (<ChipName value={row.language} />) :
                                ('')}
                            <ChipName value={row.status} />
                        </td>
                        <td><li>{row.source}</li></td>
                    </tr>
                ))}
            </tbody>
        </table>
        </Card>
    ); 
}
// -----------------------------------------------------------------------------
// Create the 'synonym' table component.

export function TableSynonyms({ synonyms }: TSpeciesNameSchema): JSX.Element {

    const names = synonyms.map((syn) => {
        return {
            synonym: syn.nameComplete ??= missing,
            source: syn.nameAuthority ??= missing,
        };
    });

    return (
        <Card className={styleCard} placeholder='' >
        <table className={styleTable}>
            <thead className={styleTableHead}>
            <tr>
                <th>Synonym</th>
                <th className={styleLastCol}>Source</th>
            </tr>
            </thead>
            <tbody>
                {names.map((row, index) => (
                    <tr key={index} className={styleRow}>
                        <td className={styleCell}>
                            {row.synonym}
                            <ChipName value='synonym' 
                            />
                        </td>
                        <td><li>{row.source}</li></td>
                    </tr>
                ))}
            </tbody>
        </table>
        </Card>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
