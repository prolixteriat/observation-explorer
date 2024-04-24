import { ITaxon } from './utils';

// -----------------------------------------------------------------------------

interface ITaxonListProps {
    taxons: ITaxon[];
}
// -----------------------------------------------------------------------------
// Horizontal breadcrumb-style taxon list.

export function TaxonBreadcrumb ({ taxons }: ITaxonListProps): React.JSX.Element  {
    
  return (
    <ul className='flex flex-wrap items-center w-full px-4 py-2 rounded-md bg-blue-gray-50'>
      {taxons.map((taxon, index) => (
          <li key={index}>
            <a  
              className='text-sm text-blue-500 hover:underline' 
              href={taxon.url} 
              target='_blank' 
              rel='noreferrer'>
              {taxon.value}
              {(index < taxons.length - 1) ? ' /' : '' }
            </a>
            <span>&nbsp;</span>
          </li>
        ))}
    </ul>
  );
}
// -----------------------------------------------------------------------------
// Vertical taxon list with responsive identation.

export function TaxonList ({ taxons }: ITaxonListProps): React.JSX.Element {

    // 'margin' needs to be statically defined rather than dynamically - see:
    // https://tailwindcss.com/docs/content-configuration#classes-aren-t-generated

    const indent = [
      'font-bold',
      'font-bold md:ml-[1rem]',
      'font-bold md:ml-[2rem]',
      'font-bold md:ml-[3rem]',
      'font-bold md:ml-[4rem]',
      'font-bold md:ml-[5rem]',
      'font-bold md:ml-[6rem]',
      'font-bold md:ml-[7rem]',
      'font-bold md:ml-[8rem]',
      'font-bold md:ml-[9rem]',
      'font-bold md:ml-[10rem]',
      'font-bold md:ml-[11rem]',
      'font-bold md:ml-[12rem]',
      'font-bold md:ml-[13rem]'
    ];

    return (
        <>
        {taxons.map((taxon, index) => (
          <div key={index} className='flex'>
            <span className={indent[index]}>
                {taxon.label}:&nbsp;&nbsp;
            </span>
                <a className='text-blue-500 hover:underline' 
                    href={taxon.url} 
                    target='_blank' 
                    rel='noreferrer'>
                  {taxon.value}
                </a>
          </div>
        ))}
        </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
