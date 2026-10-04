import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import { CalendarDays, ChevronLeft, ChevronRight, Heart, ImagePlus, LayoutGrid, Link2, Link2Off, LogOut, MapPin, Pencil, Plus, Sparkles, Trash2, UserPlus, X } from 'lucide-react'
import { api, uploadMultipleToCloudinary } from './lib'
import { searchLocalDestinations, searchPhotonPlaces, FEATURED_PLACES } from './places'

// ── Cover image presets (exactly 8 presets = 2 rows of 4) ──
const COVER_PRESETS = [
  { label: 'Mountains', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85' },
  { label: 'City Lights', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Snow', url: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=1200&q=85' },
  { label: 'Lakes', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=85' },
]

const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID

function formatJourneyDate(date) {
  if (!date) return ''
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatJourneyRange(startDate, endDate, fallback = '') {
  if (!startDate || !endDate) return fallback
  return `Our Journey: ${formatJourneyDate(startDate)} · Through: ${formatJourneyDate(endDate)}`
}


function App() {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    api.me().then(setSession).catch(() => setSession(null))
  }, [])
  if (session === undefined) return (
    <div className="loading">
      <span className="brand-mark" style={{ width: 48, height: 48, fontSize: 22 }}>U</span>
      <p>Opening your archive…</p>
    </div>
  )
  if (!session) return <Login onLogin={setSession} />
  return <Journal session={session} onSignOut={() => { api.signOut(); setSession(null) }} />
}

// ── Login ──
function Login({ onLogin }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''),
    [error, setError] = useState(''), [sending, setSending] = useState(false),
    [registering, setRegistering] = useState(false)
  async function signIn(e) {
    e.preventDefault(); setSending(true); setError('')
    try { onLogin(registering ? await api.register(email, password) : await api.login(email, password)) }
    catch (err) { setError(err.message) }
    finally { setSending(false) }
  }
  const signInWithGoogle = useCallback(async credential => {
    setSending(true); setError('')
    try { onLogin(await api.googleLogin(credential)) }
    catch (err) { setError(err.message) }
    finally { setSending(false) }
  }, [onLogin])
  return (
    <main className="login-page">
      <form className="login-card" onSubmit={signIn}>
        <span className="brand-mark">U</span>
        <p className="eyebrow">PRIVATE ARCHIVE</p>
        <h1>{registering ? 'Make this' : 'Welcome back,'}<br /><i>{registering ? 'yours.' : 'love.'}</i></h1>
        <p>{registering ? 'Create your account — each person has their own.' : 'Open the private archive you share together.'}</p>
        <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input required minLength="8" type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        {error && <small className="error">{error}</small>}
        <button className="primary" disabled={sending}>
          {sending ? 'Opening…' : registering ? 'Create my account' : 'Open our memories'} <Heart size={16} />
        </button>
        {!registering && <GoogleSignIn onCredential={signInWithGoogle} disabled={sending} />}
        <button type="button" className="switch-auth" onClick={() => { setRegistering(!registering); setError('') }}>
          {registering ? 'Already have an account? Sign in' : 'First time? Create an account'}
        </button>
      </form>
    </main>
  )
}

function GoogleSignIn({ onCredential, disabled }) {
  const buttonRef = useRef(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return undefined
    let cancelled = false
    const render = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: response => onCredential(response.credential) })
      buttonRef.current.replaceChildren()
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline', size: 'large', text: 'continue_with', width: 350, shape: 'rectangular',
      })
    }
    const existing = document.querySelector('script[data-google-identity]')
    if (window.google?.accounts?.id) render()
    else if (existing) existing.addEventListener('load', render, { once: true })
    else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.dataset.googleIdentity = 'true'
      script.onload = render
      script.onerror = () => !cancelled && setLoadError(true)
      document.head.appendChild(script)
    }
    return () => { cancelled = true }
  }, [onCredential])

  if (!GOOGLE_CLIENT_ID) return null
  return <div className={`google-signin ${disabled ? 'disabled' : ''}`}>
    <span>or</span>
    {loadError ? <small className="error">Google Sign-In could not load.</small> : <div ref={buttonRef} />}
  </div>
}

// ── Journal (main shell) ──
function Journal({ session, onSignOut }) {
  const [memories, setMemories] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [view, setView] = useState('home')
  const [modal, setModal] = useState(false)
  const [entryModal, setEntryModal] = useState(false)
  const [editingMemory, setEditingMemory] = useState(null)
  const [editingDay, setEditingDay] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [notice, setNotice] = useState('')
  const memory = memories.find(m => m.id === activeId) || memories[0]

  useEffect(() => { loadMemories() }, [])
  async function loadMemories() {
    try {
      const data = await api.memories()
      setMemories(data)
      if (data.length && !activeId) setActiveId(data[0].id)
    } catch (error) { setNotice(error.message) }
  }

  async function addMemory(form) {
    const next = {
      id: crypto.randomUUID(), title: form.title,
      place: form.place || 'Somewhere together',
      startDate: form.startDate,
      endDate: form.endDate,
      dates: formatJourneyRange(form.startDate, form.endDate),
      color: form.color,
      cover: form.cover || COVER_PRESETS[0].url,
      days: []
    }
    try { const saved = await api.createMemory(next); next.id = saved.id }
    catch (error) { setNotice(error.message); return }
    setMemories(x => [next, ...x]); setActiveId(next.id); setActiveDay(0); setModal(false)
    setNotice('Your new chapter is ready. Add the first day.')
  }

  async function addEntries(entriesList, dayDate) {
    if (!entriesList || entriesList.length === 0) return
    let targetDay = memory.days.find(d => d.date === dayDate), isNewDay = !targetDay
    if (!targetDay) {
      targetDay = { id: crypto.randomUUID(), date: dayDate || new Date().toISOString().slice(0, 10), label: dayDate ? `Day ${memory.days.length + 1}` : 'The first page', entries: [] }
      isNewDay = true
    }
    if (isNewDay) {
      try { const saved = await api.createDay(memory.id, targetDay); targetDay.id = saved.id }
      catch (error) { setNotice(error.message); return }
      setActiveDay(memory.days.length)
    }
    try {
      const savedEntries = await api.createEntriesBulk(targetDay.id, entriesList)
      setMemories(all => all.map(m => m.id !== memory.id ? m : isNewDay
        ? { ...m, days: [...m.days, { ...targetDay, entries: savedEntries }] }
        : { ...m, days: m.days.map(day => day.id !== targetDay.id ? day : { ...day, entries: [...day.entries, ...savedEntries] }) }
      ))
      setEntryModal(false)
      setNotice(savedEntries.length > 1 ? `Added ${savedEntries.length} moments to your timeline.` : 'Added to your timeline.')
    } catch (error) { setNotice(error.message) }
  }

  async function updateMemory(memoryId, form) {
    try {
      const saved = await api.updateMemory(memoryId, { ...form, dates: formatJourneyRange(form.startDate, form.endDate) })
      setMemories(all => all.map(m => m.id === memoryId ? saved : m))
      setEditingMemory(null); setNotice('Chapter updated.')
    } catch (error) { setNotice(error.message) }
  }

  async function deleteMemory(memoryId) {
    if (!window.confirm('Delete this chapter and every moment inside it? This cannot be undone.')) return
    try {
      await api.deleteMemory(memoryId)
      setMemories(all => {
        const next = all.filter(m => m.id !== memoryId)
        setActiveId(next[0]?.id || null)
        return next
      })
      setView('home'); setNotice('Chapter deleted.')
    } catch (error) { setNotice(error.message) }
  }

  async function updateDay(dayId, form) {
    try {
      const saved = await api.updateDay(dayId, form)
      setMemories(all => all.map(m => m.id !== memory.id ? m : { ...m, days: m.days.map(d => d.id === dayId ? saved : d) }))
      setEditingDay(null); setNotice('Day updated.')
    } catch (error) { setNotice(error.message) }
  }

  async function deleteDay(dayId) {
    if (!window.confirm('Delete this day and all of its moments? This cannot be undone.')) return
    try {
      await api.deleteDay(dayId)
      setMemories(all => all.map(m => m.id !== memory.id ? m : { ...m, days: m.days.filter(d => d.id !== dayId) }))
      setActiveDay(0); setEditingDay(null); setNotice('Day deleted.')
    } catch (error) { setNotice(error.message) }
  }

  async function updateEntry(entryId, form) {
    try {
      const saved = await api.updateEntry(entryId, form)
      setMemories(all => all.map(m => m.id !== memory.id ? m : { ...m, days: m.days.map(d => ({ ...d, entries: d.entries.map(e => e.id === entryId ? saved : e) })) }))
      setEditingEntry(null); setNotice('Moment updated.')
    } catch (error) { setNotice(error.message) }
  }

  async function deleteEntry(entryId) {
    if (!window.confirm('Delete this moment? This cannot be undone.')) return
    try {
      await api.deleteEntry(entryId)
      setMemories(all => all.map(m => m.id !== memory.id ? m : { ...m, days: m.days.map(d => ({ ...d, entries: d.entries.filter(e => e.id !== entryId) })) }))
      setNotice('Moment deleted.')
    } catch (error) { setNotice(error.message) }
  }

  // Get initials from session email
  const initials = useMemo(() => {
    if (!session?.email) return 'U'
    return session.email.substring(0, 2).toUpperCase()
  }, [session])

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')}>
          <span className="brand-mark">U</span>
          <span>us, always</span>
        </button>
        <div className="header-actions">
          <span className="tiny-heart">♥</span>
          <button className="signout" title="Sign out" onClick={onSignOut}><LogOut size={17} /></button>
          <button className="profile" title="Your profile & partner" onClick={() => setProfileOpen(true)}>
            {initials}
          </button>
        </div>
      </header>

      {notice && (
        <div className="toast">
          {notice}
          <button onClick={() => setNotice('')}><X size={14} /></button>
        </div>
      )}

      {view === 'home'
        ? <Home memories={memories} onOpen={id => { setActiveId(id); setActiveDay(0); setView('timeline') }} onAdd={() => setModal(true)} />
        : <MemoryView memory={memory} activeDay={activeDay} setActiveDay={setActiveDay} view={view} setView={setView} onBack={() => setView('home')} onAdd={() => setEntryModal(true)} onEditMemory={() => setEditingMemory(memory)} onDeleteMemory={() => deleteMemory(memory.id)} onEditDay={day => setEditingDay(day)} onDeleteDay={day => deleteDay(day.id)} onEditEntry={entry => setEditingEntry(entry)} onDeleteEntry={entry => deleteEntry(entry.id)} />
      }

      {modal && <MemoryModal onClose={() => setModal(false)} onSave={addMemory} />}
      {editingMemory && <MemoryModal memory={editingMemory} onClose={() => setEditingMemory(null)} onSave={form => updateMemory(editingMemory.id, form)} />}
      {entryModal && <EntryModal color={memory?.color} onClose={() => setEntryModal(false)} onSave={addEntries} />}
      {editingDay && <DayModal day={editingDay} onClose={() => setEditingDay(null)} onSave={form => updateDay(editingDay.id, form)} />}
      {editingEntry && <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onSave={form => updateEntry(editingEntry.id, form)} />}
      {profileOpen && (
        <ProfileModal
          session={session}
          onClose={() => setProfileOpen(false)}
          onNotice={setNotice}
        />
      )}
    </main>
  )
}

// ── Home grid ──
function Home({ memories, onOpen, onAdd }) {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">OUR LITTLE ARCHIVE <Sparkles size={14} /></p>
        <h1>All the places<br /><i>we became us.</i></h1>
        <p className="hero-copy">A private home for your loudest laughs, quietest days, and every beautiful in-between.</p>
        <button className="primary" onClick={onAdd}><Plus size={18} /> Start a new memory</button>
      </section>
      <section className="collection">
        <div className="section-head">
          <div><p className="eyebrow">THE COLLECTION</p><h2>Pick a chapter</h2></div>
          <span>{memories.length} {memories.length === 1 ? 'story' : 'stories'}</span>
        </div>
        <div className="memory-grid">
          {memories.map((m, i) => (
            <button className={`memory-card card-${i % 6}`} key={m.id} onClick={() => onOpen(m.id)}>
              <img src={m.cover} alt="" loading="lazy" />
              <span className="wash" style={{ background: `linear-gradient(transparent, ${m.color})` }} />
              <div>
                <small>{m.dates}</small>
                <h3>{m.title}</h3>
                <p><MapPin size={13} />{m.place}</p>
              </div>
            </button>
          ))}
          <button className="new-card" onClick={onAdd}>
            <span><Plus size={24} /></span>
            <b>A future favourite</b>
            <p>Begin a new chapter</p>
          </button>
        </div>
      </section>
    </>
  )
}

// ── Memory view ──
function MemoryView({ memory, activeDay, setActiveDay, view, setView, onBack, onAdd, onEditMemory, onDeleteMemory, onEditDay, onDeleteDay, onEditEntry, onDeleteEntry }) {
  const day = memory.days[activeDay]
  const [month, setMonth] = useState(new Date(memory.days[0]?.date || Date.now()))
  const daysWithEntries = useMemo(() => new Set(memory.days.map(d => d.date)), [memory])
  return (
    <>
      <section className="memory-hero" style={{ '--accent': memory.color }}>
        <img src={memory.cover} alt="" />
        <div className="hero-shade" />
        <button className="back" onClick={onBack}><ChevronLeft size={18} /> All memories</button>
        <div className="memory-actions">
          <button title="Edit chapter" onClick={onEditMemory}><Pencil size={16} /></button>
          <button title="Delete chapter" className="danger" onClick={onDeleteMemory}><Trash2 size={16} /></button>
        </div>
        <div className="memory-title">
          <p><MapPin size={14} />{memory.place}</p>
          <h1>{memory.title}</h1>
          <span>{memory.dates}</span>
        </div>
      </section>
      <nav className="memory-nav">
        <div className="day-pills">
          {memory.days.map((d, i) => (
            <button className={i === activeDay ? 'selected' : ''} onClick={() => setActiveDay(i)} key={d.date}>
              <small>DAY {String(i + 1).padStart(2, '0')}</small>
              <b>{new Date(`${d.date}T00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</b>
            </button>
          ))}
          <button className="add-day" onClick={onAdd}>+ add moment</button>
        </div>
        <div className="view-toggle">
          <button className={view === 'timeline' ? 'active' : ''} onClick={() => setView('timeline')}><LayoutGrid size={17} /></button>
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}><CalendarDays size={17} /></button>
        </div>
      </nav>
      {view === 'calendar'
        ? <Calendar memory={memory} month={month} setMonth={setMonth} days={daysWithEntries} onDay={(date) => { const i = memory.days.findIndex(d => d.date === date); if (i >= 0) { setActiveDay(i); setView('timeline') } }} />
        : (
          <section className="timeline">
            <div className="day-intro">
              <p className="eyebrow" style={{ color: memory.color }}>IN THIS CHAPTER</p>
              <div className="day-heading"><h2>{day?.label || 'Add your first day'}</h2>{day && <span className="item-actions"><button title="Edit day" onClick={() => onEditDay(day)}><Pencil size={14} /></button><button title="Delete day" className="danger" onClick={() => onDeleteDay(day)}><Trash2 size={14} /></button></span>}</div>
              <p>{day ? new Date(`${day.date}T00:00`).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Your story starts here.'}</p>
            </div>
            <div className="entries">
              {day?.entries.map(entry => (
                <article className={`entry ${entry.type}`} key={entry.id}>
                  <span className="item-actions entry-actions"><button title="Edit moment" onClick={() => onEditEntry(entry)}><Pencil size={14} /></button><button title="Delete moment" className="danger" onClick={() => onDeleteEntry(entry)}><Trash2 size={14} /></button></span>
                  {entry.type === 'photo'
                    ? <><img src={entry.url} alt={entry.caption} loading="lazy" /><p>{entry.caption}</p></>
                    : <><span className="quote-mark" style={{ color: entry.color }}>"</span><p style={{ color: entry.color }}>{entry.text}</p></>
                  }
                </article>
              ))}
              <button className="timeline-add" onClick={onAdd}><Plus size={19} /> Add another little moment</button>
            </div>
          </section>
        )
      }
    </>
  )
}

// ── Calendar ──
function Calendar({ memory, month, setMonth, days, onDay }) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1)
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: start.getDay() + total }, (_, i) => i < start.getDay() ? null : i - start.getDay() + 1)
  const iso = n => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`
  return (
    <section className="calendar-wrap">
      <div className="calendar-head">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></button>
        <h2>{month.toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></button>
      </div>
      <div className="weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(x => <span key={x}>{x}</span>)}</div>
      <div className="calendar-grid">
        {cells.map((n, i) => n
          ? <button key={i} onClick={() => days.has(iso(n)) && onDay(iso(n))} className={days.has(iso(n)) ? 'has-memory' : ''}>{n}{days.has(iso(n)) && <i style={{ background: memory.color }} />}</button>
          : <span key={i} />
        )}
      </div>
      <p className="calendar-note">Tap a coloured date to open that day's memories.</p>
    </section>
  )
}

// ── Location autocomplete using Curated Indian Destinations + Global Photon ──
function LocationSelect({ value, onChange }) {
  const [options, setOptions] = useState(FEATURED_PLACES)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  const selectedOption = useMemo(() => {
    if (!value) return null
    const found = options.find(o => o.value === value) || FEATURED_PLACES.find(o => o.value === value)
    return found || { value, label: value }
  }, [value, options])

  const handleSearch = useCallback(async (q) => {
    if (!q || !q.trim()) {
      setOptions(FEATURED_PLACES)
      return
    }

    const localMatches = searchLocalDestinations(q)
    setOptions(localMatches.length > 0 ? localMatches : [])

    if (q.trim().length >= 2) {
      setLoading(true)
      try {
        const photonList = await searchPhotonPlaces(q)
        setOptions(prev => {
          const seen = new Set(prev.map(p => p.value.toLowerCase()))
          const combined = [...prev]
          for (const item of photonList) {
            if (!seen.has(item.value.toLowerCase())) {
              seen.add(item.value.toLowerCase())
              combined.push(item)
            }
          }
          return combined
        })
      } finally {
        setLoading(false)
      }
    }
  }, [])

  function handleInputChange(v, { action }) {
    if (action === 'input-change') {
      const local = searchLocalDestinations(v)
      if (local.length > 0) {
        setOptions(local)
      }
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => handleSearch(v), 250)
    }
  }

  function handleSelect(opt) {
    if (!opt) {
      onChange('')
      setOptions(FEATURED_PLACES)
      return
    }
    const val = opt.value || opt.label || ''
    onChange(val)
  }

  function handleCreate(newVal) {
    const trimmed = newVal.trim()
    if (!trimmed) return
    onChange(trimmed)
    setOptions(prev => [{ value: trimmed, label: trimmed }, ...prev])
  }

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: '#fff',
      border: `1px solid ${state.isFocused ? '#bd684b' : '#ded4ca'}`,
      borderRadius: 6,
      boxShadow: state.isFocused ? '0 0 0 3px #bd684b22' : 'none',
      minHeight: 44,
      marginTop: 6,
      fontFamily: 'inherit',
      fontSize: 14,
      cursor: 'text',
    }),
    placeholder: base => ({ ...base, color: '#b0a098' }),
    singleValue: base => ({
      ...base,
      color: '#302722',
      fontSize: 14,
      fontWeight: 500,
    }),
    input: base => ({
      ...base,
      color: '#302722',
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? '#f5ede7' : '#fff',
      color: '#302722',
      fontSize: 13,
      cursor: 'pointer',
      padding: '9px 14px',
    }),
    menu: base => ({
      ...base,
      zIndex: 100,
      borderRadius: 6,
      boxShadow: '0 8px 28px #1d100930',
      border: '1px solid #ede5db',
    }),
    loadingMessage: base => ({ ...base, color: '#9d6755', fontSize: 13 }),
    noOptionsMessage: base => ({ ...base, color: '#9d6755', fontSize: 13 }),
  }

  return (
    <CreatableSelect
      isClearable
      onInputChange={handleInputChange}
      value={selectedOption}
      options={options}
      onChange={handleSelect}
      onCreateOption={handleCreate}
      isLoading={loading}
      placeholder="e.g. Jibbi, Shimla, Dharamshala…"
      formatCreateLabel={v => `📍 Use "${v}"`}
      noOptionsMessage={({ inputValue: iv }) =>
        iv ? `Press Enter to use "${iv}"` : 'Type a place, hill station or city…'
      }
      loadingMessage={() => 'Searching places…'}
      filterOption={() => true}
      styles={customStyles}
      components={{
        DropdownIndicator: () => <MapPin size={15} style={{ margin: '0 8px', color: '#9d6755' }} />,
        IndicatorSeparator: () => null,
      }}
    />
  )
}

// ── Memory modal (create) ──
function MemoryModal({ onClose, onSave, memory = null }) {
  const [f, setF] = useState(() => ({
    title: memory?.title || '', place: memory?.place || '', startDate: memory?.startDate || '', endDate: memory?.endDate || '',
    color: memory?.color || '#C45B38', cover: memory?.cover || COVER_PRESETS[0].url,
  }))
  const [showAdd, setShowAdd] = useState(false)
  const [addMode, setAddMode] = useState('upload')
  const [customUrl, setCustomUrl] = useState('')
  const [customImage, setCustomImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  function applyCustomUrl() {
    const url = customUrl.trim()
    if (url) {
      setF(prev => ({ ...prev, cover: url }))
      setCustomImage(url)
      setShowAdd(false)
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      try {
        const results = await uploadMultipleToCloudinary([file])
        if (results[0]?.url) {
          setF(prev => ({ ...prev, cover: results[0].url }))
          setCustomImage(results[0].url)
          setShowAdd(false)
          return
        }
      } catch {
        // Fallback to local data URL if Cloudinary fails
      }
      const reader = new FileReader()
      reader.onload = ev => {
        const url = ev.target?.result
        if (url) {
          setF(prev => ({ ...prev, cover: url }))
          setCustomImage(url)
          setShowAdd(false)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="modal memory-modal" onSubmit={e => { e.preventDefault(); onSave(f) }}>
        <button type="button" className="close" onClick={onClose}><X /></button>
        <p className="eyebrow">{memory ? 'REFINE THE CHAPTER' : 'A BRAND-NEW CHAPTER'}</p>
        <h2>{memory ? 'Make this memory yours.' : 'Where did you two go?'}</h2>

        <label>Memory title
          <input required placeholder="e.g. Our trip to the hills" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        </label>

        <label>Place
          <LocationSelect value={f.place} onChange={place => setF({ ...f, place })} />
        </label>

        <label>When?
          <span className="date-range" role="group" aria-label="Journey dates">
            <input required type="date" aria-label="Journey start date" value={f.startDate} onChange={e => setF({ ...f, startDate: e.target.value })} />
            <span aria-hidden="true">through</span>
            <input required type="date" min={f.startDate || undefined} aria-label="Journey end date" value={f.endDate} onChange={e => setF({ ...f, endDate: e.target.value })} />
          </span>
          {f.startDate && f.endDate && <small className="date-range-preview">{formatJourneyRange(f.startDate, f.endDate)}</small>}
        </label>

        <label>Accent colour
          <input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} />
        </label>

        <div style={{ marginTop: 14 }}>
          <div className="cover-header-row">
            <p className="eyebrow" style={{ margin: 0 }}>COVER BACKGROUND</p>
            <button
              type="button"
              className={`cover-add-btn ${showAdd ? 'active' : ''}`}
              onClick={() => setShowAdd(s => !s)}
            >
              <Plus size={13} /> {showAdd ? 'Close' : 'Add image'}
            </button>
          </div>

          {/* Exactly 8 preset images = 2 rows of 4 */}
          <div className="cover-grid">
            {COVER_PRESETS.slice(0, 8).map(p => (
              <button
                key={p.url}
                type="button"
                className={`cover-preset ${f.cover === p.url ? 'selected' : ''}`}
                onClick={() => setF({ ...f, cover: p.url })}
                title={p.label}
              >
                <img src={p.url} alt={p.label} loading="lazy" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Add custom image panel */}
          {showAdd && (
            <div className="cover-add-panel">
              <div className="cover-add-tabs">
                <button
                  type="button"
                  className={addMode === 'upload' ? 'active' : ''}
                  onClick={() => setAddMode('upload')}
                >
                  <ImagePlus size={13} /> Upload photo
                </button>
                <button
                  type="button"
                  className={addMode === 'url' ? 'active' : ''}
                  onClick={() => setAddMode('url')}
                >
                  <Link2 size={13} /> Paste image URL
                </button>
              </div>

              {addMode === 'upload' ? (
                <div
                  className="cover-upload-box"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <ImagePlus size={22} />
                  <span>{uploading ? 'Processing photo…' : 'Click to choose an image from your computer'}</span>
                </div>
              ) : (
                <div className="custom-url-row">
                  <input
                    autoFocus
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyCustomUrl())}
                  />
                  <button type="button" className="custom-url-apply" onClick={applyCustomUrl}>
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Custom image indicator */}
          {customImage && f.cover === customImage && (
            <div className="custom-active-tag">
              <span>✨ Custom photo applied as cover</span>
              <button type="button" onClick={() => setF({ ...f, cover: COVER_PRESETS[0].url })}>
                Reset to preset
              </button>
            </div>
          )}
        </div>

        {f.cover && (
          <div className="cover-preview">
            <img src={f.cover} alt="cover preview" />
            <div style={{ background: `linear-gradient(transparent, ${f.color})` }} />
          </div>
        )}

        <button className="primary" type="submit">{memory ? 'Save changes' : 'Create the chapter'} <Heart size={17} /></button>
      </form>
    </div>
  )
}

// ── Day & moment editing ──
function DayModal({ day, onClose, onSave }) {
  const [label, setLabel] = useState(day.label)
  const [date, setDate] = useState(day.date)
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="modal edit-modal" onSubmit={e => { e.preventDefault(); onSave({ label, date }) }}>
        <button type="button" className="close" onClick={onClose}><X size={16} /></button>
        <p className="eyebrow">EDIT DAY</p><h2>Shape this chapter.</h2>
        <label>Day title<input required value={label} onChange={e => setLabel(e.target.value)} /></label>
        <label>Date<input required type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <button className="primary" type="submit">Save day <Heart size={17} /></button>
      </form>
    </div>
  )
}

function EditEntryModal({ entry, onClose, onSave }) {
  const [text, setText] = useState(entry.text || '')
  const [caption, setCaption] = useState(entry.caption || '')
  const [color, setColor] = useState(entry.color || '#C45B38')
  const [url, setUrl] = useState(entry.url || '')
  const submit = e => {
    e.preventDefault()
    onSave(entry.type === 'photo'
      ? { ...entry, url, caption }
      : { ...entry, text, color })
  }
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="modal edit-modal" onSubmit={submit}>
        <button type="button" className="close" onClick={onClose}><X size={16} /></button>
        <p className="eyebrow">EDIT MOMENT</p><h2>Keep the details true.</h2>
        {entry.type === 'photo' ? <>
          <label>Photo URL<input required type="url" value={url} onChange={e => setUrl(e.target.value)} /></label>
          <label>Caption<input value={caption} onChange={e => setCaption(e.target.value)} /></label>
        </> : <>
          <label>Your words<textarea required value={text} onChange={e => setText(e.target.value)} /></label>
          <label>Text colour<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
        </>}
        <button className="primary" type="submit">Save moment <Heart size={17} /></button>
      </form>
    </div>
  )
}

// ── Entry modal ──
function EntryModal({ color: initialColor, onClose, onSave }) {
  const [kind, setKind] = useState('photo')
  const [text, setText] = useState('')
  const [caption, setCaption] = useState('')
  const [files, setFiles] = useState([])
  const [color, setColor] = useState(initialColor)
  const [dayDate, setDayDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const fileInput = useRef()

  const previews = useMemo(() => files.map(file => ({ file, url: URL.createObjectURL(file), name: file.name })), [files])

  function handleFiles(selectedFiles) {
    const arr = Array.from(selectedFiles || [])
    if (arr.length === 0) return
    setFiles(prev => [...prev, ...arr])
  }

  function removePhoto(idx) { setFiles(prev => prev.filter((_, i) => i !== idx)) }

  async function submit(e) {
    e.preventDefault(); setSaving(true); setUploadStatus('')
    try {
      if (kind === 'text') {
        await onSave([{ type: 'text', text, color }], dayDate)
      } else if (files.length > 0) {
        setUploadStatus(`Uploading 0 of ${files.length} photos...`)
        const uploaded = await uploadMultipleToCloudinary(files, (done, total) => setUploadStatus(`Uploading ${done} of ${total} photos...`))
        const entries = uploaded.map(u => ({ type: 'photo', url: u.url, publicId: u.publicId, caption: caption || '' }))
        setUploadStatus('Saving moments to journal...')
        await onSave(entries, dayDate)
      } else {
        await onSave([{ type: 'photo', url: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=1000&q=85', caption: caption || 'A little moment, saved forever.' }], dayDate)
      }
    } catch (err) { alert(err.message) }
    finally { setSaving(false); setUploadStatus('') }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <form className="modal entry-modal" onSubmit={submit}>
        <button type="button" className="close" onClick={onClose}><X size={16} /></button>
        <p className="eyebrow">ADD TO THE STORY</p>
        <h2>What do you want to remember?</h2>
        <label>Which day?
          <input required type="date" value={dayDate} onChange={e => setDayDate(e.target.value)} />
        </label>
        <div className="kind-switch">
          <button type="button" className={kind === 'photo' ? 'chosen' : ''} onClick={() => setKind('photo')}>
            <ImagePlus size={17} /> Photos {files.length > 0 && <span className="photo-count-badge">{files.length}</span>}
          </button>
          <button type="button" className={kind === 'text' ? 'chosen' : ''} onClick={() => setKind('text')}>
            <Sparkles size={17} /> Highlight
          </button>
        </div>
        {kind === 'photo' ? (
          <>
            <button type="button" className="filepick" onClick={() => fileInput.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
              <ImagePlus size={20} />
              <div>
                <b>{files.length > 0 ? `Add more photos (${files.length} selected)` : 'Choose photos'}</b>
                <span className="filepick-subtext">Click or drag & drop multiple images</span>
              </div>
            </button>
            <input hidden multiple ref={fileInput} type="file" accept="image/*" onChange={e => handleFiles(e.target.files)} />
            {previews.length > 0 && (
              <div className="bulk-preview-grid">
                {previews.map((item, idx) => (
                  <div className="bulk-preview-item" key={idx} title={item.name}>
                    <img src={item.url} alt="" />
                    <button type="button" className="bulk-preview-remove" onClick={() => removePhoto(idx)} title="Remove photo"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <label>Caption {files.length > 1 && '(applied to selected moments)'}
              <input value={caption} placeholder="What made this moment special?" onChange={e => setCaption(e.target.value)} />
            </label>
          </>
        ) : (
          <>
            <label>Your words
              <textarea required value={text} placeholder="The little thing you never want to forget…" onChange={e => setText(e.target.value)} />
            </label>
            <label>Text colour
              <input type="color" value={color} onChange={e => setColor(e.target.value)} />
            </label>
          </>
        )}
        {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
        <button className="primary" disabled={saving}>
          {saving ? (uploadStatus || 'Saving…') : (files.length > 1 ? `Save ${files.length} moments` : 'Save this moment')} <Heart size={17} />
        </button>
      </form>
    </div>
  )
}

// ── Profile modal (S&A button) ──
function ProfileModal({ session, onClose, onNotice }) {
  const [connStatus, setConnStatus] = useState(null) // null = loading
  const [inviteEmail, setInviteEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadStatus() }, [])

  async function loadStatus() {
    try { setConnStatus(await api.connectionStatus()) }
    catch { setConnStatus({ status: 'none' }) }
  }

  async function sendInvite(e) {
    e.preventDefault(); setSending(true); setError('')
    try {
      const res = await api.sendInvite(inviteEmail)
      onNotice(res.message)
      loadStatus()
      setInviteEmail('')
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  async function respond(connectionId, accept) {
    try {
      const res = await api.respondInvite(connectionId, accept)
      onNotice(res.message)
      loadStatus()
    } catch (err) { onNotice(err.message) }
  }

  async function disconnect() {
    if (!confirm('Disconnect from your partner? You will no longer share memories (existing memories remain).')) return
    try { const res = await api.disconnect(); onNotice(res.message); loadStatus() }
    catch (err) { onNotice(err.message) }
  }

  async function cancelInvite() {
    try { const res = await api.cancelInvite(); onNotice(res.message); loadStatus() }
    catch (err) { onNotice(err.message) }
  }

  const emailInitials = session?.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal profile-modal">
        <button type="button" className="close" onClick={onClose}><X /></button>

        {/* My profile */}
        <div className="profile-header">
          <div className="profile-avatar">{emailInitials}</div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>YOUR ACCOUNT</p>
            <p className="profile-email">{session?.email}</p>
          </div>
        </div>

        <div className="profile-divider" />

        {/* Connection section */}
        <p className="eyebrow" style={{ marginBottom: 14 }}>PARTNER CONNECTION</p>

        {connStatus === null && <p className="profile-hint">Loading…</p>}

        {connStatus?.status === 'connected' && (
          <div className="partner-connected">
            <div className="partner-badge">
              <Link2 size={16} />
              <div>
                <b>Connected with</b>
                <span>{connStatus.partner_email}</span>
              </div>
            </div>
            <p className="profile-hint">You share all memories, photos, and moments together. ♥</p>
            <button className="disconnect-btn" onClick={disconnect}>
              <Link2Off size={15} /> Disconnect
            </button>
          </div>
        )}

        {connStatus?.status === 'pending_sent' && (
          <div className="invite-pending">
            <div className="invite-pill">
              <UserPlus size={15} />
              <span>Invite sent to <b>{connStatus.invitee_email}</b></span>
            </div>
            <p className="profile-hint">Waiting for them to accept. Share your email with your partner so they can log in and accept.</p>
            <button className="disconnect-btn" onClick={cancelInvite}>Cancel invite</button>
          </div>
        )}

        {connStatus?.status === 'pending_received' && (
          <div className="invite-received">
            <p className="profile-hint" style={{ marginBottom: 12 }}>
              <b>{connStatus.from_email}</b> wants to connect and share memories with you.
            </p>
            <div className="invite-actions">
              <button className="primary" style={{ flex: 1 }} onClick={() => respond(connStatus.connection_id, true)}>
                <Heart size={15} /> Accept
              </button>
              <button className="disconnect-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => respond(connStatus.connection_id, false)}>
                Decline
              </button>
            </div>
          </div>
        )}

        {connStatus?.status === 'none' && (
          <div>
            <p className="profile-hint" style={{ marginBottom: 14 }}>
              Connect with your partner using their email address. Once connected, all your memories are shared between both accounts.
            </p>
            <form onSubmit={sendInvite} className="invite-form">
              <input
                required type="email"
                placeholder="partner@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="invite-input"
              />
              <button className="primary invite-send" type="submit" disabled={sending}>
                {sending ? '…' : <><UserPlus size={15} /> Connect</>}
              </button>
            </form>
            {error && <small className="error" style={{ marginTop: 8, display: 'block' }}>{error}</small>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
