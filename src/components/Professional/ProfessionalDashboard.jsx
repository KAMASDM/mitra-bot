import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  CalendarDaysIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  StarIcon,
  CheckBadgeIcon,
  PlusIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import StatsCard from './StatsCard';
import AppointmentCard from './AppointmentCard';
import {
  getDashboardStats,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getProfessionalByUserId,
} from '../../services/professionalService';
import toast from 'react-hot-toast';

const ProfessionalDashboard = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Get professional profile
      const prof = await getProfessionalByUserId(currentUser.uid);
      if (!prof) {
        toast.error('Professional profile not found');
        navigate('/professional/register');
        return;
      }
      setProfessional(prof);

      // Get dashboard stats
      const dashboardStats = await getDashboardStats(prof.id);
      setStats(dashboardStats);
      setTodayAppointments(dashboardStats.todayAppointmentsList || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (booking) => {
    try {
      await acceptBooking(booking.id);
      toast.success('Booking accepted');
      loadDashboardData();
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (booking) => {
    try {
      await rejectBooking(booking.id);
      toast.success('Booking rejected');
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast.error('Failed to reject booking');
    }
  };

  const handleCompleteBooking = async (booking) => {
    try {
      await completeBooking(booking.id);
      toast.success('Appointment marked as completed');
      loadDashboardData();
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Failed to complete appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, Dr. {professional?.first_name || 'Professional'}
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              {professional?.specialization || 'Professional'}
            </p>
          </div>
          {professional?.verification_status === 'VERIFIED' && (
            <CheckBadgeIcon className="w-8 h-8 text-green-300" />
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, Dr. {professional?.first_name || 'Professional'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {professional?.verification_status === 'VERIFIED' && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Verified</span>
              </div>
            )}
            <button
              onClick={() => navigate('/professional/availability')}
              className="
                flex items-center gap-2
                bg-indigo-500 text-white px-4 py-2 rounded-xl
                font-medium text-sm
                hover:bg-indigo-600 active:scale-95
                transition-all duration-200
              "
            >
              <PlusIcon className="w-5 h-5" />
              Add Availability
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12 lg:mt-0">
          <StatsCard
            title="Today's Appointments"
            value={stats?.todayAppointments || 0}
            subtitle="Scheduled today"
            icon={CalendarDaysIcon}
            color="primary"
            onClick={() => navigate('/professional/appointments')}
          />
          <StatsCard
            title="Pending Requests"
            value={stats?.pendingBookings || 0}
            subtitle="Need response"
            icon={ClockIcon}
            color="warning"
            onClick={() => navigate('/professional/appointments?filter=pending')}
          />
          <StatsCard
            title="This Month"
            value={`₹${stats?.monthlyEarnings?.toLocaleString('en-IN') || 0}`}
            subtitle="Earnings"
            icon={CurrencyRupeeIcon}
            color="success"
            onClick={() => navigate('/professional/earnings')}
          />
          <StatsCard
            title="Rating"
            value={stats?.averageRating?.toFixed(1) || '0.0'}
            subtitle={`${stats?.totalReviews || 0} reviews`}
            icon={StarIcon}
            color="info"
            onClick={() => navigate('/professional/reviews')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
                <button
                  onClick={() => navigate('/professional/appointments')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All
                </button>
              </div>

              {todayAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No appointments today
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Your schedule is clear for today
                  </p>
                  <button
                    onClick={() => navigate('/professional/availability')}
                    className="
                      bg-indigo-500 text-white px-6 py-2 rounded-xl
                      font-medium text-sm
                      hover:bg-indigo-600 active:scale-95
                      transition-all duration-200
                    "
                  >
                    Add Availability
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      booking={appointment}
                      onAccept={handleAcceptBooking}
                      onReject={handleRejectBooking}
                      onComplete={handleCompleteBooking}
                      compact
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionButton
                  icon={CalendarDaysIcon}
                  label="Manage Appointments"
                  onClick={() => navigate('/professional/appointments')}
                  color="indigo"
                />
                <QuickActionButton
                  icon={ClockIcon}
                  label="Set Availability"
                  onClick={() => navigate('/professional/availability')}
                  color="purple"
                />
                <QuickActionButton
                  icon={UserGroupIcon}
                  label="View Clients"
                  onClick={() => navigate('/professional/clients')}
                  color="blue"
                />
                <QuickActionButton
                  icon={ClipboardDocumentListIcon}
                  label="Session Notes"
                  onClick={() => navigate('/professional/notes')}
                  color="green"
                />
              </div>
            </div>

            {/* Verification Status */}
            {professional?.verification_status !== 'VERIFIED' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      Verification Pending
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Your profile is under review. You'll be notified once verified.
                    </p>
                    <button
                      onClick={() => navigate('/professional/profile')}
                      className="text-sm text-yellow-800 hover:text-yellow-900 font-medium underline"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, onClick, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl
        transition-all duration-200 active:scale-95
        ${colorClasses[color]}
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};

export default ProfessionalDashboard;
