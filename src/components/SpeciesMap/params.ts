import * as bigr from 'brc-atlas-bigr';
import * as L from 'leaflet';
import { default as proj4 } from 'proj4';

import { calcBoundingRectangle, getBoundingRectangleWkt } from '@lib/funcs';
import { IExploreMap } from '@lib/types';
import { Colour, DataPane } from './const';
import { sanitiseParam, sanitiseParamList, sanitiseUrl } from './sanitise';

import Boundaries from '../../assets/VC_boundaries.json';

// -----------------------------------------------------------------------------

export type TLayers = { [k: string]: L.TileLayer | L.LayerGroup };
export type TLayersGeoJSON = { [k: string]: L.GeoJSON };
// export type TLayersShape = L.Circle[];
export type TLayersShape = (L.Circle | L.Rectangle)[];
export type TLayersWMS = { [k: string]: L.TileLayer.WMS };
export type TSearch = string | IExploreMap;

// -----------------------------------------------------------------------------
// Class which generates internal component HTML element IDs.

export class CElement {
    
    public map_id: string;
    public attr1: string;
    public attr2: string;
    public attr3: string;
    public attr4: string;
    public pipe3: string;

    constructor(map_id: string) {
        this.map_id = map_id;
        this.attr1 = this.map_id + '-attr1';
        this.attr2 = this.map_id + '-attr2';
        this.attr3 = this.map_id + '-attr3';
        this.attr4 = this.map_id + '-attr4';
        this.pipe3 = this.map_id + '-pipe3';
    }
}
// -----------------------------------------------------------------------------

export interface ISpeciesMap {
    /** Unique div ID for this map. */
    map_id: string;
    /** Search query. Either TVK or location & group/species. */
    search: TSearch;
    /** Grid reference representing bottom-left corner of a bounding box. 
     * Use with tr parameter. */
    bl?: string;
    /** Grid reference representing top-right corner of a bounding box. 
     * Use with bl parameter. */
    tr?: string;
    /** Northing,Easting pair representing bottom-left corner of a bounding box. 
     * Use with trCoord parameter. */
    blCoord?: string;
    /** Northing,Easting pair representing top-right corner of a bounding box. 
     * Use with blCoord parameter. */
    trCoord?: string;
    /** Start year for the lower date layer (inclusive). */
    b0from?: string;
    /** End year for the lower date layer (inclusive). */
    b0to?: string;
    /** Fill colour for lower date layer. */
    b0fill?: string;
    /** Border colour for lower date layer (skipped). */
    b0bord?: string;
    /** Start year for the lower date layer (inclusive). */
    b1from?: string;
    /** End year for the middle date layer (inclusive). */
    b1to?: string;
    /** Fill colour for middle date layer. */
    b1fill?: string;
    /** Border colour for middle date layer (skipped). */
    b1bord?: string;
    /** Start year for the middle date layer (inclusive). */
    b2from?: string;
    /** End year for the upper date layer (inclusive). */
    b2to?: string;
    /** Fill colour for upper date layer. */
    b2fill?: string;
    /** Border colour for upper date layer (skipped). */
    b2bord?: string;
    /** Display Vice County boundaries.*/
    bg?: string;
    /**  Number of days after which a new image will be generated instead of 
     * cached version (skipped). */
    cachedays?: number;
    /** Comma-separated list of datasetkeys of the datasets to be shown on 
     * the map. If none specified all available datasets are shown. */
    ds?: string;
    /** Specifies a grid to overlay the map (skipped). */
    gd?: string;
    /** Height, in pixels, of the map. If neither height nor width specified 
     * the height is 350. */
    h?: string;
    /** Width, in pixels, of the map. If neither height nor width specified 
     * the width is 350. */
    w?: string;
    /** External '1'  or internal '2' credits for NBN and other attributions. 
     * Default is external. */
    logo?: string;
    /** Doubles the resolution of the map (skipped). */
    retina?: number;
    /**  Size of the grid squares to show on the map. If not specified the 
     * resolution is 10km */
    res?: string;
    /** Number of the vice-county. Zooms the map to the particular vice-county 
     * as specified. */
    vc?: string;
    /** Focuses the map upon the named area (e.g.: uk, england, scotland, wales, 
     * highland, sco-mainland, outer-heb) */
    zoom?: string;
    /** Defines which base layers to display and in which order. If 'interactive'
     * is not set, then only first layer will be displayed. If no value supplied,
     * all layers will be displayed.
     */
    base?: string;
    /** Allow the user to click on the map to retrieve occurrence records. 
     * Enabled is 1, disable is 0. Default is 0.
    */
    clickable?: string;
    /** Disables map interactive controls if set to 0, enables is set to 1.
     * Default is 0. */
    interactive?: string;
    /** Size of points in 'unconfirmed' mode. Default is 4. */
    pointSize?: string;
    /** NBN Atlas API query addressed to the 
     * https://records-ws.nbnatlas.org/ogc/wms/reflect endpoint. Overrides some
     * other paramaters. Note that 'query' must appear as the final parameter in 
     * the calling URL. */
    query?: string;
    /** Used with location/radius to restrict results to a defined region if
     * set to 1. Default is 1. */
    region?: string;
    /** Enables scroll-wheel zooming if set to 1. Default is 0. */
    scrollZoom?: string;
    /** Separates accepted & unconfirmed observations if set to 1. Default is 0. */
    unconfirmed?: string;
}
// -----------------------------------------------------------------------------

export class Params {
    
    // used by northing/easting calculations
    readonly CRS_EPSG_27700 = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs +type=crs';
    readonly CRS_EPSG_4326 = '+proj=longlat +datum=WGS84 +no_defs +type=crs';

    // supplied members
    private props: ISpeciesMap;
    // derived members
    public explore: IExploreMap | null;
    private tvk: string;
    private bl: string;
    private tr: string;
    private blCoord: string;
    private trCoord: string;
    private b0from: string;
    private b0to: string;
    private b0fill: string;
    private b1from: string;
    private b1to: string;
    private b1fill: string;
    private b2from: string;
    private b2to: string;
    private b2fill: string;
    private bg: string;
    private ds: string;
    public h: string;
    public w: string;
    private logo: string;
    private res: string;
    private vc: string;
    private clickable: string
    private interactive: string;
    private pointSize: string;
    private query: string;
    private region: string;
    private scrollZoom: string;
    private unconfirmed: string
    private zoom: string;
    // calculated members
    public base: string[];
    public bounds: L.LatLngBounds | null;
    private druidurl: string;
    private map_grid_size: string
    private rangeurl0: string;
    private rangeurl1: string;
    private rangeurl2: string;

    // -------------------------------------------------------------------------
    /** Constructor.
     * 
     * @param {ISpeciesMap} props - Configuration parameters.
     */
    constructor(props: ISpeciesMap) {
        this.props = props;
        this.bounds = null;
        if (typeof props.search === 'string') {
            this.explore = null;
            this.tvk = this.props.search as string;
        } else {
            this.explore = this.props.search as IExploreMap;
            this.tvk = this.explore.speciesName;
        }
        // tvk: taxon version key
        this.tvk = this.tvk.replace(/[^a-zA-Z0-9]/g, ''); 
        // bl, tr: OS grid reference boundary
        if (this.checkPairParams('bl', this.props.bl, 'tr', this.props.tr)) {
            this.bl = sanitiseParam('bl', this.props.bl, /[^a-zA-Z0-9]/g); 
            this.tr = sanitiseParam('tr', this.props.tr, /[^a-zA-Z0-9]/g); 
            const blc = this.getLatLngFromGR(this.bl);
            const trc = this.getLatLngFromGR(this.tr);
            if (blc !== null && trc !== null) {
                this.bounds = L.latLngBounds(blc, trc);
            }                     
        } else {
            this.bl = '';
            this.tr = '';
        }
        // blCoord, trCoord: Northing, Easting boundary
        if (this.checkPairParams('blCoord', this.props.blCoord, 'trCoord', this.props.trCoord)) {
            this.blCoord = sanitiseParam('blCoord', this.props.blCoord, /[^0-9,]/g); 
            this.trCoord = sanitiseParam('trCoord', this.props.trCoord, /[^0-9,]/g); 
            const blc = this.getLatLngFromNE(this.blCoord);
            const trc = this.getLatLngFromNE(this.trCoord);
            if (blc !== null && trc !== null) {
                this.bounds = L.latLngBounds(blc, trc);
            }
        } else {
            this.blCoord = '';
            this.trCoord = '';
        }

        // b0from, b0to, b0fill: Lower data layer
        let db = this.getDateBand('b0from', this.props.b0from, 'b0to', this.props.b0to);
        this.b0from = db[0];
        this.b0to = db[1];
        this.rangeurl0 = db[2];
        this.b0fill = this.sanitiseFill('b0fill', this.props.b0fill, 'FFFF00');
        // b1from, b1to, b1fill: Middle data layer
        db = this.getDateBand('b1from', this.props.b1from, 'b1to', this.props.b1to);
        this.b1from = db[0];
        this.b1to = db[1];
        this.rangeurl1 = db[2];
        this.b1fill = this.sanitiseFill('b1fill', this.props.b0fill, 'FF00FF');
        // b2from, b2to, b2fill: Upper data layer
        db = this.getDateBand('b2from', this.props.b2from, 'b2to', this.props.b2to);
        this.b2from = db[0];
        this.b2to = db[1];
        this.rangeurl2 = db[2];
        this.b2fill = this.sanitiseFill('b2fill', this.props.b2fill, '00FFFF');
        // bg
        this.bg = sanitiseParamList('bg', this.props.bg, ['vc']); 
        // ds
        this.ds = sanitiseParam('ds', this.props.ds, /[^a-zA-Z0-9,]/g);
        if (this.ds.length > 0) {
            this.druidurl = '+AND+(data_resource_uid:' + 
                    this.ds.split(',').join('+OR+data_resource_uid:') + 
                    ')';
        } else {
            this.druidurl = '';
        }
        // h, w
        this.h = sanitiseParam('h', this.props.h, /[^0-9]/g);
        this.w = sanitiseParam('w', this.props.w, /[^0-9]/g);
        // logo
        this.logo = sanitiseParamList('logo', this.props.logo, ['0', '1', '2'],
                                        '1'); 
        // res
        this.res = sanitiseParamList('res', this.props.res, 
                        ['50km', '10km', '2km', '1km', '100m']); 
        if (this.res !== '') {
            this.map_grid_size = `fixed_${this.res}`;
        } else {
            this.map_grid_size = 'fixed_10km';
        }
        // unconfirmed
        this.unconfirmed = sanitiseParamList('unconfirmed', 
                        this.props.unconfirmed, ['0', '1'], '0'); 
        // vc
        this.vc = sanitiseParam('vc', this.props.vc, /[^a-zA-Z0-9]/g); 
        if (this.vc !== '') {
            this.calcBoundary('vc', this.vc);
        }
        // zoom
        this.zoom = sanitiseParamList('zoom', this.props.zoom, ['england',
            'scotland', 'wales', 'highland', 'sco-mainland', 'outer-heb', 'uk']); 
        if (this.zoom !== '') {
                this.calcBoundary('zoom', this.zoom);
        }
        // base
        this.base = [];
        const layers = ['simple', 'road', 'terrain', 'satellite'];
        const bases = sanitiseParam('base', this.props.base, /[^a-zA-Z,]/g).split(',');
        if (bases[0].length > 0) {
            for (const base of bases) {
                const clean = sanitiseParamList('base', base, layers);
                if (clean.length > 0) {
                    this.base.push(clean);
                }
            }
        }
        if (this.base.length === 0) {
            // Use all layers by default
            this.base.push(...layers)
        }
        // clickable
        this.clickable = sanitiseParamList('clickable', 
                            this.props.clickable, ['0', '1'], '1');

        // interactive   
        this.interactive = sanitiseParamList('interactive', 
                            this.props.interactive, ['0', '1'], '0');
        // pointSize
        this.pointSize = sanitiseParam('pointSize', this.props.pointSize, /[^0-9]/g, '4');
        // query
        this.query = sanitiseUrl('query', this.props.query);
        // region
        this.region = sanitiseParamList('region', 
                            this.props.region, ['0', '1'], '1');
        // scrollZoom
        this.scrollZoom = sanitiseParamList('scrollzoom', 
                            this.props.scrollZoom, ['0', '1'], '0'); 

        // Skipped parameters
        this.skipParam('gd', this.props.gd);
        this.skipParam('b0bord', this.props.b0bord);
        this.skipParam('b1bord', this.props.b1bord);
        this.skipParam('b2bord', this.props.b2bord);
        this.skipParam('cachedays', this.props.cachedays);
        this.skipParam('retina', this.props.retina);
        // Final data integrity checks...
        const bcount =  (this.bl.length > 0 ? 1 : 0) +
                        (this.blCoord.length > 0 ? 1 : 0) +
                        (this.vc.length > 0 ? 1 : 0) +
                        (this.zoom.length > 0 ? 1 : 0);
        if (bcount === 0) {
            // Set default view as none specified
            this.calcBoundary('default', 'uk');
        }
        else if (bcount > 1) {
            // Warn if multiple boundary parameters have been supplied
            console.warn("Multiple boundary parameters have been supplied. " +
                "Only one of '[bl,tr]', '[blCoord,trCoord]', 'vc', or 'zoom' " +
                "will be used.");
        }        
    }
    // -------------------------------------------------------------------------
    /** Set the boundary coords for a specified boundary ID (e.g. VC 39)
     * 
     * @param {string} name - Name of parameter.
     * @param {string} boundary_id - Value of parameter.
     */
    calcBoundary(name: string, boundary_id: string): void {
        const idl = boundary_id.toLocaleLowerCase();
        let found = false;
        // Iterate through list of boundary regions to find matching ID.
        for (const boundary of Boundaries)         {
            if (boundary.id == idl) {
                const lll = L.latLng(boundary.llat, boundary.llon);
                const ull = L.latLng(boundary.ulat, boundary.ulon);
                this.bounds = L.latLngBounds(lll, ull); 
                found = true;
                break;               
            }
        }
        if (!found) {
            console.error(`Parameter '${name} contains an invalid value: ` +
                        `${boundary_id}. It will be ignored.`);
        }
    } 
    // -------------------------------------------------------------------------
    /** Check that a pair of parameters are both defined or both undefined. 
     * 
     * @param {string} name1 - Name of parameter 1.
     * @param {string|undefined} param1 - Value of parameter 1.
     * @param {string} name2 - Name of parameter 2.
     * @param {string|undefined} param2 Value of parameter 3.
     * @returns {boolean} - True if both parameters are defined.
     */
    checkPairParams(name1: string, param1: string|undefined, 
                    name2: string, param2: string|undefined): boolean {

        if (typeof(param1) !== typeof(param2)) {
            console.warn(`Either both or neither of the parameters '${name1}'` +
                            ` and '${name2}' must be supplied`);
        }
        const ok: boolean = (param1 !== undefined) && (param2 !== undefined);
        return ok;
    }

    // -------------------------------------------------------------------------
    /** Generate the NBN API query string representing the interval between two 
     * years.
     * 
     * @param {string} name1 - Name of parameter 1.
     * @param {string|undefined} year1 - Value of the earliest year.
     * @param {string} name2 - Name of parameter 2.
     * @param {string|undefined} year2 - Value of the latest year.
     * @returns {string[]} - Three-element array. Index [0] is the santised 
     * year1; index [1] is the sanitised year2; index [2] is the query string. 
     * All elements are empty strings if one or both years are undefined.
     */
    getDateBand(name1: string, year1: string|undefined, 
                name2: string, year2: string|undefined): string[] {

        const db: string[] = ['', '', ''];

        if (this.checkPairParams(name1, year1, name2, year2)) {
            db[0] = this.sanitiseYear(name1, year1);
            db[1] = this.sanitiseYear(name2, year2);
            if (db[0] !== '' && db[1] !== '') {
                db[2] = `+AND+year:[${db[0]}+TO+${db[1]}]`;
            }
        } 
        return db;          
    }
    // -------------------------------------------------------------------------
    /** Generate the legend entry representing a date band interval.
     * 
     * @param {string} from - Earliest year.
     * @param {string} to - Latest year.
     * @returns {string} - Legend entry.
     */
    getDateBandTitle(from: string, to: string): string {
        const title = `${this.tvk}: ${from}-${to}`;
        return title;
    }
    // -------------------------------------------------------------------------
    /** Transform a gridref to a LatLng object. Uses the centroid of the gridref.
     * 
     * @param {string} gr_str - Grid reference.
     * @returns {L.LatLng|null} - LatLng object else null if invalid gridref.
     */
    getLatLngFromGR(gr_str: string): L.LatLng|null {
        
        let latLng = null;

        try {            
            const nums = bigr.getCentroid(gr_str, 'wg').centroid;
            latLng = L.latLng(nums[1], nums[0]);
        }
        catch (err) {
            console.error(`Invalid grid reference: '${gr_str}'`);
        }
        return latLng;   
    }         
    // -------------------------------------------------------------------------
    /** Transform a Northing,Easting coordinate to a LatLng object.
     * 
     * @param {string} ne_str - Coordinate in format 'Northing,Easting'.
     * @returns {L.LatLng|null} - LatLng object else null if invalid coordinate.
     */
    getLatLngFromNE(ne_str: string): L.LatLng|null {
        
        let latLng = null;

        try {
            const nums = ne_str.split(',').map(Number);
            const [lng, lat] = proj4(this.CRS_EPSG_27700, this.CRS_EPSG_4326, 
                                     nums);
            latLng = L.latLng(lat, lng);
        }
        catch (err) {
            console.error(`Invalid Northing/Easting: '${ne_str}'`);
        }
        return latLng;   
    } 
    // -------------------------------------------------------------------------
    /** Generate the query URL for a WMS request in point mode.
     * 
     * @returns {string} - The required URL.
     */
    getPointUrl(): string {
            
        const baseUrl = 'https://records-ws.nbnatlas.org/ogc/wms/reflect?';
        let queryUrl: string;
        // Are we in explore mode or TVK mode?...
        if (this.explore) {
            if (this.explore.groupName.length === 0 && this.explore.speciesName.length === 0) {
                return '';
            }
            // Handle unique case of 'ALL_SPECIES'.
            const groupName = (this.explore.groupName === 'ALL_SPECIES' || this.explore.groupName ==='') ?
                                 '*' : this.explore.groupName;

            const speciesName = (this.explore.isGroup || !this.explore.speciesName) ? '*' : `%22${this.explore.speciesName}%22`;
            queryUrl = `q=taxon_name%3A${speciesName}&fq=species_group%3A${groupName}&fq=(geospatial_kosher%3Atrue%20AND%20-occurrence_status%3Aabsent)`;
            // Restrict results to the interior of a sub-region?
            if (this.showRegion()) {
                const loc = this.explore.location;
                if (this.explore.location.isSquare) {
                    const distance = loc.radius * 1000;
                    const wkt = getBoundingRectangleWkt(loc.latitude, loc.longitude, distance, distance);                
                    queryUrl += `&wkt=${wkt}`;
                } else {
                    queryUrl += `&lat=${loc.latitude}&lon=${loc.longitude}&radius=${loc.radius}`;
                }
            }
        } else {
            queryUrl = `q=*:*&fq=-occurrence_status%3Aabsent&fq=lsid:${this.tvk}`;
        }
        const url = baseUrl + queryUrl;
        return url;
    }
    // -------------------------------------------------------------------------
    /** Generate a single TileLayer.
     * 
     * @param {string} range - Date range query string as returned by getDateBand.
     * @param {string} fill - Hex string representing colour (e.g. 'FFFF000').
     * @returns {L.TileLayer.WMS} - Generated TileLayer object.
     */
    getWmsLayer(range: string = '', fill: string = Colour.yellow): L.TileLayer.WMS {

        // const wmsType: string = WmsType.point
        const env = `&ENV=colourmode:osgrid;gridlabels:false;opacity:0.8;` + 
                    `color:${fill};gridres:${this.map_grid_size}`;
        const queryUrl = this.getWmsQueryUrl(range) + env;
        // console.debug(queryUrl);
        const tileLayer  = L.tileLayer.wms(queryUrl, {
            pane: DataPane,
            layers: 'ALA:occurrences',
            format: 'image/png',
            uppercase: true,        
        });	 

        return tileLayer;      
    }
    // -------------------------------------------------------------------------
    /** Generate a single TileLayer based upon a custom query URL.
     * 
     * @returns {L.TileLayer.WMS} - Generated TileLayer object.
     */
    getWmsLayerCustom(): L.TileLayer.WMS {

        const tileLayer  = L.tileLayer.wms(this.query, {
            pane: DataPane,
            layers: 'ALA:occurrences',
            format: 'image/png',
            uppercase: true,        
        });	 

        return tileLayer;         
    }
    // -------------------------------------------------------------------------
    /** Generate a single TileLayer.
     * 
     * @param {boolean} confirmed - If true show confirmed, else show unconfirmed.
     * @param {string} fill - Hex string representing colour (e.g. 'FFFF000').
     * @returns {L.TileLayer.WMS} - Generated TileLayer object.
     */
    getWmsLayerPoint(confirmed: boolean, fill: string = Colour.yellow): L.TileLayer.WMS {

        // const url = `https://records-ws.nbnatlas.org/ogc/wms/reflect?q=*:*&fq=lsid:${this.tvk}&fq=occurrence_status:present` ;
        const url = this.getPointUrl();
        const qryNeg = '("Unconfirmed" OR "Unconfirmed - plausible" OR "Unconfirmed - not reviewed")';
        const qryPos = '("Accepted" OR "Accepted - considered correct" OR "Accepted - correct" OR "verified")';
        // const envNeg = `size:6;opacity:0.8;color:${fill}`;
        // const envPos = `size:6;opacity:0.8;color:${fill}`;
        const envNeg = `size:${this.pointSize};opacity:0.8;color:${fill}`;
        const envPos = `size:${this.pointSize};opacity:0.8;color:${fill}`;
        // const envNeg = `name:circle;size:4;opacity:0.8;color:${fill}`;
        // const envPos = `name:circle;size:4;opacity:0.8;color:${fill}`;
        const qry = '&fq=identification_verification_status:' + (confirmed ? qryPos : qryNeg);
        const env = '&OUTLINE=false&ENV=' + (confirmed ? envPos : envNeg);

        const queryUrl = url + qry + env;
        const tileLayer  = L.tileLayer.wms(queryUrl, {
            pane: DataPane,
            layers: 'ALA:occurrences',
            format: 'image/png',
            uppercase: true,        
        });	 

        return tileLayer;      
    }
    // -------------------------------------------------------------------------
    /** Generate the NBN API URL to return an in-built layer.
     * 
     * @param {string} layerName - Name of in-built layer.
     * @returns {L.TileLayer.WMS} - Generated TileLayer object.
     */
    getWmsLayerNative(layerName: string): L.TileLayer.WMS {

        const url = 'https://layers.nbnatlas.org/geoserver/gwc/service/wms?';
        
        const tileLayer  = L.tileLayer.wms(url, {
            layers: layerName,
            format: 'image/png',
            uppercase: true,
            transparent: true,
            opacity: 0.3
        });	 
        return tileLayer;
    }
    // -------------------------------------------------------------------------
    /** Generate an associative array of map tile layers.
     * 
     * @returns {TLayersWMS} - Array of tile layers.
     */
     getWmsLayers(): TLayersWMS {

        const wmsLayers: TLayersWMS = {};

        const hasDateBands: boolean = (this.rangeurl0.length > 0) ||
                                      (this.rangeurl1.length > 0) ||
                                      (this.rangeurl2.length > 0);

        if (this.query.length > 0) {
            // Use custom query
            wmsLayers[this.tvk] = this.getWmsLayerCustom();
        } else if (hasDateBands) {
            // Split data into one or more date bands
            if (this.rangeurl0.length > 0) {
                wmsLayers[this.getDateBandTitle(this.b0from, this.b0to)] = 
                    this.getWmsLayer(this.rangeurl0, this.b0fill);
            }
            if (this.rangeurl1.length > 0) {
                wmsLayers[this.getDateBandTitle(this.b1from, this.b1to)] = 
                    this.getWmsLayer(this.rangeurl1, this.b1fill);
            }
            if (this.rangeurl2.length > 0) {
                wmsLayers[this.getDateBandTitle(this.b2from, this.b2to)] = 
                    this.getWmsLayer(this.rangeurl2, this.b2fill);
            }                        
        } else if (this.unconfirmed === '1') {
            // Separate accepted and unconfirmed into two layers
            wmsLayers['Accepted'] = this.getWmsLayerPoint(true, Colour.fuschia);
            wmsLayers['Unconfirmed'] = this.getWmsLayerPoint(false, Colour.orange);
        } else {
            // Show all data in a single layer
            wmsLayers[this.tvk] = this.getWmsLayer('', this.b0fill);
        }
        /*
        if (this.showVCs()) {
            wmsLayers['VCs'] = this.getWmsLayerNative('ALA:County_Coastal_Terrestrial_region_NOV2020');

        }
        */
        return wmsLayers;
    }
    // -------------------------------------------------------------------------
    /** Generate the NBN API query URL.
     * 
     * @param {string} range - Date range for query, if applicable.
     * @returns {string} - The query URL.
     */
    getWmsQueryUrl(range: string = ''): string {

        const url = `https://records-ws.nbnatlas.org/ogc/wms/reflect?q=*:*` +
                    `&fq=lsid:${this.tvk}${range}${this.druidurl}`;
        return url;
    }
    // -------------------------------------------------------------------------
    /** Create and return a shape dependent on whether circular or rectangular
     * searching is being used.
     * 
     * */
    
    makeShape(): L.Circle | L.Rectangle | null {
        let shape: L.Circle | L.Rectangle | null = null;
        if (this.explore && this.showRegion()) {
            const loc = this.explore.location;
            const distance = loc.radius * 1000;
            if (loc.isSquare) {
                let coords = calcBoundingRectangle(loc.latitude, loc.longitude,
                    distance, distance);
                
                const ul = L.latLng(coords.minLat, coords.maxLon);                
                const lr = L.latLng(coords.maxLat, coords.minLon);
                shape = L.rectangle(L.latLngBounds(ul, lr), 
                    {color: 'DarkGoldenRod', 
                     weight: 1,
                     fillColor: 'GoldenRod', 
                     fillOpacity: 0.1});
            }    
            else {
                shape = L.circle([loc.latitude, loc.longitude],
                    {radius: distance,
                     color: 'DarkGoldenRod', 
                     weight: 1,
                     fillColor: 'GoldenRod', 
                     fillOpacity: 0.1});                
            }
        }
        return shape
    }
    // -------------------------------------------------------------------------
    /** Sanitise a colour string as provided by a caller parameter.
     * 
     * @param {string} name - Name of parameter.
     * @param {string|undefined} param - Value of parameter.
     * @param {string} preset - Default value if invalid or not defined.
     * @returns {string} - Sanitised colour string.
     */
    sanitiseFill(name: string, param: string|undefined, preset: string): string {
        const p = param || preset;
        let fill = p.toUpperCase().replace(/[^A-F0-9]/g, '');
        try {
            if (fill.length !== 6) {
                throw new Error('Invalid fill format');          
            }
        }
        catch (err) {
            console.error(`Invalid fill format for '${name}': ${p}`);
            fill = preset;
        }  
        return fill;          
    }
    // -------------------------------------------------------------------------
    /** Sanitise a year string as provided by a caller parameter.
     * 
     * @param {string} name - Name of parameter.
     * @param {string|undefined} param - Value of parameter.
     * @returns {string} - Sanitised year string.
     */
    sanitiseYear(name: string, param: string|undefined): string {

        let p = param || '';
        try {
            const num = Number(p);
            if (num < 1000 || num > 3000) {
                throw new Error('Year out range');          
            }
        }
        catch (err) {
            console.error(`Invalid year for '${name}': ${p}`);
            p = '';
        }  
        return p;            
    }
    // -------------------------------------------------------------------------

    setExplore(explore: IExploreMap): void {
        this.explore = explore;
        this.tvk = '';
    }
    // -------------------------------------------------------------------------
    
    setTvk(tvk: string): void {
        this.tvk = tvk;
        this.explore = null;
    }
    // -------------------------------------------------------------------------
    /** Determine whether clicking on the map retrieves occurrence records.
     * 
     * @returns {boolean} - True if clicking retrieves records, else False.
     */
    showClickable(): boolean {
        return this.clickable === '1';
    }    
    // -------------------------------------------------------------------------
    /** Determine whether the map should be interactive.
     * 
     * @returns {boolean} - True if map is interactive, else False.
     */
    showInteractive(): boolean {
        return this.interactive === '1';
    }
    // -------------------------------------------------------------------------
    /** Determine whether the internal attribution control should be visible.
     * 
     * @returns {boolean} - True if internal attribution visible, else False.
     */
    showInternalAttrib(): boolean {
        return this.logo == '2';
    }
    // -------------------------------------------------------------------------
    /** Determine whether results should be restricted to defined region.
     * 
     * @returns {boolean} - True if results restricted to region, else False.
     */
    showRegion(): boolean {
        return this.region === '1';
    }
    // -------------------------------------------------------------------------
    /** Determine whether mouse scroll wheel zooming should be enabled.
     * 
     * @returns {boolean} - True if scrolliong enabled, else False.
     */
    showScrollZoom(): boolean {
        return this.scrollZoom == '1';
    }
    // -------------------------------------------------------------------------
    /** Determine whether the map should display VC boundaries.
     * 
     * @returns {boolean} - True if VCs to be displayed, else False.
     */
    showVCs(): boolean {
        return this.bg === 'vc';
    }
    // -------------------------------------------------------------------------
    /** Handle a caller-supplied parameter which will be skipped.
     * 
     * @param {string} name - Name of parameter.
     * @param {number|string|undefined} param - Value of parameter.
     */
    skipParam(name: string, param: number|string|undefined): void {
        if (param !== undefined) {
            console.warn(`Parameter '${name}' is not implemented. It will be ` +
                `ignored.`);
        }
    }

    // -------------------------------------------------------------------------
    
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
