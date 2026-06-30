# 🏥 Arztpraxis Dashboard

Ein modernes, KI-gestütztes Dashboard zur Visualisierung von Terminauslastung und Praxiskennzahlen für eine Arztpraxis.  
Die Anwendung basiert auf synthetischen Termindaten und wurde im Rahmen einer Vibe-Coding-Aufgabe entwickelt.

---

## 📌 Projektziel

Ziel dieses Projekts ist es, medizinische Termindaten in eine klare, visuelle und schnell erfassbare Übersicht zu transformieren.

Das Dashboard soll es einer Arztpraxis ermöglichen, innerhalb weniger Sekunden wichtige Kennzahlen zu erkennen, darunter:

- Terminauslastung über die Woche
- No-Show-Rate
- Verteilung von Behandlungsarten
- Trends und Muster im Terminaufkommen

---

## 🚀 Live Demo

https://praxisdahsboard.netlify.app

---

## 🧠 Konzept & Idee

Das Dashboard wurde bewusst so gestaltet, dass keine Einzeldaten im Vordergrund stehen, sondern aggregierte Kennzahlen.

Der Fokus liegt auf:

- schneller Entscheidungsfindung im Praxisalltag
- klarer Visualisierung von Trends
- Reduktion auf die wichtigsten KPIs

---

## 📊 Features

- 📅 Visualisierung von Terminen pro Tag und Woche
- ❌ No-Show-Analyse und Darstellung der Quote
- 🧾 Übersicht der häufigsten Behandlungsarten
- 📈 KPI-Karten für schnelle Übersicht
- 📊 Diagramme zur Trendanalyse
- 🎯 Fokus auf einfache und intuitive Bedienung

---

## 🤖 KI-gestützter Entwicklungsprozess

Dieses Projekt wurde bewusst mit modernen KI-Tools entwickelt, um einen realistischen Arbeitsworkflow abzubilden.

### Eingesetzte Tools

- Lovable (UI-Generierung & Grundstruktur)
- ChatGPT (Konzept, Kennzahlen, Validierung sowie technische Unterstützung)

### Vorgehen

- Analyse der bereitgestellten JSON-Datei und der enthaltenen Datenstruktur
- Definition sinnvoller Kennzahlen aus Sicht einer Arztpraxis
- Erstellung einer ersten Dashboard-Struktur mit Lovable
- Schrittweise Erweiterung der Visualisierungen und KPIs
- Kritische Prüfung und Anpassung aller KI-generierten Inhalte
- Eigenständige Entscheidung über KPIs, Layout und Datenstruktur
- Lokales Testen der Anwendung
- Erstellung eines Produktions-Builds
- Anpassung der Build- und Deployment-Konfiguration
- Veröffentlichung des Projekts über GitHub und Netlify

Die KI wurde dabei bewusst als **Entwicklungswerkzeug** eingesetzt und nicht als vollständige Lösung. Architektur, Kennzahlen, Layout sowie finale Entscheidungen wurden eigenständig getroffen.

---

## 🧩 Annahmen

- Auslastung wird als Anzahl der Termine pro Tag bzw. Woche interpretiert
- No-Shows werden separat betrachtet, da sie für die Planung besonders relevant sind
- Fokus liegt auf aggregierten Kennzahlen statt Einzeldaten

---

## ⚖️ Trade-offs

Aufgrund des begrenzten Zeitrahmens wurden folgende bewusste Entscheidungen getroffen:

- kein Backend implementiert
- keine Benutzer- oder Rechteverwaltung
- keine komplexen Filtermechanismen
- Fokus auf Frontend und Datenvisualisierung

Ziel war eine klare, funktionale und verständliche Lösung innerhalb kurzer Entwicklungszeit.

---

## 🔍 Eigene Anpassungen

Neben der von der KI generierten Grundstruktur wurden verschiedene Bereiche bewusst selbst angepasst und erweitert.

Dazu gehörten unter anderem:

- Auswahl und Optimierung der Diagrammtypen
- Erweiterung der KPI-Karten
- Verbesserung der Dashboard-Struktur
- Anpassung von Texten und Beschriftungen
- Lokales Testen und Beheben kleinerer Fehler
- Erstellung der Produktions-Builds
- Eigenständige Anpassung der Build- und Deployment-Konfiguration für Netlify

Dadurch entstand nicht lediglich eine KI-generierte Anwendung, sondern ein aktiv weiterentwickeltes und überarbeitetes Dashboard.

---

## 🔧 Tech Stack

- React
- TypeScript
- Recharts
- Tailwind CSS
- Lovable (KI-gestützte Entwicklung)
- ChatGPT
- JSON-basierte Datenquelle
- Netlify (Deployment)

---

## ▶️ Lokales Setup

```bash
npm install
npm run dev
```

Anschließend ist die Anwendung unter der von Vite ausgegebenen lokalen Adresse erreichbar.

Für einen Produktions-Build:

```bash
npm run build
```

---

## 🌐 Deployment

Nach erfolgreichem Testen der Anwendung wurde ein Produktions-Build erstellt.

Der Quellcode wurde anschließend in ein GitHub-Repository übertragen und über Netlify veröffentlicht.

Da das von Lovable erzeugte Projekt nicht direkt mit der Standardkonfiguration von Netlify kompatibel war, wurde die Build- und Publish-Konfiguration entsprechend angepasst, sodass die Anwendung erfolgreich deployed werden konnte.

---

## 🔐 Datenschutz

Für dieses Projekt wurden ausschließlich synthetische Beispieldaten verwendet.

Für eine produktive Anwendung würde ich personenbezogene Patientendaten nicht direkt im Frontend verarbeiten. Stattdessen würde ein Backend ausschließlich aggregierte und anonymisierte Kennzahlen bereitstellen. Dadurch würden keine sensiblen Gesundheitsdaten im Browser verarbeitet und datenschutzrechtliche Anforderungen besser berücksichtigt.

---

## 💡 Learnings

Während der Umsetzung konnte ich den kompletten Entwicklungsprozess begleiten – von der Analyse der Daten über die KI-gestützte Entwicklung bis hin zum erfolgreichen Deployment.

Besonders interessant war für mich die Kombination aus eigenständigen Architekturentscheidungen und der Unterstützung durch KI. Dabei hat sich gezeigt, dass KI den Entwicklungsprozess deutlich beschleunigen kann, die Verantwortung für technische Entscheidungen, Code-Qualität und Problemlösung jedoch weiterhin beim Entwickler liegt.
