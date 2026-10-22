import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import type { DriverApplication, RideRequest, RideStatus, UserRole } from './types';
import { initialDriverApplications, initialRideRequests, mockDrivers } from './data/mockData';
import { appConfig, supabase } from './lib/supabase';

const pickupCoords: [number, number] = [33.6844, 73.0479];
const destinationCoords: [number, number] = [33.7200, 73.0610];

function App() {
  const [userRole, setUserRole] = useState<UserRole>('passenger');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>(initialRideRequests);
  const [driverApplications, setDriverApplications] = useState<DriverApplication[]>(initialDriverApplications);
  const [pickup, setPickup] = useState('G-11 Markaz, Islamabad');
  const [destination, setDestination] = useState('Blue Area, Islamabad');
  const [proposedFare, setProposedFare] = useState('2200');
  const [driverOffer, setDriverOffer] = useState('2400');
  const [searchTerm, setSearchTerm] = useState('');

  const connectionLabel = useMemo(
    () => (appConfig.demoMode ? 'Demo mode: mock data only' : supabase ? 'Supabase connected' : 'Demo mode: mock data only'),
    []
  );

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return rideRequests;
    const query = searchTerm.toLowerCase();
    return rideRequests.filter(
      (request) =>
        request.pickup.toLowerCase().includes(query) ||
        request.destination.toLowerCase().includes(query) ||
        request.passengerName.toLowerCase().includes(query)
    );
  }, [rideRequests, searchTerm]);

  const handleLogin = async () => {
    if (supabase) {
      try {
        await supabase.auth.signInWithPassword({
          email: 'demo@zride.pk',
          password: 'demo-password'
        });
      } catch (error) {
        console.error('Supabase sign-in failed:', error);
      }
    }
    setIsLoggedIn(true);
  };

  const handlePublishRide = () => {
    if (!pickup || !destination || !proposedFare) {
      window.alert('Please complete pickup, destination and fare before publishing the ride request.');
      return;
    }

    const newRequest: RideRequest = {
      id: `r-${Date.now()}`,
      passengerName: 'Demo Passenger',
      pickup,
      destination,
      fare: Number(proposedFare),
      createdAt: new Date().toISOString(),
      status: 'offers',
      offers: []
    };

    setRideRequests((current) => [newRequest, ...current]);
    setPickup('');
    setDestination('');
    setProposedFare('');
  };

  const addDriverOffer = (requestId: string) => {
    const offerValue = Number(driverOffer || 0);
    if (!offerValue) {
      window.alert('Enter a valid driver fare before submitting an offer.');
      return;
    }

    setRideRequests((current) =>
      current.map((item) => {
        if (item.id !== requestId) return item;
        return {
          ...item,
          status: 'offers',
          offers: [
            ...item.offers,
            {
              id: `o-${Date.now()}`,
              driverName: 'Driver Demo',
              vehicle: 'Toyota Corolla',
              fare: offerValue,
              comment: 'I can take this trip at your proposed fare or a small adjustment.',
              status: 'pending',
              etaMinutes: 9
            }
          ]
        };
      })
    );
  };

  const acceptOffer = (requestId: string, offerId: string) => {
    setRideRequests((current) =>
      current.map((ride) => {
        if (ride.id !== requestId) return ride;

        return {
          ...ride,
          status: 'accepted',
          acceptedOfferId: offerId,
          assignedDriver:
            ride.offers.find((offer) => offer.id === offerId)?.driverName ?? ride.assignedDriver,
          offers: ride.offers.map((offer) => ({
            ...offer,
            status: offer.id === offerId ? 'accepted' : 'rejected'
          }))
        };
      })
    );
  };

  const updateTripStatus = (requestId: string, nextStatus: RideStatus) => {
    setRideRequests((current) =>
      current.map((ride) => (ride.id === requestId ? { ...ride, status: nextStatus } : ride))
    );
  };

  const approveDriver = (applicationId: string, approved: boolean) => {
    setDriverApplications((current) =>
      current.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: approved ? 'approved' : 'rejected'
            }
          : app
      )
    );
  };

  const activeRide = rideRequests.find((ride) => ride.status === 'accepted') ?? rideRequests[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Islamabad • Rawalpindi</p>
          <h1>Z Ride Pakistan</h1>
        </div>
        <div className="status-group">
          <span className="status-pill status-live">{connectionLabel}</span>
          <button className="ghost-button" onClick={() => setIsLoggedIn((val) => !val)}>
            {isLoggedIn ? 'Logged in' : 'Login'}
          </button>
        </div>
      </header>

      <section className="hero-card">
        <div className="hero-copy">
          <p className="badge">Cash only • Fare negotiation • Local rides</p>
          <h2>Choose a route, negotiate a fair price, and ride with trusted local drivers.</h2>
          <p className="muted-text">
            Demo-only experience for Islamabad and Rawalpindi. Mock routes and driver availability are clearly labeled and not fed by live GPS.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={handleLogin}>Continue as passenger</button>
            <button className="secondary-button" onClick={() => setUserRole('driver')}>Driver access</button>
          </div>
        </div>
        <div className="hero-side">
          <div className="mini-card">
            <span>Avg. fare</span>
            <strong>PKR 2,100</strong>
          </div>
          <div className="mini-card green">
            <span>Active rides</span>
            <strong>{rideRequests.length}</strong>
          </div>
          <div className="mini-card">
            <span>Driver approval</span>
            <strong>Admin review</strong>
          </div>
        </div>
      </section>

      <nav className="role-switcher" aria-label="App roles">
        {(['passenger', 'driver', 'admin'] as UserRole[]).map((role) => (
          <button
            key={role}
            className={userRole === role ? 'role-button active' : 'role-button'}
            onClick={() => setUserRole(role)}
          >
            {role === 'passenger' ? 'Passenger' : role === 'driver' ? 'Driver' : 'Admin'}
          </button>
        ))}
      </nav>

      {userRole === 'passenger' && (
        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Request a ride</h3>
              <span className="chip">Mock route search</span>
            </div>

            <div className="travel-form">
              <label>
                Pickup
                <input value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="G-11 Markaz" />
              </label>
              <label>
                Destination
                <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Blue Area" />
              </label>
              <label>
                Proposed fare (PKR)
                <input type="number" value={proposedFare} onChange={(event) => setProposedFare(event.target.value)} />
              </label>
            </div>

            <button className="primary-button full" onClick={handlePublishRide}>Publish ride request</button>

            <div className="map-wrap">
              <MapContainer center={pickupCoords} zoom={11} scrollWheelZoom={false} className="leaflet-map">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker center={pickupCoords} pathOptions={{ color: '#21b77a', fillColor: '#21b77a' }} radius={10}>
                  <Tooltip>Pickup area</Tooltip>
                </CircleMarker>
                <CircleMarker center={destinationCoords} pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9' }} radius={10}>
                  <Tooltip>Destination area</Tooltip>
                </CircleMarker>
                <Polyline positions={[pickupCoords, destinationCoords]} pathOptions={{ color: '#21b77a', opacity: 0.8 }} />
              </MapContainer>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Live offers</h3>
              <input
                value={searchTerm}
                className="search-box"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by route or rider"
              />
            </div>

            <div className="ride-list">
              {filteredRequests.length === 0 ? (
                <div className="empty-state">No matching ride requests. Try a different route.</div>
              ) : (
                filteredRequests.map((ride) => (
                  <article key={ride.id} className="ride-card">
                    <div className="ride-row">
                      <div>
                        <p className="route-name">{ride.pickup}</p>
                        <p className="route-name small">to {ride.destination}</p>
                      </div>
                      <span className="fare-badge">PKR {ride.fare.toLocaleString()}</span>
                    </div>

                    <div className="offer-stack">
                      {ride.offers.length === 0 ? (
                        <div className="empty-offer">Waiting for driver offers…</div>
                      ) : (
                        ride.offers.map((offer) => (
                          <div key={offer.id} className={offer.status === 'accepted' ? 'offer accepted' : 'offer'}>
                            <div className="offer-header">
                              <strong>{offer.driverName}</strong>
                              <span>{offer.vehicle}</span>
                            </div>
                            <div className="offer-meta">
                              <span>PKR {offer.fare.toLocaleString()}</span>
                              <span>{offer.etaMinutes} min</span>
                            </div>
                            <p>{offer.comment}</p>
                            {offer.status !== 'accepted' && (
                              <button className="secondary-button small" onClick={() => acceptOffer(ride.id, offer.id)}>
                                Accept offer
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="trip-status-line">
                      <span>Status: {ride.status}</span>
                      {ride.assignedDriver && <span>Driver: {ride.assignedDriver}</span>}
                    </div>

                    {ride.status === 'accepted' && (
                      <div className="trip-actions">
                        <button className="secondary-button small" onClick={() => updateTripStatus(ride.id, 'driver_arrived')}>
                          Driver arrived
                        </button>
                        <button className="secondary-button small" onClick={() => updateTripStatus(ride.id, 'trip_started')}>
                          Start trip
                        </button>
                        <button className="secondary-button small" onClick={() => updateTripStatus(ride.id, 'completed')}>
                          Complete trip
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {userRole === 'driver' && (
        <section className="content-grid single-column">
          <div className="panel">
            <div className="panel-header">
              <h3>Driver dashboard</h3>
              <span className="chip">Availability: online</span>
            </div>

            <div className="driver-summary">
              {mockDrivers.map((driver) => (
                <div key={driver.id} className="driver-card">
                  <div>
                    <strong>{driver.name}</strong>
                    <p>{driver.vehicle}</p>
                  </div>
                  <div className="rating-box">★ {driver.rating}</div>
                  <button className="secondary-button small" onClick={() => setUserRole('driver')}>
                    {driver.available ? 'Available' : 'Offline'}
                  </button>
                </div>
              ))}
            </div>

            <div className="travel-form compact">
              <label>
                Offer amount (PKR)
                <input value={driverOffer} onChange={(event) => setDriverOffer(event.target.value)} />
              </label>
            </div>

            <div className="ride-list">
              {filteredRequests.map((ride) => (
                <article key={ride.id} className="ride-card">
                  <div className="ride-row">
                    <div>
                      <p className="route-name">{ride.pickup}</p>
                      <p className="route-name small">to {ride.destination}</p>
                    </div>
                    <span className="fare-badge">PKR {ride.fare.toLocaleString()}</span>
                  </div>

                  <p className="muted-text">Passenger fare request: PKR {ride.fare.toLocaleString()}</p>
                  <button className="primary-button small" onClick={() => addDriverOffer(ride.id)}>
                    Submit offer
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {userRole === 'admin' && (
        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>Driver approvals</h3>
              <span className="chip">Identity records stay private</span>
            </div>

            <div className="ride-list">
              {driverApplications.map((app) => (
                <article key={app.id} className="ride-card admin-card">
                  <div className="ride-row">
                    <div>
                      <p className="route-name">{app.applicantName}</p>
                      <p className="route-name small">{app.vehicle}</p>
                    </div>
                    <span className={`status-pill ${app.status}`}>{app.status}</span>
                  </div>
                  <p className="muted-text">License: {app.license}</p>
                  <p className="muted-text">Phone: {app.phone}</p>
                  {app.status === 'pending' && (
                    <div className="trip-actions">
                      <button className="primary-button small" onClick={() => approveDriver(app.id, true)}>
                        Approve
                      </button>
                      <button className="ghost-button small" onClick={() => approveDriver(app.id, false)}>
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Ride management</h3>
              <span className="chip">Suspend / review / complaints</span>
            </div>

            <div className="ride-list">
              {rideRequests.map((ride) => (
                <article key={ride.id} className="ride-card">
                  <div className="ride-row">
                    <div>
                      <p className="route-name">{ride.pickup}</p>
                      <p className="route-name small">to {ride.destination}</p>
                    </div>
                    <span className="fare-badge">PKR {ride.fare.toLocaleString()}</span>
                  </div>
                  <div className="trip-status-line">
                    <span>Status: {ride.status}</span>
                    {ride.assignedDriver && <span>Driver: {ride.assignedDriver}</span>}
                  </div>
                  <div className="trip-actions">
                    <button className="secondary-button small" onClick={() => updateTripStatus(ride.id, 'cancelled')}>
                      Suspend trip
                    </button>
                    <button className="secondary-button small" onClick={() => updateTripStatus(ride.id, 'completed')}>
                      Mark complete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeRide && (
        <section className="summary-bar">
          <div>
            <span className="eyebrow">Current ride snapshot</span>
            <strong>{activeRide.pickup}</strong>
            <small>→ {activeRide.destination}</small>
          </div>
          <div>
            <span>Trip status</span>
            <strong>{activeRide.status}</strong>
          </div>
          <div>
            <span>Accepted fare</span>
            <strong>PKR {activeRide.fare.toLocaleString()}</strong>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
