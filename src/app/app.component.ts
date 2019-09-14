import { Component, OnInit, ElementRef, EventEmitter } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Map, Marker } from './domains/map';
import * as helper from './core/helpers';

type LoginState = 'login' | 'logout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private el: HTMLElement;
  private markerDocument: AngularFirestoreDocument<Marker>;
  locateMarkers: { [token: number]: Marker } = {};
  latlngMarkers: { [id: number]: L.Marker } = {};
  isDisabled = true;
  isSharing = false;
  marker: Observable<Marker>;

  readonly map = new Map();
  readonly token = new Date().getTime();
  readonly color = helper.getColorCode();
  userPhoto = '';

  private readonly onDestroy$ = new EventEmitter();

  get markerListLength() {
    return Object.values(this.locateMarkers).length;
  }

  user$ = this.afAuth.user;

  constructor(
    public afAuth: AngularFireAuth,
    private elementRef: ElementRef,
    private afs: AngularFirestore,
  ) {
    this.markerDocument = afs.doc<Marker>('marker/GvQyEJEj19tVHvb2vDs0');
    this.marker = this.markerDocument.valueChanges();
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement;
    const mapElem = this.el.querySelector('#map') as HTMLElement;
    this.map.initMap(mapElem);

    this.user$.subscribe(user => {
      if (user) {
        this.userPhoto = user.photoURL;
        setTimeout(() => {
          this.marker.pipe(takeUntil(this.onDestroy$)).subscribe(marker => {
            this.handleMarkerRecieve(marker);
            this.isDisabled = false;
          });
          this.handleMapClick();
        }, 300);
      } else {
        this.onDestroy$.emit();
      }
    });
  }

  handleMapClick() {
    this.map.llmap.on('click', (event: L.LeafletEvent) => {
      const marker: Marker = {
        token: this.token,
        userPhoto: this.userPhoto,
        color: this.color,
        id: new Date().getTime(),
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        task: 'put',
      };
      this.markerDocument.update(marker);
    });

    this.map.llmap.on('locationfound', (event: L.LeafletEvent) => {
      this.isDisabled = true;
      console.log(
        `現在地を取得しました: ${event.latlng.lat}, ${event.latlng.lng}`,
      );

      const marker: Marker = {
        token: this.token,
        userPhoto: this.userPhoto,
        color: this.color,
        id: new Date().getTime(),
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        task: 'location',
      };
      this.markerDocument.update(marker);
    });

    this.map.llmap.on('locationstop', () => {
      const marker: Marker = {
        token: this.token,
        userPhoto: this.userPhoto,
        color: this.color,
        id: new Date().getTime(),
        lat: NaN,
        lng: NaN,
        task: 'removeLocation',
      };
      this.markerDocument.update(marker);
    });

    this.map.llmap.on('locationerror', error => {
      console.error(`現在地を取得できませんでした`);
      this.isSharing = false;
      this.isDisabled = false;
    });
  }

  handleMarkerRecieve(sendedMarker: Marker) {
    if (this.token > sendedMarker.id) {
      return;
    }

    switch (sendedMarker.task) {
      case 'put':
        const m = this.map.putMarker(sendedMarker);
        this.latlngMarkers[m.id] = m.marker;
        let timer: any;

        m.marker.on('drag', (e: L.LeafletEvent) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            const marker: Marker = {
              token: this.token,
              userPhoto: this.userPhoto,
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
            userPhoto: this.userPhoto,
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
      case 'location':
        if (
          !this.map.locations[sendedMarker.token] &&
          sendedMarker.token === this.token
        ) {
          this.map.panTo(sendedMarker.lat, sendedMarker.lng);
        }

        if (!this.map.locationList[sendedMarker.token]) {
          this.map.locationList = {
            ...this.map.locationList,
            [sendedMarker.token]: sendedMarker,
          };
        }
        this.locateMarkers = this.map.locationList;
        this.map.putLocationMarker(sendedMarker);
        this.isDisabled = false;
        break;
      case 'removeLocation':
        delete this.map.locationList[sendedMarker.token];
        this.locateMarkers = this.map.locationList;
        this.map.removeLacateMarker(sendedMarker.token);
        this.isDisabled = false;
        break;
    }
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    Object.values(this.latlngMarkers).forEach((marker: L.Marker) => {
      this.map.llmap.removeLayer(marker);
    });
    this.handleButtonClick();
    this.afAuth.auth.signOut();
  }

  handleLoginButtonClick(loginState: LoginState) {
    if (loginState === 'login') {
      this.login();
    }
    if (loginState === 'logout') {
      this.logout();
    }
  }

  handleButtonClick() {
    this.isDisabled = true;
    if (this.isSharing) {
      this.map.stopGetLocation();
    } else {
      this.map.getLocation();
    }
    this.isSharing = !this.isSharing;
  }

  handleListClick(marker: { lat: number; lng: number }) {
    this.map.panTo(marker.lat, marker.lng);
  }
}
