import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { FinanceComponent } from './finance/finance.component';
import { GratitudeComponent } from './gratitude/gratitude.component';
import { MealPlannerComponent } from './meal/meal-planner.component';
import { SleepTrackerComponent } from './sleep/sleep-tracker.component';
import { HabitTrackerComponent } from './habit/habit-tracker.component';
import { StudyPlannerComponent } from './study/study-planner.component';
import { MoodTrackerComponent } from './mood/mood-tracker.component';
import { DashboardComponent } from './dashboard/dashboard';
import { QuizComponent } from './quiz.component';
import { BingoComponent } from './bingo.component';

export const routes: Routes = [
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
  {path: 'mood', component: QuizComponent},
  {path: 'bingo', component: BingoComponent}
];
