import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { LandingPage } from '@/app/components/landing-page';
import Dashboard from '@/app/components/dashboard';
import CommunityMap from '@/app/components/community-map';
import { SourceAttribution } from '@/app/components/source-attribution';
import { IncidentInvestigation } from '@/app/components/incident-investigation';
import AlertFeed from '@/app/components/AlertFeed';
import FalilaXIncidentMap from '@/app/FalilaXIncidentMap';
import UtilityReadiness from '@/app/components/utility-readiness';
import EnrollmentFabric from '@/app/components/enrollment-fabric';
import ParticipantHome from '@/app/components/participant-home';
import ParticipantSignIn from '@/app/components/participant-sign-in';
import { ParticipantRoute } from '@/app/components/participant-route';
import OperatorSignIn from '@/app/components/operator-sign-in';
import { OperatorRoute } from '@/app/components/operator-route';

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

        {/*
          Secure FalilaX Enrollment Fabric.

          Invitation secrets may arrive through the path and are removed
          from the visible URL immediately after acceptance.
        */}
        <Route
          path="/enroll"
          element={<EnrollmentFabric />}
        />

        <Route
          path="/enroll/:invitationToken"
          element={<EnrollmentFabric />}
        />

        <Route path="/participant/sign-in" element={<ParticipantSignIn />} />
        <Route
          path="/participant/home"
          element={
            <ParticipantRoute>
              <ParticipantHome />
            </ParticipantRoute>
          }
        />
        <Route
          path="/operator/sign-in"
          element={<OperatorSignIn />}
        />
        <Route
          path="/select-context"
          element={<Navigate to="/dashboard/utility" replace />}
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
          element={
            <OperatorRoute>
              <Dashboard />
            </OperatorRoute>
          }
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
          element={<OperatorRoute><CommunityMap /></OperatorRoute>}
        />

        <Route
          path="/incident-map"
          element={<OperatorRoute><FalilaXIncidentMap /></OperatorRoute>}
        />

        <Route
          path="/alerts"
          element={<OperatorRoute><AlertFeed /></OperatorRoute>}
        />

        <Route
          path="/readiness"
          element={<OperatorRoute><UtilityReadiness /></OperatorRoute>}
        />

        <Route
          path="/attribution"
          element={<OperatorRoute><SourceAttribution /></OperatorRoute>}
        />

        {/*
          General incident workspace.
        */}
        <Route
          path="/incidents"
          element={<OperatorRoute><IncidentInvestigation /></OperatorRoute>}
        />

        {/*
          Incident-specific deep link used by FalilaX notifications:

          /incidents/{incidentId}
        */}
        <Route
          path="/incidents/:incidentId"
          element={<OperatorRoute><IncidentInvestigation /></OperatorRoute>}
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
