var map, marker, infowindow;

//Model Information

var locations = [ //Location Data
    {
        name: 'Windsor Sculpture Park',
        lat: 42.314831,
        lng: -83.060117,
        url: 'http://www.citywindsor.ca/residents/culture/windsor-sculpture-park/pages/windsor-sculpture-park.aspx'
        },
    {
        name: 'Ambassador Bridge',
        lat: 42.312,
        lng: -83.074,
        url: 'http://www.ambassadorbridge.com'
        },
    {
        name: 'Detroit River',
        lat: 42.300,
        lng: -83.090,
        url: 'hhttp://www.detroitriver.org'
        },
    {
        name: 'The Manchester',
        lat: 42.31480,
        lng: -83.03682,
        url: 'http://themanchester.ca/'
        },
    {
        name: 'Caesars Windsor',
        lat: 42.320375,
        lng: -83.033764,
        url: 'http://www.caesarswindsor.com/'
        }
    
    
    ];

var ViewModel = function () {
    var self = this;

    function placeInfo(data) { //Knockout Obsrvables
        self.name = ko.observable(data.name);
        self.url = ko.obsrvable(data.url);
        self.lat = ko.observable(data.lat);
        self.lng = ko.observable(data.lng);
        self.LatLng = ko.computed(function () {
            return self.lat() + self.lng();
        });
    }

    self.allPlaces = ko.observableArray(locations); //Links location data to an observable

    self.allPlaces().forEach(function (place) { //Creates markers and infowindows for each location on the map
        marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(place.lat, place.lng),
            title: place.name,
            animation: google.maps.Animation.DROP,
            icon: 'images/icon.png',
        });
        place.marker = marker;
        place.marker.addListener('click', toggleBounce);

        function toggleBounce() { //Function to bounce marker when clicked.
            if (place.marker.getAnimation() !== null) {
                place.marker.setAnimation(null);
            } else {
                place.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    place.marker.setAnimation(null);
                }, 1000);
            }
        }
        google.maps.event.addListener(place.marker, 'click', function () { //Opens, populates and bounces infowindow when marker is clicked.
            if (!infowindow) {
                infowindow = new google.maps.InfoWindow();
            }

            //Wikipedia API
            var content;
            var infoNames = place.name;
            var infoURL = place.url;
            var urlNames = encodeURI(place.name);
            var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + urlNames + "&limit=1&redirects=return&format=json";

            self.apiTimeout = setTimeout(function () {
                alert('ERROR: Failed to load data');
            }, 5000);

            self.apiTimeout;
            $.ajax({
                url: wikiUrl,
                dataType: "jsonp",
                success: function (response) {
                    clearTimeout(self.apiTimeout);
                    var articleList = response[1];
                    console.log(response);
                    if (articleList.length > 0) {
                        for (var i = 0; i < articleList.length; i++) {
                            var articleStr = articleList[i];
                            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                            content = '<div class="info">' + '<h3 class="text-center" id="infoTitle">' + infoNames + '</h3>' + '<p>' + response[2] + '</p>' + '<a href="' + infoURL + '" target="_blank">' + infoURL + '</a>' + '</div>';
                            infowindow.setContent(content);
                        }
                    } else {
                        content = '<div class="info">' + '<h3 class="text-center" id="infoTitle">' + infoNames + '</h3>' + '<p>' + "Sorry, No Articles Found on Wikipedia" + '</p>' + '</div>';
                        infowindow.setContent(content);
                    }
                    infowindow.open(map, place.marker);
                    setTimeout(function () { //Closes infowindow after 9 seconds.
                        infowindow.close();
                    }, 9000);
                },
                error: (function () {
                    content = '<div class="info">' + '<h3 class="text-center" id="infoTitle">' + infoNames + '</h3>' + '<p>' + "Failed to reach Wikipedia Servers, please try again" + '</p>' + '</div>';
                    infowindow.setContent(content);
                })
            });

        });
    }); //End ForEach

    self.list = function (place, marker) {
        google.maps.event.trigger(place.marker, 'click'); //Links list to allPlaces marker information, so both have the same content.
    };
    // Search functionality on location names
    self.query = ko.observable(''); //Creates an observable for the search bar

    self.searchResults = ko.computed(function () {
        return ko.utils.arrayFilter(self.allPlaces(), function (list) {
            //Match search with items in sortedLocations() observable array
            var listFilter = list.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
            if (listFilter) { //if user input matches any of the brewery names, show only the matches
                list.marker.setVisible(true);
            } else {
                list.marker.setVisible(false); //hide markers and list items that do not match results
            }

            return listFilter;

        });
    });
}; //ViewModel End

//function initializeMap() { //Initializes map, marker, and infowindow data
function initializeMap() {
    //Map Data
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: {
            lat: 42.314,
            lng: -83.060
        },
        zoom: 13,
        draggable: false,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    ko.applyBindings(new ViewModel());
}

  
//Alerts user of an error with google.
function googleError() {
    alert("Google Has Encountered An Error.  Please Try Again Later");
    console.log('error');
}

