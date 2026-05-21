import { useEffect, useState } from "react";
import { Calendar } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { dateFnsLocalizer } from "react-big-calendar";
import { supabase } from '../lib/supabaseClient';
import { Dialog } from "@headlessui/react";
import { useSession } from "@supabase/auth-helpers-react";
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
  const session = useSession();
  const [userRole, setUserRole] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");
  const [editingEvent, setEditingEvent] = useState(null);

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
    const getUserRole = async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
      } else {
        setUserRole(data.role);
      }
    };
    getUserRole();
  }, [session]);

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
      {userRole === "admin" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const newEvent = {
              athlete_name: form.athlete.value,
              class: form.className.value,
              start_time: new Date(form.start.value),
              end_time: new Date(form.end.value),
              open_spots: parseInt(form.spots.value),
            };

            const { error } = await supabase.from("calendar_events").insert([newEvent]);
            if (error) {
              console.error("Error adding event:", error);
            } else {
              form.reset();
              location.reload();
            }
          }}
          className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <input name="athlete" placeholder="Athlete Name" className="p-2 border rounded" required />
          <input name="className" placeholder="Class" className="p-2 border rounded" required />
          <input name="start" type="datetime-local" className="p-2 border rounded" required />
          <input name="end" type="datetime-local" className="p-2 border rounded" required />
          <input name="spots" type="number" placeholder="# Open Spots" className="p-2 border rounded" required />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Add Event
          </button>
        </form>
      )}
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
              {userRole === "admin" && (
                <div className="flex gap-2 mt-1">
                  <button onClick={() => handleEditClick(event)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={userRole === "admin" && !!editingEvent} onClose={() => setEditingEvent(null)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="w-full max-w-xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
            <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
              Edit Event
            </Dialog.Title>
            <form onSubmit={handleUpdateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="athlete" defaultValue={editingEvent?.athlete} className="p-2 border rounded" required />
              <input name="className" defaultValue={editingEvent?.class} className="p-2 border rounded" required />
              <input name="start" type="datetime-local" defaultValue={editingEvent ? new Date(editingEvent.start).toISOString().slice(0, 16) : ""} className="p-2 border rounded" required />
              <input name="end" type="datetime-local" defaultValue={editingEvent ? new Date(editingEvent.end).toISOString().slice(0, 16) : ""} className="p-2 border rounded" required />
              <input name="spots" type="number" defaultValue={editingEvent?.openSpots} className="p-2 border rounded" required />
              <div className="flex gap-2 col-span-full">
                <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Save</button>
                <button type="button" onClick={() => setEditingEvent(null)} className="bg-gray-400 text-white p-2 rounded hover:bg-gray-500">Cancel</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
