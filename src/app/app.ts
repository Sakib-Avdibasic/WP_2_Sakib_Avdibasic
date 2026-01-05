import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="brand">
        Internacionalna poslovno-informaciona akademija
      </a>

      <div class="actions">
        <div *ngIf="currentUser" class="dropdown">
          <button class="dropdown-toggle">
            Student Fun Zone ▼
          </button>
          <div class="dropdown-menu">
            <a routerLink="/bingo">Bingo</a>
            <a routerLink="/quiz">Kviz</a>
          </div>
        </div>
        
        <a *ngIf="!currentUser" routerLink="/login">Prijava</a>
        <a *ngIf="!currentUser" routerLink="/register">Registracija</a>
        <a *ngIf="currentUser" (click)="logout()">Odjava</a>
      </div>
    </nav>

    <div class="route-container">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: var(--color-surface);
      box-shadow: var(--shadow);
    }

    .brand {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
      transition: color 0.3s;
    }

    .brand:hover {
      color: var(--color-primary-light);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .actions > a {
      color: var(--color-text);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
      cursor: pointer;
    }

    .actions > a:hover {
      color: var(--color-primary);
    }

    .dropdown {
      position: relative;
    }

    .dropdown-toggle {
      background: var(--color-text);
      color: var(--color-bg);
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.95rem;
    }

    .dropdown-toggle:hover {
      background: var(--color-primary-light);
      transform: translateY(-2px);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s;
      z-index: 1000;
    }

    .dropdown:hover .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-menu a {
      display: block;
      padding: 0.8rem 1.2rem;
      color: var(--color-text);
      text-decoration: none;
      transition: all 0.3s;
      font-weight: 500;
      border-bottom: 1px solid var(--input-border);
    }

    .dropdown-menu a:last-child {
      border-bottom: none;
    }

    .dropdown-menu a:hover {
      background: var(--color-bg);
      color: var(--color-primary);
      padding-left: 1.5rem;
    }

    .dropdown-menu a:first-child {
      border-radius: var(--radius) var(--radius) 0 0;
    }

    .dropdown-menu a:last-child {
      border-radius: 0 0 var(--radius) var(--radius);
    }

    .route-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      min-height: calc(100vh - 60px); 
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      .actions {
        flex-wrap: wrap;
        justify-content: center;
      }

      .dropdown-menu {
        right: auto;
        left: 50%;
        transform: translateX(-50%) translateY(-10px);
      }

      .dropdown:hover .dropdown-menu {
        transform: translateX(-50%) translateY(0);
      }
    }
  `]
  })
export class App implements OnDestroy {
  currentUser: any = null;
  private sub: Subscription;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.sub = this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  async logout() {
    await this.auth.logout();
    this.currentUser = null; 
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}