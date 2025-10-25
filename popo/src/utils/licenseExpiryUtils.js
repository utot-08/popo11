// Utility functions for license expiry warnings

/**
 * Calculate the number of days remaining until expiry
 * @param {string} expiryDate - The expiry date in YYYY-MM-DD format
 * @returns {number} - Number of days remaining (negative if expired)
 */
export const calculateDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get expiry warning level based on days remaining
 * @param {string} expiryDate - The expiry date in YYYY-MM-DD format
 * @returns {object} - Warning level information
 */
export const getExpiryWarningLevel = (expiryDate) => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  
  if (daysRemaining === null) {
    return { level: 'none', message: 'No expiry date', daysRemaining: null };
  }

  if (daysRemaining < 0) {
    return { 
      level: 'expired', 
      message: 'License has expired', 
      daysRemaining,
      priority: 1
    };
  }

  if (daysRemaining === 0) {
    return { 
      level: 'critical', 
      message: 'License expires today!', 
      daysRemaining,
      priority: 1
    };
  }

  if (daysRemaining === 1) {
    return { 
      level: 'critical', 
      message: 'License expires tomorrow!', 
      daysRemaining,
      priority: 1
    };
  }

  if (daysRemaining <= 30) {
    return { 
      level: 'urgent', 
      message: `${daysRemaining} days remaining`, 
      daysRemaining,
      priority: 2
    };
  }

  if (daysRemaining <= 90) {
    return { 
      level: 'warning', 
      message: `${daysRemaining} days remaining`, 
      daysRemaining,
      priority: 3
    };
  }

  if (daysRemaining <= 180) {
    return { 
      level: 'notice', 
      message: `${daysRemaining} days remaining`, 
      daysRemaining,
      priority: 4
    };
  }

  return { 
    level: 'none', 
    message: `${daysRemaining} days remaining`, 
    daysRemaining,
    priority: 5
  };
};

/**
 * Check if a license should trigger a notification based on predefined thresholds
 * @param {string} expiryDate - The expiry date in YYYY-MM-DD format
 * @returns {object|null} - Notification info or null if no notification needed
 */
export const getExpiryNotification = (expiryDate) => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  
  if (daysRemaining === null) return null;

  // Check for specific notification thresholds
  if (daysRemaining <= 1 && daysRemaining >= 0) {
    return {
      type: 'critical',
      title: 'License Expires Soon!',
      message: daysRemaining === 0 ? 'Your firearm license expires today!' : 'Your firearm license expires tomorrow!',
      daysRemaining,
      priority: 1
    };
  }

  if (daysRemaining === 90) {
    return {
      type: 'warning',
      title: 'License Expiry Warning',
      message: 'Your firearm license expires in 3 months. Consider renewing soon.',
      daysRemaining,
      priority: 2
    };
  }

  if (daysRemaining === 180) {
    return {
      type: 'notice',
      title: 'License Renewal Reminder',
      message: 'Your firearm license expires in 6 months. You may want to start the renewal process.',
      daysRemaining,
      priority: 3
    };
  }

  return null;
};

/**
 * Get all notifications for a list of licenses
 * @param {Array} licenses - Array of license objects with expiry_date
 * @returns {Array} - Array of notification objects
 */
export const getLicenseNotifications = (licenses) => {
  if (!Array.isArray(licenses)) return [];

  const notifications = [];
  
  licenses.forEach((license) => {
    if (license.expiry_date) {
      const notification = getExpiryNotification(license.expiry_date);
      if (notification) {
        notifications.push({
          ...notification,
          license: {
            id: license.id,
            license_number: license.license_number,
            control_number: license.control_number,
            firearm_details: `${license.kind || ''} ${license.make || ''} ${license.model || ''}`.trim(),
            serial_number: license.serial_number,
            expiry_date: license.expiry_date
          }
        });
      }
    }
  });

  // Sort by priority (lower number = higher priority)
  return notifications.sort((a, b) => a.priority - b.priority);
};

