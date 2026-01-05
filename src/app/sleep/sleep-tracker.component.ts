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
  Firestore
} from 'firebase/firestore';

interface SleepEntry {
  id?: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  notes: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-sleep-tracker',
  templateUrl: 'sleep-tracker.component.html',
  styleUrl: 'sleep-tracker.component.scss'
})
export class SleepTrackerComponent implements OnInit, OnDestroy {
  entries: SleepEntry[] = [];
  loading = false;

  date = '';
  sleepTime = '';
  wakeTime = '';
  quality = 3;
  notes = '';

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

      this.setDefaults();

      if (this.unsubscribe) this.unsubscribe();

      const ref = collection(this.db, 'users', user.uid, 'sleepEntries');
      const q = query(ref, orderBy('date', 'desc'));

      this.unsubscribe = onSnapshot(q, snap => {
        this.zone.run(() => {
          this.entries = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<SleepEntry, 'id'>)
          }));

          this.cdr.detectChanges();
        });
      });
    });
  }

  private setDefaults() {
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

    this.date = now.toISOString().split('T')[0];
    this.wakeTime = now.toTimeString().slice(0, 5);
    this.sleepTime = eightHoursAgo.toTimeString().slice(0, 5);
  }

  async addEntry() {
    const user = this.auth.currentUser;
    if (!user || !this.date || !this.sleepTime || !this.wakeTime) return;

    this.loading = true;
    const duration = this.calculateDuration(this.sleepTime, this.wakeTime);

    try {
      await addDoc(
        collection(this.db, 'users', user.uid, 'sleepEntries'),
        {
          date: this.date,
          sleepTime: this.sleepTime,
          wakeTime: this.wakeTime,
          duration,
          quality: this.quality,
          notes: this.notes,
          createdAt: new Date()
        }
      );
      this.resetForm();
      this.setDefaults();
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      this.loading = false;
    }
  }

  calculateDuration(start: string, end: string): number {
    const startDate = new Date(`1970-01-01T${start}`);
    let endDate = new Date(`1970-01-01T${end}`);

    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diff = (endDate.getTime() - startDate.getTime()) / 3600000;
    return Math.round(diff * 10) / 10;
  }

  get averageSleep(): number {
    if (!this.entries.length) return 0;
    const total = this.entries.reduce((s, e) => s + e.duration, 0);
    return Math.round((total / this.entries.length) * 10) / 10;
  }

  get sleepBalance(): number {
    if (!this.entries.length) return 0;
    return Math.round((this.averageSleep - 8) * 10) / 10;
  }

  get sleepBalanceInfo(): string {
    if (this.sleepBalance < 0) {
      return 'Manjak sna može dovesti do umora, slabije koncentracije, pada imuniteta i povećanog stresa.';
    }

    if (this.sleepBalance > 0) {
      return 'Previše sna može uzrokovati tromost, glavobolje, poremećaj ritma spavanja i smanjenu energiju.';
    }

    return 'Optimalna količina sna. Tvoje tijelo se pravilno oporavlja.';
  }

  resetForm() {
    this.notes = '';
  }

  async remove(id: string | undefined) {
    const user = this.auth.currentUser;
    if (!id || !user) return;

    try {
      await deleteDoc(
        doc(this.db, 'users', user.uid, 'sleepEntries', id)
      );
    } catch (error) {
      console.error('Error removing entry:', error);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.unsubscribe) this.unsubscribe();
  }
}