import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { firestore } from '../../firebase';
import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface Meal {
  day: string;
  meal: string;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <a routerLink="/dashboard" class="back-link">← Nazad na kontrolnu tablu</a>
    <section class="page meal-planner" [ngClass]="currentTheme">
      <h1>Planer obroka</h1>

      <div class="layout">
        <div class="card planner">
          <h2>Dodaj obrok</h2>

          <div class="form-group">
            <label>Dan</label>
            <select [(ngModel)]="newMeal.day">
              <option *ngFor="let d of days" [value]="d">{{ d }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Obrok</label>
            <input type="text" [(ngModel)]="newMeal.meal" placeholder="Npr. Piletina sa rižom" />
          </div>

          <button class="primary" (click)="addMeal()">Dodaj</button>

          <div class="recommendations" *ngIf="currentTheme === 'atlantis'">
            <h3>🌊 Preporuke iz Atlantide</h3>
            <button class="mini" *ngFor="let r of atlantisMeals" (click)="useRecommendation(r)">
              {{ r }}
            </button>
          </div>
        </div>

        <div class="card overview">
          <h2>Sedmični pregled</h2>

          <div class="day" *ngFor="let d of days">
            <h4>{{ d }}</h4>
            <p *ngIf="!getMeals(d).length" class="empty">Nema planiranog obroka</p>

            <div class="meal" *ngFor="let m of getMeals(d)">
              <span>{{ m.meal }}</span>
              <button class="delete" (click)="removeMeal(m.id)">✕</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['meal-planner.component.scss']
})
export class MealPlannerComponent implements OnInit, OnDestroy {
  currentTheme = 'default';
  days = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];
  meals: (Meal & { id: string })[] = [];
  newMeal: Meal = { day: this.days[0], meal: '' };
  atlantisMeals = [
    'Grilovani losos sa limunom',
    'Rižoto sa plodovima mora',
    'Tuna steak sa povrćem',
    'Škampi na maslinovom ulju',
    'Pečena pastrmka'
  ];
  private userId: string | null = null;
  private sub!: Subscription;
  private mealsUnsub: (() => void) | null = null;

  constructor(
    private auth: AuthService, 
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.sub = this.auth.initialized$
      .pipe(filter(initialized => initialized === true))
      .subscribe(() => {
        const user = this.auth.currentUser;
        if (!user) return;

        this.userId = user.uid;
        this.currentTheme = user.theme || 'default';

        if (this.mealsUnsub) this.mealsUnsub();
        const mealsRef = collection(firestore, 'meals');
        const q = query(mealsRef, where('userId', '==', this.userId));
        this.mealsUnsub = onSnapshot(q, snapshot => {
          this.ngZone.run(() => {
            this.meals = snapshot.docs.map(docSnap => ({
              id: docSnap.id,
              ...(docSnap.data() as Meal)
            }));
            this.cdr.markForCheck();
          });
        });
      });
  }

  async addMeal() {
    if (!this.newMeal.meal.trim() || !this.userId) return;
    const mealsRef = collection(firestore, 'meals');
    const docRef = doc(mealsRef);
    await setDoc(docRef, { ...this.newMeal, userId: this.userId });
    this.newMeal.meal = '';
  }

  async removeMeal(mealId: string) {
    if (!mealId) return;
    await deleteDoc(doc(firestore, 'meals', mealId));
  }

  getMeals(day: string) {
    return this.meals.filter(m => m.day === day);
  }

  useRecommendation(meal: string) {
    this.newMeal.meal = meal;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.mealsUnsub) this.mealsUnsub();
  }
}