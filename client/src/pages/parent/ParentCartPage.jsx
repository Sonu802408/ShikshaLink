import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, ArrowRight, Heart, Search, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { TutorCard } from '../../components/tutors/TutorCard';
import { BookingModal } from '../../components/bookings/BookingModal';
import { useToast } from '../../context/ToastContext';

export const ParentCartPage = () => {
  const { showToast } = useToast();
  const [cartTutors, setCartTutors] = useState([]);
  const [recommendedTutors, setRecommendedTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/parents/cart');
      if (res.success) {
        setCartTutors(res.tutors || []);
        setRecommendedTutors(res.recommendedTutors || []);
      }
    } catch (err) {
      showToast('Failed to load tutor cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleToggleCart = async (tutorProfileId) => {
    try {
      const res = await apiRequest('/parents/cart/toggle', {
        method: 'POST',
        body: JSON.stringify({ tutorProfileId })
      });
      if (res.success) {
        if (!res.inCart) {
          setCartTutors((prev) => prev.filter((t) => t._id !== tutorProfileId));
          showToast('Tutor removed from your cart', 'info');
        } else {
          showToast('Tutor added to your cart!', 'success');
          fetchCart();
        }
      }
    } catch (err) {
      showToast('Failed to update cart', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl card-3d flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-teal-400" />
            <span>Parent Tutor Cart</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Shortlisted Tutors & Bookings
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Tutors shortlisted in your cart. Review rates, subject expertise, and click Book Tutor to confirm your sessions with zero repetitive forms.
          </p>
        </div>

        <Link
          to="/find-tutors"
          className="px-5 py-2.5 rounded-2xl btn-3d-primary text-xs uppercase tracking-wider font-bold shrink-0 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Explore All Tutors</span>
        </Link>
      </div>

      {/* Cart Tutors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>Tutors in Your Cart</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              {cartTutors.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your cart...</div>
        ) : cartTutors.length === 0 ? (
          <div className="p-8 sm:p-10 text-center bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-2xs border border-teal-100">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Your Tutor Cart is currently empty</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Save your favourite teachers from the marketplace or book from the recommended verified tutors below.
              </p>
            </div>
            <Link
              to="/find-tutors"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-3d-primary text-xs font-bold"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Tutors</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cartTutors.map((tutor) => (
              <TutorCard
                key={tutor._id}
                tutor={tutor}
                isSaved={true}
                onSave={handleToggleCart}
                onBook={(t) => setSelectedTutorForBooking(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended / Top Verified Tutors Ready to Book */}
      {recommendedTutors.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Recommended Verified Tutors (Ready to Book)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Top-rated academic educators with background verification in Mayur Vihar & Delhi NCR
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedTutors.map((tutor) => {
              const inCart = cartTutors.some((c) => c._id === tutor._id);
              return (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  isSaved={inCart}
                  onSave={handleToggleCart}
                  onBook={(t) => setSelectedTutorForBooking(t)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedTutorForBooking && (
        <BookingModal
          tutor={selectedTutorForBooking}
          onClose={() => setSelectedTutorForBooking(null)}
          onBookingSuccess={() => {
            setSelectedTutorForBooking(null);
            showToast('Tuition booking request sent successfully!', 'success');
          }}
        />
      )}
    </div>
  );
};
