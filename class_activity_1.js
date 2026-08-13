// Import one image from the Earth Engine Data Catalogue
var dataset = ee.Image('CPOM/CryoSat2/ANTARCTICA_DEM');

// Visualisation settings for the elevation band
var visualization = {
  bands: ['elevation'],
  min: 0,
  max: 4000,
  palette: ['001fff', '00ffff', 'fbff00', 'ff0000']
};

// Add the image to the map
Map.addLayer(dataset, visualization, 'Antarctica elevation');

// PART 2: SINGLE FEATURE
// Create one geographic feature
var feature = ee.Feature(
  ee.Geometry.Point([17, -76]),
  {
    name: 'Antarctica observation point'
  }
);

// Add the feature to the map
Map.addLayer(feature, {color: 'ffffff'}, 'Single feature');

// Centre the map on the feature
Map.centerObject(feature, 4);

// Display the objects in the Console
print('Image:', dataset);
print('Feature:', feature);
