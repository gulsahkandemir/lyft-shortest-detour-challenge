'use strict';

$(document).ready(function() {
    $(document).find('.dt-calculate').dt_calculate();
});

$.widget('dt.dt_calculate', {
    options: {
    },
    eles: {
        calculateForm: null,
        calculateButton: null,
        resultAlert: null,
    },
    distances: {
        firstDetour: -1,
        firstTour: -1,
        firstDetourDifference: -1,
        secondDetour: -1,
        secondTour: -1,
        secondDetourDifference: -1
    },
    flags: {
        callback: 0,
        error: false
    },
    directionsService: null,
    _create: function() {
        // initialize the widget elements and direction service
        this.directionsService = new google.maps.DirectionsService();
        this._initUiEles();
        this.eles.calculateForm.on("submit", $.proxy(this._onCalculateFormSubmit, this));
    },
    _destroy: function() {
    },
    _initUiEles: function() {
        this.eles.calculateForm = this.element.find(".js-calculate-form");
        this.eles.calculateButton = this.element.find(".js-calculate-btn");
        this.eles.resultAlert = this.element.find(".js-result-alert");
    },
    _onCalculateFormSubmit: function(event) {
        event.preventDefault();
        // on start of each calculate operation hide the existing result, empty contentts
        this.eles.resultAlert.hide();
        this.eles.resultAlert.empty();
        // hide the button until calculation is done
        this.eles.calculateForm.find("button").attr("disabled", "disabled");

        // construct the points from inputs
        var pointA = this.element.find(".latA").val() + "," + this.element.find(".lngA").val();
        var pointB = this.element.find(".latB").val() + "," + this.element.find(".lngB").val();
        var pointC = this.element.find(".latC").val() + "," + this.element.find(".lngC").val();
        var pointD = this.element.find(".latD").val() + "," + this.element.find(".lngD").val();

        // construct the waypoints for routes A->B (first driver) and C->D (second driver)
        var waypointsFirstDriver = [];
        waypointsFirstDriver.push({
            location: pointC,
            stopover: true
        });
        waypointsFirstDriver.push({
            location: pointD,
            stopover: true
        });

        var waypointsSecondDriver = [];
        waypointsSecondDriver.push({
            location: pointA,
            stopover: true
        });
        waypointsSecondDriver.push({
            location: pointB,
            stopover: true
        });

        // for each route to be calculated, call the requestRoute function
        this._requestRoute(pointA, pointB, waypointsFirstDriver, "firstDetour");
        this._requestRoute(pointC, pointD, waypointsSecondDriver, "secondDetour");
        this._requestRoute(pointA, pointB, null, "firstTour");
        this._requestRoute(pointC, pointD, null, "secondTour");
    },
    // requestRoute function accepts an origin point, a destination point, a waypoint array
    // and distance type key as inputs. 
    _requestRoute: function(origin, destination, waypoints, distanceType) {
        // construct the request object that directionService requests.
        var routeRequest = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            waypoints: waypoints,
            optimizeWaypoints: false
        };
        // at each callback of .route function, the distance of the distanceType is
        // assigned to the return distance value of routeCallback 
        // and flag is incremented by one
        // and callbackFinished function is called 
        this.directionsService.route(routeRequest, $.proxy(function(response, status) {
            this.distances[distanceType] = this._routeCallback(response, status);
            this.flags.callback++;
            this._callbackFinished();
        }, this));
    },
    // this function calculates the distance of the route if the status is OK
    // and if the status is ZERO_RESULTS then distance is set to -1
    // else error flag is raised
    _routeCallback: function(response, status) {
        var distance = 0; 
        switch(status) {
            case google.maps.DirectionsStatus.OK:
                var route = response.routes[0];
                // For each leg, add distance to get total detour/tour distance.
                for(var i = 0; i < route.legs.length; i++) {
                    distance += route.legs[i].distance.value;
                }
                break;
            case google.maps.DirectionsStatus.ZERO_RESULTS:
                distance = -1;
                break;
            default:
                this.flags.error = true;
                break;
        }
        return distance;
    },
    _callbackFinished: function() {
        // If all direction results are returned, calculate the best detour distance
        if(this.flags.callback == 4) {
            this.flags.callback = 0;

            this.distances.firstDetourDifference = this.distances.firstDetour - this.distances.firstTour;
            this.distances.secondDetourDifference = this.distances.secondDetour - this.distances.secondTour;

            var message = null;
            if(this.flags.error) {
                message = this._getErrorMessage();
            } else if(this.distances.firstDetour < 0 && this.distances.secondDetour < 0) {
                message = this._getNoRoutesPossibleMessage();
            } else if(this.distances.firstDetour > 0 && this.distances.secondDetour < 0) {
                message = this._getOnlyFirstRoutePossibleMessage();
            } else if(this.distances.firstDetour < 0 && this.distances.secondDetour > 0) {
                message = this._getOnlySecondRoutePossibleMessage();
            } else {
                if(this.distances.firstDetourDifference > this.distances.secondDetourDifference) {
                    message = this._getSecondDetourShorterMessage();
                } else if(this.distances.secondDetourDifference > this.distances.firstDetourDifference ) {
                    message = this._getFirstDetourShorterMessage();
                }
            }    

            this.eles.resultAlert.append(message);
            this.eles.resultAlert.show();
            this.eles.calculateForm.find("button").removeAttr("disabled");
            this.flags.error = false;
        }
    },
    _getErrorMessage: function() {
        return "<p>Either an error occured or \
                    we hit the API rate limit of Google Maps. Please try again.</p>";
    },
    _getNoRoutesPossibleMessage: function() {
        return "<p>Sorry, it is not possible to have a detour path for either drivers.</p>";
    }, 
    _getOnlyFirstRoutePossibleMessage: function() {
        return "<p>It is only possible for the first driver to make a detour \
            (Since it is not possible to drive the path C -> A -> B -> D). \
            The detour distance is <b>" + this.distances.firstDetourDifference +"m</b>, and total distance to drive \
            the path <b>A -> C -> D -> B</b> is " + this.distances.firstDetour + "m.";
    }, 
    _getOnlySecondRoutePossibleMessage: function() {
        return "<p>It is only possible for the second driver to make a detour \
            (Since it is not possible to drive the path A -> C -> D -> B). \
            The detour distance is <b>" + this.distances.secondDetourDifference +"m</b>, and total distance to drive \
            the path <b>C -> A -> B -> D</b> is " + this.distances.secondDetour + "m.";
    },
    _getFirstDetourShorterMessage: function() {
        var winnerMessage = "<p>The shortest detour distance is <b>"
            + this.distances.firstDetourDifference + "m</b> when the first driver takes \
            the path <b style=\"display: inline-block;\">A -> C -> D -> B</b>. It would only take "
            + this.distances.firstTour + "m if the driver did not visit \
            points C and D. So the total distance is "
            + this.distances.firstTour + "m + " + this.distances.firstDetourDifference 
            + "m = " + this.distances.firstDetour + "m.</p>";
        var loserMessage = "<p>Whereas it would take " + this.distances.secondDetourDifference 
            + "m for the second driver to make a detour (with total distance "+this.distances.secondDetour+"m).</p>";

        return winnerMessage + loserMessage;
    },
    _getSecondDetourShorterMessage: function() {
        var winnerMessage = "<p>The shortest detour distance is <b>"
            + this.distances.secondDetourDifference + "m</b> when the second driver takes \
            the path <b style=\"display: inline-block;\">C -> A -> B -> D</b>. It would only take "
            + this.distances.secondTour + "m if the driver did not visit \
            points A and B. So the total distance is "
            + this.distances.secondTour + "m + " + this.distances.secondDetourDifference 
            + "m = " + this.distances.secondDetour + "m.</p>";
        var loserMessage = "<p>Whereas it would take " + this.distances.firstDetourDifference 
            + "m for the first driver to make a detour (with total distance "+this.distances.firstDetour+"m).</p>";

        return winnerMessage + loserMessage;
    }
});