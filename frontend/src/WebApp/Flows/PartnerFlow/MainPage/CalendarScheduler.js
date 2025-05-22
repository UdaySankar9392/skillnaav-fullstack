// src/components/CalendarScheduler.js
import React, { useState } from 'react';
import FullCalendar, {
  DateSelectArg,
  EventApi,
  EventClickArg,
  EventInput
} from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';      // month view
import timeGridPlugin from '@fullcalendar/timegrid';    // week/day with times
import interactionPlugin from '@fullcalendar/interaction'; // drag/select

export default function CalendarScheduler() {
  const [events, setEvents] = useState([]);

  // When the user drags to select a timeslot:
  const handleDateSelect = (selectInfo) => {
    let title = prompt('Event title:');
    let url   = prompt('Optional link (class URL / assignment):');

    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear highlight

    if (title) {
      setEvents(events.concat({
        id: String(events.length + 1),
        title,
        start: selectInfo.startStr,
        end:   selectInfo.endStr,
        url    // FullCalendar will render this as clickable if provided
      }));
    }
  };

  // When an event is clicked:
  const handleEventClick = (clickInfo) => {
    if (clickInfo.event.url) {
      window.open(clickInfo.event.url, '_blank');
      clickInfo.jsEvent.preventDefault(); // prevents browser from following link
    }
  };

  return (
    <FullCalendar
      plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      initialView="timeGridWeek"
      selectable={true}
      selectMirror={true}
      select={handleDateSelect}
      events={events}
      eventClick={handleEventClick}
      editable={true}
      dayMaxEvents={true}
      height="auto"
    />
  );
}

