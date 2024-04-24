import { useEffect, useRef } from 'react';

import { MapManager } from './manager';
import { CElement, ISpeciesMap } from './params';

// -----------------------------------------------------------------------------

export default function SpeciesMap(props: ISpeciesMap): React.JSX.Element {

    const element = new CElement(props.map_id);
    // Adjust map height dependent upon whether external attributions in use.
    const showExtAttrib: boolean = props.logo === undefined || props.logo !== '2';
    const font_size = showExtAttrib ? 12 : 0;
    const h = props.h ? parseInt(props.h) - font_size * 2: 350 - font_size * 2;
    const mapStyles = {
        width: props.w ? `${props.w}px` : '100%',
        height: `${h}px`
    };
    
    const mapRef = useRef<MapManager | null>(null);
    
    useEffect(() => { 
        if (!mapRef.current) {
            mapRef.current = new MapManager(props, element);
        }
        mapRef.current.show(props.search);
    }, [props]
    ); 

    return (
        <>
        <div id={props.map_id} style={mapStyles} />
        { showExtAttrib ? 
        (<div style={{fontFamily: 'sans-serif', 
                     fontSize: font_size, 
                     width: mapStyles.width}}>
            <a id={element.attr1} href=''></a>
                <span> | </span>
            <a id={element.attr2} href=''></a>
                <span> | </span>
            <a id={element.attr3} href=''></a>
                <span id={element.pipe3}> | </span>
            <a id={element.attr4} href=''></a>
            <br />
        </div>) : ('') }
        </>
    );
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
