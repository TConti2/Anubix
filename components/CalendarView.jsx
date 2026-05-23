import { useEffect, useState } from "react";
import { Calendar } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import { supabase } from '../lib/supabaseClient';
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase.from("calendar_events").select("*");
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        const formatted = data.map((event) => ({
          id: event.id,
          title: `${event.athlete_name} - ${event.class}`,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          allDay: false,
          athlete: event.athlete_name,
          class: event.class,
          openSpots: event.open_spots,
        }));
        setEvents(formatted);
        setFilteredEvents(formatted);
        setAthletes(["All", ...new Set(formatted.map((e) => e.athlete))]);
        setClasses(["All", ...new Set(formatted.map((e) => e.class))]);
      }
    };
    fetchEvents();
  }, []);


  useEffect(() => {
    let result = [...events];
    if (selectedAthlete !== "All") {
      result = result.filter((e) => e.athlete === selectedAthlete);
    }
    if (selectedClass !== "All") {
      result = result.filter((e) => e.class === selectedClass);
    }
    setFilteredEvents(result);
  }, [selectedAthlete, selectedClass, events]);

  const handleEditClick = (event) => {
    setEditingEvent(event);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedEvent = {
      athlete_name: form.athlete.value,
      class: form.className.value,
      start_time: new Date(form.start.value),
      end_time: new Date(form.end.value),
      open_spots: parseInt(form.spots.value),
    };

    const { error } = await supabase
      .from("calendar_events")
      .update(updatedEvent)
      .eq("id", editingEvent.id);

    if (error) {
      console.error("Error updating event:", error);
    } else {
      setEditingEvent(null);
      location.reload();
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) {
      console.error("Error deleting event:", error);
    } else {
      location.reload();
    }
  };

  return (
    <div
  className="rounded-2xl p-6"
  style={{
    background: "#15151d",
    border: "1px solid #2a2a35",
  }}
>
<h2
  style={{
    color: "#d4af37",
    marginBottom: "1rem",
  }}
>
  Calendar & Scheduling
</h2>
      <div
      
 className="flex gap-4 mb-6 flex-wrap"
>
        <select
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(e.target.value)}
          className="p-3 rounded-xl border"
style={{
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
}}
        >
          {athletes.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="p-3 rounded-xl border"
style={{
  background: "#1f1f2b",
  color: "#f5f5f5",
  border: "1px solid #2f2f3d",
}}
        >
          {classes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div style={{ height: 500 }}>
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
        />
      </div>

      <div className="mt-6 p-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Open Spots Summary</h2>
        <ul className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => (
            <li key={event.id} className="text-sm border-b pb-2">
              <strong>{event.class}</strong><br />
              {event.athlete} | Spots: {event.openSpots}<br />
              
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
