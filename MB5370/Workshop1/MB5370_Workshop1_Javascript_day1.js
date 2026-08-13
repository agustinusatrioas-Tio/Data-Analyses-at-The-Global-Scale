//********************************//
// MB5370 earth engine module : Workshop 1
//********************************//

//********************************//
// Learning Javascript
//********************************//

// print ('Hello word')

// var the_answer = 42 // numeric, integer
// print (the_answer)

// var city = 'san francisco'
// print (city)

// var population = 873965
// print (population)

// print ('This city is', city)

//Lists

// var cities = ['Townsville', 'Los Angeles', 'New York']
// print (cities)

// Dictionaries 

// var cityData =  {
//   'city':'san fran',
//   'coord': [122,2,37,77],
//   'pop' : 873965
// }
// print (cityData)


// var a = 1
// var b = 2

// print (a)
// var result = a + b
// print (result)

// var a1 = ee.Number(1)
// var a2 = ee.Number(3)
// var result2 = print (a1.add(a2))

// var yearlist = ee.List.sequence (1980, 2020,5)
// print (yearlist)


Map.setOptions ('SATELLITE')
// var snazzy = require("users/aazuspan/snazzy:styles");
// snazzy.addStyle("https://snazzymaps.com/style/48750/blank-map", "Blank");
Map.setCenter(174.0638, -39.298, 11);

var dataset = ee.Image("CGIAR/SRTM90_V4")
 print (dataset)

Map.addLayer(dataset, {min:0, max:8000, palette: ['darkblue', 'lightblue', 'green', 'red', 'white']}, 'srtm');

// Feature
var wdpa = ee.FeatureCollection ("WCMC/WDPA/current/polygons")
Map.addLayer (wdpa,  {color: 'green'},'wdpa')
