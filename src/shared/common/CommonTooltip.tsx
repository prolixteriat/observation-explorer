import { Tooltip } from '@material-tailwind/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

// -----------------------------------------------------------------------------

export interface ICommonTooltip {
    title: React.JSX.Element;
    body: React.JSX.Element;
}

// --------------

export const CommonTooltip = ({ title, body }: ICommonTooltip): React.JSX.Element => {
    return (
        <Tooltip
          content={
            <div className='w-80'>
            <div className='text-white font-medium'>
                {title}
            </div>
            <div className='text-white font-normal opacity-80'>
                {body}
            </div>
          </div>
          }
        >
        <QuestionMarkCircleIcon className='float-right h-6 w-6 mx-1 stroke-blue-500' />
        </Tooltip>
      );
}

// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
