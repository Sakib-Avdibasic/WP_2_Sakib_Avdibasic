import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

interface GratitudeEntry {
  id?: string;
  text: string;
  date: string;
  createdAt?: any;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
  <a routerLink="/dashboard" class="back-link">← Nazad na kontrolnu tablu</a>
    <section class="page gratitude" [ngClass]="currentTheme">
      <h1>Dnevnik zahvalnosti</h1>

      <div class="layout">
        <div class="card editor">
          <h2>Dodaj novi zapis</h2>
          
          <div *ngIf="currentTheme === 'troy'" class="troy-suggestions">
            <p class="label">Odaberi ili napiši:</p>
            <div class="suggestion-buttons">
              <button *ngFor="let suggestion of troySuggestions" 
                      class="suggestion-btn"
                      (click)="newEntry = 'Zahvalan sam za ' + suggestion">
                {{ suggestion }}
              </button>
            </div>
          </div>

          <textarea
            [(ngModel)]="newEntry"
            placeholder="Danas sam zahvalan za..."
          ></textarea>
          <button class="primary" (click)="addEntry()" [disabled]="loading">Sačuvaj</button>
        </div>

        <div class="card entries">
          <h2>Zapisi</h2>

          <div class="entry" *ngFor="let e of entries" [class.new]="isNewEntry(e)">
            <div class="meta">{{ e.date }}</div>
            <p>{{ e.text }}</p>
            <button class="delete" (click)="removeEntry(e.id)">✕</button>
          </div>

          <p *ngIf="entries.length === 0" class="empty">
            Još nema zapisa
          </p>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['gratitude.component.scss']
})
export class GratitudeComponent implements OnInit, OnDestroy {
  entries: GratitudeEntry[] = [];
  newEntry = '';
  currentTheme = 'default';
  loading = false;

  troySuggestions = [
    'Ahilejevu neustrašivost',
    'Atininu mudrost',
    'Hektorovu čast i posvećenost',
    'Afroditinu ljepotu',
    'Posejdonovu zaštitu',
    'Menelajevu odlučnost',
    'Hefestovu kreativnost i vještinu',
    ];

  sub!: Subscription;
  unsubscribe?: () => void;

  db = getFirestore();
  private lastAddedId: string | null = null;

  constructor(
    private auth: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = combineLatest([
      this.auth.initialized$,
      this.auth.user$
    ]).subscribe(([ready, user]) => {
      if (!ready || !user) return;

      this.currentTheme = user.theme || 'default';

      if (this.unsubscribe) this.unsubscribe();

      const ref = collection(this.db, 'users', user.uid, 'gratitudeEntries');
      const q = query(ref, orderBy('createdAt', 'desc'));

      this.unsubscribe = onSnapshot(ref, snap => {
        this.zone.run(() => {
          this.entries = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<GratitudeEntry, 'id'>)
          }));

          this.cdr.detectChanges();
        });
      });
    });
  }

  addEntry() {
    const user = this.auth.currentUser;
    if (!user || !this.newEntry.trim()) return;

    this.loading = true;

    addDoc(
      collection(this.db, 'users', user.uid, 'gratitudeEntries'),
      {
        text: this.newEntry.trim(),
        date: new Date().toLocaleDateString(),
        createdAt: new Date()
      }
    ).then(docRef => {
      this.lastAddedId = docRef.id;
      setTimeout(() => {
        this.lastAddedId = null;
      }, 600);
    }).finally(() => {
      this.loading = false;
    });

    this.newEntry = '';
  }

  removeEntry(id: string | undefined) {
    const user = this.auth.currentUser;
    if (!id || !user) return;

    deleteDoc(
      doc(this.db, 'users', user.uid, 'gratitudeEntries', id)
    );
  }

  isNewEntry(entry: GratitudeEntry): boolean {
    return entry.id === this.lastAddedId;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.unsubscribe) this.unsubscribe();
  }
}