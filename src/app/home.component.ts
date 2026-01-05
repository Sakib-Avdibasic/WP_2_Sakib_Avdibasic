import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page home">
      <h1>Dobrodošli na Internacionalnu poslovno-informacionu akademiju</h1>
      <p>
        Vaša platforma za akademski razvoj, upravljanje zadacima i lični napredak.
        Pristupite svom profilu, pratite napredak i organizujte svoje aktivnosti elegantno i intuitivno.
      </p>

      <div class="tabs-container">
        <div class="tabs">
          <button *ngFor="let tab of tabs; let i = index"
                  (click)="selectedTab = i"
                  [class.active]="selectedTab === i">
            {{ tab.label }}
          </button>
        </div>

        <div class="tab-content">
          <ng-container [ngSwitch]="selectedTab">

            <article *ngSwitchCase="0" class="tab-panel">
              <h2>O kursevima</h2>
              <img src="https://raw.githubusercontent.com/Sakib-Avdibasic/WP_1_Sakib_Avdibasic/refs/heads/main/slike/tecajevi1.png" alt="Kursevi IPI">
              <p><a href="http://ipi-akademija.ba/" target="_blank">IPI akademija</a> više od pet godina održava stručne kurseve iz područja ICT-a.</p>
              <p><strong>Kursevi IPI</strong> namijenjeni su svima zainteresiranima za stjecanje osnovnih znanja o upotrebi informacijsko-komunikacijskih tehnologija.</p>
              <p>Kursevi su podijeljeni u nekoliko skupina:
                <ul>
                  <li>kursevi iz osnova upotrebe računara i <a href="http://hr.wikipedia.org/wiki/Internet" target="_blank">Interneta</a></li>
                  <li>kursevi o <em>web</em>-tehnologijama, izradi <em>web</em>-stranica i <em>web</em>-sjedišta</li>
                  <li>kursevi o informatičkoj sigurnosti</li>
                  <li>uvodni kursevi o <a href="http://www.linux.com" target="_blank">Linuxu</a> i drugi.</li>
                </ul>
              <p>Kursevi se održavaju u moderno opremljenim, klimatiziranim učionicama veličine 50m<sup>2</sup>.</p>
              <p>Na osnovne kurseve mogu se prijaviti svi zainteresirani polaznici. Posebne pogodnosti osigurane su za članove akademske zajednice i nezaposlene.</p>
            </article>

            <article *ngSwitchCase="1" class="tab-panel">
              <h2>Popis kurseva</h2>
              <img src="https://raw.githubusercontent.com/Sakib-Avdibasic/WP_1_Sakib_Avdibasic/refs/heads/main/slike/tecajevi3.jpg" alt="Kursevi IPI" />
              <h3>Kursevi o osnovama upotrebe računara i Interneta</h3>
              <ol>
                <li>Osnove računala (Windows)</li>
                <li>Osnove komunikacija (Internet Explorer, Microsoft Outlook)</li>
                <li>Obrada teksta (Word)</li>
                <li>Proračunske tablice (Excel)</li>
                <li>Uporaba baza podataka (Access)</li>
                <li>Prezentacije (PowerPoint)</li>
                <li>IT sigurnost</li>
                <li>Online suradnja</li>
              </ol>
              <h3>Tečajevi o <em>web</em>-tehnologijama, izradi <em>web</em>-stranica i <em>web</em>-sjedišta</h3>
              <ol start="9">
                <li>Uvod u HTML</li>
                <li>Uvod u CSS</li>
                <li>Osnove JavaScripta</li>
                <li>Uvod u XML</li>
              </ol>
            </article>

            <article *ngSwitchCase="2" class="tab-panel">
              <h2>Raspored kurseva</h2>
              <p>Objavljen je raspored kurseva za juni.</p>
              <img src="https://raw.githubusercontent.com/Sakib-Avdibasic/WP_1_Sakib_Avdibasic/refs/heads/main/slike/tecajevi2.jpg" alt="Tečajevi Srca" />
              <table>
                <tr>
                  <th>Kurs</th><th>Šifra</th><th>Početak</th><th>Sat</th><th>Trajanje</th><th>Učionica</th>
                </tr>
                <tr>
                  <td>Uporaba baza podataka (Access)</td><td>E504</td><td>Ponedjeljak, 15.09.2014.</td><td>09:00</td><td>4 x 4</td><td>Srce-A</td>
                </tr>
                <tr>
                  <td>Obrada teksta (Word)</td><td>E304</td><td>Ponedjeljak, 15.09.2014.</td><td>17:30</td><td>4 x 4</td><td>Srce-B</td>
                </tr>
                <tr>
					<td>Wordionica ili kako oblikovati seminarski rad</td>
					<td>R100</td>
					<td>Četvrtak, 18.09.2014.</td>
					<td>09:00</td>
					<td>1 x 5</td>
					<td>Srce-E1</td>
				</tr>
				<tr>
					<td>Prezentacije (PowerPoint)</td>
					<td>E604</td>
					<td>Subota, 20.09.2014.</td>
					<td>09:00</td>
					<td>2 x 6</td>
					<td>Srce-B</td>
				</tr>
				<tr>
					<td>Proračunske tablice - napredna razina (Excel)</td>
					<td>E414</td>
					<td>Subota, 20.09.2014.</td>
					<td>09:00</td>
					<td>2 x 8</td>
					<td>Srce-B</td>
				</tr>
				<tr>
					<td>Baze podataka - napredna razina (Access)</td>
					<td>E514</td>
					<td>Ponedjeljak, 29.09.2014.</td>
					<td>09:00</td>
					<td>4 x 4</td>
					<td>Srce-A</td>
				</tr>
				<tr>
					<td>Exceliranje ili kako izraditi tablice, grafikone i formule</td>
					<td>R200</td>
					<td>Utorak, 30.09.2014.</td>
					<td>09:00</td>
					<td>1 x 5</td>
					<td>Srce-E1</td>
				</tr>
              </table>
            </article>

            <article *ngSwitchCase="3" class="tab-panel">
              <h2>Kontakt</h2>
              <img src="https://raw.githubusercontent.com/Sakib-Avdibasic/WP_1_Sakib_Avdibasic/refs/heads/main/slike/srce.jpg" alt="Srce" />
              <p>Do IPI-ja se može doći javnim gradskim prevozom ili taksijem.</p>
              <p>Naša adresa je:</p>
              <p>
                Sveučilišni računski centar<br>
                Kulina bana br. 2 (Skver)<br>
                Tuzla<br>
                75000<br>
                Bosna i Hercegovina<br>
                <a href="mailto:info@ipi-akademija.ba">info@ipi-akademija.ba</a>
                <br />
                <a href="tel:+387035258454">035 258-454</a>
              </p>
            </article>

          </ng-container>
        </div>
      </div>
      <div class="dashboard-link" *ngIf="isLoggedIn">
        <a routerLink="/dashboard">Nazad na kontrolnu tablu →</a>
      </div>
    </section>
  `,
  styles: [`
.page.home {
  max-width: 85em;
  margin: 0 auto;
  padding: 2em;
  font-family: "Segoe UI", sans-serif;
  color: var(--color-text);

}

.page.home h1 {
  font-size: 2.1em;
  margin-bottom: 0.6em;
  color: var(--color-primary);
}

.page.home > p {
  max-width: 65em;
  font-size: 1.05em;
  color: var(--color-muted);
}

.home p {
  text-align: left;
}

.tabs-container {
  margin-top: 2em;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 0.5em;
  padding: 0.6em;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.25),
    rgba(0,0,0,0.03)
  );
}

.tabs button {
  flex: 1;
  padding: 0.75em 1em;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  color: var(--color-muted);
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s,
    transform 0.15s;
}

.tabs button:hover:not(.active) {
  background: rgba(0,0,0,0.04);
  color: var(--color-text);
}

.tabs button.active {
  background: var(--color-bg);
  color: var(--color-primary);
  border-color: var(--input-border);
  box-shadow: 0 0.4em 1em rgba(0,0,0,0.15);
  transform: translateY(-0.08em);
}

.tab-content {
  padding: 2em;
  line-height: 1.65;
}

.tab-panel {
  animation: fadeIn 0.25s ease;
}

.tab-panel h2 {
  color: var(--color-primary);
  margin-bottom: 0.6em;
}

.tab-panel h3 {
  margin-top: 1.2em;
  color: var(--color-primary-light);
}

.tab-panel p {
  margin: 0.6em 0;
}

.tab-panel ul,
.tab-panel ol {
  padding-left: 1.4em;
}

.tab-panel li {
  margin: 0.35em 0;
}

.tab-panel img {
  max-width: 40%;
  float: right;
  margin: 0 0 1em 1.2em;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.tab-panel table {
  width: 100%;
  margin-top: 1em;
  border-collapse: collapse;
  background: var(--color-bg);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  overflow: hidden;
}

.tab-panel th,
.tab-panel td {
  padding: 0.7em;
  border-bottom: 1px solid var(--input-border);
  text-align: left;
}

.tab-panel th {
  background: rgba(0,0,0,0.04);
  color: var(--color-primary);
}

.tab-panel tr:hover td {
  background: rgba(0,0,0,0.03);
}

a {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

a:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(0.4em); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 48em) {
  .tabs {
    flex-direction: column;
  }

  .tab-panel img {
    float: none;
    max-width: 100%;
    margin: 1em 0;
  }
}
.dashboard-link {
  position: fixed;
  bottom: 2em;
  right: 2em;
  z-index: 100;

  a {
    display: inline-block;
    padding: 0.8em 1.5em;
    background: var(--color-text);
    color: var(--color-bg);
    border-radius: var(--radius);
    font-weight: 600;
    box-shadow: var(--shadow-lg);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--color-bg);
      color: var(--color-text);
      text-decoration: none;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }
  }
}

@media (max-width: 48em) {
  .dashboard-link {
    bottom: 1em;
    right: 1em;

    a {
      padding: 0.6em 1em;
      font-size: 0.9em;
    }
  }
}
`]
})
  export class HomeComponent implements OnInit {
  selectedTab = 0;
  isLoggedIn = false;

  tabs = [
    { label: 'O kursevima' },
    { label: 'Popis kurseva' },
    { label: 'Raspored kurseva' },
    { label: 'Kontakt' }
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() {
 this.auth.user$.subscribe(user => {
    this.isLoggedIn = !!user;
  });  }
}

