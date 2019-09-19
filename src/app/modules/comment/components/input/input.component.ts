import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() isSharing: boolean;
  @Output() textInput = new EventEmitter();
  @Output() buttonClick = new EventEmitter();

  hanndleTextInput(value: string) {
    this.textInput.emit(value);
  }

  handleButtonClick(comment) {
    this.buttonClick.emit();
    comment.value = '';
  }
}
