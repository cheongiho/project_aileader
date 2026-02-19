import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/routes/Home';
import { JudgeNew } from '@/routes/judge/JudgeNew';
import { JudgeManual } from '@/routes/judge/JudgeManual';
import { JudgePhoto } from '@/routes/judge/JudgePhoto';
import { JudgeReview } from '@/routes/judge/JudgeReview';
import { JudgeResult } from '@/routes/judge/JudgeResult';
import { MyJudgements } from '@/routes/my/MyJudgements';
import { MyCars } from '@/routes/my/MyCars';
import { Guide } from '@/routes/guide/Guide';
import { NearbyShops } from '@/routes/shops/NearbyShops';
import { DevUI } from '@/routes/dev/DevUI';

export function App() {
  return (
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

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
