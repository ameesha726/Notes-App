import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import API from '../lib/api'
import { useAuth } from '../auth/useAuth'
import Router from 'next/router'
import 'react-quill/dist/quill.snow.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function Home() {
  const { token, logout: authLogout } = useAuth()
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [isCreating, setIsCreating] = useState(true)

  useEffect(() => {
    if (!token) {
      Router.push('/signin')
      return
    }
    fetchNotes()
  }, [token])

  async function fetchNotes() {
    try {
      const res = await API.get('/notes', { headers: { Authorization: `Bearer ${token}` } })
      setNotes(res.data)
    } catch (e) { console.error(e) }
  }

  function startNewNote() {
    setTitle('')
    setContent('')
    setEditingNoteId(null)
    setIsCreating(true)
  }

  function editNote(note) {
    setTitle(note.note_title)
    setContent(note.note_content)
    setEditingNoteId(note.note_id)
    setIsCreating(false)
  }

  async function saveNote() {
    if (!title && !content) return

    try {
      if (editingNoteId) {
        await API.put(
          `/notes/${editingNoteId}`,
          { note_title: title, note_content: content },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        await API.post(
          '/notes',
          { note_title: title, note_content: content },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      startNewNote()
      fetchNotes()
    } catch (e) { console.error(e) }
  }

  async function deleteNote(id) {
    try {
      await API.delete(`/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchNotes()
      if (editingNoteId === id) startNewNote()
    } catch (e) { console.error(e) }
  }

  function cleanContent(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent?.trim() || ''
  }

  function logout() {
    authLogout()
    toast.success('Successfully logged out!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        minWidth: '300px',
        maxWidth: '500px',
        backgroundColor: '#22c55e',
        color: '#f9fafb',
        fontSize: '16px',
        fontWeight: '600',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    })
    setTimeout(() => Router.push('/signin'), 5000)
  }

  return (
    <>
      <Head>
        <title>My Notes App</title>
        <meta name="description" content="Manage your notes easily with a professional notes app." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-white p-6 relative">
        <ToastContainer />

        {/* Logout Button */}
        <div className="max-w-7xl mx-auto flex justify-end mb-4">
          <button
            onClick={logout}
            className="px-5 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Notes List */}
          <div className="lg:w-2/5 flex flex-col gap-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-extrabold text-gray-800">Saved Notes</h1>
              <button
                onClick={startNewNote}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
              >
                + New
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              {notes.length > 0 ? (
                notes.map(note => (
                  <div
                    key={note.note_id}
                    className="p-4 rounded-2xl shadow-md hover:shadow-xl transition-all bg-white relative"
                  >
                    <h2 className="font-semibold text-gray-800 mb-2">{note.note_title}</h2>
                    <p className="text-gray-600 line-clamp-4 mb-2">
                      {cleanContent(note.note_content)}
                    </p>
                    
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => editNote(note)}
                        className="text-indigo-600 font-semibold hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(note.note_id)}
                        className="text-red-500 font-semibold hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center mt-10">
                  No notes yet. Click "New" to add a note.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Create / Edit Note */}
          <div className="lg:w-3/5 flex justify-center">
            <div className="w-full p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all bg-white flex flex-col h-[80vh]">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {isCreating ? 'Create a New Note' : 'Edit Note'}
              </h2>

              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full mb-4 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />

              <div className="flex-1 overflow-y-auto">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your note..."
                  theme="snow"
                  className="rounded-xl min-h-full h-full"
                />
              </div>

              <button
                onClick={saveNote}
                className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                {editingNoteId ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
