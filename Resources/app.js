var MapModule = require('ti.map');

var win = Ti.UI.createWindow({
	backgroundColor : 'white',
	fullscreen : false
});

var myAddress;

var addressBox = Ti.UI.createTextField({
	value : myAddress,
	textAlign : "left",
	hintText : "Address",
	borderStyle : Titanium.UI.INPUT_BORDERSTYLE_ROUNDED,
	top : 0,
	left : '20dp',
	height : 'auto',
	width : 250,
	font : {
		fontSize : '17dp'
	},
	color : 'black',
});
addressBox.addEventListener('return', function() {
	addressBox.blur();
});
addressBox.addEventListener('change', function(e) {
	myAddress = e.value;
	Ti.API.info('Address = ' + myAddress);
});
win.add(addressBox);
var map1 = MapModule.createView({
	mapType : MapModule.NORMAL_TYPE,
	animate : true, 
	height : '50%',
	top : 100,
	left : 0,
	width : '100%'
});

map1.addEventListener('pinchanddragstate', function(e) {
	Ti.API.info(e.type);
	Ti.API.info(JSON.stringify(e.newState));
});
win.add(map1);
var button = Ti.UI.createButton({
	title : 'Map',
	color : 'black',
	font : {
		fontSize : '16dp',
		fontWeight : 'bold'
	},
	width : 'auto',
	height : 'auto',
	top : '0dp',
	right : '5dp',
	borderRadius : 5
});
win.add(button);

button.addEventListener('click', function() {
	var xhrGeocode = Ti.Network.createHTTPClient();
	xhrGeocode.setTimeout(120000);
	xhrGeocode.onerror = function(e) {
		alert('Google couldn\'t find the address... check your address');
	};
	xhrGeocode.onload = function(e) {
		var response = JSON.parse(this.responseText);

		Ti.API.info('Search for address: ' + myAddress);

		if (response.status == 'OK' && response.results != undefined && response.results.length > 0) {
			var myLat = response.results[0].geometry.location.lat;
			var myLon = response.results[0].geometry.location.lng;

			var userAnnotation = MapModule.createAnnotation({
				latitude : myLat,
				longitude : myLon,
				draggable : true
			});
			var region = {
				latitude : myLat,
				longitude : myLon,
				latitudeDelta : 0.1,
				longitudeDelta : 0.1
			};

			var annotations = [userAnnotation];
			map1.setAnnotations(annotations);
			map1.setRegion(region);
		}
	};
	var urlMapRequest = "http://maps.google.com/maps/api/geocode/json?address=" + myAddress.replace(' ', '+');
	urlMapRequest += "&sensor=" + (Ti.Geolocation.locationServicesEnabled == true);
	xhrGeocode.open("GET", urlMapRequest);
	xhrGeocode.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	xhrGeocode.send();
});

win.open();
