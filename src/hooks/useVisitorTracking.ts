import { useState, useEffect } from 'react';

interface VisitorSession {
  sessionId: string;
  timestamp: number;
  isNewVisitor: boolean;
}

export function useVisitorTracking() {
  const [hasTrackedVisit, setHasTrackedVisit] = useState(false);

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const isNewSession = (): boolean => {
    const currentTime = Date.now();
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes session timeout
    
    // Check for existing session
    const existingSession = sessionStorage.getItem('visitor_session');
    
    if (existingSession) {
      try {
        const session: VisitorSession = JSON.parse(existingSession);
        const timeDiff = currentTime - session.timestamp;
        
        // If session is still valid (within timeout), it's not a new session
        if (timeDiff < sessionTimeout) {
          return false;
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
      }
    }
    
    return true;
  };

  const trackUniqueVisit = (): boolean => {
    if (hasTrackedVisit) return false;
    
    const isNew = isNewSession();
    
    if (isNew) {
      // Create new session
      const newSession: VisitorSession = {
        sessionId: generateSessionId(),
        timestamp: Date.now(),
        isNewVisitor: true
      };
      
      // Store session data
      sessionStorage.setItem('visitor_session', JSON.stringify(newSession));
      
      // Update session timestamp in localStorage for persistence across tabs
      const lastVisit = localStorage.getItem('last_visit_timestamp');
      const currentTime = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000; // 24 hours
      
      // Only count as new visit if last visit was more than 24 hours ago or no previous visit
      if (!lastVisit || (currentTime - parseInt(lastVisit)) > dayInMs) {
        localStorage.setItem('last_visit_timestamp', currentTime.toString());
        setHasTrackedVisit(true);
        return true;
      }
    }
    
    setHasTrackedVisit(true);
    return false;
  };

  const updateSessionActivity = () => {
    const existingSession = sessionStorage.getItem('visitor_session');
    if (existingSession) {
      try {
        const session: VisitorSession = JSON.parse(existingSession);
        session.timestamp = Date.now();
        sessionStorage.setItem('visitor_session', JSON.stringify(session));
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    }
  };

  useEffect(() => {
    // Update session activity every 5 minutes to keep session alive
    const activityInterval = setInterval(updateSessionActivity, 5 * 60 * 1000);
    
    return () => clearInterval(activityInterval);
  }, []);

  return {
    trackUniqueVisit,
    hasTrackedVisit
  };
}