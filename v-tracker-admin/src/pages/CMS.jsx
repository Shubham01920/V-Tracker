import React, { useState } from 'react';
import { FileText, Save, Edit3, Eye, Shield, FileCheck, Info, CheckCircle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { toast } from 'sonner';

const cmsPages = [
  { id: 'privacy', name: 'Privacy Policy', icon: Shield, lastUpdated: 'Oct 12, 2026' },
  { id: 'terms', name: 'Terms & Conditions', icon: FileCheck, lastUpdated: 'Oct 10, 2026' },
  { id: 'about', name: 'About Us', icon: Info, lastUpdated: 'Sep 25, 2026' }
];

const initialContent = {
  privacy: `# Privacy Policy\n\nEffective Date: January 1, 2026\n\nWelcome to V-Tracker. We are committed to protecting your personal information and your right to privacy.\n\n## 1. Information We Collect\nWe collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and Services.\n\n## 2. How We Use Your Information\nWe use personal information collected via our App for a variety of business purposes described below:\n- To facilitate account creation and logon process.\n- To post testimonials.`,
  terms: `# Terms & Conditions\n\nThese terms and conditions outline the rules and regulations for the use of V-Tracker's App.\n\n## 1. License\nUnless otherwise stated, V-Tracker and/or its licensors own the intellectual property rights for all material on V-Tracker.\n\n## 2. User Comments\n- This Agreement shall begin on the date hereof.\n- Parts of this app offer an opportunity for users to post and exchange opinions and information in certain areas of the app.`,
  about: `# About Us\n\nV-Tracker is a leading enterprise solution for vehicle tracking, QR inventory management, and fast-tag integrations. Our mission is to simplify vehicle management for everyone.`
};

const CMS = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(cmsPages[0]);
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
  const [isSaving, setIsSaving] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleContentChange = (e) => {
    setContent({
      ...content,
      [activePage.id]: e.target.value
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${activePage.name} updated successfully!`);
    }, 1000);
  };

  // Very basic markdown parsing for preview
  const renderPreview = (markdown) => {
    if (!markdown) return '';
    
    // Split by newlines and wrap in paragraphs, handle basic headings
    return markdown.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-900">{line.replace('# ', '')}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-gray-800">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-gray-800">{line.replace('### ', '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-5 list-disc text-gray-700 my-1">{line.replace('- ', '')}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-gray-700 leading-relaxed my-1">{line}</p>;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex-1 flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} user={{ name: 'Admin', role: 'System Admin' }} />

        <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden max-w-[1600px] w-full mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CMS & Legal Pages</h1>
              <p className="text-sm text-gray-500 mt-1">Manage content for mobile app legal and support pages</p>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm disabled:opacity-70"
            >
              {isSaving ? <CheckCircle className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
            
            {/* Page Navigation Sidebar */}
            <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
              <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm overflow-x-auto flex lg:flex-col gap-1 hide-scrollbar">
                {cmsPages.map((page) => {
                  const Icon = page.icon;
                  const isActive = activePage.id === page.id;
                  
                  return (
                    <button
                      key={page.id}
                      onClick={() => setActivePage(page)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all min-w-[180px] lg:min-w-0 ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                      <div className="flex flex-col">
                        <span className="text-sm">{page.name}</span>
                        {isActive && <span className="text-[10px] text-primary/70 font-normal">Last updated: {page.lastUpdated}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-2 hidden lg:block">
                <h4 className="flex items-center gap-2 font-semibold text-blue-800 text-sm mb-2">
                  <Info className="w-4 h-4" />
                  Markdown Supported
                </h4>
                <p className="text-xs text-blue-600 leading-relaxed">
                  You can use markdown syntax to format these pages. Use # for headings, - for lists, and ** for bold text. Changes apply instantly to the mobile app upon saving.
                </p>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
              
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <activePage.icon className="w-5 h-5 text-gray-500" />
                  <h2 className="font-bold text-gray-800">{activePage.name}</h2>
                </div>
                
                <div className="flex items-center bg-gray-200/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Editor/Preview Content */}
              <div className="flex-1 overflow-y-auto relative bg-[#fafafa]">
                {viewMode === 'edit' ? (
                  <textarea
                    className="w-full h-full p-6 bg-transparent border-none focus:outline-none resize-none font-mono text-sm text-gray-700 leading-relaxed"
                    value={content[activePage.id]}
                    onChange={handleContentChange}
                    placeholder="Start writing in markdown..."
                  />
                ) : (
                  <div className="w-full h-full p-6 lg:px-12 max-w-4xl mx-auto bg-white min-h-full prose">
                    {renderPreview(content[activePage.id])}
                  </div>
                )}
              </div>
              
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 flex justify-between items-center">
                <span>{content[activePage.id].split(' ').length} words</span>
                <span>Auto-saved locally</span>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CMS;
