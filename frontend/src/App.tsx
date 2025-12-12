import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

/**
 * FlowNote Ana Uygulama Bileşeni
 * Block-based not tutma uygulaması
 */
function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark-950 text-dark-50">
                {/* Header */}
                <header className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">F</span>
                                </div>
                                <h1 className="text-xl font-semibold text-dark-50">FlowNote</h1>
                            </div>
                            <nav className="flex items-center space-x-4">
                                <button className="px-4 py-2 text-sm font-medium text-dark-200 hover:text-dark-50 transition-colors">
                                    Login
                                </button>
                                <button className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">
                                    Get Started
                                </button>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

/**
 * Ana Sayfa Bileşeni
 */
function HomePage() {
    return (
        <div className="text-center">
            {/* Hero Section */}
            <div className="py-20">
                <h2 className="text-4xl sm:text-5xl font-bold text-dark-50 mb-6">
                    Welcome to{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                        FlowNote
                    </span>
                </h2>
                <p className="text-lg text-dark-300 max-w-2xl mx-auto mb-8">
                    A modern, block-based note-taking application. Organize your thoughts
                    with powerful blocks: text, headings, checkboxes, and images.
                </p>
                <div className="flex items-center justify-center space-x-4">
                    <button className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-primary-500/25">
                        Start Taking Notes
                    </button>
                    <button className="px-6 py-3 border border-dark-700 hover:border-dark-600 text-dark-200 hover:text-dark-50 font-medium rounded-lg transition-colors">
                        Learn More
                    </button>
                </div>
            </div>

            {/* Feature Preview */}
            <div className="mt-16 p-8 bg-dark-900/50 rounded-2xl border border-dark-800">
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-left space-y-4">
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <span className="text-dark-400 text-sm">Heading Block</span>
                        <h3 className="text-xl font-semibold text-dark-100">My First Note</h3>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg">
                        <span className="text-dark-400 text-sm">Text Block</span>
                        <p className="text-dark-200">This is a paragraph of text. You can write anything here.</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-lg flex items-center space-x-3">
                        <span className="text-dark-400 text-sm mr-2">Checkbox Block</span>
                        <input type="checkbox" className="w-5 h-5 rounded border-dark-600" defaultChecked />
                        <span className="text-dark-200 line-through">Complete the project setup</span>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mt-12 inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                    🚀 Project Foundation Complete - Phase 1
                </span>
            </div>
        </div>
    );
}

export default App;
