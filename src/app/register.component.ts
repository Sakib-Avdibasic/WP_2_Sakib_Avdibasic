import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-card" style="margin: 5em auto; width:25%">
      <h2>Registracija</h2>
      <form #regForm="ngForm" (ngSubmit)="register(regForm)">
        <div class="form-group">
          <label>Ime</label>
          <input type="text" name="name" ngModel required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" ngModel required />
        </div>
        <div class="form-group">
          <label>Lozinka</label>
          <input type="password" name="password" ngModel required />
        </div>
        <div class="form-group">
          <label>Tema</label>
          <select name="theme" ngModel required>
            <option value="default">Default</option>
            <option value="gotham">Gotham</option>
            <option value="atlantis">Atlantis</option>
            <option value="troy">Troy</option>
          </select>
        </div>
        <button class="primary" type="submit">Registracija</button>
      </form>
    </div>
  `
})
export class RegisterComponent {
  constructor(private router: Router, private auth: AuthService) {}

  async register(form: NgForm) {
    if (form.invalid) return;
    try {
      await this.auth.register(form.value);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      alert('Registracija nije uspjela: ' + error.message);
    }
  }
}
