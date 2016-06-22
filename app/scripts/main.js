var map, marker, infowindow;

//Information for the model
// List of places to be shown in view, along with geo location information

var places = [{
        name: 'Windsor Sculpture Park',
        lat: 42.314831,
        lng: -83.060117,
        url: 'http://www.citywindsor.ca/residents/culture/windsor-sculpture-park/pages/windsor-sculpture-park.aspx'
    }, {
        name: 'Ambassador Bridge',
        lat: 42.312,
        lng: -83.074,
        url: 'http://www.ambassadorbridge.com'
    }, {
        name: 'Detroit River',
        lat: 42.300,
        lng: -83.090,
        url: 'hhttp://www.detroitriver.org'
    }, {
        name: 'The Manchester',
        lat: 42.31480,
        lng: -83.03682,
        url: 'http://themanchester.ca/'
    }, {
        name: 'Caesars Windsor',
        lat: 42.320375,
        lng: -83.033764,
        url: 'http://www.caesarswindsor.com/'
    }


];

var ViewModel = function() {
    var self = this;

    function locationInfo(data) {

        //Knockout Obsrvables
        self.name = ko.observable(data.name);
        self.url = ko.obsrvable(data.url);
        self.lat = ko.observable(data.lat);
        self.lng = ko.observable(data.lng);
        self.LatLng = ko.computed(function() {
            return self.lat() + self.lng();
        });
    }


    //Location data is linked to an observable
    self.allPlaces = ko.observableArray(places);

    //Using foreach to put markers and infowindows for each location on the google map

    self.allPlaces().forEach(function(place) {
        marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(place.lat,
                place.lng),
            title: place.name,
            animation: google.maps.Animation.DROP,
            icon: 'images/icon.png',
        });
        place.marker = marker;
        place.marker.addListener('click', placeBounce);

        //Bounce animation effect is achieved using following function

        function placeBounce() {
            if (place.marker.getAnimation() !== null) {
                place.marker.setAnimation(null);
            } else {
                place.marker.setAnimation(google.maps.Animation
                    .BOUNCE);
                setTimeout(function() {
                    place.marker.setAnimation(null);
                }, 1000);
            }
        }

        //Infowindow functionality along with animation when place or marker is clicked
        google.maps.event.addListener(place.marker, 'click',
            function() {
                if (!infowindow) {
                    infowindow = new google.maps.InfoWindow();
                }

                //Wikipedia API to show related article
                var content;
                var infoNames = place.name;
                var infoURL = place.url;
                var urlNames = encodeURI(place.name);
                var wikiUrl =
                    "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" +
                    urlNames +
                    "&limit=1&redirects=return&format=json";

                self.apiTimeout = setTimeout(function() {
                    alert(
                        'ERROR: Wikipedia failed to load articles'
                    );
                }, 5000);

                self.apiTimeout;
                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp"})
                    .done (function(response) {
                        clearTimeout(self.apiTimeout);
                        var articleList = response[
                            1];
                        console.log(response);
                        if (articleList.length > 0) {
                            for (var i = 0; i < articleList.length; i++) {
                                var articleStr =
                                    articleList[i];
                                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                                content = '<div class="info">' +
                                    '<h3 class="text-center" id="infoTitle">' +infoNames +
                                    '</h3>' + '<p>' +response[2] +'</p>' +
                                    '<a href="' + infoURL + '" target="_blank">' +infoURL +
                                    '</a>' +
                                    '</div>';
                                infowindow.setContent(content);
                            }
                        } else {
                            content =
                                '<div class="info">' +
                                '<h3 class="text-center" id="infoTitle">' +
                                infoNames + '</h3>' +
                                '<p>' +
                                "Sorry, Wikipedia do not have any articles on the subject" +
                                '</p>' + '</div>';
                            
                        }

                    //To close infowindow after 7 seconds
                        
                    })//success function
                    .always(function(){
                        infowindow.setContent(content);
                        infowindow.open(map, place.marker);
                        setTimeout(function() {
                            infowindow.close();
                        }, 7000);
                    })
                    .fail (function() {
                        content =
                            '<div class="info">' +
                            '<h3 class="text-center" id="infoTitle">' +
                            infoNames + '</h3>' +
                            '<p>' +
                            "Something went wrong with Wikipedia Servers" +
                            '</p>' + '</div>';
                        infowindow.setContent(content);
                    });//error
                //ajax

            });//addeventlistner
    });

    //Link the list with allplaces marker to present the information when clicked
    self.list = function(place, marker) {
        google.maps.event.trigger(place.marker, 'click');
    };
    // Search functionality
    self.query = ko.observable('');

    self.searchResults = ko.computed(function() {
        return ko.utils.arrayFilter(self.allPlaces(), function(list) {
            //Match search with places and filter
            var listFilter = list.name.toLowerCase().indexOf(
                self.query().toLowerCase()) >= 0;
            //show only the correct matches
            if (listFilter) {
                list.marker.setVisible(true);
            }
            //hide unmatched markers and list items
            else {
                list.marker.setVisible(false);
            }

            return listFilter;

        });
    });
};
//ViewModel finished

//Initializes map, marker, and infowindow data
function initializeMap() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: {
            lat: 42.314,
            lng: -83.060
        },
        zoom: 12,
        draggable: false,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    ko.applyBindings(new ViewModel());
}


//In case of an error with google Maps.
function mapError() {
    alert("Google Maps Encountered an Error.  Please Visit us Later");
    console.log('error');
}

