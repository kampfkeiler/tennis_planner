# Tennisverein Wochenplaner

Ein interaktiver Wochenplaner für einen Tennisverein. Die Anwendung läuft komplett im Browser.

## Funktionen

- Wochenansicht von Montag bis Sonntag mit Plätzen (standardmäßig Platz 1, Platz 7 und Platz 8)
- Zeitraster von 14:00 Uhr bis 22:00 Uhr im 15-Minuten-Takt
- Termine erstellen, Trainern zuordnen (mit Farbcodierung) und per Drag & Drop verschieben sowie in der Höhe anpassen
- Plätze pro Tag flexibel hinzufügen oder entfernen
- Horizontales Scrollen für umfangreiche Planungen
- Export der aktuellen Wochenansicht als PDF-Datei

## Nutzung

1. Öffne `index.html` in einem Browser (z. B. per Doppelklick oder über einen lokalen Webserver).
2. Über den Button **„Termin hinzufügen“** lassen sich neue Einträge anlegen.
3. Ziehe Termine per Drag & Drop an eine neue Position oder auf einen anderen Platz. Die Größe kann am oberen oder unteren Rand angepasst werden.
4. Mit dem Button **„Als PDF exportieren“** wird eine PDF-Datei der aktuellen Ansicht erzeugt und heruntergeladen.

Für die Drag-&-Drop-Funktionalität kommt [interact.js](https://interactjs.io/) zum Einsatz. Der PDF-Export wird über [html2canvas](https://html2canvas.hertzen.com/) und [jsPDF](https://github.com/parallax/jsPDF) umgesetzt.
