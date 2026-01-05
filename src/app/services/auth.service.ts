import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { auth, firestore } from '../../firebase';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  theme: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<UserData | null>(null);
  user$ = this.userSubject.asObservable();

  private initializedSubject = new BehaviorSubject<boolean>(false);
  initialized$ = this.initializedSubject.asObservable();

  get currentUser(): UserData | null {
    return this.userSubject.value;
  }

  constructor() {
    console.log('AuthService constructor - setting up listener');
    
    const timeoutId = setTimeout(() => {
      if (!this.initializedSubject.value) {
        console.warn('Firebase auth timeout - initializing anyway');
        this.initializedSubject.next(true);
      }
    }, 3000);

    onAuthStateChanged(auth, async fbUser => {
      console.log('Auth state changed:', fbUser?.uid || 'null');
      clearTimeout(timeoutId);

      if (!fbUser) {
        this.userSubject.next(null);
        this.initializedSubject.next(true);
        return;
      }

      try {
        const snap = await getDoc(doc(firestore, 'users', fbUser.uid));
        const userData = snap.exists()
          ? { uid: fbUser.uid, ...snap.data() } as UserData
          : { uid: fbUser.uid, name: '', email: fbUser.email || '', theme: 'default' };

        this.userSubject.next(userData);
        this.initializedSubject.next(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.userSubject.next(null);
        this.initializedSubject.next(true);
      }
    }, (error) => {
      console.error('Auth state change error:', error);
      clearTimeout(timeoutId);
      this.initializedSubject.next(true);
    });
  }

  async register(data: { name: string; email: string; password: string; theme: string }) {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await setDoc(doc(firestore, 'users', cred.user.uid), {
      name: data.name,
      email: data.email,
      theme: data.theme
    });
    this.userSubject.next({ uid: cred.user.uid, name: data.name, email: data.email, theme: data.theme });
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(firestore, 'users', cred.user.uid));
    const userData: UserData = snap.exists()
      ? { uid: cred.user.uid, ...snap.data() } as UserData
      : { uid: cred.user.uid, name: '', email: cred.user.email || '', theme: 'default' };
    this.userSubject.next(userData);
  }

  async logout() {
    await signOut(auth);
    this.userSubject.next(null);
  }
}