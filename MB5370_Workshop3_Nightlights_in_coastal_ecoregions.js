//***********************//
//    Workshop 3         //
//***********************//

// Load the population
var population = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Count")
print(population)

// Pull out only the images fro the years
var population_2000 = 
ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2000_30_sec')

var population_2015 = ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2015_30_sec')

print(population_2000)
print (population_2015)

var population_vis = {
  'max': 1000.0,
  'palette': [
    'ffffe7',
    '86a192',
    '509791',
    '307296',
    '2c4484',
    '000066'
  ],
  'min': 0.0
};
Map.addLayer(population_2000, population_vis, 'population_count_2000');
Map.addLayer(population_2015, population_vis, 'population_count_2015');

// Making the nightlights
// Nightlights
var nl = ee.ImageCollection("NOAA/DMSP-OLS/NIGHTTIME_LIGHTS")
print (nl)

// get the two images for start and end
var nl_2000 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F142000')
var nl_2013 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013')
print (nl_2000)
print (nl_2013)

// rename the using special argument (select) which changes the band name from avg_vis to nightlight
var nl_2000 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F142000').select(['avg_vis'], ['nightlight']) //select and rename
var nl_2013 = ee.Image ('NOAA/DMSP-OLS/NIGHTTIME_LIGHTS/F182013').select(['avg_vis'], ['nightlight'])
print ('nightlight 2000 processed', nl_2000)
print ('nightlight 2000 processed', nl_2013)

//Nighttime lights visualisation
var nighttimeLightsVis = {
bands: ['nightlight'],
  min: 0,
  max: 100,
  palette: [
   '000000',
  'ffff00',
 'ff8000',
  'ff0000',
  'ffffff']
 };

Map.addLayer(nl_2000, nighttimeLightsVis, 'Nighttime Lights 2000');
Map.addLayer(nl_2013, nighttimeLightsVis, 'Nighttime Lights 2013');

// VECTOR DATA
// Load the recommended 2-degree global grid
var worldGrid = ee.FeatureCollection(
  'users/murrnick/mb5370/worldgrid_5deg'
);

print(worldGrid)

//Map.addLayer (worldGrid, {color:'lightgreen'}, 'worldGrid')

var coast = ee.FeatureCollection(
  'projects/UQ_intertidal/dataMasks/naturalEarthCoastline_v1'
);

Map.addLayer(
  coast,
  {color: 'gold'},
  'Coastline'
);

var coastGrid = worldGrid.filter(ee.Filter.bounds(coast))
Map.addLayer (coastGrid, {color:'yellow'}, 'coast grid 5 degree')

// Filter ecoregions to bounds
var coastalGrid = worldGrid
  .filter(ee.Filter.bounds(coast))
  .filter(ee.Filter.bounds(geometry));
Map.addLayer(coastalGrid, {color:'firebrick'}, 'costal eco region')

var pop_change = population_2015
  .subtract(population_2000)
  .clip(coastalGrid)
Map.addLayer (pop_change, {palette:  ['red', 'black', 'lime'], min: -500, max: 500}, 'pop_change', true, 0.9)

//And the same for nightlights. 
var nl_change = nl_2013
  .subtract(nl_2000)
  .clip(coastalGrid)
Map.addLayer (nl_change, {palette:  ['red', 'black', 'lime'], min: -50, max: 50}, 'nl_change', true, 0.9)

// average change in nightlights per ecoregion
var nl_changePerEcoregion = nl_change.reduceRegions({
  collection: coastalGrid, 
  reducer: ee.Reducer.mean(), 
  scale: 1000, // note computing at a larger scale for speed
});
print (nl_changePerEcoregion.first()) // look at properties of the first one

// average change population per ecoregion 
var pop_changePerEcoregion = pop_change.reduceRegions({
  collection: coastalGrid, 
  reducer: ee.Reducer.mean(), 
  scale: 1000, // note computing at a larger scale for speed
});

// Export the result
// Approx 10-20 minute export for scale = 1000.
// Export the result to asset
Export.table.toAsset({
  collection: pop_changePerEcoregion, //
  description: 'export_pop_toAsset',
  assetId:'pop_changePerEcoregion'
});

Export.table.toAsset({
  collection: nl_changePerEcoregion, //
  description: 'export_nl_toAsset',
  assetId:'nl_changePerEcoregion'
});

// Visualise your data
var pop_result = ee.FeatureCollection('projects/my-project-mb5370-503200/assets/pop_changePerEcoregion')
Map.addLayer(pop_result)
print (pop_result)

var nl_result = ee.FeatureCollection('projects/my-project-mb5370-503200/assets/nl_changePerEcoregion')
Map.addLayer(nl_result)
print (nl_result)

// Sort from highest to lowest using the "mean" property
var pop_sorted = pop_result.sort('mean', false);
var nl_sorted = nl_result.sort('mean', false);

print(
  'Top 10 population-change areas:',
  pop_sorted.limit(10)
);

print(
  'Top 10 nightlight-change areas:',
  nl_sorted.limit(10)
);

var empty = ee.Image().byte() // make an empty image
var palette = ['green','yellow', 'orange', 'red'];
var popChangePerEcoregion = empty.paint({
  featureCollection: pop_result,
  color:'mean'
})

Map.addLayer(popChangePerEcoregion, {max:112, palette: palette}, 'popChange_result')

var nlChangePerEcoregion = empty.paint({
  featureCollection: nl_result,
  color: 'mean'
});

Map.addLayer(popChangePerEcoregion, {max:112, palette: palette}, 'popChange_result')
Map.addLayer(
  nlChangePerEcoregion,
  {
    min: 0,
    max: 112,
    palette: palette
  },
  'Nightlight change result'
);

