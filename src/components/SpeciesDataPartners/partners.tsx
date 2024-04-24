import React from 'react';

import { DataResource } from '@nbn-hooks/useDataResource';

// -----------------------------------------------------------------------------

export interface IDatasetSchema {
    count: number,
    drUrn: string,
    licence: string,    // TODO: needs a separate API call to drUrn to populate
    link: string,
    name: string,
    partner: string     // TODO: needs a separate API call to drUrn to populate
  }  
// -----------------------------------------------------------------------------

interface IDataSetTable {
    datasets: IDatasetSchema[];
}
// ----------------------
  
export function DatasetTable({datasets}: IDataSetTable): React.JSX.Element {

    return (
      <table className='w-full table-auto'>
        <thead className='border-b-4'>
          <tr>
            <th className='text-left px-4 py-2'>Data sets</th>
            <th className='text-left px-4 py-2'>Records</th>
          </tr>
        </thead>
        <tbody className='text-sm'>
          {datasets.map((row, index) => (
            <tr key={index} className='border-b'>
              <td className='text-blue-500 hover:underline px-4 py-2'>
                <a href={row.link} target='_blank' rel='noreferrer'>
                    {row.name}
                  </a>                  
              </td>
              <td className='text-right px-4 py-2'>{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>        
      </table>
  );
}
// -----------------------------------------------------------------------------

export function transformData (data: DataResource[] | undefined): IDatasetSchema[] | undefined {
    return data?.map((res) => {
        const link: string = 'https://registry.nbnatlas.org/public/show/' + res.uid;
        const dataset: IDatasetSchema = {
            count: res.count,
            drUrn: res.urn,
            link: link,
            name: res.name,
            // TODO: the following two variables need a call to drUrn to populate
            licence: '',
            partner: '',
        }
        return dataset;
    });
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
