import L, { Layer, Map } from 'leaflet';

import { occurrencesDetailFetcher,
    occurrencesDetailUrl,
    occurrencesSummaryFetcher,
    occurrencesSummaryUrl,
    occurrencesSummaryTaxonUrl,
    TOccurrencesDetailSchema,
    TOccurrencesSummarySchema } 
    from '@nbn-hooks/useOccurrences';

import { IExploreMap } from '@lib/types';
import { getVcBoundaryUrl, getVcFromCoordUrl, vcFromCoordFetcher } from '@nbn-hooks/useVCs';

// -----------------------------------------------------------------------------

const id_btn_next = 'next-occurrence-button';
const id_btn_previous = 'previous-occurrence-button';

// -----------------------------------------------------------------------------
// Class which manages fetching and formatting data from a mouse click.

export class OccurrencePopup {

    private index: number;  // Array index of current occurrence.
    private summaryData: TOccurrencesSummarySchema | null;
    private summaryUrl: string;

    // -------------------------------------------------------------------------
    // Constructor.

    constructor(lat: number, lng: number, zoom: number, explore: IExploreMap | null) {
        this.index = -1;
        this.summaryData = null;
        // Get the query URL. If 'explore' is provided, then will be taxon-specific
        this.summaryUrl = (explore) ? 
            occurrencesSummaryTaxonUrl(lat, lng, zoom, explore):
            occurrencesSummaryUrl(lat, lng, zoom);
    }
    // -------------------------------------------------------------------------
    // Fetch detail data for the current occurrence.

    async fetchDetail(): Promise<TOccurrencesDetailSchema | null> {
        let detail: TOccurrencesDetailSchema | null = null;
        if (this.summaryData && this.summaryData.count > 0) {
            if (this.index === -1)
            {   this.index = 0;
            } 
            if (this.summaryData.occurrences && (this.index < this.summaryData.occurrences.length)) {
                const url = occurrencesDetailUrl(this.summaryData.occurrences[this.index]);
                detail = await occurrencesDetailFetcher(url);
            }
        }
        return detail;
    }
    // -------------------------------------------------------------------------
    // Construct the content of the popup box.
    
    async getPopupContent(): Promise<string | null> {
        const trunc=(text: string, max: number=40): string => {
            return (text.length > max) && (text.indexOf(' ') < 0) ? 
                text.substring(0, max-1) + '...' : text;
        };
        const getUrl=() => (this.summaryData?.occurrences) ? 
            `https://records.nbnatlas.org/occurrences/${this.summaryData.occurrences[this.index]}` :
            null;

        const buttonStyle = 'w-24 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
        let content: string | null = null;
        const detail: TOccurrencesDetailSchema|null = await this.fetchDetail();
        if (detail) {
            content = '<div style="font-weight: normal;">';
            content += (this.summaryData && this.summaryData.count > 1) ?
                `<b>Viewing ${this.index+1} of ${this.summaryData.count} occurrences</b><br><br>` :
                '';
            if (detail.processed) {
                const p = detail.processed;
                content += (p.classification && p.classification.vernacularName) ?
                    `${p.classification.vernacularName}<br>` :
                    '';    
                content += (p.classification && p.classification.scientificName) ?
                    `<i>${p.classification.scientificName}</i><br>` :
                    '';
                content += '<br>';
                content += (p.attribution && p.attribution.dataResourceName) ?
                    `<b>Data resource:</b> ${trunc(p.attribution.dataResourceName)}<br>` :
                    '';                  
                content += (p.occurrence && p.occurrence.recordedBy) ?
                    `<b>Collector:</b> ${trunc(p.occurrence.recordedBy)}<br>` :
                    '';   
                content += (p.event && p.event.eventDate) ?
                    `<b>Event date:</b> ${trunc(p.event.eventDate)}<br>` :
                    ''; 
                const url = getUrl();
                if (url) {
                    content += `<a href="${url}" 
                            target="_blank">View full record</a>`;
                }
                content += '<br></div>';
            }
            if (this.summaryData && this.summaryData.count > 1) {
                content += `<button class='${buttonStyle}' id=${id_btn_previous}>Previous</button>
                            <button class='${buttonStyle}' id=${id_btn_next}>Next</button>`;            
            }
        }
        return content;
    }
    // -------------------------------------------------------------------------
    // Make initial fetch for summary data. Return true if data is available.

    async init(): Promise<boolean> {
        this.summaryData = await occurrencesSummaryFetcher(this.summaryUrl);
        return (this.summaryData && this.summaryData.count > 0);
    }    
    // -------------------------------------------------------------------------
    // Respond to a 'next' event.

    next(): void {
        if (this.summaryData) {
            if (this.index === -1) { 
                this.index = 0 
            } else if (this.summaryData.count > 0) {
                this.index++;
                if (this.index >= this.summaryData.count) {
                    this.index = 0;
                } 
            } else {
                this.index = 0;
            }
        }
    }
    // -------------------------------------------------------------------------
    // Respond to a previous event.

    previous(): void {
        if (this.summaryData) {
            if (this.index === -1) { 
                this.index = 0 
            } else if (this.summaryData.count > 0) {
                this.index--;
                if (this.index < 0) {
                    this.index = this.summaryData.count-1;
                } 
            } else {
                this.index = 0;
            }
        }
    }
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 

export async function getVcBoundary(latitude: number, longitude: number): Promise<L.GeoJSON|null> {

    let layer: L.GeoJSON|null = null;
    try {
        const coordUrl = getVcFromCoordUrl(latitude, longitude);
        const coordData = await vcFromCoordFetcher(coordUrl);
        const pid = coordData[0].pid;
        if (!pid) {
            throw new Error('No PID found in response');
        }
        const boundUrl = getVcBoundaryUrl(pid);
        const boundResp = await fetch(boundUrl);
        if (!boundResp.ok) {
            throw new Error('Failed to fetch GeoJSON data');
        }
        const boundData = await boundResp.json();
        if (boundData) {
            layer = L.geoJSON(boundData, {
                style: {
                    color: 'blue',
                    weight: 2,
                    fillOpacity: 0
                }});
        }
    } catch (error) {
        console.error('Error creating VC boundary layer: ', error);
    }
    return layer;
}
// -----------------------------------------------------------------------------
// Swap x & y values in array of arrays of form [[x, y]...]

export function exchangeArrayValues(array: []): [] {
    for (let i = 0; i < array.length; i++) {
        const subArray = array[i];
        const temp = subArray[0];
        subArray[0] = subArray[1];
        subArray[1] = temp;
    }   
    return array;
}
// -----------------------------------------------------------------------------
// Handle a 'next' or 'previous' button click.

export async function skipOccurrence(popup: L.Popup, occurrencePopup: OccurrencePopup, 
                                next: boolean): Promise<void> {
    (next) ? occurrencePopup.next(): occurrencePopup.previous();
    // popup.setContent('Loading...');
    const content = await occurrencePopup.getPopupContent();
    if (content) {
        // Remove any existing buttons & their listeners.
        let nextButton = L.DomUtil.get(id_btn_next);
        let previousButton = L.DomUtil.get(id_btn_previous);
        (nextButton) && L.DomUtil.remove(nextButton);
        (previousButton) && L.DomUtil.remove(previousButton);
        // Render the new content
        popup.setContent(content);
        // Create new button listeners.
        nextButton = L.DomUtil.get(id_btn_next);
        previousButton = L.DomUtil.get(id_btn_previous);
        nextButton?.addEventListener('click', 
            () => skipOccurrence(popup, occurrencePopup, true));
        previousButton?.addEventListener('click', 
            () => skipOccurrence(popup, occurrencePopup, false));        
    } else {
        popup.setContent('No occurrences found.');
    }
}
// -----------------------------------------------------------------------------
// Select a base layer which has already been added to a control.

export function selectBaseLayer(map: Map, layer: Layer, name: string): void {
    // display the layer
    layer.addTo(map);
    // find the associated radio button and set its 'checked' property to true
    const radios = document.querySelectorAll(
                    '.leaflet-control-layers-base input[type="radio"]') as 
                    NodeListOf<HTMLInputElement>;
    radios.forEach((radio) => {
        if (radio.nextSibling?.textContent?.trim() === name) {
            radio.checked = true;
            // trigger a change event to update the map accordingly
            radio.dispatchEvent(new Event('change'));
        } else {
            radio.checked = false;
        }
    });
}
// -----------------------------------------------------------------------------
// Select an overlay layer which has already been added to a control.

export function selectOverlayLayer(map: Map, layer: Layer, name: string): void {
    // display the layer
    layer.addTo(map);
    // find the associated checkbox  and set its 'checked' property to true
    const checkboxes = document.querySelectorAll(
                '.leaflet-control-layers-overlays input[type="checkbox"]') as
                NodeListOf<HTMLInputElement>;
    checkboxes.forEach((checkbox) => {
        if (checkbox.nextSibling?.textContent?.trim() === name) {
            checkbox.checked = true;
            // trigger a change event to update the map accordingly
            checkbox.dispatchEvent(new Event('change'));
        } 
    });
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
