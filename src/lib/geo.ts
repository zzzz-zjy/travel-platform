// Convert lat/lng to 3D sphere coordinates for Three.js
export function latLngToVec3(lat: number, lng: number, radius: number = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

// Extract boundary polygons from GeoJSON and convert to sphere points
export function geojsonToSpherePoints(geojson: any, radius: number = 1): Array<[number, number, number][]> {
  const polygons: Array<[number, number, number][]> = [];

  const extractCoords = (geometry: any) => {
    if (geometry.type === 'Polygon') {
      polygons.push(geometry.coordinates[0].map(
        ([lng, lat]: [number, number]) => latLngToVec3(lat, lng, radius)
      ));
    } else if (geometry.type === 'MultiPolygon') {
      for (const poly of geometry.coordinates) {
        polygons.push(poly[0].map(
          ([lng, lat]: [number, number]) => latLngToVec3(lat, lng, radius)
        ));
      }
    }
  };

  if (geojson.type === 'FeatureCollection') {
    for (const feature of geojson.features) {
      extractCoords(feature.geometry);
    }
  } else {
    extractCoords(geojson.geometry);
  }

  return polygons;
}
