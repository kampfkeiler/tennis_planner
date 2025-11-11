const days = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag'
];

const defaultCourts = ['Platz 1', 'Platz 7', 'Platz 8'];
const baseMinutes = 14 * 60;
const slotMinutes = 15;
const trainers = [
  { name: 'Anna Becker', color: '#e63946' },
  { name: 'Ben Müller', color: '#1d3557' },
  { name: 'Clara Schmidt', color: '#2a9d8f' },
  { name: 'David Klein', color: '#f4a261' },
  { name: 'Elena Fischer', color: '#6d597a' }
];

const dayCourts = {};
const planner = document.getElementById('planner');
const timeAxis = document.getElementById('timeAxis');
const addEventBtn = document.getElementById('addEventBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const eventDialog = document.getElementById('eventDialog');
const eventForm = document.getElementById('eventForm');
const daySelect = document.getElementById('daySelect');
const courtSelect = document.getElementById('courtSelect');
const trainerSelect = document.getElementById('trainerSelect');
const eventTitleInput = document.getElementById('eventTitle');
const startTimeInput = document.getElementById('startTime');
const durationInput = document.getElementById('duration');
const eventTemplate = document.getElementById('eventTemplate');

const slotHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--timeslot-height'));

function init() {
  buildTimeAxis();
  populateTrainerSelect();
  populateDaySelect();
  buildPlanner();
  addEventBtn.addEventListener('click', openEventDialog);
  exportPdfBtn.addEventListener('click', exportPlannerToPdf);
  daySelect.addEventListener('change', () => updateCourtSelect(daySelect.value));
  eventForm.addEventListener('submit', handleEventSubmit);
  if (window.HTMLDialogElement && !eventDialog.open) {
    eventDialog.addEventListener('close', () => eventForm.reset());
  }
}

document.addEventListener('DOMContentLoaded', init);

function buildTimeAxis() {
  const end = baseMinutes + 8 * 60;
  for (let minutes = baseMinutes; minutes < end; minutes += slotMinutes) {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.textContent = formatTime(minutes);
    timeAxis.appendChild(slot);
  }
}

function populateTrainerSelect() {
  trainers.forEach((trainer) => {
    const option = document.createElement('option');
    option.value = trainer.name;
    option.textContent = trainer.name;
    trainerSelect.appendChild(option);
  });
}

function populateDaySelect() {
  days.forEach((day) => {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    daySelect.appendChild(option);
  });
}

function buildPlanner() {
  days.forEach((day) => {
    dayCourts[day] = [...defaultCourts];
    const dayColumn = createDayColumn(day);
    planner.appendChild(dayColumn);
  });
}

function createDayColumn(day) {
  const dayColumn = document.createElement('div');
  dayColumn.className = 'day-column';
  dayColumn.dataset.day = day;

  const header = document.createElement('div');
  header.className = 'day-header';
  header.innerHTML = `<span>${day}</span>`;

  const headerActions = document.createElement('div');
  headerActions.className = 'courts-header';
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.title = 'Platz hinzufügen';
  addButton.textContent = '+';
  addButton.addEventListener('click', () => addCourt(day));
  headerActions.appendChild(addButton);
  header.appendChild(headerActions);

  const courtsContainer = document.createElement('div');
  courtsContainer.className = 'courts-container';

  dayCourts[day].forEach((court) => {
    const courtColumn = createCourtColumn(day, court);
    courtsContainer.appendChild(courtColumn);
  });

  dayColumn.appendChild(header);
  dayColumn.appendChild(courtsContainer);
  return dayColumn;
}

function createCourtColumn(day, court) {
  const column = document.createElement('div');
  column.className = 'court-column';
  column.dataset.court = court;

  const header = document.createElement('div');
  header.className = 'court-header';
  header.textContent = court;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.title = 'Platz entfernen';
  removeButton.textContent = '−';
  removeButton.style.marginLeft = '0.5rem';
  removeButton.addEventListener('click', () => removeCourt(day, column));
  header.appendChild(removeButton);

  const body = document.createElement('div');
  body.className = 'court-body';
  body.dataset.day = day;
  body.dataset.court = court;

  column.appendChild(header);
  column.appendChild(body);

  setupDropzone(body);
  return column;
}

function addCourt(day) {
  const name = prompt('Neuen Platznamen eingeben:');
  if (!name) return;
  dayCourts[day].push(name);
  const dayColumn = [...planner.querySelectorAll('.day-column')].find((col) => col.dataset.day === day);
  if (!dayColumn) return;
  const courtsContainer = dayColumn.querySelector('.courts-container');
  const newCourt = createCourtColumn(day, name);
  courtsContainer.appendChild(newCourt);
  if (daySelect.value === day) {
    updateCourtSelect(day);
  }
}

function removeCourt(day, columnElement) {
  const court = columnElement.dataset.court;
  const hasEvents = columnElement.querySelector('.event');
  if (hasEvents && !confirm('Dieser Platz enthält Termine. Trotzdem entfernen?')) {
    return;
  }
  columnElement.remove();
  dayCourts[day] = dayCourts[day].filter((name) => name !== court);
  if (daySelect.value === day) {
    updateCourtSelect(day);
  }
}

function openEventDialog() {
  daySelect.value = days[0];
  updateCourtSelect(daySelect.value);
  trainerSelect.selectedIndex = 0;
  durationInput.value = 60;
  startTimeInput.value = '14:00';
  eventTitleInput.value = '';
  if (typeof eventDialog.showModal === 'function') {
    eventDialog.showModal();
  }
}

function updateCourtSelect(day) {
  courtSelect.innerHTML = '';
  const courts = dayCourts[day] || [];
  courts.forEach((court) => {
    const option = document.createElement('option');
    option.value = court;
    option.textContent = court;
    courtSelect.appendChild(option);
  });
  if (!courts.length) {
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = 'Keine Plätze vorhanden';
    courtSelect.appendChild(option);
    courtSelect.disabled = true;
  } else {
    courtSelect.disabled = false;
  }
}

function handleEventSubmit(evt) {
  evt.preventDefault();
  const title = eventTitleInput.value.trim();
  const trainerName = trainerSelect.value;
  const day = daySelect.value;
  const court = courtSelect.value;
  const startValue = startTimeInput.value;
  const duration = parseInt(durationInput.value, 10);

  if (courtSelect.disabled) {
    alert('Für den ausgewählten Tag sind keine Plätze verfügbar.');
    return;
  }

  if (!title || !trainerName || !day || !court || !startValue || !duration) {
    return;
  }

  const startMinutes = timeToMinutes(startValue) - baseMinutes;
  if (startMinutes < 0 || startMinutes >= 8 * 60) {
    alert('Startzeit muss zwischen 14:00 und 22:00 liegen.');
    return;
  }

  if (startMinutes + duration > 8 * 60) {
    alert('Der Termin endet nach 22:00 Uhr. Bitte Dauer oder Startzeit anpassen.');
    return;
  }

  const eventData = { title, trainerName, day, court, startMinutes, duration };
  const element = createEventElement(eventData);
  const courtBody = findCourtBody(day, court);
  if (courtBody) {
    courtBody.appendChild(element);
    applyEventPosition(element);
    if (eventDialog.open) {
      eventDialog.close();
    }
  }
}

function findCourtBody(day, court) {
  return planner.querySelector(`.court-body[data-day="${day}"][data-court="${CSS.escape(court)}"]`);
}

function createEventElement({ title, trainerName, day, court, startMinutes, duration }) {
  const node = eventTemplate.content.firstElementChild.cloneNode(true);
  const trainer = trainers.find((t) => t.name === trainerName) || trainers[0];
  node.querySelector('.event-title').textContent = title;
  node.querySelector('.event-trainer').textContent = trainerName;
  node.style.backgroundColor = trainer.color;
  node.dataset.trainer = trainerName;
  node.dataset.day = day;
  node.dataset.court = court;
  node.dataset.start = startMinutes;
  node.dataset.duration = duration;
  updateEventTime(node);

  const deleteBtn = node.querySelector('.event-delete');
  deleteBtn.addEventListener('click', () => node.remove());

  enableInteraction(node);
  return node;
}

function applyEventPosition(element) {
  const start = parseFloat(element.dataset.start) || 0;
  const duration = parseFloat(element.dataset.duration) || slotMinutes;
  const top = (start / slotMinutes) * slotHeight;
  const height = (duration / slotMinutes) * slotHeight;
  element.style.top = `${top}px`;
  element.style.height = `${height}px`;
  element.style.transform = '';
}

function updateEventTime(element) {
  const start = parseInt(element.dataset.start, 10);
  const duration = parseInt(element.dataset.duration, 10);
  const startTime = formatTime(baseMinutes + start);
  const endTime = formatTime(baseMinutes + start + duration);
  element.querySelector('.event-time').textContent = `${startTime} – ${endTime}`;
}

function timeToMinutes(value) {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function setupDropzone(element) {
  interact(element).dropzone({
    accept: '.event',
    overlap: 0.1,
    ondrop(event) {
      const target = event.relatedTarget;
      const dropzone = event.target;
      const pointerY = event.dragEvent.pageY || (event.dragEvent.clientY + window.scrollY);
      const rect = dropzone.getBoundingClientRect();
      const offset = parseFloat(target.dataset.pointerOffset || '0');
      const rawTop = pointerY - (rect.top + window.scrollY) - offset;
      const parentHeight = dropzone.getBoundingClientRect().height;
      const snappedTop = snapToSlot(rawTop, parentHeight - target.offsetHeight);

      dropzone.appendChild(target);
      target.dataset.day = dropzone.dataset.day;
      target.dataset.court = dropzone.dataset.court;
      target.style.transform = '';
      target.dataset.dragX = 0;
      target.dataset.dragY = 0;
      target.dataset.dragDropped = 'true';

      const clampedHeight = Math.max(slotHeight, Math.round(target.offsetHeight / slotHeight) * slotHeight);
      target.style.height = `${clampedHeight}px`;
      const snappedHeightMinutes = (clampedHeight / slotHeight) * slotMinutes;
      target.dataset.duration = snappedHeightMinutes;

      const startMinutes = (snappedTop / slotHeight) * slotMinutes;
      target.dataset.start = startMinutes;
      target.style.top = `${snappedTop}px`;
      updateEventTime(target);
    }
  });
}

function snapToSlot(value, max) {
  const snapped = Math.round(value / slotHeight) * slotHeight;
  const clamped = Math.min(Math.max(snapped, 0), Math.max(max, 0));
  return clamped;
}

function enableInteraction(element) {
  interact(element)
    .draggable({
      listeners: {
        start(event) {
          const target = event.target;
          target.classList.add('dragging');
          target.dataset.dragX = 0;
          target.dataset.dragY = 0;
          const rect = target.getBoundingClientRect();
          target.dataset.pointerOffset = (event.pageY || (event.clientY + window.scrollY)) - (rect.top + window.scrollY);
        },
        move(event) {
          const target = event.target;
          const dragX = (parseFloat(target.dataset.dragX) || 0) + event.dx;
          const dragY = (parseFloat(target.dataset.dragY) || 0) + event.dy;
          target.dataset.dragX = dragX;
          target.dataset.dragY = dragY;
          target.style.transform = `translate(${dragX}px, ${dragY}px)`;
        },
        end(event) {
          const target = event.target;
          target.classList.remove('dragging');
          target.style.transform = '';
          target.dataset.dragX = 0;
          target.dataset.dragY = 0;
          delete target.dataset.pointerOffset;
          if (target.dataset.dragDropped !== 'true') {
            applyEventPosition(target);
          }
          delete target.dataset.dragDropped;
        }
      }
    })
    .resizable({
      edges: { top: true, bottom: true, left: false, right: false },
      listeners: {
        move(event) {
          const target = event.target;
          const parent = target.parentElement;
          const parentHeight = parent.getBoundingClientRect().height;
          let newTop = (parseFloat(target.style.top) || 0) + event.deltaRect.top;
          let newHeight = event.rect.height;

          newTop = Math.round(newTop / slotHeight) * slotHeight;
          newHeight = Math.round(newHeight / slotHeight) * slotHeight;
          if (newHeight < slotHeight) newHeight = slotHeight;
          if (newTop < 0) newTop = 0;
          if (newTop + newHeight > parentHeight) {
            newTop = parentHeight - newHeight;
          }

          target.style.top = `${newTop}px`;
          target.style.height = `${newHeight}px`;

          const start = (newTop / slotHeight) * slotMinutes;
          const duration = (newHeight / slotHeight) * slotMinutes;
          target.dataset.start = start;
          target.dataset.duration = duration;
          updateEventTime(target);
        }
      }
    });
}

async function exportPlannerToPdf() {
  exportPdfBtn.disabled = true;
  exportPdfBtn.textContent = 'Exportiere...';
  try {
    const plannerArea = document.querySelector('.planner-wrapper');
    const canvas = await html2canvas(plannerArea, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
    const width = imgProps.width * ratio;
    const height = imgProps.height * ratio;
    const x = (pageWidth - width) / 2;
    const y = (pageHeight - height) / 2;
    pdf.addImage(imgData, 'PNG', x, y, width, height);
    pdf.save('tennis-wochenplaner.pdf');
  } catch (error) {
    console.error('PDF Export fehlgeschlagen:', error);
    alert('Der Export ist fehlgeschlagen. Bitte erneut versuchen.');
  } finally {
    exportPdfBtn.disabled = false;
    exportPdfBtn.textContent = 'Als PDF exportieren';
  }
}
