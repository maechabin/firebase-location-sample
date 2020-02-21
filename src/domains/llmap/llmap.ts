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

export class LLMap extends L.Map {
  /** Layers */
  private readonly streetsLayer = this.createTileLayer(Constants.LayerId.MapboxStreets);
  private readonly satelliteLayer = this.createTileLayer(Constants.LayerId.MapboxSatellite);
  private readonly googlemaps = L.gridLayer.googleMutant({
    type: 'roadmap', // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
  });

  markers: {
    [id: number]: L.Marker;
  } = {};
  locations: { [token: number]: L.Marker } = {};

  constructor(elem: HTMLElement) {
    super(elem);

    this.setView(
      Constants.DefaultCenteringPosition as L.LatLngExpression,
      Constants.DefaultZoomSize,
    ).addLayer(this.streetsLayer);

    this.addLayerToControl();
  }

  private addLayerToControl(): void {
    L.control
      .layers(
        {
          street: this.streetsLayer,
          satellite: this.satelliteLayer,
          'google maps': this.googlemaps,
        },
        {},
        { position: 'bottomright' },
      )
      .addTo(this);
  }

  private createTileLayer(layerId: Constants.LayerId): L.Layer {
    let layerUrl: string;
    switch (layerId) {
      case Constants.LayerId.MapboxStreets:
        layerUrl = Constants.StreetLayer;
        break;
      case Constants.LayerId.MapboxSatellite:
        layerUrl = Constants.SatelliteLayer;
        break;
    }
    return L.tileLayer(layerUrl, {
      attribution: Constants.Attribution,
      maxZoom: Constants.LayerMaxZoomSize,
      id: layerId,
      accessToken: Constants.Token,
    });
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
    }).addTo(this);

    return { id: marker.id, marker: this.markers[marker.id] };
  }

  moveMarker(marker: Marker) {
    this.markers[marker.id].setLatLng([marker.lat, marker.lng]);
  }

  removeMarker(marker: Marker) {
    this.removeLayer(this.markers[marker.id]);
  }

  getLocation() {
    if (this.locate) {
      this.locate({
        watch: true,
        enableHighAccuracy: true,
        maximumAge: 5000,
      });
    }
  }

  stopGetLocation() {
    this.stopLocate();
    this.fire('locationstop');
  }

  removeLacateMarker(uid: string) {
    this.removeLayer(this.locations[uid]);
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
      this.removeLayer(this.locations[marker.uid]);
    }
    this.locations[marker.uid] = L.marker([marker.lat, marker.lng], {
      icon,
      draggable: false,
    })
      .addTo(this)
      .on('click', () => {
        this.pan(marker.lat, marker.lng);
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

  pan(lat: number, lng: number) {
    this.panTo(new L.LatLng(lat, lng));
  }
}
