# 🏥 Doctor Practice Dashboard

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

[https://praxisdahsboard.netlify.app](https://praxisdahsboard.netlify.app)

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

### Eingesetzte Tools:
- Lovable (UI-Generierung & Grundstruktur)
- ChatGPT (Konzept, Kennzahlen, Validierung)

### Vorgehen:
- Erstellung einer ersten Dashboard-Struktur mit KI-Unterstützung
- Iterative Verbesserung der Visualisierungen
- Kritische Prüfung und Anpassung aller KI-generierten Inhalte
- Eigenständige Entscheidung über KPIs, Layout und Datenstruktur

KI wurde dabei als **Entwicklungswerkzeug**, nicht als vollständige Lösung genutzt.

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

## 🔧 Tech Stack

- React
- TypeScript
- Charting Library (z. B. Recharts)
- Lovable (KI-gestützte Entwicklung)
- JSON-basierte Datenquelle

---

## ▶️ Lokales Setup

```bash
npm install
npm run dev
