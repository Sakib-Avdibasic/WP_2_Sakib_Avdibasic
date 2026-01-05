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
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore';

type Emotion =
  | 'sretno'
  | 'smireno'
  | 'tužno'
  | 'ljuto'
  | 'anksiozno'
  | 'motivisano';

interface MoodEntry {
  id: string;
  date: string;
  emotion: Emotion;
  note: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-mood-tracker',
  templateUrl: './mood-tracker.component.html',
  styleUrls: ['./mood-tracker.component.scss']
})
export class MoodTrackerComponent implements OnInit, OnDestroy {
  currentTheme = 'default';

  emotion: Emotion | '' = '';
  note = '';
  entries: MoodEntry[] = [];

  readonly emotions: Emotion[] = [
    'sretno',
    'smireno',
    'tužno',
    'ljuto',
    'anksiozno',
    'motivisano'
  ];

  quotes: Record<Emotion, string[]> = {
    sretno: [
      'Sreća zavisi od nas samih. — Aristotel',
      'Radost je znak razuma u ravnoteži. — Epikur'
    ],
    smireno: [
      'Mir dolazi iznutra. Ne traži ga izvana. — Buda',
      'Najveća pobjeda je nad samim sobom. — Platon'
    ],
    tužno: [
      'Ništa ljudsko nije trajno. — Heraklit',
      'Bol je učitelj, ne neprijatelj. — Seneka'
    ],
    ljuto: [
      'Ljutnja je kratko ludilo. — Horacije',
      'Onaj ko vlada sobom jači je od onoga ko osvaja gradove. — Aristotel'
    ],
    anksiozno: [
      'Ne muče nas stvari, već naše mišljenje o njima. — Epiktet',
      'Strah dolazi iz neznanja. — Platon'
    ],
    motivisano: [
      'Početak je najvažniji dio svakog posla. — Platon',
      'Postani ono što jesi. — Pindar'
    ]
  };

  activeQuote = '';

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

      const ref = collection(this.db, 'users', user.uid, 'moodEntries');

      this.unsubscribe = onSnapshot(ref, snap => {
        this.zone.run(() => {
          this.entries = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<MoodEntry, 'id'>)
          }));

          this.cdr.detectChanges();
        });
      });
    });
  }

  selectEmotion(e: Emotion) {
    this.emotion = e;
    const list = this.quotes[e];
    this.activeQuote = list[Math.floor(Math.random() * list.length)];
  }

  saveEntry() {
    const user = this.auth.currentUser;
    if (!user || !this.emotion) return;

    addDoc(
      collection(this.db, 'users', user.uid, 'moodEntries'),
      {
        date: new Date().toLocaleDateString(),
        emotion: this.emotion,
        note: this.note.trim()
      }
    );

    this.emotion = '';
    this.note = '';
    this.activeQuote = '';
  }

  removeEntry(id: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    deleteDoc(
      doc(this.db, 'users', user.uid, 'moodEntries', id)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.unsubscribe) this.unsubscribe();
  }
}
