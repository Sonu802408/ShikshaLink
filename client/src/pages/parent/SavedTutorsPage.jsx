import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Star, MapPin } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { TutorCard } from '../../components/tutors/TutorCard';
import { BookingModal } from '../../components/bookings/BookingModal';
import { useToast } from '../../context/ToastContext';

export const SavedTutorsPage = () => {
  const { showToast } = useToast();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/support/saved-tutors');
      if (data.success) {
        setTutors(data.tutors || []);
      }
    } catch (err) {
      showToast('Failed to load saved tutors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (tutorProfileId) => {
    try {
      const res = await apiRequest('/support/save-tutor', {
        method: 'POST',
        body: JSON.stringify({ tutorProfileId })
      });
      if (res.success) {
        setTutors((prev) => prev.filter((t) => t._id !== tutorProfileId));
        showToast('Tutor removed from saved list', 'info');
      }
    } catch (err) {
      showToast('Failed to remove tutor', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Saved Tutors</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your bookmarked teachers for quick reference and future tuition requests
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading saved tutors...</div>
      ) : tutors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No tutors saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse verified tutors in Mayur Vihar and click the heart icon to save your favorites.
          </p>
          <Link
            to="/find-tutors"
            className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Find Tutors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor._id}
              tutor={tutor}
              isSaved={true}
              onSave={handleRemove}
              onBook={(t) => setSelectedTutorForBooking(t)}
            />
          ))}
        </div>
      )}

      {selectedTutorForBooking && (
        <BookingModal
          tutor={selectedTutorForBooking}
          onClose={() => setSelectedTutorForBooking(null)}
          onBookingSuccess={() => setSelectedTutorForBooking(null)}
        />
      )}
    </div>
  );
};
