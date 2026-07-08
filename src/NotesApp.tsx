import './App.css';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { getAuthHeaders } from './utils/api';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from './components/RichTextEditor';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

type Note = {
  id: number;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
};

const NotesApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tag, setTag] = useState('General');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortField, setSortField] = useState('date');

  const [sortOrder, setSortOrder] = useState('desc');

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notes`, {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          logout(); // token expired or invalid
          return;
        }

        const notes: Note[] = await response.json();

        console.log(notes);

        setNotes(notes);
      } catch (e) {
        console.log(e);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          content,
          tag,
        }),
      });

      if (response.status === 401) {
        logout(); // token expired or invalid
        return;
      }

      const newNote = await response.json();

      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
      setTag('General');
    } catch (e) {
      console.log(e);
    }
  };

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag);
  };

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedNote) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          content,
          tag,
        }),
      });

      if (response.status === 401) {
        logout(); // token expired or invalid
        return;
      }

      const updatedNote = await response.json();

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotesList);

      setTitle('');
      setContent('');
      setTag('General');
      setSelectedNote(null);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setTag('General');
    setSelectedNote(null);
  };

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();

    try {
      const response = await fetch(`${API_BASE}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        logout(); // token expired or invalid
        return;
      }

      const updatedNotes = notes.filter((note) => note.id !== noteId);

      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = selectedTag === 'All' || note.tag === selectedTag;

    return matchesSearch && matchesTag;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortField === 'name') {
      const result = a.title.localeCompare(b.title);

      return sortOrder === 'asc' ? result : -result;
    }

    const result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

    return sortOrder === 'asc' ? result : -result;
  });

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <span>📝</span>
          <div>
            <h1>Notes App</h1>
            <p>Capture your thoughts</p>
          </div>
        </div>
        <form
          className="note-form"
          onSubmit={(event) => (selectedNote ? handleUpdateNote(event) : handleAddNote(event))}
        >
          <label>Title</label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title..."
            required
          />

          <label>Category</label>

          <select value={tag} onChange={(event) => setTag(event.target.value)}>
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Ideas">Ideas</option>
            <option value="Personal">Personal</option>
          </select>

          <label>Content</label>
          <RichTextEditor
            value={content}
            onChange={(html) => setContent(html)}
            placeholder="Write something..."
          />

          {selectedNote ? (
            <div className="edit-buttons">
              <button type="submit">Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <button type="submit">Add Note</button>
          )}
        </form>
        <button onClick={handleLogout} className="logout-btn">
          <span>🚪</span> Logout
        </button>
      </aside>
      <main className="notes-section">
        <div className="header">
          <h1>Your Notes</h1>

          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-bar">
          {['All', 'General', 'Work', 'Study', 'Ideas', 'Personal'].map((tag) => (
            <button
              key={tag}
              className={`filter-btn ${tag.toLowerCase()} ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
          <div className="sort-controls">
            <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
              <option value="date">Date Created</option>
              <option value="name">Title</option>
            </select>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        <div className="notes-grid">
          {sortedNotes.map((note) => (
            <div
              className={`note-item ${note.tag.toLowerCase()}`}
              key={note.id}
              onClick={() => handleNoteClick(note)}
            >
              <div className="notes-header">
                <button onClick={(event) => deleteNote(event, note.id)}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={`note-tag ${note.tag.toLowerCase()}`}>{note.tag}</div>
              <h2>{note.title}</h2>
              <div className="note-content" dangerouslySetInnerHTML={{ __html: note.content }} />

              <div className="note-date">
                {new Date(note.createdAt).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'Asia/Seoul',
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotesApp;
