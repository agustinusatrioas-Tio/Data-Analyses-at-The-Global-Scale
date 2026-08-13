//********************************//
// MB5370 earth engine module : Workshop 4 //
//********************************//

// Global Variables
var distance = 800;  // metres we are allowed to snorkel from the station

 Map.setOptions('SATELLITE')
//Map.setCenter ( 145.44647541, -14.66767257, 17 ) // zoom

var field_stations = ee.FeatureCollection([Heron, orpheus, Hamilton
,Lizard])
print (field_stations)
var allen= (ee.Image("ACA/reef_habitat/v2_0"))
var benthic= allen.select('benthic') //select only benthic

var coral_algae = benthic.eq(15).selfMask()
Map.addLayer(coral_algae, {palette:'orange'}, 'coral and algae')

// bufering station
// var buffered = ee.Feature(field_stations.first()).buffer(800)
// Map.addLayer(buffered)

// write a function that applies a buffer
// To run as a .map - looping over all stations - we will need to make a function
var bufferer = function (feature) {
  var buffered = feature.buffer(800)
  return buffered;
}

var out = field_stations.map(bufferer)
print('out',out)
Map.addLayer(out, {color: 'yellow'},'Buffers')

// Use .map to work one station at a time
var bufferedStations = field_stations.map(bufferer) 

//Cumpute area of coral within the buffer
var coral_area= coral_algae
.multiply(ee.Image.pixelArea())
.reduceRegions({
  reducer: ee.Reducer.sum(),
 collection: out,
 scale: 5
})
print (coral_area,'coral area')
Map.addLayer (coral_area)

// ****************************/
// 4. Package up results and export
// ****************************/

Export.table.toDrive({
  collection: coral_area, //FYI - type: featureCollection
  description: 'exportToDrive',
  fileNamePrefix: 'research_stations',
  fileFormat:'CSV'
})

var exportImage = allen.clip(orpheus)
Map.addLayer(exportImage)

Export.image.toDrive({
  image: exportImage, //FYI - type: Image
  description: 'exportImageToDrive',
  fileNamePrefix: 'aca_orpheus',
  fileFormat:'GeoTIFF',
  scale:5
})
