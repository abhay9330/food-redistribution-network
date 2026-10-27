import { useState } from 'react'
import './deliveryboard.css'

const startingDeliveries = [
  {
    id: 'DL-204',
    food: '38 meal boxes',
    donor: 'Harbor Hostel',
    recipient: 'Sahaara Community Kitchen',
    eta: '6:40 PM',
    expiry: '8:30 PM',
    status: 'On the way',
  },
  {
    id: 'DL-203',
    food: '24 rice bowls',
    donor: 'Green Bowl Cafe',
    recipient: 'Hope Food Bank',
    eta: '7:05 PM',
    expiry: '8:00 PM',
    status: 'Pickup soon',
  },
]

export default function DeliveryBoard() {
  const [deliveries, setDeliveries] = useState(startingDeliveries)

  function reassign(id) {
    setDeliveries((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'Reassigned' } : item
      )
    )
  }

  return (
    <section className="delivery-board">
      <p className="delivery-board-label">DELIVERY NETWORK</p>
      <h2>Delivery board</h2>

      {deliveries.map((item) => (
        <article className="delivery-card" key={item.id}>
          <div>
            <strong>{item.food}</strong>
            <p>{item.donor} → {item.recipient}</p>
          </div>
          <div>
            <p>ETA: {item.eta}</p>
            <p>Expires: {item.expiry}</p>
          </div>
          <span className="delivery-status">{item.status}</span>
          <button type="button" onClick={() => reassign(item.id)}>
            Reassign
          </button>
        </article>
      ))}
    </section>
  )
}