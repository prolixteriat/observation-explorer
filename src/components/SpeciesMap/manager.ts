// Need to import the CSS before 'leaflet'
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import { DataPane } from './const';
import { CElement, ISpeciesMap, Params, TLayers, TLayersGeoJSON, TLayersShape, TLayersWMS, 
        TSearch } from './params';
import { handleBaseLayerChange, handleMouseClick } from './interactions';
import { getVcBoundary, selectOverlayLayer } from './utils'; 
import './speciesmap.css';

// -----------------------------------------------------------------------------

export class MapManager {
    // Layer arrays
    private baseMaps: TLayers;
    private overlayMaps: TLayersGeoJSON;
    private shapeLayers: TLayersShape;
    private wmsLayers: TLayersWMS;

    private ctrlLayer: L.Control.Layers | null;
    private map: L.Map;
    private params: Params;

    private element: CElement;

    // -------------------------------------------------------------------------
    
    constructor(props: ISpeciesMap, element:CElement) {
        this.params = new Params(props);
        this.element = element;

        this.baseMaps = {};
        this.overlayMaps = {};
        this.shapeLayers = [];
        this.wmsLayers = {};

        this.ctrlLayer = null;
        this.initBaseMaps();  // call before map initialisation
        const interactive = this.params.showInteractive();
        this.map = L.map(element.map_id, {
                center: [54.59,-1.45],
            zoom: 6,
            zoomSnap: 0,
            attributionControl: this.params.showInternalAttrib(),
            boxZoom: interactive,
            doubleClickZoom: interactive,
            dragging: interactive,
            keyboard: interactive,
            scrollWheelZoom: this.params.showScrollZoom(), 
            touchZoom: interactive,
            zoomControl: interactive,
            layers: [Object.values(this.baseMaps)[0]]
        });  
        // Handle attributions
        this.map.on('baselayerchange', (e) => {
            handleBaseLayerChange(e.name, this.element);
        });
        handleBaseLayerChange(Object.keys(this.baseMaps)[0], this.element);
        // Handle mouse click
        if (this.params.showClickable()) {
            this.map.on('click', (e) => {
                handleMouseClick(e, this.map, this.params.explore);
            });
            // Use pointer cursor if results not restricted to just a defined region            
            if (!this.params.showRegion()) {
                L.DomUtil.addClass(this.map.getContainer(),'pointer-cursor-enabled');
            }
        }
        this.initMap();
    }
    
    // -------------------------------------------------------------------------

    addLayer(layer: L.GeoJSON | L.TileLayer | L.TileLayer.WMS, name: string = ''): void {
        if (this.params.showInteractive()) {
            // add to layer control
            this.ctrlLayer?.addOverlay(layer, name);
            selectOverlayLayer(this.map, layer, name);
        } else {
            // add directly to map
            layer.addTo(this.map);
        }
    }
    // -------------------------------------------------------------------------
    
    initBaseMaps(): void {
        const nbn_attrib = '<a href="https://docs.nbnatlas.org/nbn-atlas-terms-of-use/" target="_blank">powered by NBN</a> | ';
        this.baseMaps = {};
        
        for (const base of this.params.base) {
            switch (base) {
                case 'simple':
                    this.baseMaps.Simple = L.tileLayer(
                        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
                        {   attribution: nbn_attrib +
                            '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | ' +
                            '<a href="https://carto.com/attributions" target="_blank">CartoDB'  
                        });
                    break;
                case 'road':
                    this.baseMaps.Road = L.tileLayer(
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png', 
                        {   attribution: nbn_attrib +
                            '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' 
                        });
                    break;
                case 'terrain':
                    this.baseMaps.Terrain = L.tileLayer(
                        'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', 
                        {   attribution: nbn_attrib +
                            '<a href="https://opentopomap.org" target="_blank">OpenTopoMap</a>' 
                        });
                    break;
                case 'satellite':
                    this.baseMaps.Satellite = L.tileLayer(
                        'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
                        {   subdomains:['mt0','mt1','mt2','mt3'],
                            attribution: nbn_attrib + 
                            '<a href="https://mapsplatform.google.com/" target="_blank">powered by Google</a>' 
                        });         
                    break;
                default:
                    console.error(`Unknown base map type: ${base}`);
                    break;
            }
        }
    }
    // -------------------------------------------------------------------------
    // add boundary line layers

    async initBoundaryOverlays(): Promise<void> {
        const vcName = 'VC boundary';
        if (this.params.showVCs() &&  this.params.explore) {
            const loc = this.params.explore.location;
            const layer = await getVcBoundary(loc.latitude, loc.longitude);
            // Remove any existing boundary overlays
            for (const layerName in  this.overlayMaps) {
                this.map.removeLayer(this.overlayMaps[layerName]);
                this.ctrlLayer?.removeLayer(this.overlayMaps[layerName]);
            }
            this.overlayMaps = {};
            if (layer) {
                this.overlayMaps[vcName] = layer;
                this.addLayer(layer, vcName);
            }
        }
    }
    // -------------------------------------------------------------------------
    
    initMap(): void { 
        const pane = this.map.createPane(DataPane);     
        // Set weighting to allow data layers to show over top of static map
        pane.style.zIndex = '600';
        if (this.ctrlLayer !== null) {
            this.map.removeControl(this.ctrlLayer);
        }
        if (this.params.showInteractive()) {
            this.ctrlLayer = L.control
                .layers(this.baseMaps)
                .addTo(this.map);
        }
    }
    // -------------------------------------------------------------------------
    
    initShapeLayers(): void {
        // Remove any existing shape layers
        for (const layer of this.shapeLayers) {
            this.map.removeLayer(layer);
        }
        this.shapeLayers = [];
        if (this.params.showRegion()) {
            const shape = this.params.makeShape();
            if (shape !== null) {
                shape.addTo(this.map);
                this.shapeLayers.push(shape);
                this.params.bounds = shape.getBounds().pad(0.1); 
            }             
        }
    }
    // -------------------------------------------------------------------------
    
    async initWmsLayers(): Promise<void> {
        // Remove any existing WMS layers
        for (const layer of Object.values(this.wmsLayers)) {
            this.map.removeLayer(layer);
            this.ctrlLayer?.removeLayer(layer);
        }
        this.wmsLayers = this.params.getWmsLayers();
        for (const [title, layer] of Object.entries(this.wmsLayers)) {
            this.addLayer(layer, title);
        }           
    }
    // -------------------------------------------------------------------------

    show(search: TSearch): void {
        if (typeof search === 'string') {
            this.params.setTvk(search);
        } else {
            this.params.setExplore(search);
        }
        this.initWmsLayers();
        this.initShapeLayers();
        this.initBoundaryOverlays();
        if (this.params.bounds !== null ) {
            this.map.fitBounds(this.params.bounds);
        }
    }
    // -------------------------------------------------------------------------
}

// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------

