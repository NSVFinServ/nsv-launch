// Analytics utility for tracking website clicks
export const trackClick = async (page: string, action: string) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await fetch('http://localhost:5000/api/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        action,
        user_id: user.id || null
      }),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track page views
export const trackPageView = (page: string) => {
  trackClick(page, 'page_view');
};

// Track button clicks
export const trackButtonClick = (page: string, buttonName: string) => {
  trackClick(page, `button_click_${buttonName}`);
};

// Track form submissions
export const trackFormSubmission = (page: string, formName: string) => {
  trackClick(page, `form_submit_${formName}`);
};
