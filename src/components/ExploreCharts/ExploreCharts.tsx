import { CommonSpinner } from '@common/CommonSpinner';
import { IExploreMap } from '@lib/types';

import { IuseChartData, useChartDataLoc, useChartDataTaxon } from '@nbn-hooks/useChartData';

import { SpeciesChart, TChartType  } from './charts';

// -----------------------------------------------------------------------------

export default function ExploreCharts(props: IExploreMap): React.JSX.Element {
    const { isGroup, location, speciesName } = props;

    const local = ' for the currently selected search area';
    const uk = ' for the whole UK';
    // Restrict returned data to a specific taxon if not group.
    // const sciName: string|undefined = (isGroup) ? undefined : name;
    const sciName: string|undefined = speciesName;
    // Construct the array of charts to be displayed 
    const charts: {title: string, response: IuseChartData, colour?: string,
                  chartType: TChartType}[] = [                               
        { title: 'By month' + local,
          response: useChartDataLoc(props, {dataType: 'month'}),
          colour: '#0000FF7D',
          chartType: 'bar_vertical'
        },
        { title: 'By month' + uk,
          response: useChartDataTaxon(props, {dataType: 'month'}),
          colour: '#0000FF7D',
          chartType: 'bar_vertical'
        },
        { title: 'By decade' + local,
          response: useChartDataLoc(props, {dataType: 'decade'}),
          colour: '#42F5D77D',
          chartType: 'bar_vertical'
        },
        { title: 'By decade' + uk,
          response: useChartDataTaxon(props, {dataType: 'decade'}),
          colour: '#42F5D77D',
          chartType: 'bar_vertical'
        },         
        { title: 'Since 1990' + local,
          response: useChartDataLoc(props, {dataType: 'since1990'}),
          colour: '#00FF007D',
          chartType: 'bar_vertical'
        },
        { title: 'Since 1990' + uk,
          response: useChartDataTaxon(props, {dataType: 'since1990'}),
          colour: '#00FF007D',
          chartType: 'bar_vertical'
        },        
        { title: 'By Watsonian vice-county' + local,
          response: useChartDataLoc(props, {dataType: 'vc'}),
          colour: '#FF00007D',
          chartType: 'bar_vertical'
        },
        { title: 'By Watsonian vice-county' + uk,
          response: useChartDataTaxon(props, {dataType: 'vc'}),
          colour: '#FF00007D',
          chartType: 'bar_vertical'
        },        
        { title: 'By country' + local,
          response: useChartDataLoc(props, {dataType: 'country'}),
          colour: '#FFFF007D',
          chartType: 'bar_vertical'
        },
        { title: 'By country' + uk,
          response: useChartDataTaxon(props, {dataType: 'country'}),
          colour: '#FFFF007D',
          chartType: 'bar_vertical'
        },
        { title: 'By licence' + local,
          response: useChartDataLoc(props, {dataType: 'licence'}),
          chartType: 'doughnut'
        },
        { title: 'By licence' + uk,
          response: useChartDataTaxon(props, {dataType: 'licence'}),
          chartType: 'doughnut'
        },                 
      ];
      // Set overarching loading flag to avoid multiple re-renders of charts
      let loading = false;
      charts.forEach((chart) => {
        if (chart.response.isLoading) {
          loading = true;
        }
      });
      return (
          <div className='grid md:grid-cols-2 gap-4'>
            {loading ? (<CommonSpinner  />) : 
            charts.map((chart, index) => (chart.response.isLoading) ? (<CommonSpinner key={index}/>) : 
            ((chart.response.error) ? (`Error fetching data ("${chart.title}"): ${chart.response.error.message}. `) : 
              (chart.response.data) ? (
                <SpeciesChart 
                    key={index}
                    data={chart.response.data.data} 
                    title={chart.title}
                    colour={chart.colour}
                    chartType={chart.chartType} />
              ) : '')
            )}              
          </div>
      );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
