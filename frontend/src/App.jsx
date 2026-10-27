                        </span>
                      </td>

                      <td>
                        <strong>{delivery.recipient}</strong>
                        <span className="cell-sub">
                          Expires {delivery.expiry}
                        </span>
                      </td>

                      <td>
                        <strong>{delivery.eta}</strong>
                        <span className="cell-sub">
                          {delivery.partner}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-pill ${delivery.tone}`}
                        >
                          {delivery.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {!dashboard.deliveries.length && (
                    <tr>
                      <td colSpan="4" className="empty-table">
                        {loading
                          ? 'Loading deliveries…'
                          : 'No active deliveries yet. Add matching surplus and recipient needs below.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footnote">
              <span className="footnote-dot" />
              ETA uses the backend's fixed 30-minute demo estimate;
              there is no live map route.
            </div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">RECENT DATABASE EVENTS</p>
                <h2>Network updates</h2>
              </div>
              <span className="live-label">
                <span /> LIVE
              </span>
            </div>

            <div className="activity-list">
              {dashboard.activity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <div className={`activity-icon ${item.tone}`}>
                    {item.symbol}
                  </div>

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
                <p className="empty-activity">
                  {loading
                    ? 'Loading recent updates…'
                    : 'Saved surplus, need and delivery changes will appear here.'}
                </p>
              )}
            </div>

            <div className="agent-note">
              <span className="sparkle">✦</span>
              <p>
                <strong>Matching:</strong> food type, portions,
                expiry/deadline and demo partner availability.
              </p>
            </div>
          </article>
        </section>

        <div id="food-surplus">
          <SupplyDemand />
        </div>

        <div id="delivery-board">
          <DeliveryBoard />
        </div>

        <footer className="page-footer">
          <span>FoodLink · Food redistribution demo</span>
          <span>Forecasts and ETAs use transparent demo rules</span>
        </footer>
      </main>
    </div>
  )
}

export default App
