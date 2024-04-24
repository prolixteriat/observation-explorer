import React, { useEffect, useMemo, useRef } from 'react';

import { TContainerSchema } from '@nbn-hooks/useChartData';

// -----------------------------------------------------------------------------
// Use the following import to include all options for dev purposes:
/*
import Chart from 'chart.js/auto';
import {
    ChartConfiguration,
} from 'chart.js';
*/
// However, for prod use the following explicit imports to allow tree-shaking:

import {
    ArcElement,
    Chart,
    ChartConfiguration,
    BarController,
    BarElement,
    CategoryScale,
    DoughnutController,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
  
Chart.register(
    ArcElement,
    BarController,
    BarElement,    
    CategoryScale,
    DoughnutController,
    Legend,
    LinearScale,
    Title,
    Tooltip
);

// See the following for further information:
// https://www.chartjs.org/docs/latest/getting-started/integration.html#bundle-optimization
  
// -----------------------------------------------------------------------------
// Define available chart types.
export type TChartType = 'bar_horizontal' | 'bar_vertical' | 'doughnut' | 'pie';
// Map internal chart types to their ChartJS equivalents.
const getChartJsType = (chartType: TChartType) => {
    switch (chartType) {
        case 'bar_horizontal':
            return 'bar';
        case 'bar_vertical':
            return 'bar';
        case 'doughnut':
            return 'doughnut';
        case 'pie':
            return 'pie';
        default:
            console.error(`Unknown chart type: ${chartType}`);
            return 'bar';
    }
}
// -----------------------------------------------------------------------------
// Return data in a format suitable for charting. If 'colour' is supplied, it 
// will be used for all data values. If not, random colours will be used.

function getChartData( dataSchema: TContainerSchema[], colour?: string) {

    const [values, labels, colours] = transformData(dataSchema);
    const chartData = {
        labels,
        datasets: [
        {
            data: values,
            backgroundColor: colour || colours,
            borderColor: 'LightGray',
            borderWidth: 1
        }
        ]
    };
    return chartData;
}
// -----------------------------------------------------------------------------
// Return chart options.

function getChartOptions(chartType: TChartType, title?: string) {

    let chartOptions: ChartConfiguration['options'] = {
        responsive: true,
        aspectRatio: 1,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            align: 'start' as const,
            display: true,
            text: title,
            font: {
                size: 18,
            }
          },
        },
        scales: {           
            y: {
              ticks: {
                autoSkip: true,
              }
            }
          }
    };
    
    // Customise options dependent upon chart type being used.
    switch (chartType) {
        case 'bar_horizontal':
            break;
        case 'bar_vertical':
            chartOptions.indexAxis = 'x' as const;
            break;
        case 'doughnut':
        case 'pie':
            delete chartOptions.scales;
            chartOptions.plugins = { ...chartOptions.plugins,
                legend: {
                  display: true,
                  align: 'start' as const,
                  position: 'bottom' as const,
                  labels: {
                    boxWidth: 20,
                    font: {
                        size: 10
                    }
                  }
                }
            }
            break;
    };
    
    return chartOptions;
}
// -----------------------------------------------------------------------------
// Return a random colour string using the supplied opacity value.

function getRandomColour(opacity: number = 0.5): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},${opacity})`;
}
// -----------------------------------------------------------------------------
// Transform data into a format suitable for charting. Returns arrays of:
// values, labels, colours

function transformData(dataSchema: TContainerSchema[], 
                    sort: boolean = false): [number[], string[], string[]] {

    const labels: string[] = [];    // Axis labels.
    const values: number[] = [];    // Axis values.
    const colours: string[] = [];   // Colour values.

    if (dataSchema.length > 0) {
        if (sort) {
            dataSchema[0].data.sort((a, b) => {
                const ac = a.count ??= 0;
                const bc = b.count ??= 0;
                return (ac > bc) ? -1 : (ac < bc) ? 1 : 0;
            });
        }
        dataSchema[0].data.map((record) => {
            labels.push(record.label ??= '');
            values.push(record.count ??= 0);
            colours.push(getRandomColour());
        });
    }
    return [values, labels, colours];
}
// -----------------------------------------------------------------------------
  
interface IChart {
    /** Hex string representing data colour. Random if not supplied*/
    colour?: string;
    /** Data returned by Atlas API call. */
    data: TContainerSchema[];
    /** Chart type */
    chartType: TChartType;
    /** Title of chart. */
    title: string;
}
// -----------------------------------------------------------------------------

export function SpeciesChart(props: IChart): React.JSX.Element {

    const { colour, data, chartType, title } = props;
    const chartData = useMemo(() => getChartData(data, colour), [data, colour]);
    const chartOptions = getChartOptions(chartType, title);
    const chartRef = useRef<Chart | null>(null);
  
    const canvasCallback = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {        
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const config: ChartConfiguration = {
                type: getChartJsType(chartType),
                data: chartData,
                options: chartOptions
              };            
            chartRef.current = new Chart(ctx, config);
        }
    };      
  
    useEffect(() => {
        if (chartRef.current) {
          chartRef.current.data = chartData;
          chartRef.current.update();
        }
    }, [chartData]);
  
    return (
        <div className='w-full' >
            <canvas ref={canvasCallback} />
        </div>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
