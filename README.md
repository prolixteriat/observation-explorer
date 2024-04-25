# observation-explorer

## Overview
Observation Explorer is a collection of components assembled to provide an easy-to-use method to interrogate observation records
contained within the [NBN Atlas](https://nbnatlas.org/). The components are design to facilitate embedding within an existing website - examples
of which can be found [here](https://explore.bandolin.co.uk/).

## Technology
The app is based upon a collection of React components, written in Typescript using Vite and Tailwind CSS.

## Usage
`ExplorePage` is the top-level component and offers a number of configuration props as demonstrated below:
```
const root = ReactDOM.createRoot(document.getElementById('root'));
const explorePage = window.nbnReactComponents.ExplorePage;
const exploreElem = React.createElement(explorePage, {
  region: 'Cheshire',
  filterGroups: ['birds'],
  filterFamilies: undefined,
  tabNames: ['explore', 'overview', 'charts', 'gallery','names', 'classification', 'literature', 'sequences', 'data']
}											)
root.render(exploreElem);
```

## Examples
https://explore.bandolin.co.uk/
