import { Component, OnInit, ElementRef } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Map, Marker } from './domains/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private el: HTMLElement;
  private markerDocument: AngularFirestoreDocument<Marker>;
  marker: Observable<Marker>;
  map = new Map();
  token = new Date().getTime();
  color = this.getColorCode();

  constructor(private elementRef: ElementRef, private afs: AngularFirestore) {
    this.markerDocument = afs.doc<Marker>('marker/GvQyEJEj19tVHvb2vDs0');
    this.marker = this.markerDocument.valueChanges();
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement;
    const mapElem = this.el.querySelector('#map') as HTMLElement;
    this.map.initMap(mapElem);
    this.marker.subscribe(marker => {
      this.handleMarkerRecieve(marker);
    });
    this.handleMapClick();
  }

  handleMapClick() {
    this.map.llmap.on('click', (e: L.LeafletEvent) => {
      const marker: Marker = {
        token: this.token,
        color: this.color,
        id: new Date().getTime(),
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        task: 'put',
      };
      this.markerDocument.update(marker);
    });
  }

  handleMarkerRecieve(sendedMarker: Marker) {
    if (this.token > sendedMarker.id) {
      return;
    }

    switch (sendedMarker.task) {
      case 'put':
        const m = this.map.putMarker(sendedMarker);
        let timer: any;

        m.marker.on('drag', (e: L.LeafletEvent) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            const marker: Marker = {
              token: this.token,
              color: this.color,
              id: m.id,
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              task: 'move',
            };
            this.markerDocument.update(marker);
          }, 1000);
        });

        m.marker.on('click', (e: L.LeafletEvent) => {
          const marker: Marker = {
            token: this.token,
            color: this.color,
            id: m.id,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            task: 'remove',
          };
          this.markerDocument.update(marker);
        });
        break;
      case 'move':
        if (sendedMarker.token !== this.token) {
          this.map.moveMarker(sendedMarker);
        }
        break;
      case 'remove':
        this.map.removeMarker(sendedMarker);
        break;
    }
  }

  private getColorCode() {
    // tslint:disable-next-line: no-bitwise
    const color = ((Math.random() * 0xffffff) | 0).toString(16);
    return `#${('000000' + color).slice(-6)}`;
  }
}
