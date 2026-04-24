import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OutlineDetail from './pages/OutlineDetail';
import LessonViewer from './pages/LessonViewer';
import QuizViewer from './pages/QuizViewer';
import Progress from './pages/Progress';
import NewOutline from './pages/NewOutline';
import QualityCheck from './pages/QualityCheck';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/outline/:slug" element={<OutlineDetail />} />
        <Route path="/lesson/:kpId" element={<LessonViewer />} />
        <Route path="/quiz/:kpId" element={<QuizViewer />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/new" element={<NewOutline />} />
        <Route path="/check/:topic" element={<QualityCheck />} />
      </Routes>
    </Layout>
  );
}

export default App;
