// Change the map background to satellite imagery
Map.setOptions ('SATELLITE')
// var snazzy = require("users/aazuspan/snazzy:styles");
// snazzy.addStyle("https://snazzymaps.com/style/48750/blank-map", "Blank");

// Centre the map on New Zealand
Map.setCenter(174.0638, -39.298, 11);

//Import a single SRTM elevation image
var dataset = ee.Image("CGIAR/SRTM90_V4")

// // Print image information in the Console
print (dataset)

// // Add the elevation image to the map
Map.addLayer(dataset, {min:0, max:8000, palette: ['darkblue', 'lightblue', 'green', 'red', 'white']}, 'srtm');

// // ==================================================
// // FEATURE COLLECTION: PROTECTED ARprint (protected_areas.limit(10))EAS
// // ==================================================

// // Import the World Database on Protected Areas
var wdpa = ee.FeatureCollection ("WCMC/WDPA/current/polygons")

// // Add protected areas to the map
Map.addLayer (wdpa,  {color: 'green'},'wdpa')

//print (wdpa.limit(10))

print ('No of protected areas:', wdpa.size())

//print (wdpa);
print (wdpa.first()); // looking just at the first feature is much faster.

// Filter only for level II protected areas
var iucn_pa = wdpa.filter(ee.Filter.eq('IUCN_CAT', 'II'));
Map.addLayer(iucn_pa, {color: 'yellow'}, 'National Parks')

// filter date
var iucn_pre1980 = wdpa.filter(ee.Filter.lte('STATUS_YR',1980));
Map.addLayer(iucn_pa, {color: 'white'}, 'PAs in 1980')

//..........................//
//spatial filters//
//..........................//

// Import countries
var countries = ee.FeatureCollection ("USDOS/LSIB_SIMPLE/2017")

print (countries)
Map.addLayer(countries)


// New Zealand only
var nz = countries.filter(ee.Filter.equals('country_na', 'New Zealand'))
print (nz)
Map.addLayer(nz) // look at it.

// Spatial filter PAs only in NZ
var nz_pas = wdpa.filter(ee.Filter.bounds(nz))
print ('Number of PAs in NZ:', nz_pas.size())

//add layer
Map.addLayer(nz_pas, {color:'lightgreen'}, 'NZ PAs only')

// Link them all into one statement
var nz_national_parks = wdpa
    .filter(ee.Filter.eq('IUCN_CAT', 'II')) // filter only NPs
    .filter(ee.Filter.bounds(nz)) // filter to NZ

print ('Number of National Parks in NZ:', nz_national_parks.size())

// COMPUTATION IN EARTH ENGINE

// Set up visualisation parameters
var elevationVis = {
  min: 0,
  max: 2500,
  palette: ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff']
};

// Change opacity
Map.addLayer(dataset, elevationVis, 'Elevation', true, 0.6);
print (dataset)

//Computation
print (dataset) 
var srtm_fixed = dataset.add(100)
Map.addLayer(srtm_fixed, elevationVis, 'fixed srtm')

// Thresholding images
var elevGt1500 = dataset; ee.Filter.greaterThan(1500) 
Map.addLayer(elevGt1500) // Binary white == true

//self mask function 

var elevGt1500 = dataset.gt (1500).selfMask()
Map.addLayer(elevGt1500)

//
Map.addLayer(elevGt1500.selfMask(), {palette:'fuchsia'}, 'gt 1500m', true, 0.7) 

// Complex image functions

// apply complex algorithm
// Use terrain, an algorithm that returns several topographic variables from an elevation image
var terrain = ee.Terrain.products(dataset);
print ('terrain', terrain ) // print it to see what's inside

// make images from the bands we are interested in
var slope = terrain.select(['slope']) 
var hillshade = terrain.select(['hillshade'])
Map.addLayer (hillshade)
Map.addLayer (slope, {palette: ['white', 'darkred', 'black'], min:0, max:45}, 'slope')

//Region Reducers//

// Find Taranaki NP
var taranaki = wdpa.filter(ee.Filter.eq('NAME', 'Egmont National Park'));
Map.addLayer(taranaki, {color: 'orange'}, 'Mt Taranaki')

// Apply a spatial reducer to estimate mean slope
var slopeOutput = slope.reduceRegion({
  reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('slopeOutput', slopeOutput)

// Try clipping to see if it's any different.
var taranakiSlope = slope.clip(taranaki)
Map.addLayer (taranakiSlope, {palette: ['white', 'darkred', 'black'], min:0, max:45}, 'taranaki slope')

var slopeOutput2 = taranakiSlope.reduceRegion({
  reducer: ee.Reducer.mean(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('slopeOutput2', slopeOutput2) // same answer

// Use reduce regions with a different reducer (Max)
var elevOutput_Max = dataset.reduceRegion({
  reducer: ee.Reducer.max(), // we compute the max of all pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Max', elevOutput_Max)

// Use reduce regions with a different reducer (min)
var elevOutput_Min = dataset.reduceRegion({
  reducer: ee.Reducer.min(), // we compute the min of all slope pixel values in the national park
  geometry: taranaki,
  scale:90 // pixel size in metres - get this from the metadata (ie. search for it)
})
print ('elevOutput_Min', elevOutput_Min)


// Use reduce regions with a different reducer
var elevOutput_MinMax = dataset.reduceRegion({
  reducer: ee.Reducer.minMax(), // we compute the mean of all slope pixel values in the national park
  geometry: taranaki, 
  scale: 90 //pixel size in metres - get this from the metadata 
})

print ('elevOutput_MinMax', elevOutput_MinMax)

//Get area of >1500m
var areaGt1500m = elevGt1500 // binary 1 == yes
.multiply (ee.Image.pixelArea()) //get the area from each pixel
.reduceRegion({
  reducer: ee.Reducer.sum(), //sum all the pixel areas together
  geometry: taranaki,
  scale: 90
})
print ('The area of Taranaki above 1500m (m2)',areaGt1500m) //in square metres

print ('The area of Taranaki above 1500m (km2)',
ee.Number(areaGt1500m.get('elevation')).divide(1000 * 1000)) // in km square

//Image Reducers//

//using thhe Worldclim data to get the anual average of temp from many months
var dataset = ee.ImageCollection('WORLDCLIM/V1/MONTHLY');
print('dataset') //12 images where each one is a month

//get two months
var jan_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/01")
var jul_climate = ee.Image ("WORLDCLIM/V1/MONTHLY/07")

//select their avarage temp bands
var jan_climate_avg= jan_climate.select('tavg') // get the average band
var jul_climate_avg= jul_climate.select ('tavg')

// set the visual parameters
var meanTemperatureVis = {
  min: -40,
  max: 30,
  palete: ['blue', 'purple', 'cyan', 'green', 'yelow', 'red'],
};

Map.addLayer (jan_climate_avg, meanTemperatureVis, 'janClimate')
Map.addLayer(jul_climate_avg, meanTemperatureVis, 'julyClimate')
//inspect them

// Note the pixel scaling error and fix it
// Need to divide all pixel values by 10, or multiply by .1 (.multiply(0.1)

//reduce the 12 pixel values to get the yearly average
var annualMeanTemperature = dataset
.select ('tavg')
.mean () //this is the reducer
.multiply(0.1); //scale pixels to real values

Map.setCenter(71.7,52.4,3);
Map.addLayer(annualMeanTemperature,meanTemperatureVis, 'Mean Annual Temperature');

// add some lansat image for the year 2017\
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
.filterDate('2017-01-01', '2017-12-31'); // only images from 2017
var trueColour = dataset.select(['B4','B3','B2']);
var trueColourVis = {
  min: 0.0,
  max: 0.4,
  };
Map.setCenter(146.746, -19.592,9);
Map.addLayer(trueColour, trueColourVis, 'True Colour Landsat');

//using .median() reducer to find the median pixel in all the images
//Let's use reduce these
var LandsatMedian = trueColour.median()
Map.addLayer(LandsatMedian, trueColourVis, 'True Colour Median');
