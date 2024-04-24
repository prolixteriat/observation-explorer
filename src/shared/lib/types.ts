
// -----------------------------------------------------------------------------

export interface ILocation {
    isSquare: boolean;      // square if true, else circle
    latitude: number;
    longitude: number;
    radius: number;         // kilometres, distance from centroid if square
}

export interface IExploreMap {
    isGroup: boolean;       // true if group, false if species
    location: ILocation;
    groupName: string;
    speciesName: string;
}

// -----------------------------------------------------------------------------
// End
// -----------------------------------------------------------------------------
