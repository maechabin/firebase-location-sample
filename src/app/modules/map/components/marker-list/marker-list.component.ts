import {
  Component,
  OnChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { LLMap, Marker } from '../../../../../domains/llmap';

@Component({
  selector: 'app-marker-list',
  templateUrl: './marker-list.component.html',
  styleUrls: ['./marker-list.component.scss'],
})
export class MarkerListComponent implements OnChanges {
  @Input() map: LLMap;
  @Input() markers: { [token: number]: Marker };
  @Input() markerListLength: number;
  @Output() listClick = new EventEmitter<{ lat: number; lng: number }>();

  markerList: Marker[] = [];
  colors: { ['box-shadow']: string }[];

  ngOnChanges() {
    this.markerList = Object.values(this.markers);
    this.colors = this.markerList.map(marker => {
      return { 'box-shadow': `0 0 0 8px ${marker.color[1]}` };
    });
  }

  handleListClick($event: { lat: number; lng: number }) {
    this.listClick.emit($event);
  }
}
