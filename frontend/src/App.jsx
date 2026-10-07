import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  DoorOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  Mic2,
  PanelLeft,
  Ticket,
  Users,
  X,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL: API_URL })
const chartColors = ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6', '#f87171']

const toCollection = (payload, key, resourceName) => {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload[key])) return payload[key]
  if (payload && Array.isArray(payload.data)) return payload.data
  if (payload?.data && Array.isArray(payload.data[key])) return payload.data[key]
  throw new Error(`Unexpected ${resourceName} response shape`)
}

const getEvents = async () => {
  const response = await api.get('/events')
  return toCollection(response.data, 'events', 'events')
}

const getStoredAuth = () => {
  try {
    const saved = localStorage.getItem('eventforge_auth')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const formatDate = (value) => {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const getRoleLabel = (role) => role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Guest'

const landingRoute = (role) => {
  if (role === 'organizer' || role === 'admin') return '/dashboard'
  if (role === 'staff') return '/staff-checkin'
  if (role === 'attendee') return '/attendee-events'
  return '/dashboard'
}

const getStatusClass = (status) => {
  if (status === 'checked_in') return 'status checked-in'
  if (status === 'registered') return 'status registered'
  return 'status pending'
}

function App() {
  const [auth, setAuth] = useState(getStoredAuth())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (auth?.token) {
      api.defaults.headers.common.Authorization = `Bearer ${auth.token}`
      localStorage.setItem('eventforge_auth', JSON.stringify(auth))
    } else {
      delete api.defaults.headers.common.Authorization
      localStorage.removeItem('eventforge_auth')
    }
  }, [auth])

  useEffect(() => {
    if (!auth?.token) {
      setLoading(false)
      return
    }

    api
      .get('/auth/me')
      .then((response) => {
        setAuth((current) => ({ ...current, user: response.data.user }))
      })
      .catch(() => {
        setAuth(null)
      })
      .finally(() => setLoading(false))
  }, [auth?.token])

  if (loading) {
    return <div className="loading-shell">Loading EventForge…</div>
  }

  return (
    <BrowserRouter>
      <AppShell auth={auth} setAuth={setAuth} />
    </BrowserRouter>
  )
}

function AppShell({ auth, setAuth }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userRole = auth?.user?.role || 'guest'

  const navItems = useMemo(() => {
    if (!auth?.user) {
      return []
    }

    if (auth.user.role === 'organizer' || auth.user.role === 'admin') {
      return [
        { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
        { label: 'Events', to: '/events', icon: CalendarDays },
        { label: 'Venues', to: '/venues', icon: DoorOpen },
        { label: 'Speakers', to: '/speakers', icon: Mic2 },
        { label: 'Sessions', to: '/sessions', icon: FileText },
        { label: 'Tickets', to: '/tickets', icon: Ticket },
        { label: 'Registrations', to: '/registrations', icon: Users },
        { label: 'Analytics', to: '/analytics', icon: BarChart3 },
      ]
    }

    if (auth.user.role === 'attendee') {
      return [
        { label: 'Browse events', to: '/attendee-events', icon: CalendarDays },
        { label: 'My tickets', to: '/my-tickets', icon: Ticket },
      ]
    }

    return [{ label: 'Check-in desk', to: '/staff-checkin', icon: ClipboardCheck }]
  }, [auth])

  const handleLogout = () => {
    setAuth(null)
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  if (!auth?.user) {
    return (
      <div className="public-shell">
        <header className="public-header">
          <Link className="brand-wrap" to="/">
            <span className="brand-mark">E</span>
            <span>
              <strong className="brand-name">EventForge</strong>
              <small className="brand-subtitle">Event operations platform</small>
            </span>
          </Link>
          <nav className="public-nav">
            <Link to="/login">Sign in</Link>
            <Link className="primary-btn small" to="/register">Create account</Link>
          </nav>
        </header>
        <main className="public-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
            <Route path="/register" element={<RegisterPage setAuth={setAuth} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <button className="mobile-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
        <PanelLeft size={18} />
      </button>
      {sidebarOpen && <button className="sidebar-scrim" type="button" onClick={closeSidebar} aria-label="Close navigation" />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Link className="brand-wrap" to={landingRoute(userRole)} onClick={closeSidebar}>
            <span className="brand-mark">E</span>
            <span>
              <strong className="brand-name">EventForge</strong>
              <small className="brand-subtitle">Event operations</small>
            </span>
          </Link>
          <button className="sidebar-close" type="button" onClick={closeSidebar} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-section-label">Workspace</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link key={item.to} className={`sidebar-link ${active ? 'active' : ''}`} to={item.to} onClick={closeSidebar}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="account-block">
            <div className="avatar">{auth.user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{auth.user.name}</strong>
              <span>{getRoleLabel(auth.user.role)}</span>
            </div>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="main-shell">
        <div className="mobile-topbar">
          <span className="mobile-page-name">{navItems.find((item) => item.to === location.pathname)?.label || 'EventForge'}</span>
          <div className="mobile-avatar">{auth.user.name?.charAt(0).toUpperCase()}</div>
        </div>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute auth={auth}><DashboardPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute auth={auth}><EventManagementPage /></ProtectedRoute>} />
          <Route path="/venues" element={<ProtectedRoute auth={auth}><VenueManagementPage /></ProtectedRoute>} />
          <Route path="/speakers" element={<ProtectedRoute auth={auth}><SpeakerManagementPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute auth={auth}><SessionManagementPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute auth={auth}><TicketManagementPage /></ProtectedRoute>} />
          <Route path="/registrations" element={<ProtectedRoute auth={auth}><RegistrationManagementPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute auth={auth}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/attendee-events" element={<ProtectedRoute auth={auth}><AttendeeEventsPage /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute auth={auth}><MyTicketsPage /></ProtectedRoute>} />
          <Route path="/staff-checkin" element={<ProtectedRoute auth={auth}><StaffCheckinPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={landingRoute(userRole)} replace />} />
        </Routes>
      </main>
    </div>
  )
}

function ProtectedRoute({ auth, children }) {
  if (!auth?.user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function LandingPage() {
  const highlightCards = [
    { label: 'Events launched', value: '128', detail: 'Corporate programs delivered this year' },
    { label: 'Avg. turnout', value: '84%', detail: 'Across annual summit and training programs' },
    { label: 'Check-ins', value: '9.2k', detail: 'Fast, accurate attendee validation' },
    { label: 'Time saved', value: '34%', detail: 'Compared to manual event operations' },
  ]

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">EventForge • Enterprise event ops</span>
          <h1>Plan high-impact events with less admin overhead.</h1>
          <p>
            Organize conferences, manage attendee check-in, assign speakers, and view attendance analytics from one easy dashboard.
          </p>
          <div className="cta-row">
            <Link className="primary-btn large" to="/register">Create account</Link>
            <Link className="secondary-btn large" to="/login">View demo login</Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-card">
            <p className="panel-label">Next event</p>
            <h3>Future of Work Summit 2026</h3>
            <ul>
              <li>Harbor Hall • New York</li>
              <li>300 attendees • 12 speakers</li>
              <li>Live sessions + attendee check-in</li>
            </ul>
            <button type="button" className="primary-btn small">Preview event flow</button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {highlightCards.map((item) => (
          <article key={item.label} className="stat-card">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <span>{item.detail}</span>
          </article>
        ))}
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Organizer workflow</h3>
          <p>Build events, venues, speakers, sessions, and tickets from a single control center.</p>
        </div>
        <div className="feature-card">
          <h3>Attendee experience</h3>
          <p>Browse programs, register with a ticket, and select sessions in a few clicks.</p>
        </div>
        <div className="feature-card">
          <h3>Staff operations</h3>
          <p>Check in attendees instantly and keep attendance analytics up to date in real time.</p>
        </div>
      </section>
    </div>
  )
}

function LoginPage({ setAuth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'organizer@eventforge.com', password: '123456' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await api.post('/auth/login', form)
      setAuth({ token: response.data.token, user: response.data.user })
      navigate(landingRoute(response.data.user.role))
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  const fillDemo = (role) => {
    const options = {
      organizer: { email: 'organizer@eventforge.com', password: '123456' },
      staff: { email: 'staff@eventforge.com', password: '123456' },
      attendee: { email: 'attendee@eventforge.com', password: '123456' },
    }
    const demo = options[role]
    setForm(demo)
  }

  return (
    <div className="auth-shell split">
      <div className="auth-left">
        <div className="meta-small">EVENTFORGE</div>
        <h1 className="editorial-title">EVENTS.<br/>PEOPLE.<br/>IDEAS.</h1>
        <p className="page-description" style={{ marginTop: 18 }}>Sign in to access the organizer control center — concise workflows for building and running premium events.</p>
      </div>

      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Sign in to continue managing your event operations.</p>

        <div className="demo-row">
          <button type="button" className="chip small" onClick={() => fillDemo('organizer')}>Organizer demo</button>
          <button type="button" className="chip small" onClick={() => fillDemo('staff')}>Staff demo</button>
          <button type="button" className="chip small" onClick={() => fillDemo('attendee')}>Attendee demo</button>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          {error && <div className="error-banner">{error}</div>}
          <button className="primary-btn" type="submit">Login</button>
        </form>

        <p className="auth-link-row">
          Need an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

function RegisterPage({ setAuth }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'attendee',
    company: '',
  })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await api.post('/auth/register', form)
      setAuth({ token: response.data.token, user: response.data.user })
      navigate(landingRoute(response.data.user.role))
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card wide-card">
        <h2>Create your EventForge account</h2>
        <p>Choose the right workflow for your event responsibilities.</p>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <div className="form-grid two-col">
            <label>
              Full name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="attendee">Attendee</option>
                <option value="organizer">Organizer</option>
                <option value="staff">Staff</option>
                <option value="speaker">Speaker</option>
                <option value="sponsor">Sponsor</option>
              </select>
            </label>
          </div>
          <div className="form-grid two-col">
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Company
              <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Optional" />
            </label>
          </div>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>
          {error && <div className="error-banner">{error}</div>}
          <button className="primary-btn" type="submit">Register</button>
        </form>

        <p className="auth-link-row">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

function DashboardPage() {
  const [events, setEvents] = useState([])
  const [overview, setOverview] = useState({ totalEvents: 0, totalRegistrations: 0, checkedIn: 0, attendanceRate: 0, ticketsSold: 0, upcoming: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedEvents, analyticsResponse] = await Promise.all([
          getEvents(),
          api.get('/analytics/overview'),
        ])
        setEvents(loadedEvents)
        setOverview((prev) => ({ ...prev, ...analyticsResponse.data }))
      } catch (error) {
        console.error('Dashboard load failed', error)
      }
    }

    load()
  }, [])

  const kpis = [
    { label: 'TOTAL EVENTS', value: overview.totalEvents || 0 },
    { label: 'REGISTRATIONS', value: overview.totalRegistrations || 0 },
    { label: 'TICKETS SOLD', value: overview.ticketsSold || overview.checkedIn || 0 },
    { label: 'UPCOMING', value: overview.upcoming || events.filter(e => new Date(e.date) > new Date()).length },
  ]

  return (
    <div className="page-block editorial">
      <div className="section-heading editorial-heading">
        <div>
          <div className="meta-small">EVENTFORGE <span className="meta-sep">/</span> ORGANIZER</div>
          <h1 className="editorial-title">EVENT<br/>OPERATIONS</h1>
          <p className="page-description">A concise editorial view of your event portfolio, audience demand, and readiness for the day.</p>
        </div>
        <div className="heading-actions">
          <Link className="primary-btn small" to="/events">+ CREATE EVENT</Link>
        </div>
      </div>

      <section className="bento-grid">
        <div className="bento-left">
          <div className="bento-upcoming">
            <div className="bento-index">01</div>
            <div>
              <div className="kpi-lead">UPCOMING EVENT</div>
              {events[0] ? (
                <div className="kpi-event">
                  <div className="kpi-title">{events[0].title}</div>
                  <div className="kpi-meta">{formatDate(events[0].date)} • {events[0].location}</div>
                </div>
              ) : (
                <div className="kpi-empty">No upcoming events</div>
              )}
            </div>
          </div>

          <div className="bento-grid-inner">
            <div className="kpi-block">
              <div className="kpi-number">{kpis[0].value}</div>
              <div className="kpi-label">{kpis[0].label}</div>
            </div>
            <div className="kpi-block">
              <div className="kpi-number">{kpis[1].value}</div>
              <div className="kpi-label">{kpis[1].label}</div>
            </div>
            <div className="kpi-block small">
              <div className="kpi-number">{kpis[2].value}</div>
              <div className="kpi-label">{kpis[2].label}</div>
            </div>
            <div className="kpi-block small">
              <div className="kpi-number">{kpis[3].value}</div>
              <div className="kpi-label">{kpis[3].label}</div>
            </div>
          </div>
        </div>

        <div className="bento-right">
          <div className="panel-card">
            <h3 className="panel-title">UPCOMING EVENTS</h3>
            <div className="stack-list events-list">
              {events.map((event, idx) => (
                <article key={event._id} className="event-article">
                  <div className="event-index">{String(idx + 1).padStart(2, '0')}</div>
                  <div className="event-body">
                    <div className="event-head">
                      <strong className="event-title">{event.title}</strong>
                      <div className="event-meta">{new Date(event.date).toLocaleDateString()} • {event.location}</div>
                    </div>
                    <div className="event-foot">
                      <span className="tag neutral">{event.category || 'Conference'}</span>
                      <Link to={`/events`} className="chip small">VIEW EVENT →</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function EventManagementPage() {
  const [events, setEvents] = useState([])
  const [venues, setVenues] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'Conference', date: '', location: '', venue: '', capacity: 200, status: 'published' })

  const fetchData = async () => {
    const [loadedEvents, venueResponse] = await Promise.all([getEvents(), api.get('/venues')])
    setEvents(loadedEvents)
    setVenues(venueResponse.data)
  }

  useEffect(() => {
    fetchData().catch((error) => console.error(error))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'Conference', date: '', location: '', venue: '', capacity: 200, status: 'published' })
    setEditingId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { ...form, capacity: Number(form.capacity) }
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, payload)
      } else {
        await api.post('/events', payload)
      }
      resetForm()
      fetchData()
    } catch (error) {
      console.error(error.response?.data?.message || 'Action failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return
    await api.delete(`/events/${id}`)
    fetchData()
  }

  const fillEdit = (eventItem) => {
    setEditingId(eventItem._id)
    setForm({
      title: eventItem.title,
      description: eventItem.description || '',
      category: eventItem.category || 'Conference',
      date: eventItem.date ? new Date(eventItem.date).toISOString().slice(0, 16) : '',
      location: eventItem.location || '',
      venue: eventItem.venue?._id || '',
      capacity: eventItem.capacity || 200,
      status: eventItem.status || 'published',
    })
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Event setup</span>
          <h2>Event management</h2>
        </div>
      </div>

      <div className="content-grid two-col">
        <form className="panel-card ghost-panel stacked-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Update event' : 'Create event'}</h3>
          <div className="form-grid two-col">
            <label>
              Event title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Category
              <input name="category" value={form.category} onChange={handleChange} />
            </label>
          </div>
          <label>
            Description
            <div className="ai-assist">
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
              <div className="ai-controls">
                <button type="button" className="chip" onClick={async () => {
                  try {
                    const payload = { title: form.title || 'Untitled event', category: form.category || 'Conference', audience: form.location || 'Professional' };
                    const resp = await api.post('/ai/description', payload);
                    if (resp?.data?.description) {
                      setForm((cur) => ({ ...cur, description: resp.data.description }));
                    } else {
                      // backend not available or responded without description
                      alert('AI generation not available on the server');
                    }
                  } catch (err) {
                    alert('AI generation not available on the server');
                  }
                }}>GENERATE DRAFT</button>
                <small className="info-note">AI-ASSISTED · Review before publishing</small>
              </div>
            </div>
          </label>
          <div className="form-grid two-col">
            <label>
              Event date
              <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
            </label>
            <label>
              Capacity
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="10" />
            </label>
          </div>
          <div className="form-grid two-col">
            <label>
              Location
              <input name="location" value={form.location} onChange={handleChange} />
            </label>
            <label>
              Venue
              <select name="venue" value={form.venue} onChange={handleChange}>
                <option value="">No specific venue</option>
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id}>{venue.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <div className="button-row">
            <button className="primary-btn" type="submit">{editingId ? 'Save changes' : 'Create event'}</button>
            <button className="secondary-btn" type="button" onClick={resetForm}>Reset</button>
          </div>
        </form>

        <div className="panel-card ghost-panel">
          <h3>Event catalog</h3>
          <div className="stack-list">
            {events.map((eventItem) => (
              <div key={eventItem._id} className="list-row with-actions">
                <div>
                  <strong>{eventItem.title}</strong>
                  <span>{eventItem.location} • {eventItem.capacity} seats</span>
                </div>
                <div className="mini-actions">
                  <button type="button" className="chip small" onClick={() => fillEdit(eventItem)}>Edit</button>
                  <button type="button" className="chip danger small" onClick={() => handleDelete(eventItem._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VenueManagementPage() {
  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({ name: '', address: '', city: '', capacity: 200, description: '', amenities: '' })

  const fetchData = async () => {
    const response = await api.get('/venues')
    setVenues(response.data)
  }

  useEffect(() => {
    fetchData().catch((error) => console.error(error))
  }, [])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await api.post('/venues', { ...form, amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean) })
    setForm({ name: '', address: '', city: '', capacity: 200, description: '', amenities: '' })
    fetchData()
  }

  const handleDelete = async (id) => {
    await api.delete(`/venues/${id}`)
    fetchData()
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Venue setup</span>
          <h2>Venue management</h2>
        </div>
      </div>

      <div className="content-grid two-col">
        <form className="panel-card ghost-panel stacked-form" onSubmit={handleSubmit}>
          <h3>Add venue</h3>
          <label>
            Venue name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <div className="form-grid two-col">
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} />
            </label>
            <label>
              Capacity
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} />
            </label>
          </div>
          <label>
            Address
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
          </label>
          <label>
            Amenities (comma separated)
            <input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Wi-Fi, Stage, Catering" />
          </label>
          <button className="primary-btn" type="submit">Save venue</button>
        </form>

        <div className="panel-card ghost-panel">
          <h3>Registered venues</h3>
          <div className="stack-list">
            {venues.map((venue) => (
              <div key={venue._id} className="list-row with-actions">
                <div>
                  <strong>{venue.name}</strong>
                  <span>{venue.city} • {venue.capacity} seats</span>
                </div>
                <button type="button" className="chip danger small" onClick={() => handleDelete(venue._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SpeakerManagementPage() {
  const [speakers, setSpeakers] = useState([])
  const [form, setForm] = useState({ name: '', title: '', company: '', bio: '', expertise: '' })

  const fetchData = async () => {
    const response = await api.get('/speakers')
    setSpeakers(response.data)
  }

  useEffect(() => {
    fetchData().catch((error) => console.error(error))
  }, [])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await api.post('/speakers', {
      ...form,
      expertise: form.expertise.split(',').map((item) => item.trim()).filter(Boolean),
    })
    setForm({ name: '', title: '', company: '', bio: '', expertise: '' })
    fetchData()
  }

  const handleDelete = async (id) => {
    await api.delete(`/speakers/${id}`)
    fetchData()
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Speaker roster</span>
          <h2>Speaker management</h2>
        </div>
      </div>

      <div className="content-grid two-col">
        <form className="panel-card ghost-panel stacked-form" onSubmit={handleSubmit}>
          <h3>Add speaker</h3>
          <label>
            Full name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <div className="form-grid two-col">
            <label>
              Title
              <input name="title" value={form.title} onChange={handleChange} />
            </label>
            <label>
              Company
              <input name="company" value={form.company} onChange={handleChange} />
            </label>
          </div>
          <label>
            Expertise (comma separated)
            <input name="expertise" value={form.expertise} onChange={handleChange} />
          </label>
          <label>
            Bio
            <textarea name="bio" value={form.bio} onChange={handleChange} rows="4" />
          </label>
          <button className="primary-btn" type="submit">Save speaker</button>
        </form>

        <div className="panel-card ghost-panel">
          <h3>Confirmed speakers</h3>
          <div className="stack-list">
            {speakers.map((speaker) => (
              <div key={speaker._id} className="list-row with-actions">
                <div>
                  <strong>{speaker.name}</strong>
                  <span>{speaker.title || 'Speaker'} • {speaker.company || 'Company'}</span>
                </div>
                <button type="button" className="chip danger small" onClick={() => handleDelete(speaker._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionManagementPage() {
  const [sessions, setSessions] = useState([])
  const [events, setEvents] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [venues, setVenues] = useState([])
  const [form, setForm] = useState({ title: '', event: '', speaker: '', venue: '', room: '', startTime: '', endTime: '', capacity: 80 })

  const fetchData = async () => {
    const [sessionResponse, loadedEvents, speakerResponse, venueResponse] = await Promise.all([
      api.get('/sessions'),
      getEvents(),
      api.get('/speakers'),
      api.get('/venues'),
    ])
    setSessions(sessionResponse.data)
    setEvents(loadedEvents)
    setSpeakers(speakerResponse.data)
    setVenues(venueResponse.data)
  }

  useEffect(() => {
    fetchData().catch((error) => console.error(error))
  }, [])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await api.post('/sessions', { ...form, capacity: Number(form.capacity) })
    setForm({ title: '', event: '', speaker: '', venue: '', room: '', startTime: '', endTime: '', capacity: 80 })
    fetchData()
  }

  const handleDelete = async (id) => {
    await api.delete(`/sessions/${id}`)
    fetchData()
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Sessions</span>
          <h2>Session planner</h2>
        </div>
      </div>

      <div className="content-grid two-col">
        <form className="panel-card ghost-panel stacked-form" onSubmit={handleSubmit}>
          <h3>Create session</h3>
          <label>
            Session title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <div className="form-grid two-col">
            <label>
              Event
              <select name="event" value={form.event} onChange={handleChange} required>
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </label>
            <label>
              Capacity
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="10" />
            </label>
          </div>
          <div className="form-grid two-col">
            <label>
              Speaker
              <select name="speaker" value={form.speaker} onChange={handleChange}>
                <option value="">No speaker</option>
                {speakers.map((speaker) => (
                  <option key={speaker._id} value={speaker._id}>{speaker.name}</option>
                ))}
              </select>
            </label>
            <label>
              Venue
              <select name="venue" value={form.venue} onChange={handleChange}>
                <option value="">No venue</option>
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id}>{venue.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Room
            <input name="room" value={form.room} onChange={handleChange} placeholder="Main Stage" />
          </label>
          <div className="form-grid two-col">
            <label>
              Start time
              <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} required />
            </label>
            <label>
              End time
              <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />
            </label>
          </div>
          <button className="primary-btn" type="submit">Save session</button>
        </form>

        <div className="panel-card ghost-panel">
          <h3>Scheduled sessions</h3>
          <div className="stack-list">
            {sessions.map((session) => (
              <div key={session._id} className="list-row with-actions">
                <div>
                  <strong>{session.title}</strong>
                  <span>{session.speaker?.name || 'Speaker TBA'} • {session.room || 'Room TBA'}</span>
                </div>
                <button type="button" className="chip danger small" onClick={() => handleDelete(session._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TicketManagementPage() {
  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ event: '', name: '', description: '', price: 0, capacity: 100 })

  useEffect(() => {
    const load = async () => {
      const [ticketResponse, loadedEvents] = await Promise.all([api.get('/tickets'), getEvents()])
      setTickets(ticketResponse.data)
      setEvents(loadedEvents)
    }
    load().catch((error) => console.error(error))
  }, [])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await api.post('/tickets', { ...form, price: Number(form.price), capacity: Number(form.capacity) })
    setForm({ event: '', name: '', description: '', price: 0, capacity: 100 })
    const response = await api.get('/tickets')
    setTickets(response.data)
  }

  const handleDelete = async (id) => {
    await api.delete(`/tickets/${id}`)
    const response = await api.get('/tickets')
    setTickets(response.data)
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Tickets</span>
          <h2>Ticket types</h2>
        </div>
      </div>

      <div className="content-grid two-col">
        <form className="panel-card ghost-panel stacked-form" onSubmit={handleSubmit}>
          <h3>Create ticket type</h3>
          <label>
            Event
            <select name="event" value={form.event} onChange={handleChange} required>
              <option value="">Select event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
          </label>
          <div className="form-grid two-col">
            <label>
              Ticket name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Capacity
              <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="10" />
            </label>
          </div>
          <div className="form-grid two-col">
            <label>
              Price
              <input type="number" name="price" value={form.price} onChange={handleChange} min="0" />
            </label>
            <label>
              Description
              <input name="description" value={form.description} onChange={handleChange} />
            </label>
          </div>
          <button className="primary-btn" type="submit">Save ticket</button>
        </form>

        <div className="panel-card ghost-panel">
          <h3>Current tickets</h3>
          <div className="stack-list">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="list-row with-actions">
                <div>
                  <strong>{ticket.name}</strong>
                  <span>{ticket.event?.title || 'Linked event'} • ${ticket.price}</span>
                </div>
                <button type="button" className="chip danger small" onClick={() => handleDelete(ticket._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function RegistrationManagementPage() {
  const [registrations, setRegistrations] = useState([])

  const loadRegistrations = async () => {
    const response = await api.get('/registrations')
    setRegistrations(response.data)
  }

  useEffect(() => {
    loadRegistrations().catch((error) => console.error(error))
  }, [])

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Registrations</span>
          <h2>Attendee list</h2>
        </div>
      </div>

      <div className="panel-card ghost-panel">
        <div className="table-list">
          {registrations.map((registration) => (
            <div key={registration._id} className="table-row">
              <div>
                <strong>{registration.attendee?.name}</strong>
                <span>{registration.attendee?.email}</span>
              </div>
              <div>
                <strong>{registration.event?.title}</strong>
                <span>{registration.ticketType?.name}</span>
              </div>
              <div>
                <strong>{registration.ticketCode}</strong>
                <span>{registration.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AttendeeEventsPage() {
  const [events, setEvents] = useState([])
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState({})
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedEvents, ticketResponse] = await Promise.all([getEvents(), api.get('/tickets')])
        setEvents(loadedEvents)
        setTickets(toCollection(ticketResponse.data, 'tickets', 'tickets'))
      } catch (loadError) {
        console.error('Attendee events load failed', loadError)
        setError(loadError.response?.data?.message || 'Unable to load events. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const registerForEvent = async (eventId) => {
    const ticketId = selectedTicket[eventId]
    if (!ticketId) {
      setStatus('Choose a ticket before registering.')
      return
    }
    try {
      await api.post('/registrations', { event: eventId, ticketType: ticketId })
      setStatus('Registration created successfully.')
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to register')
    }
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Attendee</span>
          <h2>Browse events</h2>
        </div>
      </div>

      {status && <div className="info-banner">{status}</div>}
      {loading && <div className="loading-shell">Loading events…</div>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && <div className="event-card-grid">
        {events.map((event) => {
          const availableTickets = tickets.filter((ticket) => ticket.event?._id === event._id || ticket.event === event._id)
          return (
            <div key={event._id} className="event-card panel-card ghost-panel">
              <div className="event-card-head">
                <span className="tag">{event.category || 'Conference'}</span>
                <span className="tag neutral">{event.status}</span>
              </div>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <small>{formatDate(event.date)} • {event.location}</small>

              <label>
                Ticket type
                <select value={selectedTicket[event._id] || ''} onChange={(item) => setSelectedTicket((current) => ({ ...current, [event._id]: item.target.value }))}>
                  <option value="">Choose a pass</option>
                  {availableTickets.map((ticket) => (
                    <option key={ticket._id} value={ticket._id}>{ticket.name} • ${ticket.price}</option>
                  ))}
                </select>
              </label>

              <button className="primary-btn" type="button" onClick={() => registerForEvent(event._id)}>Register</button>
            </div>
          )
        })}
      </div>}
    </div>
  )
}

function MyTicketsPage() {
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    api
      .get('/registrations/me')
      .then((response) => setRegistrations(response.data))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Tickets</span>
          <h2>My registrations</h2>
        </div>
      </div>

      <div className="panel-card ghost-panel">
        <div className="table-list">
          {registrations.map((registration) => (
            <div key={registration._id} className="table-row">
              <div>
                <strong>{registration.event?.title}</strong>
                <span>{registration.ticketType?.name}</span>
              </div>
              <div>
                <strong>{registration.ticketCode}</strong>
                <span>{registration.status}</span>
              </div>
              <div>
                <strong>{formatDate(registration.event?.date)}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StaffCheckinPage() {
  const [registrations, setRegistrations] = useState([])

  const loadCheckins = async () => {
    const response = await api.get('/registrations')
    setRegistrations(response.data)
  }

  useEffect(() => {
    loadCheckins().catch((error) => console.error(error))
  }, [])

  const handleCheckin = async (id) => {
    await api.put(`/registrations/${id}/checkin`)
    loadCheckins()
  }

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Staff</span>
          <h2>Check-in desk</h2>
        </div>
      </div>

      <div className="panel-card ghost-panel">
        <div className="table-list">
          {registrations.map((registration) => (
            <div key={registration._id} className="table-row">
              <div>
                <strong>{registration.attendee?.name}</strong>
                <span>{registration.event?.title}</span>
              </div>
              <div>
                <strong>{registration.ticketCode}</strong>
                <span>{registration.ticketType?.name}</span>
              </div>
              <div>
                <span className={getStatusClass(registration.status)}>{registration.status}</span>
              </div>
              <div>
                {registration.status !== 'checked_in' && (
                  <button type="button" className="primary-btn small" onClick={() => handleCheckin(registration._id)}>Check in</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AnalyticsPage() {
  const [overview, setOverview] = useState({ totalEvents: 0, totalRegistrations: 0, checkedIn: 0, attendanceRate: 0, ticketBreakdown: [], sessionPopularity: [] })

  useEffect(() => {
    api
      .get('/analytics/overview')
      .then((response) => setOverview(response.data))
      .catch((error) => console.error(error))
  }, [])

  const barData = overview.ticketBreakdown.map((entry, index) => ({ name: entry.name, count: entry.count, fill: chartColors[index % chartColors.length] }))

  return (
    <div className="page-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Insights</span>
          <h2>Analytics overview</h2>
        </div>
      </div>

      <div className="stats-grid compact-grid">
        <article className="stat-card">
          <p>Total registrations</p>
          <h3>{overview.totalRegistrations}</h3>
        </article>
        <article className="stat-card">
          <p>Checked-in attendees</p>
          <h3>{overview.checkedIn}</h3>
        </article>
        <article className="stat-card">
          <p>Attendance rate</p>
          <h3>{overview.attendanceRate || 0}%</h3>
        </article>
        <article className="stat-card">
          <p>Events tracked</p>
          <h3>{overview.totalEvents}</h3>
        </article>
      </div>

      <div className="content-grid two-col">
        <div className="panel-card ghost-panel chart-box">
          <h3>Ticket breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel-card ghost-panel chart-box">
          <h3>Session popularity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={overview.sessionPopularity} dataKey="value" nameKey="name" outerRadius={80} fill="#34d399" label>
                {overview.sessionPopularity.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default App
