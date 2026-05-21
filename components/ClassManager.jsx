import { useState } from "react";

export default function ClassManager() {
  const [classes, setClasses] = useState([
    { id: 1, title: "Beginner Tumbling", coach: "Coach J", time: "3:00 PM" },
    { id: 2, title: "Intermediate Tumbling", coach: "Coach L", time: "4:30 PM" }
  ]);

  const [newClass, setNewClass] = useState({ title: "", coach: "", time: "" });

  const handleChange = (e) => {
    setNewClass({ ...newClass, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!newClass.title || !newClass.coach || !newClass.time) return;
    setClasses([...classes, { id: Date.now(), ...newClass }]);
    setNewClass({ title: "", coach: "", time: "" });
  };

  const handleDelete = (id) => {
    setClasses(classes.filter((cls) => cls.id !== id));
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Class Management</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input name="title" placeholder="Class Title" value={newClass.title} onChange={handleChange} />
        <input name="coach" placeholder="Coach" value={newClass.coach} onChange={handleChange} />
        <input name="time" placeholder="Time" value={newClass.time} onChange={handleChange} />
        <button onClick={handleAdd}>Add Class</button>
      </div>

      <ul>
        {classes.map((cls) => (
          <li key={cls.id}>
            <strong>{cls.title}</strong> w/ {cls.coach} at {cls.time}
            <button onClick={() => handleDelete(cls.id)} style={{ marginLeft: "1rem" }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
