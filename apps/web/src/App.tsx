import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/routes/Home';
import { Login } from '@/routes/auth/Login';
import { Signup } from '@/routes/auth/Signup';
import { JudgeNew } from '@/routes/judge/JudgeNew';
import { JudgeManual } from '@/routes/judge/JudgeManual';
import { JudgePhoto } from '@/routes/judge/JudgePhoto';
import { JudgeReview } from '@/routes/judge/JudgeReview';
import { JudgeResult } from '@/routes/judge/JudgeResult';
import { MyJudgements } from '@/routes/my/MyJudgements';
import { MyCars } from '@/routes/my/MyCars';
import { Guide } from '@/routes/guide/Guide';
import { NearbyShops } from '@/routes/shops/NearbyShops';
import { AllCases } from '@/routes/cases/AllCases';
import { DevUI } from '@/routes/dev/DevUI';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Dev route — no main layout chrome */}
          <Route path="/dev/ui" element={<DevUI />} />

          {/* Main app — all wrapped in Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />

                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Judge flow */}
                  <Route path="/judge/new" element={<JudgeNew />} />
                  <Route path="/judge/manual" element={<JudgeManual />} />
                  <Route path="/judge/photo" element={<JudgePhoto />} />
                  <Route path="/judge/review/:estimateId" element={<JudgeReview />} />
                  <Route path="/judge/result/:judgementId" element={<JudgeResult />} />

                  {/* My */}
                  <Route path="/my/judgements" element={<MyJudgements />} />
                  <Route path="/my/cars" element={<MyCars />} />

                  {/* Guide */}
                  <Route path="/guide" element={<Guide />} />

                  {/* Shops */}
                  <Route path="/shops" element={<NearbyShops />} />

                  {/* Cases */}
                  <Route path="/cases" element={<AllCases />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
