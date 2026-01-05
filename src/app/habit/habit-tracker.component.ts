import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

interface Habit {
  id?: string;
  name: string;
  color: string;
  completedDates: string[];
}

@Component({
  selector: 'app-habit-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './habit-tracker.component.html',
  styleUrls: ['./habit-tracker.component.scss']
})
export class HabitTrackerComponent implements OnInit, OnDestroy {
  newHabit = '';
  habits: Habit[] = [];
  currentTheme = 'default';
  loading = false;

  today = new Date().toISOString().split('T')[0];

  atlantisSuggestions = [
    'Popiti dva litra vode',
    'Ne ostavljati česme otvorene bez potrebe',
    'Nahraniti ribice',
    'Pokupiti smeće sa obale',
    'Izbjegavati korištenje plastike',
    'Pogledati epizodu Spužva Boba'
  ];

  sub!: Subscription;
  unsubscribe?: () => void;

  db = getFirestore();

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

      const ref = collection(this.db, 'users', user.uid, 'habits');
      const q = query(ref, orderBy('name'));

      this.unsubscribe = onSnapshot(ref, snap => {
        this.zone.run(() => {
          this.habits = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<Habit, 'id'>)
          }));

          this.cdr.detectChanges();
        });
      });
    });
  }

  addHabit() {
    const user = this.auth.currentUser;
    if (!user || !this.newHabit.trim()) return;

    this.loading = true;

    addDoc(
      collection(this.db, 'users', user.uid, 'habits'),
      {
        name: this.newHabit.trim(),
        color: '#16a34a',
        completedDates: []
      }
    ).finally(() => {
      this.loading = false;
    });

    this.newHabit = '';
  }

  async toggleToday(habit: Habit) {
    const user = this.auth.currentUser;
    if (!user || !habit.id) return;

    const index = habit.completedDates.indexOf(this.today);
    const updated = [...habit.completedDates];

    if (index >= 0) {
      updated.splice(index, 1);
    } else {
      updated.push(this.today);
    }

    await updateDoc(
      doc(this.db, 'users', user.uid, 'habits', habit.id),
      { completedDates: updated }
    );
  }

  isDoneToday(habit: Habit) {
    return habit.completedDates.includes(this.today);
  }

  getStreak(habit: Habit) {
    let streak = 0;
    let date = new Date();

    while (true) {
      const key = date.toISOString().split('T')[0];
      if (habit.completedDates.includes(key)) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else break;
    }

    return streak;
  }

  getConsistency(habit: Habit) {
    if (!habit.completedDates.length) return 0;

    const first = new Date(habit.completedDates[0]);
    const days = Math.floor((Date.now() - first.getTime()) / 86400000) + 1;

    return Math.round((habit.completedDates.length / days) * 100);
  }

  getCompletedTodayCount() {
    return this.habits.filter(h => this.isDoneToday(h)).length;
  }

  async removeHabit(id: string | undefined) {
    const user = this.auth.currentUser;
    if (!id || !user) return;

    await deleteDoc(
      doc(this.db, 'users', user.uid, 'habits', id)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.unsubscribe) this.unsubscribe();
  }
}
