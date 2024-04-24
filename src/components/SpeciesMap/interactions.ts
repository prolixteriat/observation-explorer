import L from 'leaflet';

import { IExploreMap } from '@lib/types';

import { CElement } from './params';
import { OccurrencePopup, skipOccurrence } from './utils';

// -----------------------------------------------------------------------------

export function handleBaseLayerChange(layerName: string, element: CElement): void {
    const attrib1 = document.getElementById(element.attr1) as HTMLAnchorElement;
    const attrib2 = document.getElementById(element.attr2) as HTMLAnchorElement;
    const attrib3 = document.getElementById(element.attr3) as HTMLAnchorElement;
    const attrib4 = document.getElementById(element.attr4) as HTMLAnchorElement;
    const pipe3 = document.getElementById(element.pipe3);

    // Check if the elements exists
    if (attrib1 && attrib2 && attrib3 && attrib4 && pipe3) {
        // Set the common attributions
        attrib1.innerText = 'powered by NBN';
        attrib1.href = 'https://docs.nbnatlas.org/nbn-atlas-terms-of-use/';
        attrib2.innerText = 'Leaflet';
        attrib2.href = 'https://leafletjs.com';
        attrib4.innerText = '';
        attrib4.href = '';
        pipe3.style.display = 'none';
        // Set the layer-specific attributions
        switch (layerName.toLowerCase()) {
            case 'simple':
                attrib3.innerText = 'OpenStreetMap';
                attrib3.href = 'https://www.openstreetmap.org/copyright';
                attrib4.innerText = 'CartoDB';
                attrib4.href = 'https://carto.com/attributions';
                pipe3.style.display = '';
                break;
            case 'road':
                attrib3.innerText = 'OpenStreetMap';
                attrib3.href = 'https://www.openstreetmap.org/copyright';
                break;
            case 'terrain':
                attrib3.innerText = 'OpenTopoMap';
                attrib3.href = 'https://opentopomap.org';
                break;
            case 'satellite':
                attrib3.innerText = 'powered by Google';
                attrib3.href = 'https://mapsplatform.google.com/';
                break;
            default:
                console.error(`Unknown base layer name: ${layerName}`);
                break;
        }
    }
}
// -----------------------------------------------------------------------------

export async function handleMouseClick(e: L.LeafletMouseEvent, map: L.Map,
                                    explore: IExploreMap|null): Promise<void> {

    map.closePopup();
    const occurrencePopup = new OccurrencePopup(e.latlng.lat, e.latlng.lng, 
                                map.getZoom(), explore);  
    const hasData = await occurrencePopup.init();
    if (hasData) {
        const popup = L.popup();
        popup
            .setLatLng(e.latlng)
            .setContent('Loading...')
            .openOn(map);
        await skipOccurrence(popup, occurrencePopup, true);           
    }
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
