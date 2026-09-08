import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { LandingPage } from '@/app/components/landing-page';
import { ContextSelection } from '@/app/components/context-selection';
import Dashboard from '@/app/components/dashboard';
import CommunityMap from '@/app/components/community-map';
import { SourceAttribution } from '@/app/components/source-attribution';
import { IncidentInvestigation } from '@/app/components/incident-investigation';
import FalilaXIncidentMap from '@/app/FalilaXIncidentMap';

import PrivacyPolicy from '@/app/docs/PrivacyPolicy';
import TermsOfService from '@/app/docs/TermsOfService';
import SmsConsent from '@/app/docs/SmsConsent';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC / ENTRY
        ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/select-context"
          element={<ContextSelection />}
        />


        {/* =====================================================
            CONTEXT-AWARE FALILAX WORKSPACES
        ===================================================== */}

        {/*
          The selected context is carried in the URL:

          /dashboard/home
          /dashboard/school
          /dashboard/hospital
          /dashboard/restaurant
          /dashboard/utility

          Dashboard will read the :context parameter and adapt
          its presentation accordingly.
        */}
        <Route
          path="/dashboard/:context"
          element={<Dashboard />}
        />

        {/*
          Preserve the old /dashboard URL.

          Existing buttons, bookmarks, or links that still use
          /dashboard will enter the professional Utility workspace.
        */}
        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/dashboard/utility"
              replace
            />
          }
        />


        {/* =====================================================
            OPERATIONAL INTELLIGENCE TOOLS
        ===================================================== */}

        <Route
          path="/map"
          element={<CommunityMap />}
        />

        <Route
          path="/incident-map"
          element={<FalilaXIncidentMap />}
        />

        <Route
          path="/attribution"
          element={<SourceAttribution />}
        />

        <Route
          path="/incidents"
          element={<IncidentInvestigation />}
        />


        {/* =====================================================
            LEGAL / CONSENT
        ===================================================== */}

        <Route
          path="/privacy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms"
          element={<TermsOfService />}
        />

        <Route
          path="/sms-alerts"
          element={<SmsConsent />}
        />


        {/* =====================================================
            UNKNOWN ROUTES
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}