lyft-shortest-detour-challenge
==============================

# [Lyft Shortest Detour Challenge](http://funma.pl/yft/)

This is the source code of Lyft's shortest detour programming challenge. Challenge description is:

Calculate the detour distance between two different rides. Given four latitude / longitude pairs, where driver one is traveling from point A to point B and driver two is traveling from point C to point D, write a function (in your language of choice) to calculate the shorter of the detour distances the drivers would need to take to pick-up and drop-off the other driver.

## Development

I used Google Maps Api, jQuery UI Widgets and Bootstrap to implement my solution. To be more specific, routes between two points are requested from Google Maps Api's Direction Service.
The algorithm implemented is like as follows:

- firstDriverDetourDistance = distance between A -> B through waypoints C and D (A -> C -> D -> B)
- firstDriverTourDistance = distance between A -> B
- secondDriverDetourDistance = distance between C -> D through waypoints A and B (C -> A -> B -> D)
- secondDriverTourDistance = distance between C -> D

- shortestDetourDifference = Minimum((firstDriverDetourDistance - firstDriverTourDistance), (secondDriverDetourDistance - secondDriverTourDistance))

## How to get it work

Open [Lyft Shortest Detour Challenge](http://funma.pl/yft/) webpage and enter 4 pairs of Latitude/Longitude. Click Calculate button :)


