import { Component, OnInit, ElementRef, EventEmitter } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { LLMap, Marker } from '../../../../domains/llmap';
import * as helper from '../../../core/helpers';
import { MapService } from '../service/map.service';
import { LoginService } from '../service/login.service';
import { State } from '../../../core/state';

type LoginState = 'login' | 'logout';
interface Comment {
  uid: string;
  comment: string;
  // lat: number;
  // lng: number;
  // date: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.container.html',
  styleUrls: ['./map.container.scss'],
})
export class MapContainerComponent implements OnInit {
  private el: HTMLElement;
  private markerDocument: AngularFirestoreDocument<Marker>;
  private commentsCollection: AngularFirestoreCollection<Comment>;

  locateMarkers: { [token: number]: Marker } = {};
  latlngMarkers: { [id: number]: L.Marker } = {};
  isDisabled = true;
  marker: Observable<Marker>;

  map: LLMap;
  readonly token = new Date().getTime();
  readonly color = helper.getColorCode();

  private uid = '';
  private userPhoto = '';
  private comments: Comment[];
  timeInterval: number;
  previousLat: number;
  previousLng: number;

  private readonly onDestroy$ = new EventEmitter();

  get markerListLength() {
    return Object.values(this.locateMarkers).length;
  }

  user$ = this.afAuth.user;
  comments$: Observable<Comment[]>;

  constructor(
    public afAuth: AngularFireAuth,
    private elementRef: ElementRef,
    private afs: AngularFirestore,
    private mapService: MapService,
    private loginService: LoginService,
    public state: State,
  ) {
    this.markerDocument = afs.doc<Marker>('marker/GvQyEJEj19tVHvb2vDs0');
    this.marker = this.markerDocument.valueChanges();
    this.commentsCollection = afs.collection<Comment>('comments');
    this.comments$ = this.commentsCollection.valueChanges();
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement;
    const mapElem = this.el.querySelector('#map') as HTMLElement;
    this.map = new LLMap(mapElem);

    this.user$.subscribe(user => {
      if (user) {
        this.uid = user.uid;
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

    this.comments$.subscribe((comments: Comment[]) => {
      this.comments = comments;
      this.map.setComment(comments);
    });
  }

  handleMapClick() {
    this.map.on('click', (event: L.LeafletEvent) => {
      const marker: Marker = {
        token: this.token,
        uid: this.uid,
        userPhoto: this.userPhoto,
        color: this.color,
        id: new Date().getTime(),
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        task: 'put',
      };
      this.markerDocument.update(marker);
    });

    this.map.on('locationfound', (event: L.LeafletEvent) => {
      console.log(`現在地を取得しました: ${event.latlng.lat}, ${event.latlng.lng}`);

      const time = new Date().getTime();

      if (!this.timeInterval || time - this.timeInterval > 5000) {
        this.isDisabled = true;
        const marker: Marker = {
          token: this.token,
          uid: this.uid,
          userPhoto: this.userPhoto,
          color: this.color,
          id: time,
          lat: event.latlng.lat,
          lng: event.latlng.lng,
          task: 'location',
        };
        this.markerDocument.update(marker);
        this.timeInterval = time;
        this.previousLat = event.latlng.lat;
        this.previousLng = event.latlng.lng;
      }
    });

    this.map.on('locationstop', () => {
      const marker: Marker = {
        token: this.token,
        uid: this.uid,
        userPhoto: this.userPhoto,
        color: this.color,
        id: new Date().getTime(),
        lat: NaN,
        lng: NaN,
        task: 'removeLocation',
      };
      this.markerDocument.update(marker);
    });

    this.map.on('locationerror', error => {
      console.error(`現在地を取得できませんでした`);
      this.state.isSharing = false;
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

        m.marker.on('dragend', (event: L.LeafletEvent) => {
          const marker: Marker = {
            token: this.token,
            uid: this.uid,
            userPhoto: this.userPhoto,
            color: this.color,
            id: m.id,
            lat: event.target._latlng.lat,
            lng: event.target._latlng.lng,
            task: 'move',
          };
          this.markerDocument.update(marker);
        });

        m.marker.on('click', (event: L.LeafletEvent) => {
          const marker: Marker = {
            token: this.token,
            uid: this.uid,
            userPhoto: this.userPhoto,
            color: this.color,
            id: m.id,
            lat: event.latlng.lat,
            lng: event.latlng.lng,
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
        if (!this.map.locations[sendedMarker.uid] && sendedMarker.uid === this.uid) {
          this.map.pan(sendedMarker.lat, sendedMarker.lng);
        }

        if (!this.map.locationList[sendedMarker.uid]) {
          this.map.locationList = {
            ...this.map.locationList,
            [sendedMarker.uid]: sendedMarker,
          };
        }
        this.locateMarkers = this.map.locationList;
        setTimeout(() => {
          const comment = this.comments.find(c => c.uid === sendedMarker.uid);
          this.map.putLocationMarker(sendedMarker, (comment && comment.comment) || `I'm here now`);
        }, 0);

        this.isDisabled = false;
        break;
      case 'removeLocation':
        delete this.map.locationList[sendedMarker.uid];
        this.locateMarkers = this.map.locationList;
        this.map.removeLacateMarker(sendedMarker.uid);
        this.isDisabled = false;
        break;
    }
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    Object.values(this.latlngMarkers).forEach((marker: L.Marker) => {
      this.map.removeLayer(marker);
    });
    this.handleShareButtonClick();
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

  handleShareButtonClick() {
    this.isDisabled = true;
    if (this.state.isSharing) {
      this.map.stopGetLocation();
    } else {
      this.map.getLocation();
    }
    this.state.isSharing = !this.state.isSharing;
  }

  handleListClick(marker: { lat: number; lng: number }) {
    this.map.pan(marker.lat, marker.lng);
  }
}
