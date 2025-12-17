import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api/notes/";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all notes
  const fetchNotes = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => setError("Failed to fetch notes"));
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add or update note
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}${editingId}/` : API_URL;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then(() => {
        setTitle("");
        setContent("");
        setEditingId(null);
        fetchNotes();
      })
      .catch(() => setError("Failed to save note"));
  };

  // Start editing a note
  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  // Delete a note
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    fetch(`${API_URL}${id}/`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        fetchNotes();
      })
      .catch(() => setError("Failed to delete note"));
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setError(null);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Notes</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <div>
          <button type="submit" style={{ marginRight: "8px" }}>
            {editingId ? "Update Note" : "Add Note"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <hr />

      {notes.length > 0 ? (
        notes.map((note) => (
          <div key={note.id} style={{ border: "1px solid #ccc", padding: "12px", marginBottom: "12px" }}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <button onClick={() => handleEdit(note)} style={{ marginRight: "8px" }}>
              Edit
            </button>
            <button onClick={() => handleDelete(note.id)}>Delete</button>
          </div>
        ))
      ) : (
        <p>No notes available.</p>
      )}
    </div>
  );
}
