/**
 * Sitebango Analytics Tracking Script
 * 
 * Simple analytics tracker for client sites.
 * Include this script on your site to track pageviews, sessions, and conversions.
 * 
 * Usage:
 * <script src="https://yourdomain.com/analytics.js" data-site-id="YOUR_SITE_ID"></script>
 */

(function() {
  'use strict';

  // Configuration
  const TRACKING_ENDPOINT = '/api/analytics/track';
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const DEBOUNCE_DELAY = 1000; // 1 second

  // Get site ID from script tag
  const scriptTag = document.currentScript || document.querySelector('script[data-site-id]');
  const siteId = scriptTag?.getAttribute('data-site-id');

  if (!siteId) {
    console.error('Sitebango Analytics: No site ID provided. Add data-site-id to the script tag.');
    return;
  }

  // Analytics object
  const SitebangoAnalytics = {
    siteId: siteId,
    sessionId: null,
    sessionStart: null,
    lastActivity: null,
    pageLoadTime: performance.now(),
    hasTrackedPageview: false,

    // Initialize analytics
    init: function() {
      this.sessionId = this.getOrCreateSession();
      this.trackPageview();
      this.setupEventListeners();
      this.trackSession();
    },

    // Get or create session
    getOrCreateSession: function() {
      const stored = sessionStorage.getItem('sitebango_session');
      const now = Date.now();

      if (stored) {
        const session = JSON.parse(stored);
        
        // Check if session is still valid
        if (now - session.lastActivity < SESSION_TIMEOUT) {
          session.lastActivity = now;
          sessionStorage.setItem('sitebango_session', JSON.stringify(session));
          this.sessionStart = session.start;
          this.lastActivity = session.lastActivity;
          return session.id;
        }
      }

      // Create new session
      const newSession = {
        id: this.generateId(),
        start: now,
        lastActivity: now,
      };
      
      sessionStorage.setItem('sitebango_session', JSON.stringify(newSession));
      this.sessionStart = newSession.start;
      this.lastActivity = newSession.lastActivity;
      
      return newSession.id;
    },

    // Generate unique ID
    generateId: function() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    // Send tracking event
    track: function(eventType, metadata = {}) {
      const data = {
        siteId: this.siteId,
        eventType: eventType,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        metadata: metadata,
      };

      // Get base URL from script src or use current origin
      const scriptSrc = scriptTag?.src || '';
      let baseUrl;
      
      if (scriptSrc && scriptSrc.includes('://')) {
        // Extract base URL from script src
        const url = new URL(scriptSrc);
        baseUrl = url.origin;
      } else {
        // Fallback to current origin
        baseUrl = window.location.origin;
      }
      
      const endpoint = baseUrl + TRACKING_ENDPOINT;

      // Send as beacon if available, otherwise use fetch
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, JSON.stringify(data));
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        }).catch(function(error) {
          console.error('Sitebango Analytics: Failed to send event', error);
        });
      }
    },

    // Track pageview
    trackPageview: function() {
      if (this.hasTrackedPageview) return;
      
      this.hasTrackedPageview = true;
      this.track('pageview');
    },

    // Track session
    trackSession: function() {
      const sessionDuration = Date.now() - this.sessionStart;
      const bounced = sessionDuration < 10000 && !this.hasInteracted; // Less than 10 seconds and no interaction

      this.track('session', {
        sessionDuration: Math.round(sessionDuration / 1000), // Convert to seconds
        bounced: bounced,
        pageLoadTime: Math.round(this.pageLoadTime),
      });
    },

    // Track conversion (can be called manually)
    trackConversion: function(conversionType, value) {
      this.track('conversion', {
        type: conversionType,
        value: value,
      });
    },

    // Track lead (can be called manually)
    trackLead: function(source) {
      this.track('lead', {
        source: source || 'unknown',
      });
    },

    // Setup event listeners
    setupEventListeners: function() {
      const self = this;
      
      // Track user interaction for bounce rate
      ['click', 'scroll', 'keypress'].forEach(function(event) {
        document.addEventListener(event, function() {
          self.hasInteracted = true;
        }, { once: true, passive: true });
      });

      // Track before page unload
      window.addEventListener('beforeunload', function() {
        self.trackSession();
      });

      // Track visibility changes
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          self.trackSession();
        }
      });

      // Update session activity
      let activityTimeout;
      ['click', 'scroll', 'keypress', 'mousemove'].forEach(function(event) {
        document.addEventListener(event, function() {
          clearTimeout(activityTimeout);
          activityTimeout = setTimeout(function() {
            self.lastActivity = Date.now();
            const session = JSON.parse(sessionStorage.getItem('sitebango_session') || '{}');
            session.lastActivity = self.lastActivity;
            sessionStorage.setItem('sitebango_session', JSON.stringify(session));
          }, DEBOUNCE_DELAY);
        }, { passive: true });
      });
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      SitebangoAnalytics.init();
    });
  } else {
    SitebangoAnalytics.init();
  }

  // Expose analytics object globally
  window.SitebangoAnalytics = SitebangoAnalytics;
})();