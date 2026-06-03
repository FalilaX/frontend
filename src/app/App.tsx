import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/app/components/landing-page';
import { ContextSelection } from '@/app/components/context-selection';
import Dashboard from '@/app/components/dashboard';
import CommunityMap from '@/app/components/community-map';
import { SourceAttribution } from '@/app/components/source-attribution';

import PrivacyPolicy from '@/app/docs/PrivacyPolicy';
import TermsOfService from '@/app/docs/TermsOfService';
import SmsConsent from '@/app/docs/SmsConsent';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-context" element={<ContextSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<CommunityMap />} />
        <Route path="/attribution" element={<SourceAttribution />} />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/sms-alerts" element={<SmsConsent />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}