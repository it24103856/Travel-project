import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaMapMarkerAlt, FaCalendarAlt, FaCalendarCheck, FaStar,
  FaChevronDown, FaChevronUp, FaBus, FaTrain, FaCar,
  FaHotel, FaCamera, FaLightbulb, FaHashtag, FaPhoneAlt,
  FaUserCircle
} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";
import { logView } from "../api/interactions";


const PackageOverviewPage = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Travel Itinerary");
  const [openFaq, setOpenFaq] = useState(null);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // ── View tracking ─────────────────────────────────────────────────
  const arrivalTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      const duration = Math.round((Date.now() - arrivalTime.current) / 1000);
      logView(id, duration);
    };
  }, [id]);

  const NAV_TABS = [
    "Travel Itinerary",
    "Destinations",
    "Hotels",
    "Transport",
    "Gallery",
    "FAQs & tips",
    "Reviews",
  ];

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const cleanId = id.includes(":") ? id.split(":")[1] : id;
        const response = await axios.get(`${backendUrl}/packages/get/${cleanId}`);
        if (response.data?.success) {
          setPkg(response.data.data);
        } else {
          toast.error("Package not found");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Error loading package details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPackage();
  }, [id, backendUrl]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const cleanId = id.includes(":") ? id.split(":")[1] : id;
        const response = await axios.get(`${backendUrl}/reviews/package/${cleanId}`);
        if (response.data?.success) {
          setReviews(response.data.data || []);
        }
      } catch (error) {
        console.error("Reviews fetch error:", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    if (id) fetchReviews();
  }, [id, backendUrl]);

  const scrollToSection = (section) => {
    setActiveSection(section);
    const el = document.getElementById(section.replace(/[\s&]/g, "-").toLowerCase());
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f4f7fc] p-6">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#c87941] mb-4"></div>
      <p className="text-[#c87941] font-black tracking-widest uppercase text-[10px]">Preparing Your Journey</p>
    </div>
  );

  if (!pkg) return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fc]">
      <p className="text-slate-500 font-bold">Package not found!</p>
    </div>
  );

  const galleryImages = pkg.gallery || [];
  const visibleGallery = showAllGallery ? galleryImages : galleryImages.slice(0, 3);

  // ── Review stats ──────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-24 pb-10 px-2 md:px-8">
      <Toaster />

      {/* ── OUTER ROUNDED RECTANGLE ── */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/40">

        {/* ── 1. HERO SECTION ── */}
        <section
          className="relative h-[350px] md:h-[550px] bg-cover bg-center flex items-end p-6 md:p-14 text-white"
          style={{
            backgroundImage: `url("${pkg.gallery?.[0] || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"}")`,
            backgroundColor: "#0b223a",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b223a] via-[#0b223a]/30 to-transparent z-1"></div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {pkg.categories?.map((cat, i) => (
                  <span key={i} className="bg-amber-400/20 backdrop-blur-sm text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {cat}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-7xl font-bold tracking-tight drop-shadow-2xl capitalize leading-tight">
                {pkg.title}
              </h1>
              <div className="flex items-center gap-2 text-sm md:text-xl font-light opacity-90">
                <FaMapMarkerAlt className="text-amber-400" /> {pkg.location}
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 md:px-8 md:py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 md:gap-4">
                <FaCalendarAlt className="text-amber-400 text-sm md:text-2xl" />
                <span className="text-sm md:text-2xl font-bold">{pkg.no_of_days} Days</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 md:px-8 md:py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 md:gap-4">
                <span className="text-amber-400 text-sm md:text-xl font-black">LKR</span>
                <span className="text-sm md:text-2xl font-bold">{pkg.price?.toLocaleString()}</span>
              </div>
              {avgRating && (
                <div className="bg-white/10 backdrop-blur-xl px-4 py-2 md:px-8 md:py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 md:gap-4">
                  <FaStar className="text-amber-400 text-sm md:text-xl" />
                  <span className="text-sm md:text-2xl font-bold">{avgRating} <span className="text-white/60 text-xs font-medium">({reviews.length})</span></span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. STICKY NAV TABS ── */}
        <nav className="flex gap-6 md:gap-10 px-6 md:px-14 py-4 md:py-6 bg-white border-b border-slate-50 sticky top-0 z-20 overflow-x-auto no-scrollbar">
          {NAV_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => scrollToSection(tab)}
              className={`flex-shrink-0 font-black text-[10px] uppercase tracking-widest pb-3 border-b-2 transition-all ${
                activeSection === tab
                  ? "border-blue-900 text-blue-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* ── 3. MAIN CONTENT ── */}
        <div className="p-5 md:p-14 space-y-16">

          {/* ── CUSTOMIZE BANNER ── */}
          <div className="border-2 border-[#d4a96a] rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900">Customize your tour package</h3>
              <p className="text-slate-500 text-sm mt-1 font-semibold">extend nights, change hotels, add activities</p>
            </div>
            <button className="bg-slate-900 text-white px-7 py-3 rounded-full font-black text-sm hover:scale-105 transition-all flex-shrink-0">
              Customize package
            </button>
          </div>

          {/* ── TRAVEL ITINERARY ── */}
          <section id="travel-itinerary" className="scroll-mt-24">
            <SectionTitle title="Travel Itinerary" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                {pkg.itineraries?.map((itin, idx) => (
                  <ItineraryCard key={idx} itin={itin} />
                ))}
              </div>
              <div className="rounded-[1.5rem] overflow-hidden h-[340px] md:h-[500px] border border-[#e8d5b7] shadow-sm">
                <iframe
                  title="map"
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(pkg.location || "Sri Lanka")}&output=embed`}
                />
              </div>
            </div>
          </section>

          {/* ── DESTINATIONS ── */}
          {pkg.destinations?.length > 0 && (
            <section id="destinations" className="scroll-mt-24">
              <SectionTitle title="Destinations" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pkg.destinations.map((dest, idx) => (
                  <DestinationCard
                    key={idx}
                    dest={dest}
                    onView={() => navigate(`/destination/${dest._id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── INCLUDED HOTELS ── */}
          {pkg.included_hotels?.length > 0 && (
            <section id="hotels" className="scroll-mt-24">
              <SectionTitle title="Included Hotels" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pkg.included_hotels.map((hotel, idx) => (
                  <HotelCard
                    key={idx}
                    hotel={hotel}
                    onView={() => navigate(`/hotel-details/${hotel._id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── TRANSPORT ── */}
          {pkg.transport?.length > 0 && (
            <section id="transport" className="scroll-mt-24">
              <SectionTitle title="Transport" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pkg.transport.map((t, idx) => (
                  <TransportCard key={idx} label={t} />
                ))}
              </div>
            </section>
          )}

          {/* ── GALLERY ── */}
          {galleryImages.length > 0 && (
            <section id="gallery" className="scroll-mt-24">
              <SectionTitle title="Gallery" />
              <div className="grid grid-cols-3 gap-4 items-center">
                {visibleGallery.map((img, idx) => (
                  <div key={idx} className="rounded-[1.2rem] overflow-hidden h-48 md:h-60 shadow-sm">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
                {!showAllGallery && galleryImages.length > 3 && (
                  <button
                    onClick={() => setShowAllGallery(true)}
                    className="flex items-center gap-2 font-black text-slate-900 text-lg md:text-2xl justify-center"
                  >
                    View more →
                  </button>
                )}
              </div>
            </section>
          )}

          {/* ── FAQs & TIPS ── */}
          <section id="faqs---tips" className="scroll-mt-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {pkg.faqs?.length > 0 && (
                <div>
                  <SectionTitle title="Frequently Asked Questions" />
                  <div className="space-y-3">
                    {pkg.faqs.map((faq, idx) => (
                      <FaqItem
                        key={idx}
                        faq={faq}
                        isOpen={openFaq === idx}
                        onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {pkg.traveller_tips?.length > 0 && (
                <div>
                  <SectionTitle title="Traveller Tips" />
                  <div className="space-y-3">
                    {pkg.traveller_tips.map((tip, idx) => (
                      <TipCard key={idx} tip={tip} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── REVIEWS ── */}
          <section id="reviews" className="scroll-mt-24">
            <SectionTitle title="Reviews" />

            {reviewsLoading ? (
              <div className="flex items-center gap-3 text-slate-400 text-sm font-medium py-8">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-14 bg-[#fdf8f2] rounded-[2rem] border-2 border-dashed border-[#e8d5b7]">
                <FaStar className="mx-auto text-4xl text-[#e8d5b7] mb-3" />
                <p className="text-slate-400 text-sm font-bold">No reviews yet for this package.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* ── Left: Summary ── */}
                <div className="md:col-span-1 bg-[#fdf8f2] border-2 border-[#e8d5b7] rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 h-fit">
                  <p className="text-6xl font-black text-slate-900">{avgRating}</p>
                  <StarRow rating={parseFloat(avgRating)} size="text-2xl" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </p>
                  <div className="w-full space-y-2 mt-2">
                    {ratingCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-500 w-4">{star}</span>
                        <FaStar className="text-amber-400 text-xs flex-shrink-0" />
                        <div className="flex-1 bg-[#e8d5b7] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-bold w-4">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Right: Review Cards ── */}
                <div className="md:col-span-2 space-y-5">
                  {reviews.map((review, idx) => (
                    <ReviewCard key={idx} review={review} />
                  ))}
                </div>

              </div>
            )}
          </section>

        </div>

        {/* ── 4. FOOTER / BOOK CTA ── */}
        <footer className="bg-[#0b223a] text-white p-8 md:px-14 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 font-bold opacity-80">
            <span className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-amber-400" /> {pkg.location}
            </span>
            <span className="flex items-center gap-3">
              <FaCalendarAlt className="text-amber-400" /> {pkg.no_of_days} Days
            </span>
            <span className="flex items-center gap-3">
              <FaHashtag className="text-amber-400" /> LuxuryTravelSL
            </span>
          </div>
          <button
            onClick={() => navigate(`/booking/package/${pkg._id}`)}
            className="w-full md:w-auto bg-[#f3c26b] text-[#1c3d58] px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-all flex items-center justify-center gap-4"
          >
            <FaCalendarCheck /> BOOK NOW
          </button>
        </footer>

      </div>
    </div>
  );
};

// ─── HELPER COMPONENTS ────────────────────────────────────────────

const SectionTitle = ({ title }) => (
  <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-8">{title}</h2>
);

const StarRow = ({ rating, size = "text-base" }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar
        key={s}
        className={`${size} ${s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
      />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const userName = review.userId? `${review.userId.firstName || ""} ${review.userId.lastName || ""}`.trim(): "Traveller";
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "";

  return (
    <div className="border-2 border-[#e8d5b7] rounded-[1.5rem] p-6 bg-white">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f0dfc0] flex items-center justify-center flex-shrink-0">
            {review.userId?.image ? (
            <img
            src={
            review.userId.image.includes("googleusercontent") || review.userId.image.startsWith("http")
            ? review.userId.image: `${import.meta.env.VITE_BACKEND_URL}/${review.userId.image}`
            }
            alt={userName} className="w-full h-full rounded-full object-cover"/>) : (
            <FaUserCircle className="text-[#c87941] text-2xl" />
)}
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm">{userName}</p>
            {date && <p className="text-slate-400 text-[10px] font-medium">{date}</p>}
          </div>
        </div>
        <StarRow rating={review.rating} />
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
};

const ItineraryCard = ({ itin }) => (
  <div className="border-2 border-[#e8d5b7] rounded-[1.5rem] p-5 md:p-7 bg-white">
    <div className="flex items-center gap-3 mb-5">
      <span className="bg-[#f0dfc0] text-[#7a4e1e] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
        Day {String(itin.day_no).padStart(2, "0")}
      </span>
      <span className="font-black text-slate-800 text-base md:text-lg">{itin.title}</span>
    </div>
    <div className="space-y-3">
      {itin.activities?.map((act, idx) => (
        <div key={idx} className="flex items-start gap-4 border-b border-dashed border-slate-100 pb-3 last:border-0 last:pb-0">
          <span className="text-slate-400 font-black text-xs min-w-[42px] pt-0.5">{act.time}</span>
          <span className="text-slate-700 text-sm">{act.task}</span>
        </div>
      ))}
    </div>
  </div>
);

const DestinationCard = ({ dest, onView }) => (
  <div className="bg-white rounded-[1.5rem] overflow-hidden border border-[#e8d5b7] shadow-sm group hover:shadow-md transition-shadow">
    <div className="h-48 overflow-hidden">
      <img
        src={dest.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
        alt={dest.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="p-5">
      <h3 className="font-black text-slate-900 text-base mb-2">{dest.name}</h3>
      {dest.description && (
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2">{dest.description}</p>
      )}
      <button
        onClick={onView}
        className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-black hover:scale-105 transition-all"
      >
        view
      </button>
    </div>
  </div>
);

const HotelCard = ({ hotel, onView }) => (
  <div className="bg-white rounded-[1.5rem] overflow-hidden border border-[#e8d5b7] shadow-sm group hover:shadow-md transition-shadow">
    <div className="relative h-48 overflow-hidden">
      <img
        src={hotel.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"}
        alt={hotel.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {hotel.rating && (
        <div className="absolute top-3 right-3 bg-[#f0dfc0] text-[#7a4e1e] px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow">
          <FaStar size={10} /> {hotel.rating}
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-black text-slate-900 text-base mb-1">{hotel.name}</h3>
      {hotel.city && (
        <span className="inline-flex items-center gap-1 bg-[#f0dfc0] text-[#7a4e1e] px-2.5 py-1 rounded-full text-[10px] font-black mb-3">
          <FaLocationDot size={9} /> {hotel.city}
        </span>
      )}
      <div className="flex justify-between items-center mt-2">
        <span className="font-black text-slate-900 text-sm">
          from LKR {hotel.roomTypes?.[0]?.finalPrice?.toLocaleString() || "—"}
        </span>
        <button
          onClick={onView}
          className="bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-black hover:scale-105 transition-all"
        >
          view
        </button>
      </div>
    </div>
  </div>
);

const TRANSPORT_ICONS = {
  train:   <FaTrain size={28} />,
  bus:     <FaBus size={28} />,
  car:     <FaCar size={28} />,
  vehicle: <FaCar size={28} />,
  tuk:     <FaBus size={28} />,
};

const TransportCard = ({ label }) => {
  const iconKey = Object.keys(TRANSPORT_ICONS).find((k) => label.toLowerCase().includes(k));
  const icon = iconKey ? TRANSPORT_ICONS[iconKey] : <FaBus size={28} />;
  return (
    <div className="border-2 border-[#e8d5b7] rounded-[1.5rem] p-6 bg-white space-y-3">
      <div className="text-slate-700">{icon}</div>
      <p className="font-black text-slate-900 text-base">{label}</p>
    </div>
  );
};

const FaqItem = ({ faq, isOpen, onToggle }) => (
  <div className="border-2 border-[#e8d5b7] rounded-[1.2rem] overflow-hidden bg-white">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-5 font-black text-slate-900 text-sm text-left"
    >
      <span>{faq.question}</span>
      {isOpen
        ? <FaChevronUp className="text-slate-400 flex-shrink-0" />
        : <FaChevronDown className="text-slate-400 flex-shrink-0" />}
    </button>
    {isOpen && (
      <div className="px-5 pb-5 text-slate-500 text-sm leading-relaxed border-t border-[#f0e4cc]">
        <p className="pt-4">{faq.answer}</p>
      </div>
    )}
  </div>
);

const TipCard = ({ tip }) => (
  <div className="border-2 border-[#e8d5b7] rounded-[1.2rem] p-5 bg-white">
    <p className="font-black text-slate-900 text-sm mb-1.5">{tip.title}</p>
    <p className="text-slate-500 text-xs leading-relaxed">{tip.description}</p>
  </div>
);

export default PackageOverviewPage;