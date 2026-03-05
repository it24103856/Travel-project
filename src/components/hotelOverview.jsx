import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaMapMarkerAlt, FaStar, FaUtensils, FaHotel, FaBed, 
  FaCrown, FaWifi, FaUsers, FaPhoneAlt, FaHashtag, FaCalendarCheck 
} from "react-icons/fa";
import { FaShrimp, FaBowlFood } from "react-icons/fa6";
import toast, { Toaster } from "react-hot-toast";

const HotelOverviewPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview"); 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        // --- ඉන්ස්ට්‍රක්ටර්ගේ උපදෙස: URL එකේ ':' තිබේ නම් එය ඉවත් කර පිරිසිදු ID එක ලබා ගැනීම ---
        const cleanId = id.includes(":") ? id.split(":")[1] : id; 
        
        const response = await axios.get(`${backendUrl}/hotels/get/${cleanId}`);
        if (response.data?.success) {
          setHotel(response.data.data);
        } else {
          toast.error("Hotel data not found");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Error loading hotel details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHotelDetails();
  }, [id, backendUrl]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-900 mb-4"></div>
      <p className="text-blue-900 font-black tracking-widest uppercase text-[10px]">Preparing Luxury</p>
    </div>
  );

  if (!hotel) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-slate-500 font-bold">Hotel not found!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fc] pt-24 pb-10 px-2 md:px-8">
      <Toaster />
      
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/40">
        
        {/* 1. HERO SECTION - පින්තූරය පෙන්වීම නිවැරදි කර ඇත */}
        <section 
          className="relative h-[350px] md:h-[550px] bg-cover bg-center flex items-end p-6 md:p-14 text-white"
          style={{ 
            backgroundImage: `url("${hotel.images?.[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}")`,
            backgroundColor: '#0b223a'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b223a] via-[#0b223a]/30 to-transparent z-1"></div>
          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-7xl font-bold tracking-tight drop-shadow-2xl capitalize leading-tight">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2 text-sm md:text-xl font-light opacity-90">
                <FaMapMarkerAlt className="text-amber-400" /> {hotel.city}, {hotel.district}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 md:px-8 md:py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-2 md:gap-4">
               <FaStar className="text-amber-400 text-sm md:text-2xl" /> 
               <span className="text-sm md:text-2xl font-bold">{hotel.rating}</span>
            </div>
          </div>
        </section>

        {/* 2. NAVIGATION TABS */}
        <nav className="flex gap-6 md:gap-10 px-6 md:px-14 py-4 md:py-6 bg-white border-b border-slate-50 sticky top-0 z-20 overflow-x-auto no-scrollbar">
          <TabButton label="Overview" active={activeTab === "Overview"} onClick={() => setActiveTab("Overview")} icon={<FaHotel />} />
          <TabButton label="Rooms" active={activeTab === "Rooms"} onClick={() => setActiveTab("Rooms")} icon={<FaBed />} />
          <TabButton label="Dining" active={activeTab === "Dining"} onClick={() => setActiveTab("Dining")} icon={<FaUtensils />} />
        </nav>

        {/* 3. DYNAMIC CONTENT AREA */}
        <div className="p-5 md:p-14">
          
          {/* --- VIEW 1: OVERVIEW --- */}
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-16 animate-fadeIn">
              <div className="space-y-8 md:space-y-12">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl text-[#1a4d78] shadow-sm"><FaBed size={24} /></div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Rooms & Suites</h2>
                </div>

                <div className="space-y-6">
                  {hotel.roomTypes?.slice(0, 2).map((room, idx) => (
                    <RoomItem key={idx} room={room} hotelImg={hotel.images?.[0]} />
                  ))}
                </div>
                
                <button onClick={() => setActiveTab("Rooms")} className="text-blue-900 font-black uppercase tracking-widest text-[10px] md:text-sm border-b-2 border-blue-900 pb-1">
                   View All Accommodations →
                </button>
              </div>

              <div className="space-y-8 md:space-y-12">
                <div className="flex items-center gap-4">
                  <div className="bg-[#f0e6d5] p-4 rounded-2xl text-[#a8652c] shadow-sm"><FaUtensils size={24} /></div>
                  <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Dining</h2>
                </div>
                <div className="bg-[#fdf9f3] rounded-[2rem] p-6 md:p-10 border border-[#f0e6d5] space-y-6 relative overflow-hidden">
                   <div className="relative z-10 space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <FoodCard img="https://images.unsplash.com/photo-1559339352-11d035aa65de" name="Lobster Thermidor" price="LKR 8,500" />
                        <FoodCard img="https://images.unsplash.com/photo-1600891964599-f61ba0e24092" name="Wagyu Steak" price="LKR 12,400" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                         <FoodTag icon={<FaShrimp />} label="Seafood" />
                         <FoodTag icon={<FaBowlFood />} label="Curry" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW 2: ROOMS --- */}
          {activeTab === "Rooms" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 animate-fadeIn">
              {hotel.roomTypes?.map((room, idx) => (
                <RoomItem key={idx} room={room} hotelImg={hotel.images?.[0]} fullView={true} />
              ))}
            </div>
          )}

          {/* --- VIEW 3: DINING --- */}
          {activeTab === "Dining" && (
             <div className="max-w-4xl mx-auto text-center animate-fadeIn">
                <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-4 italic">The Pacific Grill</h2>
                <div className="bg-[#fdf9f3] p-6 md:p-12 rounded-[2.5rem] border border-amber-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FoodCard img="https://images.unsplash.com/photo-1559339352-11d035aa65de" name="Lobster" price="LKR 8,500" />
                   <FoodCard img="https://images.unsplash.com/photo-1600891964599-f61ba0e24092" name="Wagyu" price="LKR 12,400" />
                   <FoodCard img="https://images.unsplash.com/photo-1544025162-d76694265947" name="Grilled Salmon" price="LKR 6,200" />
                </div>
             </div>
          )}
        </div>

        {/* 4. FOOTER */}
        <footer className="bg-[#0b223a] text-white p-8 md:px-14 flex flex-col md:row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 font-bold opacity-80">
             <span className="flex items-center gap-3"><FaPhoneAlt className="text-amber-400"/> {hotel.phone}</span>
             <span className="flex items-center gap-3"><FaHashtag className="text-amber-400"/> LuxuryTravelSL</span>
          </div>
          <button 
            onClick={() => navigate(`/booking/hotel/${hotel._id}`)}
            className="w-full md:w-auto bg-[#f3c26b] text-[#1c3d58] px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-all flex items-center justify-center gap-4"
          >
            <FaCalendarCheck /> BOOK STAY
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const TabButton = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest pb-3 border-b-2 transition-all ${active ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-400'}`}>
    {icon} {label}
  </button>
);

const RoomItem = ({ room, hotelImg, fullView }) => (
  <div className={`group p-2 rounded-[1.5rem] md:rounded-[2.5rem] transition-all duration-500 ${fullView ? 'bg-white shadow-lg border border-slate-100 p-4 md:p-6' : ''}`}>
    <h3 className="text-lg md:text-2xl font-bold text-slate-700 flex items-center gap-2 italic mb-4">
       <FaCrown className="text-amber-500" /> {room.type}
    </h3>
    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
      <div className="col-span-2 rounded-2xl overflow-hidden h-40 md:h-56 shadow-md">
        <img src={room.images?.[0] || hotelImg} className="w-full h-full object-cover" alt="Room" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="rounded-xl overflow-hidden h-[75px] md:h-[100px] shadow-sm"><img src={room.images?.[1] || hotelImg} className="w-full h-full object-cover" alt="d1" /></div>
        <div className="rounded-xl overflow-hidden h-[75px] md:h-[100px] shadow-sm"><img src={room.images?.[2] || hotelImg} className="w-full h-full object-cover" alt="d2" /></div>
      </div>
    </div>
    <div className="flex justify-between items-center px-2">
       <div className="flex gap-2">
          <AmenityTag icon={<FaUsers />} label={`${room.maxGuests}`} />
          <AmenityTag icon={<FaWifi />} label="WiFi" />
       </div>
       <div className="text-right">
          <p className="text-xl md:text-2xl font-black text-blue-900">LKR {room.finalPrice || room.originalPrice}</p>
       </div>
    </div>
  </div>
);

const AmenityTag = ({ icon, label }) => (
  <span className="bg-[#f0f5fb] text-[#1d4c79] px-3 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1.5 uppercase border border-blue-50">
    {icon} {label}
  </span>
);

const FoodTag = ({ icon, label }) => (
  <span className="bg-white text-[#533e26] px-3 py-1.5 rounded-full text-[9px] font-black flex items-center gap-1.5 uppercase border border-amber-100 shadow-sm">
    {icon} {label}
  </span>
);

const FoodCard = ({ img, name, price }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-50 flex items-center p-3 gap-4">
    <img src={img} className="w-16 h-16 rounded-xl object-cover" alt={name} />
    <div className="flex-1 flex justify-between items-center font-black text-slate-800 text-[10px] tracking-tight uppercase">
      <span>{name}</span>
      <span className="text-blue-900 italic">{price}</span>
    </div>
  </div>
);

export default HotelOverviewPage;