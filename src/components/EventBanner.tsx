import React, { useState, useEffect } from "react";
import "./EventBanner.css";
import { eventsAPI } from '../lib/api.ts';  // Import the new API service

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

const EventBanner: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventsAPI.getAll();
        setEvents(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Auto slide every 5s
  useEffect(() => {
    if (events.length > 1) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, events.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  if (loading) {
    return (
      <section className="event-banner">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recent Events</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

  if (error || events.length === 0) {
    return (
      <section className="event-banner">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recent Events</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">{error || 'No events available at the moment.'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="event-banner">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recent Events</h1>
      <div className="event-slider">
        {events.length > 1 && (
          <button className="arrow left" onClick={prevSlide}>
            &#10094;
          </button>
        )}

        <div className="slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {events.map((event, i) => (
            <div className="slide" key={event.id}>
              <img 
                src={event.image_url} 
                alt={event.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/src/components/images/event1.jpg'; // Fallback image
                }}
              />
              <div className="slide-overlay">
                <h3 className="slide-title">{event.title}</h3>
                {event.description && (
                  <p className="slide-description">{event.description}</p>
                )}
                {event.event_date && (
                  <p className="slide-date">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {events.length > 1 && (
          <button className="arrow right" onClick={nextSlide}>
            &#10095;
          </button>
        )}
      </div>

      {/* Pagination Dots */}
      {events.length > 1 && (
        <div className="dots">
          {events.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
            ></span>
          ))}
        </div>
      )}
    </section>
  );
};

export default EventBanner;
