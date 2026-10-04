import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Heart, ImagePlus, LayoutGrid, LogOut, MapPin, Plus, Sparkles, X } from 'lucide-react'
import { api, uploadToCloudinary, uploadMultipleToCloudinary } from './lib'

const sample = [
  { id: 'jaipur', title: 'Jaipur, in golden light', place: 'Jaipur · India', dates: '18–21 Oct 2026', color: '#D76D43', cover: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85', days: [
    { date: '2026-10-18', label: 'Day 01 · arriving slowly', entries: [{ type: 'text', text: 'We made it. The city already feels like it has a secret for us.', color: '#C45B38' }, { type: 'photo', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=85', caption: 'The first warm hello from Jaipur.' }] },
    { date: '2026-10-19', label: 'Day 02 · pink city', entries: [{ type: 'photo', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=85', caption: 'Every window looked like a postcard.' }, { type: 'text', text: 'Favourite moment: chai on a tiny rooftop, talking until the sky turned violet.', color: '#8054A8' }] },
    { date: '2026-10-20', label: 'Day 03 · a little lost', entries: [{ type: 'photo', url: 'https://images.unsplash.com/photo-1598605272254-16f0c9c3c27e?auto=format&fit=crop&w=1000&q=85', caption: 'Getting lost was part of the plan.' }] }
  ] },
  { id: '10k', title: 'We did the 10K', place: 'Cubbon Park · Bengaluru', dates: '12 May 2026', color: '#4D8B75', cover: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1200&q=85', days: [{ date: '2026-05-12', label: '10 kilometres & a million feelings', entries: [{ type: 'text', text: 'A finish line, two tired legs, and the biggest smile.', color: '#4D8B75' }, { type: 'photo', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=85', caption: 'We showed up for each other.' }] }] },
  { id: 'goa', title: 'Goa, no plans', place: 'South Goa · India', dates: '3–6 Feb 2026', color: '#597CB6', cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85', days: [{ date: '2026-02-03', label: 'Salt, sun & you', entries: [{ type: 'photo', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85', caption: 'Our favourite shade of blue.' }] }] }
]

function App() {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    api.me().then(setSession).catch(() => setSession(null))
  }, [])
  if (session === undefined) return <div className="loading">Opening your archive…</div>
  if (!session) return <Login onLogin={setSession}/>
  return <Journal onSignOut={() => { api.signOut(); setSession(null) }} />
}

function Login({ onLogin }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [sending, setSending] = useState(false), [registering,setRegistering]=useState(false)
  async function signIn(e) { e.preventDefault(); setSending(true); setError(''); try { onLogin(registering ? await api.register(email,password) : await api.login(email,password)) } catch(err) { setError(err.message) } finally { setSending(false) } }
  return <main className="login-page"><form className="login-card" onSubmit={signIn}><span className="brand-mark">U</span><p className="eyebrow">PRIVATE ARCHIVE</p><h1>{registering?'Make this':'Welcome back,'}<br/><i>{registering?'yours.':'love.'}</i></h1><p>{registering?'Create the one shared account for both of you.':'Open the private archive you share together.'}</p><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Password<input required minLength="8" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>{error && <small className="error">{error}</small>}<button className="primary" disabled={sending}>{sending ? 'Opening…' : registering?'Create our archive':'Open our memories'} <Heart size={16}/></button><button type="button" className="switch-auth" onClick={()=>{setRegistering(!registering);setError('')}}>{registering?'Already have the shared account? Sign in':'First time? Create the shared account'}</button></form></main>
}

function Journal({ onSignOut }) {
  const [memories, setMemories] = useState(sample)
  const [activeId, setActiveId] = useState('jaipur')
  const [view, setView] = useState('home')
  const [modal, setModal] = useState(false)
  const [entryModal, setEntryModal] = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [notice, setNotice] = useState('')
  const memory = memories.find(m => m.id === activeId) || memories[0]

  useEffect(() => { loadMemories() }, [])
  async function loadMemories() {
    try { const data = await api.memories(); setMemories(data); if (data.length) setActiveId(data[0].id) } catch (error) { setNotice(error.message) }
  }
  async function addMemory(form) {
    const next = { id: crypto.randomUUID(), title: form.title, place: form.place || 'Somewhere together', dates: form.dates, color: form.color, cover: form.cover || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85', days: [] }
    try { const saved = await api.createMemory(next); next.id = saved.id } catch (error) { setNotice(error.message); return }
    setMemories(x => [next, ...x]); setActiveId(next.id); setActiveDay(0); setModal(false)
    setNotice('Your new chapter is ready. Add the first day.')
  }
  async function addEntries(entriesList, dayDate) {
    if (!entriesList || entriesList.length === 0) return
    let targetDay = memory.days.find(d => d.date === dayDate), isNewDay = !targetDay
    if (!targetDay) {
      targetDay = { id: crypto.randomUUID(), date: dayDate || new Date().toISOString().slice(0,10), label: dayDate ? `Day ${memory.days.length + 1}` : 'The first page', entries: [] }; isNewDay = true
    }
    if (isNewDay) {
      try { const saved = await api.createDay(memory.id, targetDay); targetDay.id = saved.id } catch (error) { setNotice(error.message); return }
      setActiveDay(memory.days.length)
    }
    try {
      const savedEntries = await api.createEntriesBulk(targetDay.id, entriesList)
      setMemories(all => all.map(m => m.id !== memory.id ? m : isNewDay ? { ...m, days: [...m.days, { ...targetDay, entries: savedEntries }] } : { ...m, days: m.days.map(day => day.id !== targetDay.id ? day : { ...day, entries: [...day.entries, ...savedEntries] }) }))
      setEntryModal(false)
      setNotice(savedEntries.length > 1 ? `Added ${savedEntries.length} moments to your timeline.` : 'Added to your timeline.')
    } catch (error) {
      setNotice(error.message)
    }
  }
  return <main>
    <header className="topbar"><button className="brand" onClick={() => setView('home')}><span className="brand-mark">U</span><span>us, always</span></button><div className="header-actions"><span className="tiny-heart">♥</span><button className="signout" title="Sign out" onClick={onSignOut}><LogOut size={17}/></button><button className="profile">S & A</button></div></header>
    {notice && <div className="toast">{notice}<button onClick={() => setNotice('')}><X size={14}/></button></div>}
    {view === 'home' ? <Home memories={memories} onOpen={id => {setActiveId(id); setActiveDay(0); setView('timeline')}} onAdd={() => setModal(true)} /> : <MemoryView memory={memory} activeDay={activeDay} setActiveDay={setActiveDay} view={view} setView={setView} onBack={() => setView('home')} onAdd={() => setEntryModal(true)} />}
    {modal && <MemoryModal onClose={() => setModal(false)} onSave={addMemory}/>} {entryModal && <EntryModal color={memory.color} onClose={() => setEntryModal(false)} onSave={addEntries}/>} 
  </main>
}

function Home({ memories, onOpen, onAdd }) { return <><section className="hero"><p className="eyebrow">OUR LITTLE ARCHIVE <Sparkles size={14}/></p><h1>All the places<br/><i>we became us.</i></h1><p className="hero-copy">A private home for your loudest laughs, quietest days, and every beautiful in-between.</p><button className="primary" onClick={onAdd}><Plus size={18}/> Start a new memory</button></section><section className="collection"><div className="section-head"><div><p className="eyebrow">THE COLLECTION</p><h2>Pick a chapter</h2></div><span>{memories.length} stories</span></div><div className="memory-grid">{memories.map((m, i) => <button className={`memory-card card-${i}`} key={m.id} onClick={() => onOpen(m.id)}><img src={m.cover} alt=""/><span className="wash" style={{background: `linear-gradient(transparent, ${m.color})`}}/><div><small>{m.dates}</small><h3>{m.title}</h3><p><MapPin size={13}/>{m.place}</p></div></button>)}<button className="new-card" onClick={onAdd}><span><Plus size={24}/></span><b>A future favourite</b><p>Begin a new chapter</p></button></div></section></> }

function MemoryView({ memory, activeDay, setActiveDay, view, setView, onBack, onAdd }) { const day = memory.days[activeDay]; const [month, setMonth] = useState(new Date(memory.days[0]?.date || Date.now())); const daysWithEntries = useMemo(() => new Set(memory.days.map(d => d.date)), [memory]); return <><section className="memory-hero" style={{'--accent': memory.color}}><img src={memory.cover} alt=""/><div className="hero-shade"/><button className="back" onClick={onBack}><ChevronLeft size={18}/> All memories</button><div className="memory-title"><p><MapPin size={14}/>{memory.place}</p><h1>{memory.title}</h1><span>{memory.dates}</span></div></section><nav className="memory-nav"><div className="day-pills">{memory.days.map((d,i) => <button className={i===activeDay?'selected':''} onClick={() => setActiveDay(i)} key={d.date}><small>DAY {String(i+1).padStart(2,'0')}</small><b>{new Date(`${d.date}T00:00`).toLocaleDateString('en',{month:'short',day:'numeric'})}</b></button>)}<button className="add-day" onClick={onAdd}>+ add moment</button></div><div className="view-toggle"><button className={view==='timeline'?'active':''} onClick={() => setView('timeline')}><LayoutGrid size={17}/></button><button className={view==='calendar'?'active':''} onClick={() => setView('calendar')}><CalendarDays size={17}/></button></div></nav>{view==='calendar' ? <Calendar memory={memory} month={month} setMonth={setMonth} days={daysWithEntries} onDay={(date) => {const i=memory.days.findIndex(d=>d.date===date); if(i>=0){setActiveDay(i);setView('timeline')}}}/> : <section className="timeline"><div className="day-intro"><p className="eyebrow" style={{color:memory.color}}>IN THIS CHAPTER</p><h2>{day?.label || 'Add your first day'}</h2><p>{day ? new Date(`${day.date}T00:00`).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : 'Your story starts here.'}</p></div><div className="entries">{day?.entries.map((entry,i) => <article className={`entry ${entry.type}`} key={i}>{entry.type === 'photo' ? <><img src={entry.url} alt={entry.caption}/><p>{entry.caption}</p></> : <><span className="quote-mark" style={{color:entry.color}}>“</span><p style={{color:entry.color}}>{entry.text}</p></>}</article>)}<button className="timeline-add" onClick={onAdd}><Plus size={19}/> Add another little moment</button></div></section>}</> }

function Calendar({ memory, month, setMonth, days, onDay }) { const start = new Date(month.getFullYear(),month.getMonth(),1), total=new Date(month.getFullYear(),month.getMonth()+1,0).getDate(); const cells=Array.from({length:start.getDay()+total},(_,i)=>i<start.getDay()?null:i-start.getDay()+1); const iso=n=>`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`; return <section className="calendar-wrap"><div className="calendar-head"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2>{month.toLocaleDateString('en',{month:'long',year:'numeric'})}</h2><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div><div className="weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=><span key={x}>{x}</span>)}</div><div className="calendar-grid">{cells.map((n,i)=>n?<button key={i} onClick={()=>days.has(iso(n))&&onDay(iso(n))} className={days.has(iso(n))?'has-memory':''}>{n}{days.has(iso(n))&&<i style={{background:memory.color}}/>}</button>:<span key={i}/>)}</div><p className="calendar-note">Tap a coloured date to open that day’s memories.</p></section> }

function MemoryModal({onClose,onSave}) { const [f,setF]=useState({title:'',place:'',dates:'',color:'#C45B38',cover:''}); return <div className="overlay"><form className="modal" onSubmit={e=>{e.preventDefault();onSave(f)}}><button type="button" className="close" onClick={onClose}><X/></button><p className="eyebrow">A BRAND-NEW CHAPTER</p><h2>Where did you two go?</h2><label>Memory title<input required placeholder="e.g. Our first beach escape" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></label><label>Place<input placeholder="e.g. Varkala, Kerala" value={f.place} onChange={e=>setF({...f,place:e.target.value})}/></label><label>When?<input placeholder="e.g. 15–18 Dec 2026" value={f.dates} onChange={e=>setF({...f,dates:e.target.value})}/></label><label>Its colour<input type="color" value={f.color} onChange={e=>setF({...f,color:e.target.value})}/></label><button className="primary" type="submit">Create the chapter <Heart size={17}/></button></form></div> }

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

  const previews = useMemo(() => {
    return files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }))
  }, [files])

  function handleFiles(selectedFiles) {
    const arr = Array.from(selectedFiles || [])
    if (arr.length === 0) return
    setFiles(prev => [...prev, ...arr])
  }

  function removePhoto(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setUploadStatus('')
    try {
      if (kind === 'text') {
        await onSave([{ type: 'text', text, color }], dayDate)
      } else if (files.length > 0) {
        setUploadStatus(`Uploading 0 of ${files.length} photos...`)
        const uploaded = await uploadMultipleToCloudinary(files, (done, total) => {
          setUploadStatus(`Uploading ${done} of ${total} photos...`)
        })
        const entries = uploaded.map(u => ({
          type: 'photo',
          url: u.url,
          publicId: u.publicId,
          caption: caption || '',
        }))
        setUploadStatus('Saving moments to journal...')
        await onSave(entries, dayDate)
      } else {
        await onSave([
          {
            type: 'photo',
            url: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=1000&q=85',
            caption: caption || 'A little moment, saved forever.',
          },
        ], dayDate)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
      setUploadStatus('')
    }
  }

  return (
    <div className="overlay">
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
            <button
              type="button"
              className="filepick"
              onClick={() => fileInput.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                handleFiles(e.dataTransfer.files)
              }}
            >
              <ImagePlus size={20} />
              <div>
                <b>{files.length > 0 ? `Add more photos (${files.length} selected)` : 'Choose photos'}</b>
                <span className="filepick-subtext">Click or drag & drop multiple images</span>
              </div>
            </button>
            <input
              hidden
              multiple
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={e => handleFiles(e.target.files)}
            />

            {previews.length > 0 && (
              <div className="bulk-preview-grid">
                {previews.map((item, idx) => (
                  <div className="bulk-preview-item" key={idx} title={item.name}>
                    <img src={item.url} alt="" />
                    <button
                      type="button"
                      className="bulk-preview-remove"
                      onClick={() => removePhoto(idx)}
                      title="Remove photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label>Caption {files.length > 1 && '(applied to selected moments)'}
              <input
                value={caption}
                placeholder="What made this moment special?"
                onChange={e => setCaption(e.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label>Your words
              <textarea
                required
                value={text}
                placeholder="The little thing you never want to forget…"
                onChange={e => setText(e.target.value)}
              />
            </label>
            <label>Text colour
              <input type="color" value={color} onChange={e => setColor(e.target.value)} />
            </label>
          </>
        )}

        {uploadStatus && <div className="upload-status">{uploadStatus}</div>}

        <button className="primary" disabled={saving}>
          {saving
            ? (uploadStatus || 'Saving…')
            : (files.length > 1 ? `Save ${files.length} moments` : 'Save this moment')
          } <Heart size={17} />
        </button>
      </form>
    </div>
  )
}
export default App

