import { useEffect, useState } from 'react'
import './deliveryboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, options).catch(() => {
    throw new Error('Backend nahi chal raha. Backend terminal check karo.')
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data
}

function displayTime(value) {
  if (!value) return 'Not set'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function DeliveryBoard() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadDeliveries() {
    setLoading(true)
    setError('')

    try {
      const rows = await request('/api/deliveries')
      setDeliveries(rows)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeliveries()
  }, [])

  async function reassign(id) {
    setBusyId(id)
    setError('')
    setNotice('')

    try {
      const updated = await request(`/api/deliveries/${id}/reassign`, {
        method: 'POST',
      })

      setDeliveries((items) =>
        items.map((item) => (item.id === id ? updated : item))
      )
      setNotice(updated.message || 'Delivery plan updated.')
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setBusyId(null)
    }
  }

  async function markArrived(id) {
    setBusyId(id)
    setError('')
    setNotice('')

    try {
      const updated = await request(`/api/deliveries/${id}/arrived`, {
        method: 'POST',
      })

      setDeliveries((items) =>
        items.map((item) => (item.id === id ? updated : item))
      )
      setNotice(updated.message || 'Arrival recorded.')
    } catch (actionError) {
      setError(actionError.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="delivery-board">
      <p className="delivery-board-label">DELIVERY NETWORK</p>
      <h2>Delivery board</h2>

      {loading && <p>Loading deliveries…</p>}
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}

      {!loading && deliveries.length === 0 && (
        <p>
          No deliveries yet. Add a surplus and a matching food need with future
          times to create a delivery.
        </p>
      )}

      {deliveries.map((item) => {
        const isDelivered = item.status.startsWith('Delivered')

        return (
          <article className="delivery-card" key={item.id}>
            <div>
              <strong>
                {item.portions} portions · {item.food_item}
              </strong>
              <p>
                {item.donor} → {item.organization}
              </p>
              <p>Partner: {item.partner_name || 'Reassignment needed'}</p>
            </div>

            <div>
              <p>ETA: {displayTime(item.eta)}</p>
              <p>Expires: {displayTime(item.expires_at)}</p>
            </div>

            <span className="delivery-status">{item.status}</span>

            <button
              type="button"
              disabled={busyId === item.id || isDelivered}
              onClick={() => reassign(item.id)}
            >
              {busyId === item.id ? 'Updating…' : 'Reassign partner'}
            </button>

            <button
              type="button"
              disabled={busyId === item.id || isDelivered}
              onClick={() => markArrived(item.id)}
            >
              Confirm arrival
            </button>
          </article>
        )
      })}
    </section>
  )
}