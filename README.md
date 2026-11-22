# Woyzeck · Montagewerkstatt

Offene Lernumgebung zu Georg Büchners *Woyzeck*. Die Lernenden entwickeln eine Frage, entwerfen eine eigene Szenenfolge, prüfen sie an Textbelegen und Gegenperspektiven und überarbeiten ihre Deutung.

## Didaktischer Aufbau

- **Frage entwickeln:** eigene Forschungsfrage und erste Vermutung; drei optionale Anstösse.
- **Fassung bauen:** kompakte Szenenkarten neben der bearbeitbaren Montage. Die Nummern dienen der Orientierung und bilden keine autorisierte Szenenfolge ab. Deutungsimpulse und regelbasierte Vorschläge sind zunächst eingeklappt.
- **Perspektiven prüfen:** Wahrnehmung, institutionelle Deutung und Betroffene als Gegenproben. Werkvergleich und simulierte Figurengespräche sind optionale Vertiefungen. Das Öffnen eines Angebots gilt nicht als nachgewiesener Lernerfolg.
- **Denkprotokoll:** zwei gesicherte Fassungen A/B, Textbeleg, eigene Deutung, Gegenbeleg, selbst notierte Rückmeldung aus einem Gespräch und revidierte These. Keine automatische Bewertung.

Die Karten sind Inhaltsparaphrasen und Interpretationsangebote. Belege werden in der benutzten Textausgabe nachgewiesen. Die Textgrundlage und Handschriften sind im [Büchnerportal](https://buechnerportal.de/werke/woyzeck/) verlinkt. Vergleichshinweise ersetzen die Lektüre der anderen Werke nicht. Figurenantworten sind Textbaustein-Simulationen, keine Büchner-Zitate.

## Daten und Export

Die aktuelle Montage und Regiebegründung verwenden weiterhin die bisherigen lokalen Speicherschlüssel (`woyzeckBuild`, `woyzeckNotes`). Forschungsfrage und Denkprotokoll (`woyzeckJournal`) sowie A/B (`woyzeckVersions`) liegen ebenfalls ausschliesslich im Browser. Es gibt keine gemeinsame Klassenablage und keine Übertragung von Lernendenantworten.

Der Text-Export enthält das Denkprotokoll, die aktuelle Montage und beide gesicherten Fassungen. Die JSON-Sicherung lässt sich nach Validierung und Bestätigung wieder importieren. Sie wird vor einem Gerätewechsel oder dem Löschen von Browserdaten benötigt. Der Druck erzeugt lesbare Textabsätze aus den Eingabefeldern.

## Lokal ansehen

Die eigentliche Anwendung ist buildlos in `public/woyzeck/`:

```sh
python3 -m http.server 4173 --directory public
```

Dann `http://localhost:4173/woyzeck/index.html` öffnen.

## GitHub Pages

Die Next.js-Hülle bindet die statische Anwendung ein. Der bestehende Workflow `.github/workflows/pages.yml` baut mit Node 22 und veröffentlicht `out/` unter `/woyzeck-prozessor-lernplattform`.

```sh
NEXT_PUBLIC_BASE_PATH=/woyzeck-prozessor-lernplattform npx next build
node --test tests/rendered-html.test.mjs
```

Die vorhandene Sites-/Vinext-Konfiguration bleibt für diesen zweiten Hostingweg bestehen; der GitHub-Pages-Workflow nutzt Next.js.

## Anmoderation und Fassungsvergleich

Der Einstieg erklärt Flucht, wissenschaftliche Qualifikation, Zürcher Lehrtätigkeit, parallele Schreibarbeit und Tod im Februar 1837. Die Ansteckung beim Präparieren bleibt ausdrücklich eine Vermutung. Quellen: Patrick Fischers [Georg B.](https://www.zurichstories.org/georgbPatrickFischer/index.html), der [Editionsbericht der Marburger Ausgabe, Band 7.2, S. 86](https://www.marburger-buechner-ausgabe.de/textview?ccl1=8&p1=86&l1=1), HLS und Deutsche Biographie. Die Autopsie des Textkörpers ist als heutiges methodisches Arbeitsbild ausgewiesen. Eine kleine Leseprobe motiviert das Montieren und speichert einen ersten Befund.

Der A/B-Vergleich unterscheidet Umordnungen von blossen Positionsverschiebungen durch Einfügen oder Weglassen. Geänderte Nachbarschaften einschliesslich Anfang und Schluss erhalten eigene Begründungsfelder. Texte bleiben dem exakten Paar von Szenenfolgen zugeordnet (`woyzeckTransitionNotes`), sind im Text-Export und in der JSON-Sicherung enthalten und werden beim Import wiederhergestellt. Alte Sicherungen bleiben lesbar.

`node --test tests/comparison.test.mjs` prüft Reihenfolge, Übergänge und Zuordnung der Begründungen unabhängig vom Build.
