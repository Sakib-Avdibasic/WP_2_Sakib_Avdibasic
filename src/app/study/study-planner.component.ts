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
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  completed: boolean;
}

@Component({
  standalone: true,
  selector: 'app-study-planner',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './study-planner.component.html',
  styleUrls: ['./study-planner.component.scss']
})
export class StudyPlannerComponent implements OnInit, OnDestroy {
  currentTheme = 'default';

  subject = '';
  topic = '';
  duration = 60;

  tasks: StudyTask[] = [];

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

      const ref = collection(this.db, 'users', user.uid, 'studyTasks');

      this.unsubscribe = onSnapshot(ref, snap => {
        this.zone.run(() => {
          this.tasks = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<StudyTask, 'id'>)
          }));

          this.cdr.detectChanges();
        });
      });
    });
  }

  addTask() {
    const user = this.auth.currentUser;
    if (!user || !this.subject.trim() || !this.topic.trim()) return;

    addDoc(
      collection(this.db, 'users', user.uid, 'studyTasks'),
      {
        subject: this.subject.trim(),
        topic: this.topic.trim(),
        duration: this.duration,
        completed: false
      }
    );

    this.subject = '';
    this.topic = '';
    this.duration = 60;
  }

  toggle(task: StudyTask) {
    const user = this.auth.currentUser;
    if (!user) return;

    updateDoc(
      doc(this.db, 'users', user.uid, 'studyTasks', task.id),
      { completed: !task.completed }
    );
  }

  remove(id: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    deleteDoc(
      doc(this.db, 'users', user.uid, 'studyTasks', id)
    );
  }

  get totalMinutes() {
    return this.tasks.reduce((s, t) => s + t.duration, 0);
  }

  get completedMinutes() {
    return this.tasks
      .filter(t => t.completed)
      .reduce((s, t) => s + t.duration, 0);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (this.unsubscribe) this.unsubscribe();
  }
}
