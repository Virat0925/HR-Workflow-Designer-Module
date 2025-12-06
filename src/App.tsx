import { Workflow } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './utils/toast';

function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <Workflow size={24} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                HR Workflow Designer
              </h1>
              <p className="text-sm text-gray-500">
                Visual workflow automation platform for HR processes
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1" role="main">
            <WorkflowCanvas />
          </main>
        </div>
      </div>
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
