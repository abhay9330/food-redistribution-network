import { useEffect, useState } from 'react'
import './supplydemand.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const emptySupply = {
  food: '',
  donor: '',
  portions: '',
  pickup: '',
  expiry: '',
}

const emptyNeed = {
  organisation: '',
  food: '',
  portions: '',
  dropoff: '',
  neededBy: '',
}

async function api(path, options) {
  const response = await fetch(`${API_URL}${path}`, options).catch(() => {
    throw new Error('Backend nahi chal raha. Backend terminal check karo.')
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

function todayAt(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function displayTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function mapSupply(row) {
  return {
    id: row.id,
    food: row.food_item,
    donor: row.donor,
    portions: String(row.portions),
    pickup: row.pickup_location,
    expiry: displayTime(row.expires_at),
  }
}

function mapNeed(row) {
  return {
    id: row.id,
    organisation: row.organization,
    food: row.food_needed,
    portions: String(row.portions_needed),
    dropoff: row.delivery_location,
    neededBy: displayTime(row.needed_by),
  }
}

export default function SupplyDemand() {
  const [supplies, setSupplies] = useState([])
  const [needs, setNeeds] = useState([])
  const [supplyForm, setSupplyForm] = useState(emptySupply)
  const [needForm, setNeedForm] = useState(emptyNeed)

  useEffect(() => {
    let ignore = false

    Promise.all([api('/api/surpluses'), api('/api/needs')])
      .then(([supplyRows, needRows]) => {
        if (!ignore) {
          setSupplies(supplyRows.map(mapSupply))
          setNeeds(needRows.map(mapNeed))
        }
      })
      .catch((error) => console.error('Could not load listings:', error))

    return () => {
      ignore = true
    }
  }, [])

  function updateSupply(event) {
    setSupplyForm({ ...supplyForm, [event.target.name]: event.target.value })
  }

  function updateNeed(event) {
    setNeedForm({ ...needForm, [event.target.name]: event.target.value })
  }

  async function addSupply(event) {
    event.preventDefault()

    try {
      const saved = await api('/api/surpluses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodItem: supplyForm.food,
          donor: supplyForm.donor,
          portions: Number(supplyForm.portions),
          pickupLocation: supplyForm.pickup,
          expiresAt: todayAt(supplyForm.expiry),
        }),
      })

      setSupplies((current) => [mapSupply(saved), ...current])
      setSupplyForm({ ...emptySupply })
    } catch (error) {
      window.alert(`Surplus save nahi hua: ${error.message}`)
    }
  }

  async function addNeed(event) {
    event.preventDefault()

    try {
      const saved = await api('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: needForm.organisation,
          foodNeeded: needForm.food,
          portionsNeeded: Number(needForm.portions),
          deliveryLocation: needForm.dropoff,
          neededBy: todayAt(needForm.neededBy),
        }),
      })

      setNeeds((current) => [mapNeed(saved), ...current])
      setNeedForm({ ...emptyNeed })
    } catch (error) {
      window.alert(`Food need save nahi hua: ${error.message}`)
    }
  }

  return (
    <section className="supply-demand">
      <header className="supply-heading">
        <p>NETWORK INTAKE</p>
        <h2>Food supply and community needs</h2>
        <span>
          Add available food or tell the network what your organisation needs.
        </span>
      </header>

      <div className="intake-grid">
        <form className="intake-card" onSubmit={addSupply}>
          <div className="intake-card-heading">
            <span className="intake-icon supply-icon">＋</span>
            <div>
              <h3>Post food surplus</h3>
              <p>For restaurants, hostels and food donors</p>
            </div>
          </div>

          <label>
            Food item
            <input
              name="food"
              value={supplyForm.food}
              onChange={updateSupply}
              placeholder="e.g. Vegetable pulao"
              required
            />
          </label>

          <label>
            Restaurant or hostel
            <input
              name="donor"
              value={supplyForm.donor}
              onChange={updateSupply}
              placeholder="Name of donor"
              required
            />
          </label>

          <div className="field-row">
            <label>
              Portions
              <input
                name="portions"
                type="number"
                min="1"
                value={supplyForm.portions}
                onChange={updateSupply}
                placeholder="30"
                required
              />
            </label>

            <label>
              Food expires at
              <input
                name="expiry"
                type="time"
                value={supplyForm.expiry}
                onChange={updateSupply}
                required
              />
            </label>
          </div>

          <label>
            Pickup location
            <input
              name="pickup"
              value={supplyForm.pickup}
              onChange={updateSupply}
              placeholder="Area or address"
              required
            />
          </label>

          <button type="submit" className="intake-button supply-button">
            Add surplus
          </button>
        </form>

        <form className="intake-card" onSubmit={addNeed}>
          <div className="intake-card-heading">
            <span className="intake-icon need-icon">♡</span>
            <div>
              <h3>Share a food need</h3>
              <p>For food banks and recipient organisations</p>
            </div>
          </div>

          <label>
            Organisation
            <input
              name="organisation"
              value={needForm.organisation}
              onChange={updateNeed}
              placeholder="Organisation name"
              required
            />
          </label>

          <label>
            Food needed
            <input
              name="food"
              value={needForm.food}
              onChange={updateNeed}
              placeholder="e.g. Cooked meals"
              required
            />
          </label>

          <div className="field-row">
            <label>
              Portions needed
              <input
                name="portions"
                type="number"
                min="1"
                value={needForm.portions}
                onChange={updateNeed}
                placeholder="20"
                required
              />
            </label>

            <label>
              Needed by
              <input
                name="neededBy"
                type="time"
                value={needForm.neededBy}
                onChange={updateNeed}
                required
              />
            </label>
          </div>

          <label>
            Delivery location
            <input
              name="dropoff"
              value={needForm.dropoff}
              onChange={updateNeed}
              placeholder="Area or address"
              required
            />
          </label>

          <button type="submit" className="intake-button need-button">
            Add food need
          </button>
        </form>
      </div>

      <div className="listings-grid">
        <article className="listing-card">
          <div className="listing-heading">
            <h3>Available surplus</h3>
            <span>{supplies.length} listings</span>
          </div>

          {supplies.map((item) => (
            <div className="listing-row" key={item.id}>
              <div>
                <strong>{item.food}</strong>
                <span>{item.donor} · Pickup: {item.pickup}</span>
              </div>
              <div className="listing-detail">
                <strong>{item.portions} portions</strong>
                <span>Expires {item.expiry}</span>
              </div>
            </div>
          ))}
        </article>

        <article className="listing-card">
          <div className="listing-heading">
            <h3>Open recipient needs</h3>
            <span>{needs.length} requests</span>
          </div>

          {needs.map((item) => (
            <div className="listing-row" key={item.id}>
              <div>
                <strong>{item.organisation}</strong>
                <span>{item.food} · Deliver to: {item.dropoff}</span>
              </div>
              <div className="listing-detail">
                <strong>{item.portions} portions</strong>
                <span>Needed by {item.neededBy}</span>
              </div>
            </div>
          ))}
        </article>
      </div>
    </section>
  )
}