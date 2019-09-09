import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-locate-button',
  templateUrl: './locate-button.component.html',
  styleUrls: ['./locate-button.component.scss'],
})
export class LocateButtonComponent implements OnChanges {
  @Input() isDisabled: boolean;
  @Input() isSharing: boolean;
  @Output() buttonClick = new EventEmitter<never>();

  buttonLabel: string;

  ngOnChanges() {
    this.buttonLabel = this.isSharing
      ? '現在地の共有を停止する'
      : '現在地の共有を開始する';
  }

  handleButtonClick() {
    this.buttonClick.emit();
  }
}
