// WGS-84 to GCJ-02 conversion (for Chinese map tiles)
const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320.0 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

export function wgs84ToGcj02(lat: number, lng: number): [number, number] {
  if (lat < 0.8293 || lat > 55.8271 || lng < 72.004 || lng > 137.8347) {
    return [lat, lng]; // Outside China, no offset
  }
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const dLatOut = (dLat * 180.0) / ((A * (1 - EE)) / (magic * sqrtMagic) * PI);
  const dLngOut = (dLng * 180.0) / (A / sqrtMagic * Math.cos(radLat) * PI);
  return [lat + dLatOut, lng + dLngOut];
}

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
