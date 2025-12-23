import React, { useState, useEffect } from 'react';
import { API_BASE_URL} from '@/lib/api.ts';
import{
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Video, 
  BookOpen, 
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Star,
  Check,
  X as XIcon,
  Calculator
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Newspaper } from 'lucide-react';



// Define TypeScript interfaces
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Referral {
  id: number;
  referrer_name: string;
  referrer_email: string;
  referrer_phone: string;
  referred_name: string;
  referred_email: string;
  referred_phone: string;
  status: string;
  created_at: string;
}

interface LoanApplication {
  id: number;
  user_name: string;
  user_email: string;
  service_name: string;
  amount: number;
  status: string;
  submitted_at: string;
}

interface Review {
  id: number;
  name: string;
  email: string;
  phone: string;
  rating: number;
  review_text: string;
  status: string;
  created_at: string;
  is_approved?: boolean;
  location?: string;
  loan_type?: string;
  loan_amount?: string;
}

interface TestimonialVideo {
  id: number;
  title: string;
  video_url: string;
  customer_name: string;
  customer_location: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  image_url?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  image_url: string;
  event_date: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface RegulatoryUpdate {
  id: number;
  title: string;
  content: string;
  category: 'RBI' | 'GST';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface EligibilitySubmission {
  id: number;
  name: string;
  phone: string;
  email: string;
  monthly_salary: number;
  existing_emi: number;
  age: number;
  employment_type: string;
  interest_rate: number;
  desired_tenure_years: number;
  eligible_loan_amount: number;
  affordable_emi: number;
  status: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  totalReferrals: number;
  totalApplications: number;
  recentUsers: number;
  recentApplications: number;
  totalClicks: number;
}
interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  is_published: boolean;
  created_at: string;
}


const AdminDashboardClean = () => {
  
  const [showBlogModal, setShowBlogModal] = useState(false);
    // 🔹 Blog modal states (MUST be inside component)
  const [newBlog, setNewBlog] = useState({
    title: '',
    description: '',
    content: '',
    is_published: true,
  });

  const [blogImage, setBlogImage] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonialVideos, setTestimonialVideos] = useState<TestimonialVideo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [eligibilitySubmissions, setEligibilitySubmissions] = useState<EligibilitySubmission[]>([]);
  const [actionStatus, setActionStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Form states
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    image_url: '',
    event_date: '',
    display_order: 0,
    is_active: true
  });
  
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  
  const [newVideo, setNewVideo] = useState({
    title: '',
    video_url: '',
    customer_name: '',
    customer_location: '',
    description: '',
    display_order: 0,
    is_active: true
  });
  
  const [videoImage, setVideoImage] = useState<File | null>(null);
  const [videoImagePreview, setVideoImagePreview] = useState<string | null>(null);
  
  const [newRegulatoryUpdate, setNewRegulatoryUpdate] = useState({
    title: '',
    content: '',
    category: 'RBI' as 'RBI' | 'GST',
    display_order: 0,
    is_active: true
  });

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showRegulatoryModal, setShowRegulatoryModal] = useState(false);

  // Get JWT token from localStorage
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      console.warn('No authentication token found');
      showActionMessage('Authentication required. Please log in again.', 'error');
      // Redirect to login
      window.location.href = '/login';
    }
  }, [token]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Fetching data with token:', token ? 'Token present' : 'No token');
      
      // Fetch all data in parallel
      const [
        usersRes, 
        referralsRes, 
        applicationsRes, 
        statsRes, 
        reviewsRes, 
        videosRes, 
        eventsRes, 
        regulatoryRes,
        eligibilityRes,
        blogsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers }),
        fetch(`${API_BASE_URL}/referrals`, { headers }),
        fetch(`${API_BASE_URL}/loan-applications`, { headers }),
        fetch(`${API_BASE_URL}/dashboard-stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/reviews`, { headers }),
        fetch(`${API_BASE_URL}/admin/testimonial-videos`, { headers }),
        fetch(`${API_BASE_URL}/admin/events`, { headers }),
        fetch(`${API_BASE_URL}/admin/regulatory-updates`, { headers }),
        fetch(`${API_BASE_URL}/admin/eligibility`, { headers }),
        fetch(`${API_BASE_URL}/admin/blogs`, { headers })
      ]);

      // Check if any admin requests failed due to auth
      const adminResponses = [reviewsRes, videosRes, eventsRes, regulatoryRes, eligibilityRes];
      for (const res of adminResponses) {
        if (!res.ok && res.status === 401) {
          console.error('Authentication failed for admin endpoint');
          showActionMessage('Authentication failed. Please log in again.', 'error');
          return;
        }
      }

      const usersData = await usersRes.json();
      const referralsData = await referralsRes.json();
      const applicationsData = await applicationsRes.json();
      const statsData = await statsRes.json();
      const reviewsData = await reviewsRes.json();
      const videosData = await videosRes.json();
      const eventsData = await eventsRes.json();
      const regulatoryData = await regulatoryRes.json();
      const eligibilityData = await eligibilityRes.json();
      const blogsData = await blogsRes.json();
      setBlogs(blogsData);
      setUsers(usersData);
      setReferrals(referralsData);
      setLoanApplications(applicationsData);
      setStats(statsData);
      setReviews(reviewsData);
      setTestimonialVideos(videosData);
      setEvents(eventsData);
      setRegulatoryUpdates(regulatoryData);
      setEligibilitySubmissions(eligibilityData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showActionMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show action message
  const showActionMessage = (message: string, type: 'success' | 'error') => {
    setActionStatus({ message, type });
    setTimeout(() => setActionStatus(null), 3000);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  const handleBlogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setBlogImage(file);

    const reader = new FileReader();
    reader.onload = () => setBlogImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }
};
const handleAddBlog = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append('title', newBlog.title);
    formData.append('description', newBlog.description);
    formData.append('content', newBlog.content);
    formData.append('is_published', newBlog.is_published ? '1' : '0');

    if (blogImage) {
      formData.append('thumbnail', blogImage);
    }

    const response = await fetch(`${API_BASE_URL}/admin/blogs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create blog');
    }

    setShowBlogModal(false);
    setNewBlog({ title: '', description: '', content: '', is_published: true });
    setBlogImage(null);
    setBlogImagePreview(null);

    fetchAllData();
    showActionMessage('Blog created successfully', 'success');
  } catch (err) {
    console.error(err);
    showActionMessage('Failed to create blog', 'error');
  }
};


  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  const handleDeleteBlog = async (id: number) => {
  if (!window.confirm('Delete this blog?')) return;

  try {
    await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setBlogs(blogs.filter(b => b.id !== id));
    showActionMessage('Blog deleted successfully', 'success');
  } catch (err) {
    showActionMessage('Failed to delete blog', 'error');
  }
};
  // Handle regulatory update deletion
  const handleDeleteRegulatoryUpdate = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this regulatory update? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/regulatory-updates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete regulatory update: ${errorData.error || response.statusText}`);
      }

      // Remove the update from local state
      setRegulatoryUpdates(regulatoryUpdates.filter((update: RegulatoryUpdate) => update.id !== id));

      showActionMessage('Regulatory update deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting regulatory update:', err);
      showActionMessage(err.message || 'Failed to delete regulatory update', 'error');
    }
  };

  // Handle referral status update
  const handleUpdateReferralStatus = async (id: number, status: 'pending' | 'accepted' | 'rejected') => {
    try {
      console.log('Updating referral status:', { id, status });
      
      // First, get the current referral to check its state
      const currentReferral = referrals.find((r: Referral) => r.id === id);
      console.log('Current referral:', currentReferral);
      
      // Check if we have a valid token
      if (!token) {
        throw new Error('No authentication token. Please log in again.');
      }
      
      // Fixed the endpoint URL - it was missing the /api prefix
      // Fixed the endpoint URL - it was missing the /api prefix
      const response = await fetch(`${API_BASE_URL}/admin/referrals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      console.log('Response status:', response.status);
      
      // Check for network errors
      if (!response.ok) {
        if (response.status === 0) {
          throw new Error('Network error - server may be unreachable');
        }
        
        // Try to get error details
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.error || response.statusText;
          console.error('Error response data:', errorData);
        } catch (parseError) {
          errorDetails = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(`Failed to update referral status: ${errorDetails}`);
      }

      const result = await response.json();
      console.log('Update result:', result);

      // Update local state
      setReferrals(referrals.map((referral: Referral) => 
        referral.id === id ? { ...referral, status } : referral
      ));

      showActionMessage(`Referral ${status} successfully`, 'success');
      
      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchAllData();
      }, 1000);
    } catch (err: any) {
      console.error('Error updating referral status:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to update referral status';
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Network error - please check your connection';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showActionMessage(errorMessage, 'error');
    }
  };

  // Handle loan application status update
  const handleUpdateLoanApplicationStatus = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/loan-applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update loan application status: ${errorData.error || response.statusText}`);
      }

      // Update local state
      setLoanApplications(loanApplications.map((application: LoanApplication) => 
        application.id === id ? { ...application, status } : application
      ));

      showActionMessage(`Loan application ${status} successfully`, 'success');
    } catch (err: any) {
      console.error('Error updating loan application status:', err);
      showActionMessage(err.message || 'Failed to update loan application status', 'error');
    }
  };

  // Handle loan application deletion
  const handleDeleteLoanApplication = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this loan application? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/loan-applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete loan application: ${errorData.error || response.statusText}`);
      }

      // Remove the application from local state
      setLoanApplications(loanApplications.filter((application: LoanApplication) => application.id !== id));

      showActionMessage('Loan application deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting loan application:', err);
      showActionMessage(err.message || 'Failed to delete loan application', 'error');
    }
  };

  // Handle referral deletion
  const handleDeleteReferral = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this referral? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/referrals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete referral: ${errorData.error || response.statusText}`);
      }

      // Remove the referral from local state
      setReferrals(referrals.filter((referral: Referral) => referral.id !== id));

      showActionMessage('Referral deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting referral:', err);
      showActionMessage(err.message || 'Failed to delete referral', 'error');
    }
  };

  // Handle eligibility submission status update
  const handleUpdateEligibilityStatus = async (id: number, status: 'pending' | 'reviewed' | 'contacted') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/eligibility/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update eligibility status: ${errorData.error || response.statusText}`);
      }

      // Update local state
      setEligibilitySubmissions(eligibilitySubmissions.map((submission: EligibilitySubmission) => 
        submission.id === id ? { ...submission, status } : submission
      ));

      showActionMessage(`Eligibility submission ${status} successfully`, 'success');
    } catch (err: any) {
      console.error('Error updating eligibility status:', err);
      showActionMessage(err.message || 'Failed to update eligibility status', 'error');
    }
  };

  // Handle eligibility submission deletion
  const handleDeleteEligibilitySubmission = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this eligibility submission? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/eligibility/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete eligibility submission: ${errorData.error || response.statusText}`);
      }

      // Remove the submission from local state
      setEligibilitySubmissions(eligibilitySubmissions.filter((submission: EligibilitySubmission) => submission.id !== id));

      showActionMessage('Eligibility submission deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting eligibility submission:', err);
      showActionMessage(err.message || 'Failed to delete eligibility submission', 'error');
    }
  };

  // Handle review approval
  const handleReviewApproval = async (id: number, isApproved: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: isApproved ? 'verified' : 'rejected' })
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      // Update local state
      setReviews(reviews.map((review: Review) => 
        review.id === id ? { ...review, status: isApproved ? 'verified' : 'rejected' } : review
      ));

      showActionMessage(`Review ${isApproved ? 'approved' : 'rejected'} successfully`, 'success');
    } catch (err: any) {
      console.error('Error updating review:', err);
      showActionMessage(err.message || 'Failed to update review', 'error');
    }
  };

  // Handle review deletion

  // Handle review deletion
  const handleDeleteReview = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Remove the review from local state
      setReviews(reviews.filter((review: Review) => review.id !== id));

      showActionMessage('Review deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting review:', err);
      showActionMessage(err.message || 'Failed to delete review', 'error');
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete event: ${errorData.error || response.statusText}`);
      }

      // Remove the event from local state
      setEvents(events.filter((event: Event) => event.id !== id));

      showActionMessage('Event deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      showActionMessage(err.message || 'Failed to delete event', 'error');
    }
  };

  // Handle testimonial video deletion
  const handleDeleteVideo = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this testimonial video? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/testimonial-videos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete video: ${errorData.error || response.statusText}`);
      }

      // Remove the video from local state
      setTestimonialVideos(testimonialVideos.filter((video: TestimonialVideo) => video.id !== id));

      showActionMessage('Testimonial video deleted successfully', 'success');
    } catch (err: any) {
      console.error('Error deleting video:', err);
      showActionMessage(err.message || 'Failed to delete video', 'error');
    }
  };

  // Handle input changes for forms
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewEvent({
      ...newEvent,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEventImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEventImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewVideo({
      ...newVideo,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleVideoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegulatoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewRegulatoryUpdate({
      ...newRegulatoryUpdate,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submissions
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (eventImage) {
        // Upload with file
        const formData = new FormData();
        formData.append('image', eventImage);
        formData.append('title', newEvent.title);
        formData.append('description', newEvent.description);
        formData.append('event_date', newEvent.event_date);
        formData.append('display_order', newEvent.display_order.toString());
        formData.append('is_active', newEvent.is_active.toString());
      
        const response = await fetch(`${API_BASE_URL}/admin/events/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to add event: ${errorData.error || response.statusText}`);
        }
      } else if (newEvent.image_url) {
        // Upload with URL
        const response = await fetch(`${API_BASE_URL}/admin/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newEvent)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to add event: ${errorData.error || response.statusText}`);
        }
      } else {
        throw new Error('Please provide an image file or URL');
      }

      // Reset form and close modal
      setNewEvent({
        title: '',
        description: '',
        image_url: '',
        event_date: '',
        display_order: 0,
        is_active: true
      });
      setEventImage(null);
      setEventImagePreview(null);
      setShowEventModal(false);

      // Refresh data
      fetchAllData();
      showActionMessage('Event added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding event:', err);
      showActionMessage(err.message || 'Failed to add event', 'error');
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (videoImage) {
        // Upload with file
        const formData = new FormData();
        formData.append('image', videoImage);
        formData.append('title', newVideo.title);
        formData.append('video_url', newVideo.video_url);
        formData.append('customer_name', newVideo.customer_name);
        formData.append('customer_location', newVideo.customer_location);
        formData.append('description', newVideo.description);
        formData.append('display_order', newVideo.display_order.toString());
        formData.append('is_active', newVideo.is_active.toString());
      
        const response = await fetch(`${API_BASE_URL}/admin/testimonial-videos/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to add video: ${errorData.error || response.statusText}`);
        }
      } else {
        // Upload with existing data
        const response = await fetch(`${API_BASE_URL}/admin/testimonial-videos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newVideo)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to add video: ${errorData.error || response.statusText}`);
        }
      }

      // Reset form and close modal
      setNewVideo({
        title: '',
        video_url: '',
        customer_name: '',
        customer_location: '',
        description: '',
        display_order: 0,
        is_active: true
      });
      setVideoImage(null);
      setVideoImagePreview(null);
      setShowVideoModal(false);

      // Refresh data
      fetchAllData();
      showActionMessage('Video added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding video:', err);
      showActionMessage(err.message || 'Failed to add video', 'error');
    }
  };

  const handleAddRegulatoryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/admin/regulatory-updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRegulatoryUpdate)
      });

      if (!response.ok) {
        throw new Error('Failed to add regulatory update');
      }
      
      // Reset form and close modal
      setNewRegulatoryUpdate({
        title: '',
        content: '',
        category: 'RBI',
        display_order: 0,
        is_active: true
      });
      setShowRegulatoryModal(false);

      // Refresh data
      fetchAllData();
      showActionMessage('Regulatory update added successfully', 'success');
    } catch (err: any) {
      console.error('Error adding regulatory update:', err);
      showActionMessage(err.message || 'Failed to add regulatory update', 'error');
    }
  };

  // Navigation items
  const navigationItems = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { 
    id: 'content', 
    label: 'Content Management', 
    items: [
      { id: 'blogs', label: 'Blogs', icon: Newspaper },   // ✅ NEW
      { id: 'regulatory', label: 'Regulatory Updates', icon: BookOpen, count: regulatoryUpdates.length },
      { id: 'events', label: 'Events', icon: Calendar, count: events.length },
      { id: 'videos', label: 'Testimonial Videos', icon: Video, count: testimonialVideos.length }
    ]
  },

    { 
      id: 'users', 
      label: 'User Management', 
      items: [
        { id: 'users-list', label: 'Users', icon: Users, count: users.length },
        { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length }
      ]
    },
    { 
      id: 'loans', 
      label: 'Loan Management', 
      items: [
        { id: 'applications', label: 'Applications', icon: FileText, count: loanApplications.length },
        { id: 'referrals', label: 'Referrals', icon: TrendingUp, count: referrals.length },
        { id: 'eligibility', label: 'Eligibility Submissions', icon: Calculator, count: eligibilitySubmissions.length }
      ]
    }
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Action Status Message */}
      {actionStatus && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          actionStatus.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {actionStatus.message}
        </div>
      )}
      {/* Create Blog Modal */}
{showBlogModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create Blog</h3>
          <button onClick={() => setShowBlogModal(false)}>
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleAddBlog} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blog Title *
            </label>
            <input
              type="text"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={newBlog.description}
              onChange={(e) =>
                setNewBlog({ ...newBlog, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail Image
            </label>
            <input type="file" accept="image/*" onChange={handleBlogImageChange} />
            {blogImagePreview && (
              <img
                src={blogImagePreview}
                alt="Preview"
                className="mt-2 h-24 rounded-md object-cover"
              />
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blog Content *
            </label>
       <textarea
  value={newBlog.content}
  onChange={(e) =>
    setNewBlog({ ...newBlog, content: e.target.value })
  }
  rows={12}
  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Write blog content here..."
  required
/>


          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newBlog.is_published}
              onChange={(e) =>
                setNewBlog({ ...newBlog, is_published: e.target.checked })
              }
            />
            <span className="text-sm text-gray-700">Publish immediately</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowBlogModal(false)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Blog
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Event</h3>
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddEvent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newEvent.title}
                      onChange={handleEventInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={newEvent.description}
                      onChange={handleEventInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <input
                      type="date"
                      name="event_date"
                      value={newEvent.event_date}
                      onChange={handleEventInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEventImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {eventImagePreview && (
                      <div className="mt-2">
                        <img src={eventImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional if uploading file)</label>
                    <input
                      type="text"
                      name="image_url"
                      value={newEvent.image_url}
                      onChange={handleEventInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!!eventImage}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      name="display_order"
                      value={newEvent.display_order}
                      onChange={handleEventInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={newEvent.is_active}
                      onChange={handleEventInputChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Testimonial Video</h3>
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddVideo}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newVideo.title}
                      onChange={handleVideoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL *</label>
                    <input
                      type="url"
                      name="video_url"
                      value={newVideo.video_url}
                      onChange={handleVideoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={newVideo.customer_name}
                      onChange={handleVideoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Location</label>
                    <input
                      type="text"
                      name="customer_location"
                      value={newVideo.customer_location}
                      onChange={handleVideoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVideoImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {videoImagePreview && (
                      <div className="mt-2">
                        <img src={videoImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={newVideo.description}
                      onChange={handleVideoInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      name="display_order"
                      value={newVideo.display_order}
                      onChange={handleVideoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={newVideo.is_active}
                      onChange={handleVideoInputChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Regulatory Update Modal */}
      {showRegulatoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Add New Regulatory Update</h3>
                <button 
                  onClick={() => setShowRegulatoryModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddRegulatoryUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newRegulatoryUpdate.title}
                      onChange={handleRegulatoryInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category"
                      value={newRegulatoryUpdate.category}
                      onChange={(e) => setNewRegulatoryUpdate({...newRegulatoryUpdate, category: e.target.value as 'RBI' | 'GST'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="RBI">RBI</option>
                      <option value="GST">GST</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <textarea
                      name="content"
                      value={newRegulatoryUpdate.content}
                      onChange={handleRegulatoryInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      name="display_order"
                      value={newRegulatoryUpdate.display_order}
                      onChange={handleRegulatoryInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={newRegulatoryUpdate.is_active}
                      onChange={handleRegulatoryInputChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRegulatoryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="ml-2 text-lg font-bold text-gray-800">NSV Admin</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigationItems.map((section) => (
              <div key={section.id}>
                {section.items ? (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.label}
                    </div>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                        {item.count !== undefined && (
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <button
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === section.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="mr-3 h-5 w-5" />
                    {section.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <Bell className="h-6 w-6" />
              </button>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <Settings className="h-6 w-6" />
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 p-2"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Overview Dashboard */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Applications</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Website Clicks</p>
                          <p className="text-2xl font-bold text-gray-900">{stats?.totalClicks || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
{/* Blogs */}
{activeTab === 'blogs' && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>

      <button
  onClick={() => setShowBlogModal(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
>
  <Plus className="h-4 w-4 mr-2" />
  Add Blog
</button>

    </div>

    <Card>
      <CardContent>
        <p className="text-gray-500">
          Blog management UI coming next (create / edit / delete).
        </p>
      </CardContent>
    </Card>
  </div>
)}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Users</CardTitle>
                      <CardDescription>Latest user registrations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {users.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">{formatDate(user.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Applications</CardTitle>
                      <CardDescription>Latest loan applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {loanApplications.slice(0, 5).map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{application.user_name}</p>
                              <p className="text-sm text-gray-500">{application.service_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{formatCurrency(application.amount)}</p>
                              <p className="text-sm text-gray-500">{formatDate(application.submitted_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Users List */}
            {activeTab === 'users-list' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 mr-3">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loan Applications */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {loanApplications.map((application) => (
                            <tr key={application.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{application.user_name}</div>
                                <div className="text-sm text-gray-500">{application.user_email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.service_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(application.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  application.status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : application.status === 'rejected' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {application.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(application.submitted_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => handleUpdateLoanApplicationStatus(application.id, 'pending')}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                  disabled={application.status === 'pending'}
                                >
                                  Pending
                                </button>
                                <button 
                                  onClick={() => handleUpdateLoanApplicationStatus(application.id, 'approved')}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                  disabled={application.status === 'approved'}
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleUpdateLoanApplicationStatus(application.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900 mr-3"
                                  disabled={application.status === 'rejected'}
                                >
                                  Reject
                                </button>
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLoanApplication(application.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Referrals */}
            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
                  <button 
                    onClick={fetchAllData}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {referrals.map((referral) => (
                            <tr key={referral.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{referral.referrer_name}</div>
                                <div className="text-sm text-gray-500">{referral.referrer_email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{referral.referred_name}</div>
                                <div className="text-sm text-gray-500">{referral.referred_email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  referral.status === 'accepted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : referral.status === 'rejected' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {referral.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(referral.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => handleUpdateReferralStatus(referral.id, 'pending')}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                  disabled={referral.status === 'pending'}
                                >
                                  Pending
                                </button>
                                <button 
                                  onClick={() => handleUpdateReferralStatus(referral.id, 'accepted')}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                  disabled={referral.status === 'accepted'}
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleUpdateReferralStatus(referral.id, 'rejected')}
                                  className="text-red-600 hover:text-red-900 mr-3"
                                  disabled={referral.status === 'rejected'}
                                >
                                  Reject
                                </button>
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteReferral(referral.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
                  <button 
                    onClick={fetchAllData}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                
                <Card>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No reviews found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className={`bg-white rounded-lg shadow-md p-6 ${review.status !== 'verified' ? 'border-l-4 border-yellow-400' : ''}`}>
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{review.name}</h3>
                                <p className="text-sm text-gray-600">{review.email}</p>
                                {review.phone && <p className="text-sm text-gray-600">{review.phone}</p>}
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Rating:</span>
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="text-gray-700">{review.review_text}</p>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-medium">Status:</span> 
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                    review.status === 'verified' ? 'bg-green-100 text-green-800' :
                                    review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {review.status}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Submitted:</span> {formatDate(review.created_at)}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t flex justify-end space-x-3">
                              {review.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => handleReviewApproval(review.id, true)}
                                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                  >
                                    <Check className="w-4 h-4 mr-1" /> Approve
                                  </button>
                                  <button 
                                    onClick={() => handleReviewApproval(review.id, false)}
                                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                  >
                                    <XIcon className="w-4 h-4 mr-1" /> Reject
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleDeleteReview(review.id)}
                                className="flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Regulatory Updates */}
            {activeTab === 'regulatory' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Regulatory Updates</h1>
                  <button 
                    onClick={() => setShowRegulatoryModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Update
                  </button>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {regulatoryUpdates.map((update) => (
                            <tr key={update.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{update.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-2">{update.content}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  update.category === 'RBI' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {update.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  update.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {update.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {update.display_order}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteRegulatoryUpdate(update.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Events */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Events</h1>
                  <button 
                    onClick={() => setShowEventModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </button>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {events.map((event) => (
                            <tr key={event.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {event.image_url ? (
                                      <img className="h-10 w-10 rounded-md object-cover" src={event.image_url} alt={event.title} />
                                    ) : (
                                      <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                    <div className="text-sm text-gray-500 line-clamp-2">{event.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(event.event_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  event.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {event.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {event.display_order}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Testimonial Videos */}
            {activeTab === 'videos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Testimonial Videos</h1>
                  <button 
                    onClick={() => setShowVideoModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </button>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {testimonialVideos.map((video) => (
                        <div key={video.id} className="border rounded-lg overflow-hidden">
                          <div className="aspect-video bg-gray-200 relative">
                            {video.image_url ? (
                              <img 
                                src={video.image_url} 
                                alt={video.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : video.video_url ? (
                              <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-20">
                                <Video className="h-12 w-12 text-white" />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium text-gray-900">{video.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{video.customer_name}, {video.customer_location}</p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{video.description}</p>
                            <div className="flex items-center justify-between mt-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                video.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {video.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Eligibility Submissions */}
            {activeTab === 'eligibility' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Eligibility Submissions</h1>
                  <button 
                    onClick={fetchAllData}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                
                <Card>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary & EMI</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eligibilitySubmissions.map((submission) => (
                            <tr key={submission.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                                <div className="text-sm text-gray-500">Age: {submission.age}, {submission.employment_type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{submission.email}</div>
                                <div className="text-sm text-gray-500">{submission.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">₹{submission.monthly_salary.toLocaleString()}/month</div>
                                <div className="text-sm text-gray-500">Existing EMI: ₹{submission.existing_emi.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-green-600">₹{Math.round(submission.eligible_loan_amount).toLocaleString()}</div>
                                <div className="text-sm text-gray-500">EMI: ₹{Math.round(submission.affordable_emi).toLocaleString()}</div>
                                <div className="text-sm text-gray-500">{submission.desired_tenure_years} years @ {submission.interest_rate}%</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  submission.status === 'contacted' 
                                    ? 'bg-green-100 text-green-800' 
                                    : submission.status === 'reviewed' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(submission.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => handleUpdateEligibilityStatus(submission.id, 'pending')}
                                  className="text-yellow-600 hover:text-yellow-900 mr-3"
                                  disabled={submission.status === 'pending'}
                                >
                                  Pending
                                </button>
                                <button 
                                  onClick={() => handleUpdateEligibilityStatus(submission.id, 'reviewed')}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                  disabled={submission.status === 'reviewed'}
                                >
                                  Reviewed
                                </button>
                                <button 
                                  onClick={() => handleUpdateEligibilityStatus(submission.id, 'contacted')}
                                  className="text-green-600 hover:text-green-900 mr-3"
                                  disabled={submission.status === 'contacted'}
                                >
                                  Contacted
                                </button>
                                <button 
                                  onClick={() => handleDeleteEligibilitySubmission(submission.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardClean;
