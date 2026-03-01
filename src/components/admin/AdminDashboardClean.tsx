import React, { useEffect, useMemo, useState, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import Quill from "quill";
import QuillBetterTable from "quill-better-table";
import "quill-better-table/dist/quill-better-table.css";

import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  Calculator,
  FileText,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";
import { Edit } from "lucide-react";

/* --------------------------------------------------------------------------------
   Quill plugin registration (MUST be at module scope, runs once)
--------------------------------------------------------------------------------- */

// Register QuillBetterTable once
Quill.register({ "modules/better-table": QuillBetterTable }, true);

// Optional: Soft line break (<br>) blot – register once, guard for HMR
const Embed = Quill.import("blots/embed");
class BreakBlot extends Embed {
  static blotName = "break";
  static tagName = "BR";
}
if (!(Quill as any).__break_registered) {
  Quill.register(BreakBlot, true);
  (Quill as any).__break_registered = true;
}

// Blog-thumbnail URL normalizer (STRICTLY for blog images).
// Supports absolute URLs (e.g., Cloudinary) or relative paths (/uploads/..).
const resolveBlogThumbnailUrl = (url?: string | null) => {
  if (!url) return "";
  const s = String(url);
  if (/^https?:\/\//i.test(s)) return s;
  const p = s.startsWith("/") ? s : `/${s}`;
  return `${API_BASE_URL}${p}`;
};

type ActionType = "success" | "error";

interface DashboardStats {
  totalUsers: number;
  totalReferrals: number;
  totalApplications: number;
  recentUsers: number;
  recentApplications: number;
  totalClicks: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface Referral {
  id: number;
  referrer_name?: string;
  referrer_email?: string;
  referrer_phone?: string;
  referred_name?: string;
  referred_email?: string;
  referred_phone?: string;
  status?: string;
  created_at: string;
}

interface LoanApplication {
  id: number;
  user_name?: string;
  user_email?: string;
  service_name?: string;
  amount?: number;
  status?: string;
  submitted_at?: string;
}

interface Review {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  rating?: number;
  review_text?: string;
  status?: string;
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
  image_url?: string | null;
}

interface EventItem {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  event_date: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface RegulatoryUpdate {
  id: number;
  title: string;
  content: string;
  category: "RBI" | "GST";
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface EligibilitySubmission {
  id: number;
  name: string;
  phone: string;
  email?: string;
  monthly_salary: number;
  existing_emi: number;
  age: number;
  employment_type: string;
  interest_rate: number;
  desired_tenure_years: number;
  eligible_loan_amount: number;
  affordable_emi: number;
  status?: string;
  created_at: string;
}

interface Blog {
  id: number;
  title: string;
  slug: string;
  description: string;
  content?: string;
  author?: string | null;
  category?: string | null;
  thumbnail?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
  is_published: boolean;
  created_at: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * IMPORTANT:
 * - quill-better-table does NOT expose a "table" format button by default.
 * - DO NOT include ["table"] in toolbar or "table" in formats, or Quill will warn and may crash.
 * - We'll add a custom "Insert Table" button ourselves and call better-table API.
 */
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
  "better-table": {
    operationMenu: {
      items: {
        unmergeCells: { text: "Unmerge cells" },
      },
    },
  },
  keyboard: {
    bindings: (QuillBetterTable as any).keyboardBindings,
  },
};

const quillFormats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "header",
  "align",
  "link",
  "image",
];

function fmtDate(dateString?: string) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtCurrencyINR(amount?: number) {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export default function AdminDashboardClean() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const quillRef = useRef<ReactQuill | null>(null);

  // layout
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "blogs"
    | "regulatory"
    | "events"
    | "videos"
    | "users-list"
    | "reviews"
    | "applications"
    | "referrals"
    | "eligibility"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // data
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [videos, setVideos] = useState<TestimonialVideo[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [regulatory, setRegulatory] = useState<RegulatoryUpdate[]>([]);
  const [eligibility, setEligibility] = useState<EligibilitySubmission[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // ui feedback
  const [actionStatus, setActionStatus] = useState<{ message: string; type: ActionType } | null>(null);

  // search
  const [search, setSearch] = useState("");

  // modals
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showRegulatoryModal, setShowRegulatoryModal] = useState(false);

  // blog form
  const [slugTouched, setSlugTouched] = useState(false);
  const [blogImage, setBlogImage] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const [newBlog, setNewBlog] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    author: "",
    id: null as number | null,
    category: "",
    thumbnail_alt: "",
    meta_title: "",
    meta_description: "",
    keywords: "",
    is_published: true,
  });

  // event form
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    display_order: 0,
    is_active: true,
  });

  // video form
  const [videoImage, setVideoImage] = useState<File | null>(null);
  const [videoImagePreview, setVideoImagePreview] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({
    title: "",
    video_url: "",
    customer_name: "",
    customer_location: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  // regulatory form
  const [newRegulatory, setNewRegulatory] = useState({
    title: "",
    content: "",
    category: "RBI" as "RBI" | "GST",
    display_order: 0,
    is_active: true,
  });

  const headersJson = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const headersAuthOnly = useMemo(() => {
    const h: Record<string, string> = {};
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const showActionMessage = (message: string, type: ActionType) => {
    setActionStatus({ message, type });
    window.setTimeout(() => setActionStatus(null), 3000);
  };

  const guardAuth = () => {
    if (!token) {
      showActionMessage("Authentication required. Please log in again.", "error");
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [
        statsRes,
        usersRes,
        referralsRes,
        applicationsRes,
        reviewsRes,
        videosRes,
        eventsRes,
        regulatoryRes,
        eligibilityRes,
        blogsRes,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard-stats`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/users`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/referrals`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/loan-applications`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/admin/reviews`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/admin/testimonial-videos`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/admin/events`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/admin/regulatory-updates`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/admin/eligibility`, { headers: headersJson }),
        fetch(`${API_BASE_URL}/admin/blogs`, { headers: headersJson }),
      ]);

      if (!statsRes.ok) throw new Error("Failed to load dashboard stats");
      if (!usersRes.ok) throw new Error("Failed to load users");
      if (!referralsRes.ok) throw new Error("Failed to load referrals");
      if (!applicationsRes.ok) throw new Error("Failed to load loan applications");
      if (!reviewsRes.ok) throw new Error("Failed to load reviews");
      if (!videosRes.ok) throw new Error("Failed to load testimonial videos");
      if (!eventsRes.ok) throw new Error("Failed to load events");
      if (!regulatoryRes.ok) throw new Error("Failed to load regulatory updates");
      if (!eligibilityRes.ok) throw new Error("Failed to load eligibility submissions");
      if (!blogsRes.ok) throw new Error("Failed to load blogs");

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setReferrals(await referralsRes.json());
      setLoanApplications(await applicationsRes.json());
      setReviews(await reviewsRes.json());
      setVideos(await videosRes.json());
      setEvents(await eventsRes.json());
      setRegulatory(await regulatoryRes.json());
      setEligibility(await eligibilityRes.json());
      setBlogs(await blogsRes.json());
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load data once
  useEffect(() => {
    if (!guardAuth()) return;
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add paste-cleaning matcher once per editor instance (when blog modal opens)
  useEffect(() => {
    if (!showBlogModal) return;

    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    if ((editor as any).__clean_paste_added) return;
    (editor as any).__clean_paste_added = true;

    editor.clipboard.addMatcher(Node.ELEMENT_NODE, (_node: any, delta: any) => {
      delta.ops = (delta.ops || []).map((op: any) => {
        if (op.attributes) {
          delete op.attributes.background;
          delete op.attributes.color;
          delete op.attributes.font;
          delete op.attributes.size;
        }
        return op;
      });
      return delta;
    });
  }, [showBlogModal]);

  // Custom Insert Table (3x3)
  const insertTable3x3 = () => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    try {
      const tableModule = editor.getModule("better-table");
      if (!tableModule || typeof tableModule.insertTable !== "function") {
        showActionMessage("Table module not available.", "error");
        return;
      }
      tableModule.insertTable(3, 3);
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to insert table.", "error");
    }
  };

  // ---------- handlers: blog ----------
  const handleBlogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBlogImage(file);
      const reader = new FileReader();
      reader.onload = () => setBlogImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetBlogModal = () => {
    setNewBlog({
      title: "",
      slug: "",
      description: "",
      content: "",
      author: "",
      id: null,
      category: "",
      thumbnail_alt: "",
      meta_title: "",
      meta_description: "",
      keywords: "",
      is_published: true,
    });
    setSlugTouched(false);
    setBlogImage(null);
    setBlogImagePreview(null);
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth()) return;

    try {
      if (!newBlog.title.trim()) return showActionMessage("Blog title is required.", "error");
      if (!newBlog.slug.trim()) return showActionMessage("Slug is required.", "error");
      if (!newBlog.content.trim()) return showActionMessage("Content is required.", "error");

      const formData = new FormData();
      formData.append("title", newBlog.title.trim());
      formData.append("slug", newBlog.slug.trim());
      formData.append("description", newBlog.description || "");
      formData.append("content", newBlog.content);
      formData.append("author", newBlog.author || "");
      formData.append("category", newBlog.category || "");
      formData.append("meta_title", (newBlog.meta_title || "").trim() || newBlog.title.trim());
      formData.append("meta_description", (newBlog.meta_description || "").trim() || (newBlog.description || ""));
      formData.append("keywords", newBlog.keywords || "");
      formData.append("is_published", newBlog.is_published ? "1" : "0");
      formData.append("thumbnail_alt", newBlog.thumbnail_alt || "");
      if (blogImage) formData.append("thumbnail", blogImage);

      const res = await fetch(`${API_BASE_URL}/admin/blogs`, {
        method: "POST",
        headers: headersAuthOnly,
        body: formData,
      });

      if (!res.ok) {
        const msg = await safeJson(res);
        console.error(msg);
        throw new Error(typeof msg === "string" ? msg : "Failed to create blog");
      }

      showActionMessage("Blog created successfully.", "success");
      setShowBlogModal(false);
      resetBlogModal();
      fetchAllData();
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to create blog.", "error");
    }
  };

  const openEditBlog = (b: Blog) => {
    setNewBlog({
      id: b.id,
      title: b.title || "",
      slug: b.slug || "",
      description: b.description || "",
      content: b.content || "",
      author: b.author || "",
      category: b.category || "",
      meta_title: b.meta_title || "",
      meta_description: b.meta_description || "",
      keywords: b.keywords || "",
      thumbnail_alt: (b as any).thumbnail_alt || "",
      is_published: !!b.is_published,
    });
    setBlogImagePreview(resolveBlogThumbnailUrl(b.thumbnail) || null);
    setBlogImage(null);
    setSlugTouched(true);
    setShowBlogModal(true);
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth()) return;
    if (!newBlog.id) return showActionMessage("Missing blog id.", "error");

    try {
      if (!newBlog.title.trim()) return showActionMessage("Blog title is required.", "error");
      if (!newBlog.slug.trim()) return showActionMessage("Slug is required.", "error");
      if (!newBlog.content.trim()) return showActionMessage("Content is required.", "error");

      const formData = new FormData();
      formData.append("title", newBlog.title.trim());
      formData.append("slug", newBlog.slug.trim());
      formData.append("description", newBlog.description || "");
      formData.append("content", newBlog.content);
      formData.append("author", newBlog.author || "");
      formData.append("category", newBlog.category || "");
      formData.append("meta_title", (newBlog.meta_title || "").trim() || newBlog.title.trim());
      formData.append("meta_description", (newBlog.meta_description || "").trim() || (newBlog.description || ""));
      formData.append("keywords", newBlog.keywords || "");
      formData.append("is_published", newBlog.is_published ? "1" : "0");
      formData.append("thumbnail_alt", newBlog.thumbnail_alt || "");
      if (blogImage) formData.append("thumbnail", blogImage);

      const res = await fetch(`${API_BASE_URL}/admin/blogs/${newBlog.id}`, {
        method: "PUT",
        headers: headersAuthOnly,
        body: formData,
      });

      if (!res.ok) {
        const msg = await safeJson(res);
        console.error(msg);
        throw new Error(typeof msg === "string" ? msg : "Failed to update blog");
      }

      showActionMessage("Blog updated successfully.", "success");
      setShowBlogModal(false);
      resetBlogModal();
      fetchAllData();
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to update blog.", "error");
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!guardAuth()) return;
    if (!window.confirm("Delete this blog?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}`, {
        method: "DELETE",
        headers: headersAuthOnly,
      });
      if (!res.ok) throw new Error("Delete failed");
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      showActionMessage("Blog deleted.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to delete blog.", "error");
    }
  };

  // ---------- handlers: reviews ----------
  const handleApproveReview = async (id: number) => {
    if (!guardAuth()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/approve`, {
        method: "PATCH",
        headers: headersJson,
        body: JSON.stringify({ is_approved: true }),
      });
      if (!res.ok) throw new Error("Approve failed");
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_approved: true, status: "approved" } : r))
      );
      showActionMessage("Review approved.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to approve review.", "error");
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!guardAuth()) return;
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
        method: "DELETE",
        headers: headersAuthOnly,
      });
      if (!res.ok) throw new Error("Delete failed");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showActionMessage("Review deleted.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to delete review.", "error");
    }
  };

  // ---------- handlers: events ----------
  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEventImage(file);
      const reader = new FileReader();
      reader.onload = () => setEventImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetEventModal = () => {
    setNewEvent({
      title: "",
      description: "",
      event_date: "",
      display_order: 0,
      is_active: true,
    });
    setEventImage(null);
    setEventImagePreview(null);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth()) return;

    try {
      if (!newEvent.title.trim()) return showActionMessage("Event title is required.", "error");
      if (!newEvent.event_date.trim()) return showActionMessage("Event date is required.", "error");

      const formData = new FormData();
      formData.append("title", newEvent.title.trim());
      formData.append("description", newEvent.description || "");
      formData.append("event_date", newEvent.event_date);
      formData.append("display_order", String(newEvent.display_order || 0));
      formData.append("is_active", newEvent.is_active ? "1" : "0");
      if (eventImage) formData.append("image", eventImage);

      const res = await fetch(`${API_BASE_URL}/admin/events`, {
        method: "POST",
        headers: headersAuthOnly,
        body: formData,
      });

      if (!res.ok) {
        const msg = await safeJson(res);
        console.error(msg);
        throw new Error("Failed to create event");
      }

      showActionMessage("Event created.", "success");
      setShowEventModal(false);
      resetEventModal();
      fetchAllData();
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to create event.", "error");
    }
  };

  const toggleEvent = async (id: number, is_active: boolean) => {
    if (!guardAuth()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/${id}/toggle`, {
        method: "PATCH",
        headers: headersJson,
        body: JSON.stringify({ is_active: !is_active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, is_active: !is_active } : ev)));
      showActionMessage("Event updated.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to update event.", "error");
    }
  };

  const deleteEvent = async (id: number) => {
    if (!guardAuth()) return;
    if (!window.confirm("Delete this event?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, {
        method: "DELETE",
        headers: headersAuthOnly,
      });
      if (!res.ok) throw new Error("Delete failed");
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      showActionMessage("Event deleted.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to delete event.", "error");
    }
  };

  // ---------- handlers: videos ----------
  const handleVideoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoImage(file);
      const reader = new FileReader();
      reader.onload = () => setVideoImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetVideoModal = () => {
    setNewVideo({
      title: "",
      video_url: "",
      customer_name: "",
      customer_location: "",
      description: "",
      display_order: 0,
      is_active: true,
    });
    setVideoImage(null);
    setVideoImagePreview(null);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth()) return;

    try {
      if (!newVideo.title.trim()) return showActionMessage("Video title is required.", "error");
      if (!newVideo.video_url.trim()) return showActionMessage("Video URL is required.", "error");

      const formData = new FormData();
      formData.append("title", newVideo.title.trim());
      formData.append("video_url", newVideo.video_url.trim());
      formData.append("customer_name", newVideo.customer_name || "");
      formData.append("customer_location", newVideo.customer_location || "");
      formData.append("description", newVideo.description || "");
      formData.append("display_order", String(newVideo.display_order || 0));
      formData.append("is_active", newVideo.is_active ? "1" : "0");
      if (videoImage) formData.append("image", videoImage);

      const res = await fetch(`${API_BASE_URL}/admin/testimonial-videos`, {
        method: "POST",
        headers: headersAuthOnly,
        body: formData,
      });

      if (!res.ok) {
        const msg = await safeJson(res);
        console.error(msg);
        throw new Error("Failed to create video");
      }

      showActionMessage("Video created.", "success");
      setShowVideoModal(false);
      resetVideoModal();
      fetchAllData();
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to create video.", "error");
    }
  };

  const toggleVideo = async (id: number, is_active: boolean) => {
    if (!guardAuth()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/testimonial-videos/${id}/toggle`, {
        method: "PATCH",
        headers: headersJson,
        body: JSON.stringify({ is_active: !is_active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: !is_active } : v)));
      showActionMessage("Video updated.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to update video.", "error");
    }
  };

  const deleteVideo = async (id: number) => {
    if (!guardAuth()) return;
    if (!window.confirm("Delete this video?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/testimonial-videos/${id}`, {
        method: "DELETE",
        headers: headersAuthOnly,
      });
      if (!res.ok) throw new Error("Delete failed");
      setVideos((prev) => prev.filter((v) => v.id !== id));
      showActionMessage("Video deleted.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to delete video.", "error");
    }
  };

  // ---------- handlers: regulatory ----------
  const resetRegulatoryModal = () => {
    setNewRegulatory({
      title: "",
      content: "",
      category: "RBI",
      display_order: 0,
      is_active: true,
    });
  };

  const handleAddRegulatory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardAuth()) return;

    try {
      if (!newRegulatory.title.trim()) return showActionMessage("Title is required.", "error");
      if (!newRegulatory.content.trim()) return showActionMessage("Content is required.", "error");

      const res = await fetch(`${API_BASE_URL}/admin/regulatory-updates`, {
        method: "POST",
        headers: headersJson,
        body: JSON.stringify({
          ...newRegulatory,
          title: newRegulatory.title.trim(),
          content: newRegulatory.content.trim(),
        }),
      });

      if (!res.ok) {
        const msg = await safeJson(res);
        console.error(msg);
        throw new Error("Failed to create update");
      }

      showActionMessage("Regulatory update created.", "success");
      setShowRegulatoryModal(false);
      resetRegulatoryModal();
      fetchAllData();
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to create regulatory update.", "error");
    }
  };

  const toggleRegulatory = async (id: number, is_active: boolean) => {
    if (!guardAuth()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/regulatory-updates/${id}/toggle`, {
        method: "PATCH",
        headers: headersJson,
        body: JSON.stringify({ is_active: !is_active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      setRegulatory((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !is_active } : r)));
      showActionMessage("Regulatory update updated.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to update regulatory update.", "error");
    }
  };

  const deleteRegulatory = async (id: number) => {
    if (!guardAuth()) return;
    if (!window.confirm("Delete this update?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/regulatory-updates/${id}`, {
        method: "DELETE",
        headers: headersAuthOnly,
      });
      if (!res.ok) throw new Error("Delete failed");
      setRegulatory((prev) => prev.filter((r) => r.id !== id));
      showActionMessage("Regulatory update deleted.", "success");
    } catch (e) {
      console.error(e);
      showActionMessage("Failed to delete regulatory update.", "error");
    }
  };

  // ---------- logout ----------
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ---------- filtering ----------
  const filterText = search.trim().toLowerCase();

  const filteredBlogs = useMemo(() => {
    if (!filterText) return blogs;
    return blogs.filter((b) =>
      [b.title, b.slug, b.description, b.author || "", b.category || ""].some((x) =>
        String(x).toLowerCase().includes(filterText)
      )
    );
  }, [blogs, filterText]);

  const filteredUsers = useMemo(() => {
    if (!filterText) return users;
    return users.filter((u) =>
      [u.name, u.email, u.phone || ""].some((x) => String(x).toLowerCase().includes(filterText))
    );
  }, [users, filterText]);

  const filteredApplications = useMemo(() => {
    if (!filterText) return loanApplications;
    return loanApplications.filter((a) =>
      [a.user_name || "", a.user_email || "", a.service_name || "", a.status || ""].some((x) =>
        String(x).toLowerCase().includes(filterText)
      )
    );
  }, [loanApplications, filterText]);

  const filteredReferrals = useMemo(() => {
    if (!filterText) return referrals;
    return referrals.filter((r) =>
      [
        r.referrer_name || "",
        r.referrer_email || "",
        r.referred_name || "",
        r.referred_email || "",
        r.status || "",
      ].some((x) => String(x).toLowerCase().includes(filterText))
    );
  }, [referrals, filterText]);

  const filteredReviews = useMemo(() => {
    if (!filterText) return reviews;
    return reviews.filter((r) =>
      [r.name || "", r.email || "", r.review_text || "", r.status || ""].some((x) =>
        String(x).toLowerCase().includes(filterText)
      )
    );
  }, [reviews, filterText]);

  const filteredVideos = useMemo(() => {
    if (!filterText) return videos;
    return videos.filter((v) =>
      [v.title, v.customer_name, v.customer_location, v.description].some((x) =>
        String(x).toLowerCase().includes(filterText)
      )
    );
  }, [videos, filterText]);

  const filteredEvents = useMemo(() => {
    if (!filterText) return events;
    return events.filter((ev) =>
      [ev.title, ev.description].some((x) => String(x).toLowerCase().includes(filterText))
    );
  }, [events, filterText]);

  const filteredRegulatory = useMemo(() => {
    if (!filterText) return regulatory;
    return regulatory.filter((ru) =>
      [ru.title, ru.content, ru.category].some((x) => String(x).toLowerCase().includes(filterText))
    );
  }, [regulatory, filterText]);

  const filteredEligibility = useMemo(() => {
    if (!filterText) return eligibility;
    return eligibility.filter((el) =>
      [el.name, el.phone, el.email || "", el.employment_type, el.status || ""].some((x) =>
        String(x).toLowerCase().includes(filterText)
      )
    );
  }, [eligibility, filterText]);

  // ---------- UI blocks ----------
  const navigationItems = [
    { id: "overview" as const, label: "Dashboard", icon: BarChart3 },
    { divider: true, label: "Content Management" },
    { id: "blogs" as const, label: "Blogs", icon: Newspaper, count: blogs.length },
    { id: "regulatory" as const, label: "Regulatory Updates", icon: BookOpen, count: regulatory.length },
    { id: "events" as const, label: "Events", icon: Calendar, count: events.length },
    { id: "videos" as const, label: "Testimonial Videos", icon: Video, count: videos.length },
    { divider: true, label: "User Management" },
    { id: "users-list" as const, label: "Users", icon: Users, count: users.length },
    { id: "reviews" as const, label: "Reviews", icon: Star, count: reviews.length },
    { divider: true, label: "Loan Management" },
    { id: "applications" as const, label: "Applications", icon: FileText, count: loanApplications.length },
    { id: "referrals" as const, label: "Referrals", icon: TrendingUp, count: referrals.length },
    { id: "eligibility" as const, label: "Eligibility Submissions", icon: Calculator, count: eligibility.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* toast */}
      {actionStatus && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            actionStatus.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {actionStatus.message}
        </div>
      )}

      {/* BLOG MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{newBlog.id ? "Edit Blog" : "Create Blog"}</h3>
                <div className="flex items-center gap-2">
                  {/* Custom Insert Table button */}
                  <button
                    type="button"
                    onClick={insertTable3x3}
                    className="px-3 py-2 border rounded-md bg-gray-50 hover:bg-gray-100 text-sm"
                    title="Insert 3x3 table"
                  >
                    Insert Table
                  </button>
                  <button
                    onClick={() => {
                      setShowBlogModal(false);
                      resetBlogModal();
                    }}
                    className="p-2 rounded-md hover:bg-gray-100"
                    title="Close"
                    type="button"
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>

              <form onSubmit={newBlog.id ? handleUpdateBlog : handleAddBlog} className="space-y-4">
                {/* title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title *</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={newBlog.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewBlog((prev) => ({
                        ...prev,
                        title: v,
                        slug: slugTouched ? prev.slug : slugify(v),
                      }));
                    }}
                    required
                  />
                </div>

                {/* slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <div className="flex gap-2">
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newBlog.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setNewBlog((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder="e.g. how-to-improve-cibil-score"
                      required
                    />
                    <button
                      type="button"
                      className="px-3 py-2 border rounded-md bg-gray-50 hover:bg-gray-100"
                      onClick={() => {
                        setSlugTouched(false);
                        setNewBlog((prev) => ({ ...prev, slug: slugify(prev.title) }));
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* author/category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newBlog.author}
                      onChange={(e) => setNewBlog((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="NSV Finserv Team"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newBlog.category}
                      onChange={(e) => setNewBlog((prev) => ({ ...prev, category: e.target.value }))}
                      placeholder="Loans / CIBIL / Eligibility"
                    />
                  </div>
                </div>

                {/* description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                    value={newBlog.description}
                    onChange={(e) => setNewBlog((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                  <input type="file" accept="image/*" onChange={handleBlogImageChange} />
                  {blogImagePreview && (
                    <img
                      src={blogImagePreview}
                      alt={newBlog.thumbnail_alt || "Preview"}
                      className="mt-2 h-24 rounded-md object-cover"
                    />
                  )}

                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Alt Text</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newBlog.thumbnail_alt}
                      onChange={(e) => setNewBlog((prev) => ({ ...prev, thumbnail_alt: e.target.value }))}
                      placeholder="Short description for accessibility"
                    />
                  </div>
                </div>

                {/* content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blog Content *</label>
                  <div className="bg-white">
                    <ReactQuill
                      ref={quillRef}
                      value={newBlog.content}
                      onChange={(value) => setNewBlog((prev) => ({ ...prev, content: value }))}
                      modules={quillModules as any}
                      formats={quillFormats}
                      theme="snow"
                      className="rounded-md"
                    />
                  </div>
                </div>

                {/* seo */}
                <div className="border rounded-md p-4 bg-gray-50 space-y-3">
                  <div className="text-sm font-semibold text-gray-800">SEO Settings (optional)</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newBlog.meta_title}
                      onChange={(e) => setNewBlog((prev) => ({ ...prev, meta_title: e.target.value }))}
                      placeholder="Defaults to Blog Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows={2}
                      value={newBlog.meta_description}
                      onChange={(e) => setNewBlog((prev) => ({ ...prev, meta_description: e.target.value }))}
                      placeholder="Defaults to Short Description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newBlog.keywords}
                      onChange={(e) => setNewBlog((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="loan, emi, cibil"
                    />
                  </div>
                </div>

                {/* publish */}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newBlog.is_published}
                    onChange={(e) => setNewBlog((prev) => ({ ...prev, is_published: e.target.checked }))}
                  />
                  Publish immediately
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md"
                    onClick={() => {
                      setShowBlogModal(false);
                      resetBlogModal();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {newBlog.id ? "Update Blog" : "Create Blog"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Event</h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    resetEventModal();
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, event_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newEvent.display_order}
                      onChange={(e) => setNewEvent((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newEvent.is_active}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input type="file" accept="image/*" onChange={handleEventImageChange} />
                  {eventImagePreview && (
                    <img src={eventImagePreview} alt="Preview" className="mt-2 h-24 rounded-md object-cover" />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md"
                    onClick={() => {
                      setShowEventModal(false);
                      resetEventModal();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Testimonial Video</h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    resetVideoModal();
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={newVideo.video_url}
                    onChange={(e) => setNewVideo((prev) => ({ ...prev, video_url: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newVideo.customer_name}
                      onChange={(e) => setNewVideo((prev) => ({ ...prev, customer_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Location</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newVideo.customer_location}
                      onChange={(e) => setNewVideo((prev) => ({ ...prev, customer_location: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={newVideo.description}
                    onChange={(e) => setNewVideo((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newVideo.display_order}
                      onChange={(e) => setNewVideo((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
                    <input
                      type="checkbox"
                      checked={newVideo.is_active}
                      onChange={(e) => setNewVideo((prev) => ({ ...prev, is_active: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
                  <input type="file" accept="image/*" onChange={handleVideoImageChange} />
                  {videoImagePreview && (
                    <img src={videoImagePreview} alt="Preview" className="mt-2 h-24 rounded-md object-cover" />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md"
                    onClick={() => {
                      setShowVideoModal(false);
                      resetVideoModal();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Video
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REGULATORY MODAL */}
      {showRegulatoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Regulatory Update</h3>
                <button
                  onClick={() => {
                    setShowRegulatoryModal(false);
                    resetRegulatoryModal();
                  }}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleAddRegulatory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md"
                    value={newRegulatory.title}
                    onChange={(e) => setNewRegulatory((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={newRegulatory.category}
                      onChange={(e) =>
                        setNewRegulatory((prev) => ({ ...prev, category: e.target.value as "RBI" | "GST" }))
                      }
                    >
                      <option value="RBI">RBI</option>
                      <option value="GST">GST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      value={newRegulatory.display_order}
                      onChange={(e) => setNewRegulatory((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={newRegulatory.is_active}
                    onChange={(e) => setNewRegulatory((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Active
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={6}
                    value={newRegulatory.content}
                    onChange={(e) => setNewRegulatory((prev) => ({ ...prev, content: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md"
                    onClick={() => {
                      setShowRegulatoryModal(false);
                      resetRegulatoryModal();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-lg font-bold text-gray-900">NSV Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigationItems.map((item, idx) => {
              if ("divider" in item && (item as any).divider) {
                return (
                  <div
                    key={`div-${idx}`}
                    className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {(item as any).label}
                  </div>
                );
              }
              const Icon = (item as any).icon;
              const selected = activeTab === (item as any).id;
              return (
                <button
                  key={(item as any).id}
                  onClick={() => setActiveTab((item as any).id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    selected ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {(item as any).label}
                  {"count" in (item as any) && typeof (item as any).count === "number" && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {(item as any).count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 mr-3">
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search in current tab…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100" type="button">
                <Bell className="h-6 w-6" />
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100" type="button">
                <Settings className="h-6 w-6" />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 p-2"
                title="Logout"
                type="button"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* mobile search */}
          <div className="px-4 pb-3 md:hidden">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search in current tab…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                  <button onClick={fetchAllData} className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50" type="button">
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <div className="text-sm text-gray-500">Total Users</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalUsers ?? "-"}</div>
                    <div className="text-xs text-gray-500 mt-1">Recent: {stats?.recentUsers ?? "-"}</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <div className="text-sm text-gray-500">Loan Applications</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalApplications ?? "-"}</div>
                    <div className="text-xs text-gray-500 mt-1">Recent: {stats?.recentApplications ?? "-"}</div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border">
                    <div className="text-sm text-gray-500">Referrals</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{stats?.totalReferrals ?? "-"}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Clicks: {stats?.totalClicks ?? "-"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border p-5">
                    <div className="text-lg font-semibold text-gray-900 mb-3">Latest Blogs</div>
                    <div className="space-y-3">
                      {(blogs || []).slice(0, 5).map((b) => (
                        <div key={b.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{b.title}</div>
                            <div className="text-xs text-gray-500">
                              {b.slug} • {fmtDate(b.created_at)}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              b.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {b.is_published ? "Published" : "Draft"}
                          </span>
                        </div>
                      ))}
                      {blogs.length === 0 && <div className="text-sm text-gray-500">No blogs yet.</div>}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border p-5">
                    <div className="text-lg font-semibold text-gray-900 mb-3">Latest Applications</div>
                    <div className="space-y-3">
                      {(loanApplications || []).slice(0, 5).map((a) => (
                        <div key={a.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{a.user_name || "—"}</div>
                            <div className="text-xs text-gray-500">
                              {a.service_name || "—"} • {a.status || "—"} • {fmtDate(a.submitted_at)}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">{fmtCurrencyINR(a.amount)}</div>
                        </div>
                      ))}
                      {loanApplications.length === 0 && <div className="text-sm text-gray-500">No applications yet.</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* BLOGS */}
            {activeTab === "blogs" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Blogs</h2>
                  <button
                    onClick={() => setShowBlogModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Blog
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredBlogs.map((b) => (
                          <tr key={b.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                            <td className="px-4 py-3 text-gray-700">{b.slug}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  b.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {b.is_published ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(b.created_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditBlog(b)}
                                  className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 text-blue-600"
                                  title="Edit"
                                  type="button"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(b.id)}
                                  className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-red-600"
                                  title="Delete"
                                  type="button"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredBlogs.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>
                              No blogs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* REGULATORY */}
            {activeTab === "regulatory" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Regulatory Updates</h2>
                  <button
                    onClick={() => setShowRegulatoryModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Update
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredRegulatory.map((ru) => (
                          <tr key={ru.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{ru.title}</td>
                            <td className="px-4 py-3 text-gray-700">{ru.category}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  ru.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {ru.is_active ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(ru.created_at)}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => toggleRegulatory(ru.id, ru.is_active)}
                                className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                                type="button"
                              >
                                {ru.is_active ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => deleteRegulatory(ru.id)}
                                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-red-600"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredRegulatory.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>
                              No regulatory updates found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* EVENTS */}
            {activeTab === "events" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredEvents.map((ev) => (
                          <tr key={ev.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{ev.title}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(ev.event_date)}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  ev.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {ev.is_active ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(ev.created_at)}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => toggleEvent(ev.id, ev.is_active)}
                                className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                                type="button"
                              >
                                {ev.is_active ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => deleteEvent(ev.id)}
                                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-red-600"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredEvents.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>
                              No events found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* VIDEOS */}
            {activeTab === "videos" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Testimonial Videos</h2>
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredVideos.map((v) => (
                          <tr key={v.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{v.title}</td>
                            <td className="px-4 py-3 text-gray-700">
                              {v.customer_name} {v.customer_location ? `• ${v.customer_location}` : ""}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  v.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {v.is_active ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(v.created_at)}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => toggleVideo(v.id, v.is_active)}
                                className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                                type="button"
                              >
                                {v.is_active ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={() => deleteVideo(v.id)}
                                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-red-600"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredVideos.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>
                              No testimonial videos found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* USERS */}
            {activeTab === "users-list" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUsers.map((u) => (
                          <tr key={u.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                            <td className="px-4 py-3 text-gray-700">{u.email}</td>
                            <td className="px-4 py-3 text-gray-700">{u.phone || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(u.created_at)}</td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Text</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Approved</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredReviews.map((r) => (
                          <tr key={r.id}>
                            <td className="px-4 py-3 font-medium text-gray-900">{r.name || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{r.rating ?? "-"}</td>
                            <td className="px-4 py-3 text-gray-700 max-w-lg">
                              <div className="line-clamp-2">{r.review_text || "-"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  r.is_approved ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {r.is_approved ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(r.created_at)}</td>
                            <td className="px-4 py-3 text-right space-x-2">
                              {!r.is_approved && (
                                <button
                                  onClick={() => handleApproveReview(r.id)}
                                  className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                                  type="button"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteReview(r.id)}
                                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 text-red-600"
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredReviews.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>
                              No reviews found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* APPLICATIONS */}
            {activeTab === "applications" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Loan Applications</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredApplications.map((a) => (
                          <tr key={a.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{a.user_name || "-"}</div>
                              <div className="text-xs text-gray-500">{a.user_email || "-"}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{a.service_name || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtCurrencyINR(a.amount)}</td>
                            <td className="px-4 py-3 text-gray-700">{a.status || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(a.submitted_at)}</td>
                          </tr>
                        ))}
                        {filteredApplications.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>
                              No applications found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* REFERRALS */}
            {activeTab === "referrals" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Referrals</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Referrer</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Referred</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredReferrals.map((r) => (
                          <tr key={r.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{r.referrer_name || "-"}</div>
                              <div className="text-xs text-gray-500">{r.referrer_email || "-"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{r.referred_name || "-"}</div>
                              <div className="text-xs text-gray-500">{r.referred_email || "-"}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{r.status || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(r.created_at)}</td>
                          </tr>
                        ))}
                        {filteredReferrals.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>
                              No referrals found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ELIGIBILITY */}
            {activeTab === "eligibility" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Eligibility Submissions</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Salary</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Eligible</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredEligibility.map((el) => (
                          <tr key={el.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{el.name}</div>
                              <div className="text-xs text-gray-500">{el.employment_type}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{el.phone}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtCurrencyINR(el.monthly_salary)}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtCurrencyINR(el.eligible_loan_amount)}</td>
                            <td className="px-4 py-3 text-gray-700">{fmtDate(el.created_at)}</td>
                          </tr>
                        ))}
                        {filteredEligibility.length === 0 && (
                          <tr>
                            <td className="px-4 py-6 text-sm text-gray-500" colSpan={5}>
                              No eligibility submissions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
