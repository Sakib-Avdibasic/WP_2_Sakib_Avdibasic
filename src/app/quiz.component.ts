import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ThemeQuiz {
  title: string;
  questions: Question[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page quiz" [ngClass]="currentTheme">
      <a routerLink="/dashboard" class="back-link">← Nazad na kontrolnu tablu</a>
      <h1>{{ quizData.title }}</h1>

      <div class="quiz-container" *ngIf="!quizCompleted">
        <div class="progress">
          <div class="progress-bar" [style.width.%]="(currentQuestion / totalQuestions) * 100"></div>
        </div>
        
        <p class="question-counter">Pitanje {{ currentQuestion + 1 }} od {{ totalQuestions }}</p>

        <div class="question-card">
          <h2>{{ quizData.questions[currentQuestion].question }}</h2>

          <div class="options">
            <button 
              *ngFor="let option of quizData.questions[currentQuestion].options; let i = index"
              class="option"
              [class.selected]="!showResult && selectedAnswer === i"
              [class.correct]="showResult && i === quizData.questions[currentQuestion].correctAnswer"
              [class.wrong]="showResult && selectedAnswer === i && i !== quizData.questions[currentQuestion].correctAnswer"
              (click)="selectAnswer(i)"
              [disabled]="showResult">
              {{ option }}
            </button>
          </div>

          <div class="actions">
            <button 
              *ngIf="!showResult" 
              class="primary" 
              [disabled]="selectedAnswer === null"
              (click)="checkAnswer()">
              Potvrdi odgovor
            </button>
            <button 
              *ngIf="showResult && currentQuestion < totalQuestions - 1" 
              class="primary" 
              (click)="nextQuestion()">
              Sljedeće pitanje
            </button>
            <button 
              *ngIf="showResult && currentQuestion === totalQuestions - 1" 
              class="primary" 
              (click)="finishQuiz()">
              Završi kviz
            </button>
          </div>
        </div>
      </div>

      <div class="results" *ngIf="quizCompleted">
        <div class="results-card">
          <h2>Rezultati kviza</h2>
          <div class="score">
            <span class="score-number">{{ correctAnswers }}/{{ totalQuestions }}</span>
            <span class="score-percentage">{{ getPercentage() }}%</span>
          </div>
          
          <p class="score-message">{{ getScoreMessage() }}</p>

          <div class="actions">
            <button class="primary" (click)="restartQuiz()">Ponovi kviz</button>
            <button class="secondary" routerLink="/dashboard">Nazad na dashboard</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .quiz {
      min-height: 100vh;
      padding: 2rem;
      background: transparent;
      margin: 0 auto;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: var(--color-muted);
      text-decoration: none;
      transition: color 0.3s;
      font-weight: 500;
    }

    .back-link:hover {
      color: var(--color-primary);
    }

    h1 {
      margin-bottom: 2rem;
      text-align: center;
      color: var(--color-text);
      font-size: 2rem;
    }

    .quiz-container {
      max-width: 700px;
      margin: 0 auto;
      background: var(--color-surface);
      border-radius: var(--radius);
      padding: 2rem;
      box-shadow: var(--shadow);
    }

    .progress {
      height: 10px;
      background: var(--color-bg);
      border-radius: calc(var(--radius) / 2);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
      transition: width 0.4s ease;
    }

    .question-counter {
      text-align: center;
      color: var(--color-muted);
      margin-bottom: 2rem;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .question-card h2 {
      font-size: 1.4rem;
      margin-bottom: 2rem;
      color: var(--color-text);
      line-height: 1.5;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .option {
      padding: 1.2rem 1.5rem;
      border: 2px solid var(--input-border);
      border-radius: var(--radius);
      background: var(--color-bg);
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.3s;
      text-align: left;
      font-size: 1rem;
      font-weight: 500;
    }

    .option:hover:not(:disabled) {
      border-color: var(--color-primary);
      background: var(--color-surface);
      transform: translateY(-2px);
      box-shadow: var(--shadow);
    }

    .option.selected {
      border-color: var(--color-primary);
      background: var(--color-surface);
      box-shadow: 0 0 0 3px var(--input-focus-shadow);
    }

    .option.correct {
      border-color: #22c55e !important;
      background: #22c55e !important;
      color: white !important;
      font-weight: 700 !important;
    }

    .option.wrong {
      border-color: #ef4444 !important;
      background: #ef4444 !important;
      color: white !important;
      font-weight: 700 !important;
    }

    .option:disabled {
      cursor: not-allowed;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    button.primary {
      padding: 0.9rem 2.5rem;
      background: var(--color-primary);
      color: var(--color-bg);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: var(--shadow);
    }

    button.primary:hover:not(:disabled) {
      background: var(--color-primary-light);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }

    button.primary:disabled {
      background: var(--color-muted);
      cursor: not-allowed;
      opacity: 0.5;
    }

    button.secondary {
      padding: 0.9rem 2.5rem;
      background: transparent;
      color: var(--color-primary);
      border: 2px solid var(--color-primary);
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    button.secondary:hover {
      background: var(--color-primary);
      color: var(--color-bg);
      transform: translateY(-2px);
    }

    .results {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
    }

    .results-card {
      background: var(--color-surface);
      border-radius: var(--radius);
      padding: 3rem;
      box-shadow: var(--shadow);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .results-card h2 {
      margin-bottom: 2rem;
      color: var(--color-text);
      font-size: 2rem;
    }

    .score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 2rem;
      background: var(--color-bg);
      border-radius: var(--radius);
    }

    .score-number {
      font-size: 3.5rem;
      font-weight: bold;
      color: var(--color-primary);
    }

    .score-percentage {
      font-size: 1.8rem;
      color: var(--color-accent);
      font-weight: 600;
    }

    .score-message {
      font-size: 1.3rem;
      color: var(--color-text);
      margin-bottom: 2rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .quiz {
        padding: 1rem;
      }

      .quiz-container,
      .results-card {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .question-card h2 {
        font-size: 1.2rem;
      }

      .option {
        padding: 1rem;
        font-size: 0.95rem;
      }

      .score-number {
        font-size: 2.5rem;
      }

      .score-percentage {
        font-size: 1.3rem;
      }
    }
  `]
})
export class QuizComponent implements OnInit, OnDestroy {
  currentTheme = 'default';
  quizData!: ThemeQuiz;
  currentQuestion = 0;
  totalQuestions = 5;
  selectedAnswer: number | null = null;
  showResult = false;
  correctAnswers = 0;
  quizCompleted = false;
  
  private sub!: Subscription;

  quizzes: Record<string, ThemeQuiz> = {
    default: {
      title: 'Kviz o web developmentu',
      questions: [
        {
          question: 'Šta znači HTML?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Home Tool Markup Language',
            'Hyperlinks and Text Markup Language'
          ],
          correctAnswer: 0
        },
        {
          question: 'Koji CSS property se koristi za promjenu boje teksta?',
          options: ['text-color', 'font-color', 'color', 'text-style'],
          correctAnswer: 2
        },
        {
          question: 'Koja metoda se koristi za selektovanje elementa po ID-u u JavaScript-u?',
          options: [
            'getElementById()',
            'getElementByClass()',
            'querySelector()',
            'selectElement()'
          ],
          correctAnswer: 0
        },
        {
          question: 'Šta je Bootstrap?',
          options: [
            'JavaScript biblioteka',
            'CSS framework',
            'Programski jezik',
            'Baza podataka'
          ],
          correctAnswer: 1
        },
        {
          question: 'Koja verzija HTML-a se trenutno najčešće koristi?',
          options: ['HTML4', 'HTML5', 'HTML6', 'XHTML'],
          correctAnswer: 1
        }
      ]
    },
    gotham: {
      title: 'Kviz o Gothamu',
      questions: [
        {
          question: 'Koje je Batmanovo pravo ime?',
          options: ['Clark Kent', 'Bruce Wayne', 'Tony Stark', 'Peter Parker'],
          correctAnswer: 1
        },
        {
          question: 'Koji režiser nikad nije režirao Batman film?',
          options: ['Christopher Nolan', 'David Fincher', 'Matt Reeves', 'Tim Burton'],
          correctAnswer: 1
        },
        {
          question: 'Kako se preziva Batmanov batler?',
          options: ['Dent', 'Gordon', 'Pennyworth', 'Fox'],
          correctAnswer: 2
        },
        {
          question: 'Koji glumac nikad nije glumio Jokera?',
          options: ['Jack Nicholson', 'Mark Hamill', 'Bill Skarsgård', 'Heath Ledger'],
          correctAnswer: 2
        },
        {
          question: 'Kako se zove kćerka detektiva Jamesa Gordona?',
          options: [
            'Harley',
            'Selina',
            'Barbara',
            'Talia'
          ],
          correctAnswer: 2
        }
      ]
    },
    atlantis: {
      title: 'Kviz o Atlantidi',
      questions: [
        {
          question: 'Ko je prvi opisao Atlantidu?',
          options: ['Homer', 'Platon', 'Aristotel', 'Sokrat'],
          correctAnswer: 1
        },
        {
          question: 'U kom oceanu se, prema legendi, nalazila Atlantida?',
          options: [
            'Indijski okean',
            'Tihi okean',
            'Atlantski okean',
            'Arktički okean'
          ],
          correctAnswer: 2
        },
        {
          question: 'Koji bog je, prema mitu, stvorio Atlantidu?',
          options: ['Zeus', 'Posejdon', 'Hades', 'Apollo'],
          correctAnswer: 1
        },
        {
          question: 'Šta je uzrokovalo nestanak Atlantide prema legendi?',
          options: [
            'Rat',
            'Bolest',
            'Zemljotres i poplava',
            'Meteorit'
          ],
          correctAnswer: 2
        },
        {
          question: 'U kom djelu je Platon pisao o Atlantidi?',
          options: ['Država', 'Timaj i Kritija', 'Fedra', 'Simpozij'],
          correctAnswer: 1
        }
      ]
    },
    troy: {
      title: 'Kviz o Troji',
      questions: [
        {
          question: 'Koliko dugo je trajao Trojanski rat?',
          options: ['5 godina', '10 godina', '15 godina', '20 godina'],
          correctAnswer: 1
        },
        {
          question: 'Ko je bio najpoznatiji trojanski junak?',
          options: ['Ahilej', 'Hektor', 'Odisej', 'Agamemnon'],
          correctAnswer: 1
        },
        {
          question: 'Šta je bio razlog Trojanskog rata?',
          options: [
            'Osvajanje zemlje',
            'Otmica Helene',
            'Osveta',
            'Zlato'
          ],
          correctAnswer: 1
        },
        {
          question: 'Ko je napisao "Ilijadu"?',
          options: ['Homer', 'Vergilije', 'Sofokle', 'Euripid'],
          correctAnswer: 0
        },
        {
          question: 'Kako su Grci konačno osvojili Troju?',
          options: [
            'Pomoću opsade',
            'Pomoću Trojanskog konja',
            'Izdajom',
            'Direktnim napadom'
          ],
          correctAnswer: 1
        }
      ]
    }
  };

  constructor(@Inject(AuthService) private auth: AuthService) {}

  ngOnInit() {
    this.sub = this.auth.user$.subscribe(user => {
      if (user) {
        this.currentTheme = user.theme || 'default';
        this.quizData = this.quizzes[this.currentTheme];
      }
    });
  }

  selectAnswer(index: number) {
    if (!this.showResult) {
      this.selectedAnswer = index;
    }
  }

  checkAnswer() {
    this.showResult = true;
    if (this.selectedAnswer === this.quizData.questions[this.currentQuestion].correctAnswer) {
      this.correctAnswers++;
    }
  }

  nextQuestion() {
    this.currentQuestion++;
    this.selectedAnswer = null;
    this.showResult = false;
  }

  finishQuiz() {
    this.quizCompleted = true;
  }

  restartQuiz() {
    this.currentQuestion = 0;
    this.selectedAnswer = null;
    this.showResult = false;
    this.correctAnswers = 0;
    this.quizCompleted = false;
  }

  getPercentage(): number {
    return Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }

  getScoreMessage(): string {
    const percentage = this.getPercentage();
    if (percentage === 100) return 'Savršeno! Odličan rezultat! 🎉';
    if (percentage >= 80) return 'Izvrsno! Vrlo dobar rezultat! 👏';
    if (percentage >= 60) return 'Dobro! Ima prostora za napredak. 👍';
    if (percentage >= 40) return 'Može bolje. Pokušaj ponovo! 💪';
    return 'Trebalo bi još učiti. Probaj ponovo! 📚';
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}