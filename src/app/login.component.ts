import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-card" style="margin: 5em auto; width:25%">
      <h2>Prijava</h2>
      <form #loginForm="ngForm" (ngSubmit)="login(loginForm)">
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" ngModel required />
        </div>
        <div class="form-group">
          <label>Lozinka</label>
          <input type="password" name="password" ngModel required />
        </div>
        <button class="primary" type="submit">Prijava</button>
      </form>
    </div>
  `
})
export class LoginComponent {
  constructor(private router: Router, private auth: AuthService) {}

  async login(form: NgForm) {
    if (form.invalid) return;
    try {
      await this.auth.login(form.value.email, form.value.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      alert('Pogrešan email ili lozinka: ' + error.message);
    }
  }
}
