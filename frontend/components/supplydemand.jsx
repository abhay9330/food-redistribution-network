import { useState } from 'react'
import './SupplyDemand.css'

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

export default function SupplyDemand() {
  const [supplies, setSupplies] = useState([
    {
      id: 1,
      food: 'Vegetable pulao',
      donor: 'Harbor Hostel',
      portions: '32',
      pickup: 'Dock Road',
      expiry: '8:30 PM',
    },
  ])

  const [needs, setNeeds] = useState([
    {
      id: 2,
      organisation: 'Sahaara Community Kitchen',
      food: 'Cooked meals',
      portions: '20',
      dropoff: 'Market Street',
      neededBy: '7:30 PM',
    },
  ])

  const [supplyForm, setSupplyForm] = useState(emptySupply)
  const [needForm, setNeedForm] = useState(emptyNeed)

  function updateSupply(event) {
    setSupplyForm({ ...supplyForm, [event.target.name]: event.target.value })
  }

  function updateNeed(event) {
    setNeedForm({ ...needForm, [event.target.name]: event.target.value })
  }

  function addSupply(event) {
    event.preventDefault()
    setSupplies([{ ...supplyForm, id: Date.now() }, ...supplies])
    setSupplyForm(emptySupply)
  }

  function addNeed(event) {
    event.preventDefault()
    setNeeds([{ ...needForm, id: Date.now() }, ...needs])
    setNeedForm(emptyNeed)
  }

  return (
    <section className="supply-demand">
      <header className="supply-heading">
        <p>NETWORK INTAKE</p>
        <h2>Food supply and community needs</h2>
        <span>Add available food or tell the network what your organisation needs.</span>
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
            <input name="food" value={supplyForm.food} onChange={updateSupply} placeholder="e.g. Vegetable pulao" required />
          </label>
          <label>
            Restaurant or hostel
            <input name="donor" value={supplyForm.donor} onChange={updateSupply} placeholder="Name of donor" required />
          </label>

          <div className="field-row">
            <label>
              Portions
              <input name="portions" type="number" min="1" value={supplyForm.portions} onChange={updateSupply} placeholder="30" required />
            </label>
            <label>
              Food expires at
              <input name="expiry" type="time" value={supplyForm.expiry} onChange={updateSupply} required />
            </label>
          </div>

          <label>
            Pickup location
            <input name="pickup" value={supplyForm.pickup} onChange={updateSupply} placeholder="Area or address" required />
          </label>

          <button type="submit" className="intake-button supply-button">Add surplus</button>
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
            <input name="organisation" value={needForm.organisation} onChange={updateNeed} placeholder="Organisation name" required />
          </label>
          <label>
            Food needed
            <input name="food" value={needForm.food} onChange={updateNeed} placeholder="e.g. Cooked meals" required />
          </label>

          <div className="field-row">
            <label>
              Portions needed
              <input name="portions" type="number" min="1" value={needForm.portions} onChange={updateNeed} placeholder="20" required />
            </label>
            <label>
              Needed by
              <input name="neededBy" type="time" value={needForm.neededBy} onChange={updateNeed} required />
            </label>
          </div>

          <label>
            Delivery location
            <input name="dropoff" value={needForm.dropoff} onChange={updateNeed} placeholder="Area or address" required />
          </label>

          <button type="submit" className="intake-button need-button">Add food need</button>
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