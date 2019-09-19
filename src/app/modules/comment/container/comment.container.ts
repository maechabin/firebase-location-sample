import { Component } from '@angular/core';

import { CommentUsecase } from '../comment.usecase';
import { State } from '../../../core/state';

@Component({
  selector: 'app-comment',
  template: `
    <app-input
      (textInput)="handleTextInput($event)"
      (buttonClick)="handleButtonClick()"
      [isSharing]="state.isSharing"
    ></app-input>
  `,
})
export class CommentContainerComponent {
  comment: string;

  constructor(private commentUsecase: CommentUsecase, public state: State) {}

  handleTextInput(value: string) {
    this.comment = value;
  }

  handleButtonClick() {
    if (this.comment) {
      this.commentUsecase.addComment(this.comment);
    }
  }
}
