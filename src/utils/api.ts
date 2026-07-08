// Helper to get auth headers with token from localStorage
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ---- Example API wrappers (you'll replace your fetch calls) ----

export const fetchNotes = async () => {
  const res = await fetch('http://localhost:5001/api/notes', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
};

export const createNote = async (title: string, content: string, tag: string) => {
  const res = await fetch('http://localhost:5001/api/notes', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, content, tag }),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
};

// Similarly for update, delete...
