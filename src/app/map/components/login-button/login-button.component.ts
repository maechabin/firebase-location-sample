import { Component, Input, Output, EventEmitter } from '@angular/core';

type LoginState = 'login' | 'logout';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss'],
})
export class LoginButtonComponent {
  @Input() loginState: LoginState;
  @Output() buttonClick = new EventEmitter<LoginState>();

  get label() {
    return this.loginState === 'login' ? 'Login' : 'Logout';
  }

  handleButtonClick() {
    this.buttonClick.emit(this.loginState);
  }
}
