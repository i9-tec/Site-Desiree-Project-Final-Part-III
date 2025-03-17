import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import PropertyLaunches from './components/PropertyLaunches';
import FeaturedListings from './components/FeaturedListings';
import Categories from './components/Categories';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CookieConsent from './components/CookieConsent';
import AdminLayout from './components/admin/AdminLayout';
import Login from './components/admin/Login';
import PropertyForm from './components/admin/PropertyForm';
import PropertyList from './components/admin/PropertyList';
import AboutMeForm from './components/admin/AboutMeForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Header />
              <Hero />
              <About />
              <Categories />
              <PropertyLaunches />
              <FeaturedListings />
              <Contact />
              <Footer />
              <WhatsAppButton />
              <CookieConsent />
            </div>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/properties" replace />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="properties/new" element={<PropertyForm onSuccess={() => {}} />} />
          <Route path="properties/:id" element={<PropertyForm onSuccess={() => {}} />} />
          <Route path="about-me" element={<AboutMeForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;