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
  // ✅ Base URL - Your n8n instance on Render
  N8N_BASE_URL: 'https://n8n-nsvfinserv.onrender.com',
  
  // ✅ Full webhook paths (including /webhook/)
  WEBHOOKS: {
    LOGIN: '/webhook/website-login-alert',
    EXPERT_ADVICE: '/webhook/expert-advice-form',
    LOAN_APPLICATION: '/webhook/loan-application-form',
  },
  
  ENABLED: true,
  WEBSITE: 'www.nsvfinserv.com',
  TIMEOUT: 15000, // 15 seconds for Render cold starts
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
 * Send notification to n8n webhook
 */
async function sendToWebhook(endpoint: string, payload: NotificationPayload): Promise<boolean> {
  if (!NOTIFICATION_CONFIG.ENABLED) {
    console.log('📵 Notifications are disabled');
    return false;
  }

  // ✅ Construct full URL: base + endpoint
  const url = `${NOTIFICATION_CONFIG.N8N_BASE_URL}${endpoint}`;

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 SENDING NOTIFICATION');
    console.log('🌐 URL:', url);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      const responseData = await response.text();
      console.log('✅ SUCCESS! Notification sent');
      console.log('📥 Response:', responseData);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ FAILED! Status:', response.status);
      console.error('📥 Error Response:', errorText);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ TIMEOUT! n8n might be sleeping (Render cold start)');
      console.error('💡 Solution: Wait 30 seconds and try again');
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
