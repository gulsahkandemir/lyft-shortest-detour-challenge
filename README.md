# [Lyft Shortest Detour Challenge](http://sf.funma.pl/lyft/)

This is the source code of Lyft's shortest detour programming challenge. Challenge description is:

> Calculate the detour distance between two different rides. Given four latitude / longitude pairs, where driver one is traveling from point A to point B and driver two is traveling from point C to point D, write a function (in your language of choice) to calculate the shorter of the detour distances the drivers would need to take to pick-up and drop-off the other driver.

## Development

I used **Google Maps Api**, **jQuery UI Widgets** and **Bootstrap** to implement my solution. Routes between two points are requested from Google Maps Api's **Direction Service**.

##### Pseudocode

```
firstDriverDetourDistance = Get distance between A and B, through waypoints C and D (A -> C -> D -> B);
firstDriverTourDistance = Get distance between A and B;
secondDriverDetourDistance = Get distance between C and D, through waypoints A and B (C -> A -> B -> D);
secondDriverTourDistance = Get distance between C and D;
shortestDetourDifference = minimum(
 (firstDriverDetourDistance - firstDriverTourDistance), 
 (secondDriverDetourDistance - secondDriverTourDistance)
);
```

## Usage

Open [http://sf.funma.pl/lyft/](http://sf.funma.pl/lyft/) and submit 4 pairs of latitude / longitude.
