import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeBs from '@angular/common/locales/bs';
import { HomeComponent } from './app/home.component';
import { LoginComponent } from './app/login.component';
import { RegisterComponent } from './app/register.component';
import { FinanceComponent } from './app/finance/finance.component';
import { GratitudeComponent } from './app/gratitude/gratitude.component';
import { MealPlannerComponent } from './app/meal/meal-planner.component';
import { SleepTrackerComponent } from './app/sleep/sleep-tracker.component';
import { HabitTrackerComponent } from './app/habit/habit-tracker.component';
import { StudyPlannerComponent } from './app/study/study-planner.component';
import { MoodTrackerComponent } from './app/mood/mood-tracker.component';
import { DashboardComponent } from './app/dashboard/dashboard';
import { QuizComponent } from './app/quiz.component';
import { BingoComponent } from './app/bingo.component';


registerLocaleData(localeBs);

bootstrapApplication(App, {
  providers: [
    provideRouter([
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {path: 'dashboard', component: DashboardComponent},
      { path: 'finance', component: FinanceComponent},
      {path: 'gratitude', component: GratitudeComponent},
      {path: 'meals', component: MealPlannerComponent},
      {path: 'sleep', component: SleepTrackerComponent},
      {path: 'habits', component: HabitTrackerComponent},
      {path: 'study', component: StudyPlannerComponent},
      {path: 'mood', component: MoodTrackerComponent},
      {path: 'quiz', component: QuizComponent},
      { path: 'bingo', component: BingoComponent }
    ]),
    { provide: LOCALE_ID, useValue: 'bs-BA' }
  ]
}).catch(err => console.error(err));
