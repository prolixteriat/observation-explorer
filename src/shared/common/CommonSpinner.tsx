import { Spinner } from '@material-tailwind/react';

// -----------------------------------------------------------------------------

export const CommonSpinner = (): React.JSX.Element => {
    return (
        <div className='flex justify-center'>
            <Spinner className='h-12 w-12' />
        </div>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
