
// -----------------------------------------------------------------------------
// Use the Haversine formula to calculate bounding rectangle given a
// centroid point and a distance in meters.

export function calcBoundingRectangle(centroidLat: number, centroidLon: number, 
    horizontalDistanceMeters: number, verticalDistanceMeters: number): 
    { minLat: number, maxLat: number, minLon: number, maxLon: number } {

    const EARTH_RADIUS = 6378137;
    // Calculate the angular distance covered by horizontal and vertical distances
    const deltaLat = (verticalDistanceMeters / EARTH_RADIUS) * (180 / Math.PI);
    const deltaLon = (horizontalDistanceMeters / 
    (EARTH_RADIUS * Math.cos(Math.PI * centroidLat / 180))) * (180 / Math.PI);
    // Calculate the bounding rectangle coordinates
    const minLat = centroidLat - deltaLat;
    const maxLat = centroidLat + deltaLat;
    const minLon = centroidLon - deltaLon;
    const maxLon = centroidLon + deltaLon;

    return { minLat, maxLat, minLon, maxLon };
}
// -----------------------------------------------------------------------------
// Get WKT string representing the bounding rectangle.

export function getBoundingRectangleWkt(centroidLat: number, centroidLon: number, 
    horizontalDistanceMeters: number, verticalDistanceMeters: number): string {

    const coords = calcBoundingRectangle(centroidLat, centroidLon, 
                        horizontalDistanceMeters, verticalDistanceMeters);

    const wkt = `POLYGON((${coords.minLon} ${coords.minLat},` +
                         `${coords.maxLon} ${coords.minLat},` +
                         `${coords.maxLon} ${coords.maxLat},` +
                         `${coords.minLon} ${coords.maxLat},` +
                         `${coords.minLon} ${coords.minLat}))`;

    return wkt;
}
// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
