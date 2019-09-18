import { Component } from '@angular/core';

import { CommentUsecase } from '../../../core/comment.usecase';

@Component({
  selector: 'app-comment',
  template: `
    <app-input
      (textInput)="handleTextInput($event)"
      (buttonClick)="handleButtonClick()"
    ></app-input>
  `,
})
export class CommentContainerComponent {
  comment: string;

  constructor(private commentUsecase: CommentUsecase) {}

  handleTextInput(value: string) {
    this.comment = value;
  }

  handleButtonClick() {
    if (this.comment) {
      this.commentUsecase.addComment(this.comment);
    }
  }
}
