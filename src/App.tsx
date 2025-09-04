import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Website from './components/Website';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialServices, initialContactInfo, initialVisitorData, initialTestimonials } from './data/initialData';
import { Service, ContactInfo, VisitorData, Testimonial } from './types';

function App() {
  const [services, setServices] = useLocalStorage<Service[]>('virtu-serve-services', initialServices);
  const [contactInfo, setContactInfo] = useLocalStorage<ContactInfo>('virtu-serve-contact', initialContactInfo);
  const [visitorData, setVisitorData] = useLocalStorage<VisitorData[]>('virtu-serve-visitors', initialVisitorData);
  const [testimonials, setTestimonials] = useLocalStorage<Testimonial[]>('virtu-serve-testimonials', initialTestimonials);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const handleVisit = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingData = visitorData.find(data => data.date === today);
    
    if (existingData) {
      setVisitorData(visitorData.map(data => 
        data.date === today 
          ? { ...data, visitors: data.visitors + 1 }
          : data
      ));
    } else {
      setVisitorData([...visitorData, { date: today, visitors: 1 }]);
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Website 
              services={services}
              contactInfo={contactInfo}
              testimonials={testimonials}
              onVisit={handleVisit}
            />
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                services={services}
                contactInfo={contactInfo}
                visitorData={visitorData}
                testimonials={testimonials}
                onUpdateServices={setServices}
                onUpdateContactInfo={setContactInfo}
                onUpdateTestimonials={setTestimonials}
                onLogout={() => setIsAdminLoggedIn(false)}
              />
            ) : (
              <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;