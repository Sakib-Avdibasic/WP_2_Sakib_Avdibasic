import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bingo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page bingo" [ngClass]="currentTheme">
      <a routerLink="/dashboard" class="back-link">← Nazad na kontrolnu tablu</a>
      <h1>Programerski Bingo</h1>
      <p class="subtitle">Klikni na polja koja si doživio/la danas!</p>

      <div class="bingo-container">
        <div class="bingo-grid">
          <div 
            *ngFor="let item of bingoItems; let i = index"
            class="bingo-cell"
            [class.marked]="markedCells.has(i)"
            [class.center]="i === 12"
            (click)="toggleCell(i)">
            <span class="cell-content">{{ item }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="primary" (click)="checkBingo()">Provjeri Bingo!</button>
          <button class="secondary" (click)="resetBoard()">Resetuj tablu</button>
        </div>

        <div class="bingo-message" *ngIf="hasBingo">
          🎉 BINGO! Čestitamo, imate bingo! 🎉
        </div>
      </div>
    </section>
  `,
  styles: [`
    .bingo {
      min-height: 100vh;
      padding: 2rem;
      background: transparent;
      margin: 0 auto;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: var(--color-muted);
      text-decoration: none;
      transition: color 0.3s;
      font-weight: 500;
    }

    .back-link:hover {
      color: var(--color-primary);
    }

    h1 {
      text-align: center;
      color: var(--color-text);
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      color: var(--color-muted);
      font-size: 1.1rem;
      margin-bottom: 3rem;
    }

    .bingo-container {
      max-width: 700px;
      margin: 0 auto;
    }

    .bingo-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: var(--color-surface);
      padding: 1rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .bingo-cell {
      aspect-ratio: 1;
      background: var(--color-bg);
      border: 3px solid var(--input-border);
      border-radius: calc(var(--radius) / 2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      padding: 0.5rem;
    }

    .bingo-cell:hover:not(.center) {
      border-color: var(--color-primary);
      transform: scale(1.05);
      box-shadow: var(--shadow);
    }

    .bingo-cell.center {
      background: var(--color-primary);
      border-color: var(--color-primary);
      cursor: default;
    }

    .bingo-cell.center:hover {
      transform: none;
    }

    .bingo-cell.marked:not(.center) {
      background: var(--color-primary);
      border-color: var(--color-primary);
      transform: scale(0.95);
    }

    .bingo-cell.marked .cell-content {
      color: white;
      font-weight: 700;
    }

    .cell-content {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.3;
    }

    .bingo-cell.center .cell-content {
      font-size: 2.5rem;
      color: white;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    button.primary {
      padding: 0.9rem 2.5rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: var(--shadow);
    }

    button.primary:hover {
      background: var(--color-primary-light);
      transform: translateY(-2px);
    }

    button.secondary {
      padding: 0.9rem 2.5rem;
      background: transparent;
      color: var(--color-primary);
      border: 2px solid var(--color-primary);
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    button.secondary:hover {
      background: var(--color-primary);
      color: white;
      transform: translateY(-2px);
    }

    .bingo-message {
      text-align: center;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-accent);
      padding: 2rem;
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      animation: bounce 0.5s ease;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @media (max-width: 768px) {
      .bingo {
        padding: 1rem;
      }

      h1 {
        font-size: 1.8rem;
      }

      .subtitle {
        font-size: 0.95rem;
      }

      .bingo-grid {
        gap: 0.3rem;
        padding: 0.5rem;
      }

      .cell-content {
        font-size: 0.7rem;
      }

      .bingo-cell.center .cell-content {
        font-size: 2rem;
      }

      .actions {
        flex-direction: column;
      }

      button.primary,
      button.secondary {
        width: 100%;
      }

      .bingo-message {
        font-size: 1.3rem;
        padding: 1rem;
      }
    }
  `]
})
export class BingoComponent implements OnInit, OnDestroy {
  currentTheme = 'default';
  markedCells = new Set<number>();
  hasBingo = false;
  private sub!: Subscription;

  centerEmojis: Record<string, string> = {
    default: '💻',
    gotham: '🦇',
    atlantis: '🌊',
    troy: '🏛️'
  };

  programmingTerms = [
    'Bug u produkciji',
    'Zaboravio commitat',
    'Merge konflikt',
    'Stack Overflow',
    'Kafa #5',
    'CSS ne radi',
    '"Radi na mom PC"',
    'Git push --force',
    'Nedostaje ;',
    'Console.log debug',
    'Prepisao tutorijal',
    'npm install',
    'Izgubio kod',
    'Regex magija',
    'Copy-paste',
    'Zaboravio sintaksu',
    '404 greška',
    'Beskonačna petlja',
    'NULL pointer',
    'Deployment petak',
    'Refaktorisanje',
    'Legacy kod',
    'Tech debt',
    'Code review'
  ];

  bingoItems: string[] = [];

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.sub = this.auth.user$.subscribe(user => {
      if (user) {
        this.currentTheme = user.theme || 'default';
        this.setupBingoBoard();
      }
    });
  }

  setupBingoBoard() {
    this.bingoItems = [...this.programmingTerms];
    this.bingoItems.splice(12, 0, this.centerEmojis[this.currentTheme]);
  }

  toggleCell(index: number) {
    if (index === 12) return; 

    if (this.markedCells.has(index)) {
      this.markedCells.delete(index);
    } else {
      this.markedCells.add(index);
    }
    this.hasBingo = false;
  }

  checkBingo() {
    const winningLines = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    ];

    for (const line of winningLines) {
      const hasLine = line.every(index => 
        index === 12 || this.markedCells.has(index)
      );
      
      if (hasLine) {
        this.hasBingo = true;
        return;
      }
    }

    this.hasBingo = false;
  }

  resetBoard() {
    this.markedCells.clear();
    this.hasBingo = false;
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}