import React, { useMemo } from 'react';

import { Card, CardBody } from '@material-tailwind/react';

import { TGenBankSchema } from '@nbn-hooks/useSequences';

// -----------------------------------------------------------------------------

interface IGenbank {
    genBank: TGenBankSchema;
}
// -----------------------------------------------------------------------------

export function GenbankCards({ genBank }: IGenbank): React.JSX.Element {

    // Transform data to an array suitable for rendering
    const seqs = useMemo(() => genBank.results.map((seq) => {
        return {
            description: seq.description ??= '',
            furtherDescription: seq.furtherDescription ??= '',
            link: seq.link ??= '#',
            title: seq.title ??= 'No title',
        };
    }), [genBank]);
    
    return (
        <>
        {seqs.map((seq, index) => (
            <div key={index} className='pt-3 text-sm'>
            <Card className='bg-gray-200' placeholder=''>
                <CardBody placeholder=''>
                    <div className='text-blue-500 hover:underline'>
                    <a href={seq.link} target='_blank' rel='noreferrer'>
                        {seq.title}
                    </a>
                    </div>
                    <hr className='border-gray-400 m-2' />
                    {seq.description}
                    <br />
                    {seq.furtherDescription}
                </CardBody>
            </Card>
            </div>
        ))}
        </>
    );  
}
// -----------------------------------------------------------------------------

export function GenbankTitle({ genBank }: IGenbank): React.JSX.Element {

    const total: string = genBank.total ??= 'Missing';
    const url: string = genBank.resultsUrl ??= '#';
    const text: string = `View all results - ${total}`;

    return (
        <>
        <div className='text-xl font-bold'>
            Genbank
        </div>
        <div className=' text-blue-500 hover:underline'>
            <a href={url} target='_blank' rel='noreferrer'>
                {text}
            </a>
        </div> 
        </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------

