import './App.css'
import SupplyDemand from '../components/supplydemand'
import DeliveryBoard from '../components/deliveryboarad'


const stats = [
  {
    label: 'Predicted surplus',
    value: '186',
    unit: 'meals',
    note: 'Expected from 7 kitchens tonight',
    mark: '↗',
    tone: 'green',
  },
  {
    label: 'Open food requests',
    value: '12',
    unit: 'organisations',
    note: '4 requests added today',
    mark: '◎',
    tone: 'orange',
  },
  {
    label: 'Deliveries in progress',
    value: '08',
    unit: 'routes',
    note: '6 expected before expiry',
    mark: '⌁',
    tone: 'blue',
  },
  {
    label: 'Rescued this week',
    value: '1,248',
    unit: 'meals',
    note: 'Across the local network',
    mark: '✳',
    tone: 'purple',
  },
]

const deliveries = [
  {
    id: 'DL-204',
    donor: 'Harbor Hostel',
    food: '38 meal boxes',
    recipient: 'Sahaara Community Kitchen',
    route: '4.2 km · 18 min',
    eta: '6:40 PM',
    expiry: '8:30 PM',
    status: 'On the way',
    tone: 'moving',
  },
  {
    id: 'DL-203',
    donor: 'Green Bowl Cafe',
    food: '24 rice bowls',
    recipient: 'Hope Food Bank',
    route: '2.1 km · 12 min',
    eta: '7:05 PM',
    expiry: '8:00 PM',
    status: 'Pickup soon',
    tone: 'pickup',
  },
  {
    id: 'DL-202',
    donor: 'North Campus Mess',
    food: '16 meal packs',
    recipient: 'City Shelter',
    route: '6.8 km · 29 min',
    eta: '7:18 PM',
    expiry: '7:45 PM',
    status: 'At risk',
    tone: 'risk',
  },
]

const activity = [
  {
    type: 'Forecast',
    time: '2 min ago',
    text: 'Harbor Hostel may have 38 extra meal portions tonight.',
    symbol: '↗',
    tone: 'green',
  },
  {
    type: 'Match made',
    time: '8 min ago',
    text: '24 rice bowls matched to Hope Food Bank by need and distance.',
    symbol: '◎',
    tone: 'orange',
  },
  {
    type: 'Route updated',
    time: '14 min ago',
    text: 'Delivery DL-202 flagged: arrival is close to the food expiry time.',
    symbol: '⌁',
    tone: 'blue',
  },
]

function App() {
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
          <div className="nav-item selected"><span>▦</span> Overview</div>
          <div className="nav-item"><span>＋</span> Food surplus</div>
          <div className="nav-item"><span>♡</span> Recipient needs</div>
          <div className="nav-item"><span>⌁</span> Deliveries</div>
        </nav>

        <div className="sidebar-bottom">
          <div className="network-status">
            <span className="network-dot" />
            <div>
              <strong>Demo network active</strong>
              <small>Sample information</small>
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

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">FOOD SECURITY NETWORK</p>
            <h1>Good food, where it is needed.</h1>
            <p className="subtitle">
              A live view of surplus, community needs and time-sensitive deliveries.
            </p>
          </div>
          <div className="topbar-right">
            <span className="demo-badge"><span /> DEMO DATA</span>
            <div className="top-avatar">AP</div>
          </div>
        </header>

        <section className="forecast-banner">
          <div className="forecast-icon">✳</div>
          <div className="forecast-copy">
            <span className="banner-label">SURPLUS FORECAST · NEXT 3 HOURS</span>
            <h2>186 meals could be available tonight.</h2>
            <p>
              The forecast helps the network prepare recipients and delivery partners
              before food is ready.
            </p>
          </div>
          <div className="forecast-side">
            <strong>7</strong>
            <span>kitchens<br />expected to have surplus</span>
          </div>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
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
              <span className="small-count">3 shown</span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>FOOD & DONOR</th>
                    <th>RECIPIENT</th>
                    <th>ROUTE / ETA</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
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
                        <span className="cell-sub">{delivery.route}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${delivery.tone}`}>
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footnote">
              <span className="footnote-dot" />
              Arrival estimates are compared with each food listing's expiry time.
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">AGENT ACTIVITY</p>
                <h2>Network updates</h2>
              </div>
              <span className="live-label"><span /> LIVE</span>
            </div>

            <div className="activity-list">
              {activity.map((item) => (
                <div className="activity-item" key={item.type}>
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
            </div>

            <div className="agent-note">
              <span className="sparkle">✦</span>
              <p><strong>Next:</strong> match available food with open requests and feasible routes.</p>
            </div>
          </article>
        </section>
<SupplyDemand/>
<DeliveryBoard />

        <footer className="page-footer">
          <span>FoodLink · Food redistribution demo</span>
          <span>Built for a more connected food network</span>
        </footer>
      </main>
    </div>
  )
}

export default App