import { Marker } from '../llmap/llmap.model';

export class LocationList {
  private readonly locationList: Map<string, Marker>;

  constructor() {
    this.locationList = new Map([]);
  }

  getArray() {
    const listArray = [];
    if (this.locationList.size > 0) {
      this.locationList.forEach(list => {
        listArray.push(list);
      });
    }
    return listArray;
  }

  getSize() {
    return this.locationList.size;
  }

  add(marker: Marker) {
    this.locationList.set(marker.uid, marker);
  }

  delete(marker: Marker) {
    this.locationList.delete(marker.uid);
  }
}
