import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface Transaction {
  id?: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss']
})
export class FinanceComponent implements OnInit, OnDestroy {
  currentTheme = 'default';
  transactions: Transaction[] = [];

  name = '';
  amount = 0;
  type: 'income' | 'expense' = 'expense';

  sub!: Subscription;
  unsubscribe?: () => void;

  db = getFirestore();

  constructor(private auth: AuthService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.sub = this.auth.user$.subscribe(user => {
      if (!user) return;

      this.currentTheme = user.theme || 'default';

      if (this.unsubscribe) this.unsubscribe();

      const ref = collection(this.db, 'users', user.uid, 'transactions');

      this.unsubscribe = onSnapshot(ref, snap => {
        this.zone.run(() => {
          this.transactions = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<Transaction, 'id'>)
          }));
          this.cdr.detectChanges();
        });
      });
    });
  }

  addTransaction() {
    const user = this.auth.currentUser;
    if (!user || !this.name || !this.amount) return;

    addDoc(collection(this.db, 'users', user.uid, 'transactions'), {
      name: this.name,
      amount: this.type === 'expense' ? -Math.abs(this.amount) : Math.abs(this.amount),
      type: this.type
    });

    this.name = '';
    this.amount = 0;
    this.type = 'expense';
  }

  remove(id?: string) {
    const user = this.auth.currentUser;
    if (!user || !id) return;

    deleteDoc(doc(this.db, 'users', user.uid, 'transactions', id));
  }

  get total() {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  get income() {
    return this.transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  }

  get expenses() {
    return this.transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.unsubscribe) this.unsubscribe();
  }
}
