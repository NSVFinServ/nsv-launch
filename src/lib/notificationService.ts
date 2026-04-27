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
// CONFIGURATION - HARDCODED
// ========================================

const NOTIFICATION_CONFIG = {
  // Backend proxy URL — calls /api/notify which forwards to n8n server-to-server
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL
    || 'https://nsvfinserv-api-h7nt.onrender.com/api',

  ENABLED: true,
  WEBSITE: 'www.nsvfinserv.com',
  TIMEOUT: 15000,
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
    return 'Unknown';
  }
}

/**
 * Send notification via backend proxy → n8n (avoids browser CORS)
 */
async function sendToWebhook(type: string, payload: NotificationPayload): Promise<boolean> {
  if (!NOTIFICATION_CONFIG.ENABLED) {
    console.log('📵 Notifications are disabled');
    return false;
  }

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 SENDING NOTIFICATION (via backend proxy)');
    console.log('📦 Type:', type);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NOTIFICATION_CONFIG.TIMEOUT);

    const response = await fetch(`${NOTIFICATION_CONFIG.API_BASE_URL}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (data.ok) {
      console.log('✅ SUCCESS! Notification sent via proxy');
    } else {
      console.warn('⚠️ Proxy responded but n8n may have failed:', data);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return !!data.ok;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ TIMEOUT! Backend proxy timed out');
    } else {
      console.error('❌ ERROR:', error.message);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    console.log('🔐 Processing LOGIN notification...');

    const ipAddress = await getUserIP();

    const payload: NotificationPayload = {
      userName: userData.name || userData.fullName || userData.username || 'Unknown User',
      userEmail: userData.email || 'N/A',
      userPhone: userData.phone || userData.mobile || userData.phoneNumber || 'N/A',
      userId: userData.id || userData.userId || userData._id || 'N/A',
      loginTime: new Date().toISOString(),
      loginTimeReadable: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ipAddress: ipAddress,
      website: NOTIFICATION_CONFIG.WEBSITE,
      notificationType: 'Login',
    };

    return await sendToWebhook('login', payload);
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
    console.log('💬 Processing EXPERT ADVICE notification...');

    const ipAddress = await getUserIP();

    const payload: NotificationPayload = {
      formType: 'Expert Advice',
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
      question: formData.question,
      category: formData.category || 'General',
      submissionTime: new Date().toISOString(),
      submissionTimeReadable: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ipAddress: ipAddress,
      website: NOTIFICATION_CONFIG.WEBSITE,
      notificationType: 'Expert Advice',
    };

    return await sendToWebhook('expert-advice', payload);
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
    console.log('💰 Processing LOAN APPLICATION notification...');

    const ipAddress = await getUserIP();

    const payload: NotificationPayload = {
      formType: 'Loan Application',
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
      loanType: formData.loanType,
      loanAmount: `₹${formData.loanAmount}`,
      purpose: formData.purpose || 'Not specified',
      employmentType: formData.employmentType || 'Not specified',
      monthlyIncome: formData.monthlyIncome || 'Not specified',
      city: formData.city || 'Not specified',
      aadhaar: formData.aadhaar || 'Not provided',
      pan: formData.pan || 'Not provided',
      submissionTime: new Date().toISOString(),
      submissionTimeReadable: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ipAddress: ipAddress,
      website: NOTIFICATION_CONFIG.WEBSITE,
      notificationType: 'Loan Application',
    };

    return await sendToWebhook('loan-application', payload);
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
  console.log(`🔔 Notifications ${enabled ? 'ENABLED ✅' : 'DISABLED ❌'}`);
}

/**
 * Get current notification status
 */
export function getNotificationStatus(): boolean {
  return NOTIFICATION_CONFIG.ENABLED;
}

/**
 * Test notification setup - Run this to verify URLs
 */
export function testNotificationSetup(): void {
  console.log('🔧 NOTIFICATION SETUP TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Base URL:', NOTIFICATION_CONFIG.N8N_BASE_URL);
  console.log('');
  console.log('Full Webhook URLs:');
  console.log('1. Login:', NOTIFICATION_CONFIG.N8N_BASE_URL + NOTIFICATION_CONFIG.WEBHOOKS.LOGIN);
  console.log('2. Expert:', NOTIFICATION_CONFIG.N8N_BASE_URL + NOTIFICATION_CONFIG.WEBHOOKS.EXPERT_ADVICE);
  console.log('3. Loan App:', NOTIFICATION_CONFIG.N8N_BASE_URL + NOTIFICATION_CONFIG.WEBHOOKS.LOAN_APPLICATION);
  console.log('');
  console.log('Status:', NOTIFICATION_CONFIG.ENABLED ? 'ENABLED ✅' : 'DISABLED ❌');
  console.log('Timeout:', NOTIFICATION_CONFIG.TIMEOUT + 'ms');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
  testNotificationSetup,
};
