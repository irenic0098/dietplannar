import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { communityAPI } from '../services/api';

const Consultation = () => {
  const { t } = useLanguage();

  const [dieticians, setDieticians] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDietician, setSelectedDietician] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const dietRes = await communityAPI.getDieticians();
      setDieticians(dietRes.data);
      const appRes = await communityAPI.getAppointments();
      setAppointments(appRes.data);
    } catch (err) {
      console.error('Failed to load consultation data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDietician || !bookingDate || !bookingTime) {
      setError('Please fill in all booking fields.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await communityAPI.bookAppointment({
        dietician: selectedDietician.id,
        appointment_date: bookingDate,
        appointment_time: bookingTime,
        notes: bookingNotes
      });
      setSuccess('Appointment request submitted successfully!');
      setSelectedDietician(null);
      setBookingDate('');
      setBookingTime('');
      setBookingNotes('');
      // Reload appointment list
      loadData();
    } catch (err) {
      setError('Failed to book appointment.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dietician directories... 🩺</div>;
  }

  return (
    <div>
      <div className="app-header">
        <div>
          <h2>🩺 {t('dieticianBooking')}</h2>
          <p style={{ fontSize: '0.9rem' }}>Schedule one-on-one sessions with our certified nutrition experts.</p>
        </div>
      </div>

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Left: Dietician Directory */}
        <div>
          <h3 style={{ marginBottom: '20px' }}>Our Registered Nutrition Experts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {dieticians.map((dietician) => (
              <div key={dietician.id} className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  border: '1px solid var(--border-color)',
                  flexShrink: 0
                }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <div>
                      <h4>{dietician.name}</h4>
                      <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '500' }}>{dietician.specialization}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>⭐ {dietician.rating} / 5.0</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{dietician.experience_years} {t('experience')}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{dietician.bio}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Fee: ₹{dietician.fee_per_session} / session</strong>
                    <button className="btn btn-primary" onClick={() => {
                      setSelectedDietician(dietician);
                      // Scroll to booking form
                      const el = document.getElementById('booking-form');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      {t('bookSession')} 🗓️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Booking Form & Scheduled Appointments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Booking Form */}
          <div id="booking-form" className="card">
            <h3>🗓️ Book Appointment</h3>
            {selectedDietician ? (
              <form onSubmit={handleBook} style={{ marginTop: '16px' }}>
                <p style={{ marginBottom: '16px' }}>
                  Booking with: <strong style={{ color: 'var(--accent)' }}>{selectedDietician.name}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">{t('selectDate')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('selectTime')}</label>
                  <input
                    type="time"
                    className="form-input"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">{t('notes')}</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="e.g. Discussing diabetic diet guidelines"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? 'Booking...' : t('confirmBooking')}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedDietician(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Select a dietician from the list to configure appointment date and slot.
              </p>
            )}
          </div>

          {/* Appointments List */}
          <div className="card">
            <h3>📅 {t('upcomingAppointments')}</h3>
            {appointments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {appointments.map((app) => (
                  <div key={app.id} style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong>{app.dietician_name}</strong>
                      <span style={{
                        padding: '2px 6px',
                        background: app.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: app.status === 'confirmed' ? 'var(--accent)' : 'var(--warning)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {app.status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Date: {app.appointment_date} | Time: {app.appointment_time}</p>
                    {app.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Notes: {app.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No appointments booked yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
