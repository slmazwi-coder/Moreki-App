
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Create a local query client so we don't depend on the Base44 lib
const queryClient = new QueryClient();

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = Pages[mainPageKey] || (() => <div>Page Not Found</div>);

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  // BYPASSING BASE44 AUTH FOR INITIAL VERCEL DEPLOY
  // This allows you to see the UI immediately. 
  // We will add Vulavula/Firebase auth in the next step via Project IDX.

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthenticatedApp />
      </Router>
    </QueryClientProvider>
  )
}

export default App
