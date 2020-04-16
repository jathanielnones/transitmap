
// This isn't necessary but it keeps the editor from thinking L and carto are typos
/* global L, carto */

var map = L.map('map', {
  center: [40.709011,-73.973007],
  zoom: 12
});

// Add base layer
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(map);

// Initialize Carto
var client = new carto.Client({
  apiKey: 'default_public',
  username: 'jathanielnones2020'
});

/*Additions for Assignment 9*/

/*
 * Begin static layer 1 - Existing subway line
 */
// Initialze source data
var subwaySource = new carto.source.SQL("SELECT * FROM nyc_all_subway_lines_v2");

// Create style for the data
var subwayStyle = new carto.style.CartoCSS(`
  #layer {
    line-width: 3;
    line-color: blue;
    line-opacity: 1;
  }
`);

// Add style to the data
var subwayLayer = new carto.layer.Layer(subwaySource, subwayStyle);

// Add the data to the map as a layer
client.addLayer(subwayLayer);

// Make SQL to get the summary data you want
var sumSql = 'SELECT SUM(length) FROM nyc_all_subway_lines_v2';

//I modified lines to try and reflect that I want the sum of the length column, rather than a count
// Request the data from Carto using fetch.
fetch('https://jathanielnones2020.carto.com/api/v2/sql/?q=' + sumSql)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    // All of the data returned is in the response variable
    console.log(data);

    // The sum is in the first row's sum variable
    var sum = data.rows[0].sum;
    console.log('the sum is', sum);
    // Get the sidebar container element
    var lengthSidebarContainer = document.querySelector('.sidebar-feature-content');

     // Add the text including the sum to the sidebar
    lengthSidebarContainer.innerHTML = '<div>There are ' + sum + ' miles of subway (shown in blue) in NYC</div>';
  });


/*
 * Begin key layer 3
 */
// Initialize source data
var sviSource = new carto.source.SQL("SELECT * FROM svi_ny");

// Create style for the data
var sviStyle = new carto.style.CartoCSS(`
  #layer {
    polygon-fill: ramp([rpl_themes], (#1a9641, #a6d96a, #ffffbf, #fdae61, #d7191c), quantiles);
    polygon-opacity: 0.35;
  }
`);

// Combine style and data to make a layer
// Add style to the data
var sviLayer = new carto.layer.Layer(sviSource, sviStyle);
  featureClickColumns: ['E_TOTPOP', 'RPL_THEMES', 'E_HU', 'E_UNEMP', 'EP_PCI']

map.on('click', function (e) {
  console.log(e.latlng);
  // We want the SQL to look something like this (lat: 40.732, lng: -73.986)
  // SELECT * FROM svi_ny WHERE ST_Within(ST_Transform(the_geom, 2263), ST_Buffer(ST_Transform(CDB_LatLng(40.732,-73.986), 2263),1))
  
  // So place the lat and lng in the query at the appropriate points
  var sql = 'SELECT * FROM svi_ny WHERE ST_Within(ST_Transform(the_geom, 2263), ST_Buffer(ST_Transform(CDB_LatLng(' + e.latlng.lat + ',' + e.latlng.lng + '), 2263),100))';
  console.log(sql);
  
  sviSource.setQuery(sql);
  
  // Make SQL to get the summary data you want
  //Eric - I'd like to sum the values of the polygon layer within the radius of the click, is that possible?
  var countSql = 'SELECT SUM(E_TOTPOP) FROM svi_ny WHERE ST_Within(ST_Transform(the_geom, 2263), ST_Buffer(ST_Transform(CDB_LatLng(' + e.latlng.lat + ',' + e.latlng.lng + '), 2263),100))';
  
  // Request the data from Carto using fetch.
  fetch('https://jathanielnones2020.carto.com/api/v2/sql/?q=' + countSql)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // All of the data returned is in the response variable
      console.log(data);

      // The sum is in the first row's average variable
      //Eric, i'm not sure I understand how the line below works, does the '.sum' need to correspond with the SQL in line 100?
      var sumPop = data.rows[0].sum;

      // Get the sidebar container element
      var popSidebarContainer = document.querySelector('.sidebar-feature-content');

      // Add the text including the sum to the sidebar
      popSidebarContainer.innerHTML = '<div>There are ' + sumPop + ' residents of this area</div>';
    });
});

/* end additions for assignment 9 */




/*
 * Begin static layer 2 - Existing ferry service
 */
// Initialze source data
var ferrySource = new carto.source.SQL("SELECT * FROM east_river_ferry_stops");

// Create style for the data
var ferryStyle = new carto.style.CartoCSS(`
  #layer {
    marker-width: 5;
    marker-color: blue;
    marker-opacity: 1;
  }
`);

// Add style to the data
var ferryLayer = new carto.layer.Layer(ferrySource, ferryStyle);


/*
 * Begin key layer 1 - BQX
 */
// Initialize source data
var bqxSource = new carto.source.SQL("SELECT * FROM bqx_data");

// Create style for the data
var bqxStyle = new carto.style.CartoCSS(`
  #layer {
    marker-width: 8;
    marker-fill: green;
  }
`);

// Add style to the data
var bqxLayer = new carto.layer.Layer(bqxSource, bqxStyle);

/*
 * Begin key layer 2 - Triboro
 */
// Initialize data source
var triboroSource = new carto.source.SQL("SELECT * FROM triboro_stations");

// Create style for the data
var triboroStyle = new carto.style.CartoCSS(`
  #layer {
    marker-width: 8;
    marker-fill: orange;
  }
`);

// Add style to the data
var triboroLayer = new carto.layer.Layer(triboroSource, triboroStyle, {
  featureClickColumns: ['name', '_style']
});

//Layer 2, part 2. 
// Initialize data source
var triboroLineSource = new carto.source.SQL("SELECT * FROM triboro_line");

// Create style for the data
var triboroLineStyle = new carto.style.CartoCSS(`
  #layer {
    marker-width: 5;
    marker-fill: blue;
  }
`);

// Add style to the data
var triboroLineLayer = new carto.layer.Layer(triboroLineSource, triboroLineStyle, {
  //Consider if needed: featureClickColumns: ['xxxx', 'xxx']
});



// Add the data to the map as a layer
client.addLayer(sviLayer);
//Something wrong with this layer: client.addLayer(ferryLayer);
client.addLayer(bqxLayer);
client.addLayer(triboroLayer);
//Something wrong with this layer: client.addlayer(triboroLineLayer);
client.getLeafletLayer().addTo(map);

/* first button */
// Step 1: Find the button by its class 
var populationButton = document.querySelector('.populationButton');

// Step 2: Add an event listener to the button. We will run some code whenever the button is clicked.
populationButton.addEventListener('click', function (e) {
  sviSource.setQuery("SELECT * FROM svi_ny"); //NATE ADD TO THIS - its not a query by pop, needs to intersect with BQX and Triboro layer...
  
  // Sometimes it helps to log messages, here we log to let us know the button was clicked. You can see this if you open developer tools and look at the console.
  console.log('Population was clicked');
});

/* Second button */
// Step 1: Find the button by its class.
var vulnerabilityButton = document.querySelector('.vulnerabilityButton');

// Step 2: Add an event listener to the button. We will run some code whenever the button is clicked.
vulnerabilityButton.addEventListener('click', function (e) {
  sviSource.setQuery("SELECT * FROM svi_ny"); //NATE ADD TO THIS - its not a query by pop, needs to intersect with BQX and Triboro layer...
  
  // Sometimes it helps to log messages, here we log to let us know the button was clicked. You can see this if you open developer tools and look at the console.
  console.log('Vulnerability was clicked');
});

/* third button */
// Step 1: Find the button by its class.
var incomeButton = document.querySelector('.incomeButton');

// Step 2: Add an event listener to the button. We will run some code whenever the button is clicked.
incomeButton.addEventListener('click', function (e) {
  sviSource.setQuery("SELECT * FROM svi_ny"); //NATE ADD TO THIS - its not a query by pop, needs to intersect with BQX and Triboro layer...
  
  // Sometimes it helps to log messages, here we log to let us know the button was clicked. You can see this if you open developer tools and look at the console.
  console.log('Income was clicked');
});

/* Reset button */
// Step 1: Find the button by its class. If you are using a different class, change this.
var resetButton = document.querySelector('.resetButton');

// Step 2: Add an event listener to the button. We will run some code whenever the button is clicked.
resetButton.addEventListener('click', function (e) {
  sviSource.setQuery("SELECT * FROM svi_ny");
})

/*
 * Listen for changes on the layer picker
 */
// Step 1: Find the dropdown by class. 
var layerPicker = document.querySelector('.layer-picker');

// Step 2: Add an event listener to the dropdown. We will run some code whenever the dropdown changes.
layerPicker.addEventListener('change', function (e) {
  // The value of the dropdown is in e.target.value when it changes
  var transitType = e.target.value;
  
  // Step 3: Decide on the SQL query to use and set it on the datasource
  if (transitType === 'all') {
    // If the value is "all" then we show all of the features, unfiltered
    bqxSource.setQuery("SELECT * FROM bqx_data"); // AND triboroSource.setQuery("SELECT * FROM triboro_stations"); //NATE ADD TO THIS - all should be just showing BQX and Triboro layers...
  }
  else {
    // Else the value must be set to a transit type. Use it in an SQL query that will filter to that transit option
    bqxSource.setQuery("SELECT * FROM bqx_data");
  }
  /*else {
    // Else the value must be set to a transit type. Use it in an SQL query that will filter to that transit option
    triboroSource.setQuery("SELECT * FROM triboro_stations");
  */
  // Sometimes it helps to log messages, here we log the transitType. You can see this if you open developer tools and look at the console.
  console.log('Dropdown changed to "' + transitType + '"');
});


// SIDEBAR RELATED - Add style to the data
// Note: any column you want to show up in the popup needs to be in the list of featureClickColumns below
var sidebar = document.querySelector('.sidebar-feature-content');
sviLayer.on('featureClicked', function (event) {
  
  // Create the HTML that will go in the sidebar. event.data has all the data for 
  // the clicked feature.
  // I will add the content line-by-line here to make it a little easier to read.
  // This is exactly like the way we do it in the popups example: https://glitch.com/edit/#!/carto-popups
  var content = '<h3>' + event.data['E_TOTPOP'] + '</h3>'
  content += '<div>$' + event.data['RPL_THEMES'] + event.data['E_HU'] + event.data['E_UNEMP'] + event.data['EP_PCI'] + '.</div>';
  
  // Put the HTML inside the sidebar.
  sidebar.innerHTML = content;
});