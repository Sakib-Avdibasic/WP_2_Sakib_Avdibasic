import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import themesJson from '../themes.json';

export type ThemeName = 'default' | 'gotham' | 'atlantis' | 'troy';

interface Theme {
  "color-bg": string;
  "color-surface": string;
  "color-primary": string;
  "color-primary-light": string;
  "color-accent": string;
  "color-text": string;
  "color-muted": string;
  radius: string;
  shadow: string;
  "input-border": string;
  "input-focus-shadow": string;
  "bg-pattern": string;
}

interface Themes {
  default: Theme;
  gotham: Theme;
  atlantis: Theme;
  troy: Theme;
}

const themes: Themes = themesJson as Themes;

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private auth: AuthService) {
    this.applyTheme('default');
    
    this.auth.user$.subscribe(user => {
      const themeName = (['default', 'gotham', 'atlantis', 'troy'].includes(user?.theme || ''))
        ? (user!.theme as ThemeName)
        : 'default';
      this.applyTheme(themeName);
    });
  }

  applyTheme(themeName: ThemeName) {
    const theme = themes[themeName] || themes.default;
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
}