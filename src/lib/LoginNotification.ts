// src/lib/loginNotification.ts

/**
 * NSV Finserv - Login Notification Service
 * Sends Telegram notifications via n8n when users log in
 */

interface UserData {
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

interface NotificationPayload {
  userName: string;
  userEmail: string;
  userPhone: string;
  userId: string;
  loginTime: string;
  ipAddress: string;
  website: string;
}

const NOTIFICATION_CONFIG = {
  WEBHOOK_URL: 'https://n8n-nsvfinserv.onrender.com/webhook/website-login-alert',
  ENABLED: true,
  WEBSITE: 'nsvfinserv.com',
  TIMEOUT: 5000,
};

/**
 * Send login notification to Telegram via n8n
 */
export async function sendLoginNotification(userData: UserData): Promise<boolean> {
  if (!NOTIFICATION_CONFIG.ENABLED) {
    console.log('📵 Login notifications are disabled');
    return false;
  }

  if (!userData) {
    console.error('❌ No user data provided for notification');
    return false;
  }

  try {
    console.log('📤 Sending login notification...', {
      user: userData.name || userData.email,
      time: new Date().toLocaleTimeString(),
    });

    // Get user's IP address
    const ipAddress = await getUserIP();

    // Prepare notification payload
    const payload: NotificationPayload = {
      userName: userData.name || userData.fullName || userData.username || 'Unknown User',
      userEmail: userData.email || 'N/A',
      userPhone: userData.phone || userData.mobile || userData.phoneNumber || '9885885847',
      userId: userData.id || userData.userId || userData._id || 'N/A',
      loginTime: new Date().toISOString(),
      ipAddress: ipAddress || 'Unknown',
      website: NOTIFICATION_CONFIG.WEBSITE,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NOTIFICATION_CONFIG.TIMEOUT);

    // Send to n8n webhook
    const response = await fetch(NOTIFICATION_CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Login notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send notification. Status:', response.status);
      return false;
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('⏱️ Notification timeout - n8n might be sleeping');
    } else {
      console.error('❌ Login notification error:', error.message);
    }
    return false;
  }
}

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
 * Toggle notifications on/off
 */
export function setNotificationsEnabled(enabled: boolean): void {
  NOTIFICATION_CONFIG.ENABLED = enabled;
  console.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
}

export default sendLoginNotification;
