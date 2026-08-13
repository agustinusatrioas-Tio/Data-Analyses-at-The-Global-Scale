//Workshop 2 Assignment//
//---------------------//
//PART 1
//set the basemap
Map.setOptions ('SATELLITE');

// Import ETOPO1
var etopo = ee.Image('NOAA/NGDC/ETOPO1');

// Select the bedrock band
var bedrock = etopo.select('bedrock');


// Print to inspect the data
print(etopo);
print(bedrock);

// Visualisation
var bedrockVis = {
  min: -11000,
  max: 8000,
  palette: [
    '081d58',
    '225ea8',
    '41b6c4',
    'c7e9b4',
    'ffffcc',
    'd95f0e',
    'ffffff'
  ]
};

// Centre the map globally
Map.setCenter(0, 0, 2);

// Add the data to the map
Map.addLayer(
  bedrock,
  bedrockVis,
  'ETOPO1 bedrock'
);

//PART 2
//make a raster ecosystem

// Hadal trenches: deeper than 6000 m
var hadal = bedrock
.lt(-6000)
.selfMask()

Map.addLayer(hadal,{
  palette:['darkblue']},
  'Hadal trenches'
);

// Abyssal plains: 3000–6000 m depth
var abyssal = bedrock
  .gte(-6000)
  .and(bedrock.lt(-3000))
  .selfMask();
  
Map.addLayer(
  abyssal,
  {palette: ['lightblue']},
  'Abyssal plains'
);

//Continental and island slopes: 250–3000 m depth
var continentalSlopes = bedrock
  .gte(-3000)
  .and(bedrock.lt(-250))
  .selfMask();

Map.addLayer(
  continentalSlopes,
  {
    min: 1,
    max: 1,
    palette: ['90EE90']
  },
  'Continental and island slopes',
  true,
  0.65
);

// Calculate seafloor slope in degrees
var seafloorSlope = ee.Terrain.slope(
  bedrock.rename('elevation')
);

// Select locations deeper than 200 m
var deeperThan200m = bedrock.lt(-200);

// Select locations with slope greater than 6 degrees
var slopeGreaterThan6 = seafloorSlope.gt(6);

// Combine both conditions
var submarineCanyons = deeperThan200m
  .and(slopeGreaterThan6)
  .selfMask();

var submarineCanyonsDisplay = submarineCanyons.focalMax({
  radius: 1,
  units: 'pixels'
});

Map.addLayer(
  submarineCanyonsDisplay,
  {
    min: 1,
    max: 1,
    palette: ['red']
  },
  'Potential submarine canyons',
  true,
  1
);

print('Submarine canyon raster:', submarineCanyons);


//part 3
// Import the original WDPA vector dataset
var protectedAreas = ee.FeatureCollection(
  'WCMC/WDPA/current/polygons'
);

// Print one feature to show that the dataset is a vector FeatureCollection
print('Protected area vector example:', protectedAreas.first());

// Use FeatureView for faster global visualisation
var protectedAreasView = ui.Map.FeatureViewLayer(
  'WCMC/WDPA/current/polygons_FeatureView'
);

// Style the protected-area layer
protectedAreasView.setVisParams({
  color: 'white',
  opacity: 0.15
});

protectedAreasView.setName('Protected Areas');

// Add the FeatureView to the map
Map.add(protectedAreasView);

var title = ui.Label({
  value: 'Global Deep Ocean Ecosystems',
  style: {
    position: 'top-center',
    fontSize: '22px',
    fontWeight: 'bold',
    padding: '8px',
    backgroundColor: 'white'
  }
});

Map.add(title);

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    backgroundColor: 'white'
  }
});

var legendTitle = ui.Label({
  value: 'Ecosystem types',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0 0 6px 0'
  }
});

legend.add(legendTitle);

// Function for creating one legend row
function addLegendRow(color, name) {
 var colorBox = ui.Label({
  style: {
    backgroundColor: color,
    padding: '8px',
    margin: '0 6px 4px 0',
    border: '1px solid grey'
  }
});

  var description = ui.Label({
    value: name,
    style: {
      margin: '0 0 4px 0'
    }
  });

  var row = ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });

  legend.add(row);
}

// Add ecosystem categories to the legend
addLegendRow('darkblue', 'Hadal trenches and troughs');
addLegendRow('lightblue', 'Abyssal plains');
addLegendRow('lightgreen', 'Continental and island slopes');
addLegendRow('red', 'Potential submarine canyons');
addLegendRow('white', 'Protected areas');

// Add the legend to the map
Map.add(legend);
