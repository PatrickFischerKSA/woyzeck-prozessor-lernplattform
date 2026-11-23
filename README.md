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

## Originalhandschrift als Leseexperiment

Die Einführung enthält Foliohandschrift I, p. 1 (Marburger Ausgabe Digital, Band 7.1, Faksimile S. 5). Das lokale Bild `public/woyzeck/assets/woyzeck-h1-p1.jpg` wurde aus den Deep-Zoom-Kacheln auf Stufe 11 ohne Retusche zusammengesetzt (1320 × 1969 Pixel). Quelle: https://www.marburger-buechner-ausgabe.de/textview?ccl1=43-faksimile&p1=5

Drei auswählbare Stellen zeigen die Streichungen „Liebling“ (H1,1, Z. 6), „Ist“ (Z. 7) und den nachgetragenen Dialog Soldat/Margreth (Z. 8–9, editorisch als Späteintrag erläutert). Daneben stehen ausdrücklich didaktisch vereinfachte Auszüge der differenzierten Umschrift (MBA 7.1, S. 4): https://www.marburger-buechner-ausgabe.de/textview?ccl1=43&p1=4&l1=6

Die roten Bildrahmen sind Lernhilfen und kein Teil des Originals. Zoom und Seitenübersicht erschliessen das Bild per Maus und Tastatur; alle Auszüge werden auch gedruckt. Die eigene Beobachtung wird unter `manuscriptObservation` im bestehenden Denkprotokoll gespeichert und mit exportiert/gesichert.

### Zuerst selbst entziffern

Die drei Auswahlknöpfe benennen zunächst nur Textspur A–C und die Zeilen. Umschrift und Erläuterung sind im ausgelieferten HTML verborgen. Für jede Stelle müssen ein eigener Entzifferungsversuch und eine Vermutung zur Überarbeitung vorliegen; Leerzeichen allein schalten nichts frei, inhaltliche Unsicherheit ist erlaubt. Das Aufdecken ist eine bewusste Aktion und bewertet die Einträge nicht. Ein gesondertes Vergleichsfeld hält spätere Korrekturen fest, ohne den ersten Versuch zu ersetzen. Die neun neuen Felder nutzen das bestehende Denkprotokoll und sind in Export und JSON-Sicherung enthalten. Beim Neuladen oder Sicherungsimport bleiben die Antworten erhalten, die Umschriften sind wieder zugedeckt. Geschlossene Umschriften werden auch beim Drucken nicht aufgedeckt.

`tests/manuscript-inquiry.test.mjs` prüft die Freischaltung pro Textspur, das Bewahren eigener Versuche und das erneute Zudecken beim Import.

## Eigene Deutung vor automatischen Montagevorschlägen

In der Montage werden zuerst eine eigene Deutung und begründende Textbelege erfasst. Erst danach lässt sich die regelbasierte Interpretation bewusst aufdecken. Die Prüfung bestätigt nur vorhandene Einträge, nicht ihre inhaltliche Richtigkeit. Ein eigenes Vergleichsfeld hält Einwände und Revisionen fest. Vorschläge werden vor dem Aufdecken nicht erzeugt; auch der Aktualisieren-Knopf kann die Freischaltung nicht umgehen. Der Schrittmodus enthält nur eine Beschreibung der bisherigen Anordnung und eine offene Frage.

Die Argumente liegen unter `woyzeckMontageArguments`, zugeordnet zur exakten Szenenfolge. Umstellen, Hinzufügen oder Entfernen deckt die Vorschläge wieder zu und lädt die Begründung der neuen Folge (falls schon vorhanden). Beim Wiederherstellen einer alten Folge erscheinen deren eigene Einträge wieder; die Vorschläge bleiben zunächst verborgen. A/B-Anzeige und Text-Export enthalten die eigenen Deutungen, Belege und Vergleiche. JSON-Sicherungen bewahren alle Argumente; ältere Sicherungen ohne diese Daten bleiben importierbar. Automatische Vorschläge werden nicht in den Text-Export eingefügt oder beim Druck aufgedeckt.

`tests/montage-inquiry.test.mjs` prüft Freischaltung, explizites Aufdecken, direkte Aktualisierung, Umstellen, erneutes Laden und Validierung der Sicherungsdaten.

## Rückwärts erzählter Auftakt (23. November 2026)

Der Einstieg beginnt mit Büchners Tod am 19. Februar 1837 in der Spiegelgasse und führt rückwärts über Forschung und Schreiben, Ankunft in Zürich und Flucht aus Hessen. Die mögliche Ansteckung beim Präparieren bleibt ausdrücklich eine Vermutung. Die Lernwege und Freischaltungen bleiben erhalten.

Bildquellen: `assets/buechner-sterbezimmer-rekonstruktion.jpg` stammt aus Peter Brunners [„Danke den Wörtlichnehmern“](https://geschwisterbuechner.de/?p=2820), veröffentlicht am 18. Februar 2016. Sichtbare Bildlegende: Rekonstruktion des Sterbezimmers in der Darmstädter Ausstellung 2013, Foto Peter Brunner. Es wird nicht als historische Raumaufnahme ausgegeben. `assets/georg-b-zurichstories.jpg` ist das Titelbild aus Patrick Fischers [Georg B.](https://www.zurichstories.org/georgbPatrickFischer/index.html), Porträt nach Alexis Muston. Beide Bilder liegen unverändert lokal.

## Barben, Schädelnerven und Präparate

Der Rückblick unterscheidet jetzt ausdrücklich die Strassburger Dissertation `Mémoire sur le système nerveux du barbeau` (Grundlage der Promotion am 3. September 1836) von der Zürcher Probevorlesung `Über Schädelnerven` (5. November 1836). Ein eigener Abschnitt erklärt das Präparieren frischer Fische, die Unterscheidung von Hirn- und Rückenmarksnerven, das Freilegen, Vergleichen und Dokumentieren. Die mögliche Ansteckung bei der Präparationsarbeit wird als Hypothese behandelt; ein bestimmter Infektionsmechanismus wird nicht behauptet. Quellen sind direkt am jeweiligen Abschnitt verlinkt: Deutsche Biographie, Zürcher Taschenbuch, Bartelmus/Rickenbacher (2021), Patrick Fischers Georg B. sowie Jan Wagners Büchnerpreisrede 2017. Der Übergang zur Textautopsie ist als unser methodischer Transfer kenntlich.

## Zurichstories-Filme und visuelle Erzählung

Vier native Videoplayer binden die Originaldateien direkt von Zurichstories ein: `teil_1`, `mein-film_teil3` (3sat-Ausschnitte, 33 bzw. 93 Sekunden), `barbe_loop` sowie Patrick Fischers eigene Grabaufnahme. Quellen und direkte Fallbacklinks stehen sichtbar am Film; Filme starten nur auf Nutzeraktion, mit Controls, Playsinline und Preload none. Die 3sat-Poster sind unveränderte Einzelbilder aus den jeweiligen Clips. Barben- und Grabposter kommen von der Originalseite. Videoausfall lässt die Texte und Fallbacklinks zugänglich. Die Grabgeschichte folgt der Zurichstories-Angabe: zunächst Krautgarten, seit 1875 Germaniahügel.

Der Auftakt erhält einen dunklen Bild-/Textraum, das Grab einen eigenen rostroten Filmabschnitt, die Barbe eine grüne Filmfläche. Grosszügigere Serifentypografie, bewusst wechselnde Flächen und Bildgrössen lösen den bisherigen gleichförmigen Kartenrhythmus ab. Die Lernfunktionen bleiben erhalten. Der Exporttest prüft statt des früheren Videoverbots vier explizit steuerbare, beschriftete Filme ohne Autoplay.

## Eigenständige Lerneinheiten und Menü

Die Einführung ist in acht eigenständige Ansichten aufgeteilt; hinzu kommen die drei bisherigen Arbeitsbereiche. Das Menü gruppiert elf Einträge unter Geschichte, Forschung und Textwerkstatt. Grab, Lebensumstände, Fischforschung, Filmbeiträge, Textautopsie, Originalhandschrift und Montageprobe liegen jeweils auf einer eigenen Ansicht. Nur die gewählte Einheit wird angezeigt. Jede Einheit nennt ihren Untersuchungsfokus und bietet Zurück/Weiter. Auf kleinen Bildschirmen ist das Menü aufklappbar und schliesst nach der Wahl. URLs, Browsernavigation und Direktlinks zu Unterbereichen funktionieren weiter. Beim Wechsel werden Videos in verlassenen Einheiten pausiert. Eingaben und gespeicherte Fassungen bleiben erhalten. Die Handschrift-Fokussierung bezieht sich jetzt auf ihre eigene Ansicht.

Der Exporttest sichert elf gleichrangige Ansichten, ein vollständiges Menü, den Lernweg und die anfängliche Sichtbarkeit ab.
