import * as L from 'leaflet';

import * as Constants from './constants';
import { Marker } from './llmap.model';
import 'leaflet.gridlayer.googlemutant';

declare module 'leaflet' {
  interface LeafletEvent {
    latlng: LatLng;
  }
}

interface Comment {
  uid: string;
  comment: string;
  // lat: number;
  // lng: number;
  // date: number;
}

export class LLMap {
  llmap!: L.Map;
  markers: {
    [id: number]: L.Marker;
  } = {};
  locations: { [token: number]: L.Marker } = {};
  locationList: { [token: number]: Marker } = {};

  initMap(elem: any) {
    const token = Constants.Token;
    /** Layer */
    const streetsLayer = L.tileLayer(Constants.StreetLayer, {
      attribution: Constants.Attribution,
      maxZoom: Constants.LayerMaxZoomSize,
      id: Constants.LayerId.MapboxStreets,
      accessToken: token,
    });

    const satelliteLayer = L.tileLayer(Constants.SatelliteLayer, {
      attribution: Constants.Attribution,
      maxZoom: Constants.LayerMaxZoomSize,
      id: Constants.LayerId.MapboxSatellite,
      accessToken: token,
    });

    const googlemaps = L.gridLayer.googleMutant({
      type: 'roadmap', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    });

    this.llmap = L.map(elem)
      .setView([35.69432984468491, 139.74267643565133], 12)
      .addLayer(streetsLayer);

    L.control
      .layers(
        {
          street: streetsLayer,
          satellite: satelliteLayer,
          'google maps': googlemaps,
        },
        {},
        { position: 'bottomright' },
      )
      .addTo(this.llmap);
  }

  putMarker(marker: Marker): { id: number; marker: L.Marker } {
    /** Icon */
    const markerHtmlStyles1 = `
      position: absolute;
      left: -12px;
      top: -12px;
      border-radius: 50%;
      border: 8px solid ${marker.color[0]};
      width: 8px;
      height: 8px;
    `;
    const markerHtmlStyles2 = `
      position: absolute;
      bottom: -30px;
      left: -6px;
      border: 10px solid transparent;
      border-top: 17px solid ${marker.color[0]};
    `;
    const icon = L.divIcon({
      className: 'marker-icon',
      iconAnchor: [0, 24],
      html: `
        <span style="${markerHtmlStyles1}" />
        <span style="${markerHtmlStyles2}" />
      `,
    });

    this.markers[marker.id] = L.marker([marker.lat, marker.lng], {
      icon,
      draggable: true,
    }).addTo(this.llmap);

    return { id: marker.id, marker: this.markers[marker.id] };
  }

  moveMarker(marker: Marker) {
    this.markers[marker.id].setLatLng([marker.lat, marker.lng]);
  }

  removeMarker(marker: Marker) {
    this.llmap.removeLayer(this.markers[marker.id]);
  }

  getLocation() {
    if (this.llmap && this.llmap.locate) {
      this.llmap.locate({
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 5000,
      });
    }
  }

  stopGetLocation() {
    this.llmap.stopLocate();
    this.llmap.fire('locationstop');
  }

  removeLacateMarker(uid: string) {
    this.llmap.removeLayer(this.locations[uid]);
  }

  putLocationMarker(marker: Marker, comment: string) {
    const markerHtmlStyles = `
      position: absolute;
      width: 10px;
      height: 10px;
      box-shadow: 0 0 0 8px ${marker.color[1]};
      border-radius: 50%;
      border: 2px solid #fff;
      background-color: ${marker.color[0]};
    `;
    const icon = L.divIcon({
      className: 'marker-icon',
      iconAnchor: [7, 7],
      popupAnchor: [0, 0],
      html: `
        <span style="${markerHtmlStyles}" />
      `,
    });

    if (this.locations[marker.uid]) {
      this.llmap.removeLayer(this.locations[marker.uid]);
    }
    this.locations[marker.uid] = L.marker([marker.lat, marker.lng], {
      icon,
      draggable: false,
    })
      .addTo(this.llmap)
      .on('click', () => {
        this.panTo(marker.lat, marker.lng);
      })
      .bindPopup(comment, {
        closeButton: false,
        autoClose: false,
        keepInView: true,
        closeOnClick: false,
      })
      .openPopup();
  }

  setComment(comments: Comment[]) {
    comments.forEach(comment => {
      if (this.locations[comment.uid]) {
        this.locations[comment.uid].setPopupContent(comment.comment);
      }
    });
  }

  panTo(lat: number, lng: number) {
    this.llmap.panTo(new L.LatLng(lat, lng));
  }
}
