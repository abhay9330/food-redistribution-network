import { useEffect, useState } from 'react'
import './App.css'
import SupplyDemand from '../components/supplydemand'
import DeliveryBoard from '../components/deliveryboarad'

const API_URL = 'http://localhost:3001'

const emptyDashboard = {
  forecast: { portions: null, kitchens: 0, observations: 0, note: 'Loading saved food offers…' },
  stats: [],
  deliveries: [],
  activity: [],
}

function App() {
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_URL}/api/dashboard`)
        if (!response.ok) throw new Error('Dashboard data could not be loaded.')
        const data = await response.json()
        if (active) {
          setDashboard(data)
          setError('')
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Backend nahi chal raha.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    const refreshId = window.setInterval(loadDashboard, 15000)

    return () => {
      active = false
      window.clearInterval(refreshId)
    }
  }, [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>FoodLink</strong>
            <span>Redistribution network</span>
          </div>
        </div>

        <div className="network-picker">
          <span className="network-dot" />
          <span>Community network</span>
          <span className="chevron">⌄</span>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <nav className="nav-list">
          <a className="nav-item selected" href="#overview"><span>▦</span> Overview</a>
          <a className="nav-item" href="#food-surplus"><span>＋</span> Food surplus</a>
          <a className="nav-item" href="#food-surplus"><span>♡</span> Recipient needs</a>
          <a className="nav-item" href="#delivery-board"><span>⌁</span> Deliveries</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="network-status">
            <span className="network-dot" />
            <div>
              <strong>{error ? 'Backend connection lost' : loading ? 'Connecting to database' : 'Local database connected'}</strong>
              <small>Auto-refreshes every 15 seconds</small>
            </div>
          </div>
          <div className="profile">
            <div className="avatar">AP</div>
            <div>
              <strong>Team workspace</strong>
              <small>Coordinator</small>
            </div>
            <span className="chevron">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">FOOD SECURITY NETWORK</p>
            <h1>Good food, where it is needed.</h1>
            <p className="subtitle">
              A live view of saved surplus, community needs and time-sensitive deliveries.
            </p>
          </div>
          <div className="topbar-right">
            <span className="demo-badge"><span /> LOCAL DATA</span>
            <div className="top-avatar">AP</div>
          </div>
        </header>

        {error && <div className="dashboard-message error-message">{error} Check that the backend is running on port 3001.</div>}

        <section className="forecast-banner">
          <div className="forecast-icon">✳</div>
          <div className="forecast-copy">
            <span className="banner-label">SURPLUS FORECAST · NEXT 3 HOURS</span>
            <h2>
              {loading
                ? 'Loading saved food history…'
                : dashboard.forecast.portions === null
                  ? 'Not enough matching offer history yet.'
                  : `About ${dashboard.forecast.portions} portions may be offered.`}
            </h2>
            <p>
              {dashboard.forecast.note} This is a simple recent-data estimate, not a trained AI model.
            </p>
          </div>
          <div className="forecast-side">
            <strong>{dashboard.forecast.kitchens}</strong>
            <span>donors in the<br />matching time window</span>
          </div>
        </section>

        <section className="stats-grid">
          {dashboard.stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <div className={`stat-mark ${stat.tone}`}>{stat.mark}</div>
              <p className="stat-label">{stat.label}</p>
              <div className="stat-value">
                {stat.value} <span>{stat.unit}</span>
              </div>
              <p className="stat-note">{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel delivery-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">NETWORK ACTIVITY</p>
                <h2>Active deliveries</h2>
              </div>
              <span className="small-count">{dashboard.deliveries.length} shown</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>FOOD & DONOR</th>
                    <th>RECIPIENT</th>
                    <th>PARTNER / ETA</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.deliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td>
                        <strong>{delivery.food}</strong>
                        <span className="cell-sub">{delivery.donor} · {delivery.id}</span>
                      </td>
                      <td>
                        <strong>{delivery.recipient}</strong>
                        <span className="cell-sub">Expires {delivery.expiry}</span>
                      </td>
                      <td>
                        <strong>{delivery.eta}</strong>
                        <span className="cell-sub">{delivery.partner}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${delivery.tone}`}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!dashboard.deliveries.length && (
                    <tr><td colSpan="4" className="empty-table">{loading ? 'Loading deliveries…' : 'No active deliveries yet. Add matching surplus and recipient needs below.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footnote">
              <span className="footnote-dot" />
              ETA uses the backend's fixed 30-minute demo estimate; there is no live map route.
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">RECENT DATABASE EVENTS</p>
                <h2>Network updates</h2>
              </div>
              <span className="live-label"><span /> LIVE</span>
            </div>

            <div className="activity-list">
              {dashboard.activity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <div className={`activity-icon ${item.tone}`}>{item.symbol}</div>
                  <div className="activity-copy">
                    <div className="activity-meta">
                      <strong>{item.type}</strong>
                      <span>{item.time}</span>
                    </div>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
              {!dashboard.activity.length && (
                <p className="empty-activity">{loading ? 'Loading recent updates…' : 'Saved surplus, need and delivery changes will appear here.'}</p>
              )}
            </div>

            <div className="agent-note">
              <span className="sparkle">✦</span>
              <p><strong>Matching:</strong> food type, portions, expiry/deadline and demo partner availability.</p>
            </div>
          </article>
        </section>

        <div id="food-surplus"><SupplyDemand /></div>
        <div id="delivery-board"><DeliveryBoard /></div>

        <footer className="page-footer">
          <span>FoodLink · Food redistribution demo</span>
          <span>Forecasts and ETAs use transparent demo rules</span>
        </footer>
      </main>
    </div>
  )
}

export default App
