// src/lib/notificationService.ts
/**
 * NSV Finserv - Complete Notification Service
 * Handles Login, Expert Advice, and Loan Application notifications
 */

// ========================================
// TYPE DEFINITIONS
// ========================================

interface LoginData {
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  phoneNumber?: string;
  id?: string;
  userId?: string;
  _id?: string;
}

interface ExpertAdviceData {
  name: string;
  email: string;
  phone: string;
  question: string;
  category?: string;
}

interface LoanApplicationData {
  name: string;
  email: string;
  phone: string;
  loanType: string;
  loanAmount: string;
  purpose?: string;
  employmentType?: string;
  monthlyIncome?: string;
  city?: string;
  aadhaar?: string;
  pan?: string;
}

interface NotificationPayload {
  [key: string]: any;
}

// ========================================
// CONFIGURATION
// ========================================

const NOTIFICATION_CONFIG = {
  N8N_BASE_URL: 'https://n8n-nsvfinserv.onrender.com',
  WEBHOOKS: {
    LOGIN: 'website-login-alert',
    EXPERT_ADVICE: 'expert-advice-form',
    LOAN_APPLICATION: 'loan-application-form',
  },
  ENABLED: true,
  WEBSITE: 'nsvfinserv.com',
  TIMEOUT: 5000,
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get user's public IP address
 */
async function getUserIP(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    return data.ip;
  } catch (error: any) {
    console.log('Could not fetch IP address:', error.message);
    return 'Browser';
  }
}

/**
 * Send notification to n8n webhook
 */
async function sendToWebhook(endpoint: string, payload: NotificationPayload): Promise<boolean> {
  if (!NOTIFICATION_CONFIG.ENABLED) {
    console.log('📵 Notifications are disabled');
    return false;
  }

  const url = `${NOTIFICATION_CONFIG.N8N_BASE_URL}/${endpoint}`;

  try {
    console.log(`📤 Sending notification to: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NOTIFICATION_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Notification sent successfully');
      return true;
    } else {
      console.error(`❌ Failed to send notification. Status: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Notification timeout - n8n might be sleeping');
    } else {
      console.error('❌ Notification error:', error.message);
    }
    return false;
  }
}

// ========================================
// 1. LOGIN NOTIFICATION
// ========================================

/**
 * Send login notification to Telegram via n8n
 */
export async function sendLoginNotification(userData: LoginData): Promise<boolean> {
  if (!userData) {
    console.error('❌ No user data provided for notification');
    return false;
  }

  try {
    console.log('📤 Sending login notification...', {
      user: userData.name || userData.email,
      time: new Date().toLocaleTimeString(),
    });

    const ipAddress = await getUserIP();

    const payload: NotificationPayload = {
      userName: userData.name || userData.fullName || userData.username || 'Unknown User',
      userEmail: userData.email || 'N/A',
      userPhone: userData.phone || userData.mobile || userData.phoneNumber || 'N/A',
      userId: userData.id || userData.userId || userData._id || 'N/A',
      loginTime: new Date().toISOString(),
      ipAddress: ipAddress || 'Unknown',
      website: NOTIFICATION_CONFIG.WEBSITE,
    };

    return await sendToWebhook(NOTIFICATION_CONFIG.WEBHOOKS.LOGIN, payload);
  } catch (error: any) {
    console.error('❌ Login notification error:', error.message);
    return false;
  }
}

// ========================================
// 2. EXPERT ADVICE NOTIFICATION
// ========================================

/**
 * Send expert advice form notification to Telegram via n8n
 */
export async function sendExpertAdviceNotification(formData: ExpertAdviceData): Promise<boolean> {
  if (!formData) {
    console.error('❌ No form data provided for notification');
    return false;
  }

  try {
    console.log('📤 Sending Expert Advice notification...', {
      user: formData.name,
      time: new Date().toLocaleTimeString(),
    });

    const ipAddress = await getUserIP();

    const payload: NotificationPayload = {
      formType: 'Expert Advice',
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
      question: formData.question,
      category: formData.category || 'General',
      submissionTime: new Date().toISOString(),
      ipAddress: ipAddress || 'Unknown',
      website: NOTIFICATION_CONFIG.WEBSITE,
    };

    return await sendToWebhook(NOTIFICATION_CONFIG.WEBHOOKS.EXPERT_ADVICE, payload);
  } catch (error: any) {
    console.error('❌ Expert Advice notification error:', error.message);
    return false;
  }
}

// ========================================
// 3. LOAN APPLICATION NOTIFICATION
// ========================================

/**
 * Send loan application notification to Telegram via n8n
 */
export async function sendLoanApplicationNotification(formData: LoanApplicationData): Promise<boolean> {
  if (!formData) {
    console.error('❌ No form data provided for notification');
    return false;
  }

  try {
    console.log('📤 Sending Loan Application notification...', {
      user: formData.name,
      loanType: formData.loanType,
      amount: formData.loanAmount,
      time: new Date().toLocaleTimeString(),
    });

    const ipAddress = await getUserIP();

    const payload: NotificationPayload = {
      formType: 'Loan Application',
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
      loanType: formData.loanType,
      loanAmount: formData.loanAmount,
      purpose: formData.purpose || 'Not specified',
      employmentType: formData.employmentType || 'Not specified',
      monthlyIncome: formData.monthlyIncome || 'Not specified',
      city: formData.city || 'Not specified',
      submissionTime: new Date().toISOString(),
      ipAddress: ipAddress || 'Unknown',
      website: NOTIFICATION_CONFIG.WEBSITE,
    };

    return await sendToWebhook(NOTIFICATION_CONFIG.WEBHOOKS.LOAN_APPLICATION, payload);
  } catch (error: any) {
    console.error('❌ Loan Application notification error:', error.message);
    return false;
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Toggle all notifications on/off
 */
export function setNotificationsEnabled(enabled: boolean): void {
  NOTIFICATION_CONFIG.ENABLED = enabled;
  console.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Get current notification status
 */
export function getNotificationStatus(): boolean {
  return NOTIFICATION_CONFIG.ENABLED;
}

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
  sendLoginNotification,
  sendExpertAdviceNotification,
  sendLoanApplicationNotification,
  setNotificationsEnabled,
  getNotificationStatus,
};
