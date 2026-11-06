import React, { useState } from 'react';
import { Search, Filter, MessageSquare, Clock, User, Tag, Send, CheckCircle, ChevronLeft, MoreVertical, Paperclip, Save, Edit3, Eye, Shield, FileCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

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

const mockTickets = [
  {
    id: 'TCK-1024',
    customer: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    subject: 'Issue with QR code activation',
    status: 'Open',
    priority: 'High',
    time: '10 mins ago',
    agent: 'Unassigned',
    category: 'Technical',
    messages: [
      { id: 1, sender: 'customer', text: 'Hi, I received my QR sticker but I am unable to activate it through the app. It says "Invalid Code". Can you please help?', time: '10:30 AM' }
    ]
  },
  {
    id: 'TCK-1023',
    customer: 'Priya Patel',
    email: 'priya.p@example.com',
    subject: 'Replacement sticker request',
    status: 'In Progress',
    priority: 'Medium',
    time: '2 hours ago',
    agent: 'Amit Kumar',
    category: 'Product',
    messages: [
      { id: 1, sender: 'customer', text: 'My sticker got damaged in the rain. How can I get a replacement?', time: '08:45 AM' },
      { id: 2, sender: 'agent', text: 'Hi Priya, I am sorry to hear that. I have initiated a replacement request. You should receive an email with the tracking details shortly.', time: '09:15 AM' },
      { id: 3, sender: 'customer', text: 'Thank you!', time: '09:20 AM' }
    ]
  },
  {
    id: 'TCK-1022',
    customer: 'Vikram Singh',
    email: 'vikram.s@example.com',
    subject: 'Billing discrepancy',
    status: 'Closed',
    priority: 'Low',
    time: '1 day ago',
    agent: 'Neha Gupta',
    category: 'Billing',
    messages: [
      { id: 1, sender: 'customer', text: 'I was charged twice for my premium plan renewal.', time: 'Yesterday, 14:00' },
      { id: 2, sender: 'agent', text: 'Hello Vikram, I have checked your account. The second charge was a system error and has been refunded. It should reflect in your account within 3-5 business days.', time: 'Yesterday, 15:30' }
    ]
  }
];

const agents = ['Unassigned', 'Amit Kumar', 'Neha Gupta', 'Sanjay Verma'];

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-50 border-red-200';
    case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Low': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Open': return 'text-emerald-600 bg-emerald-50';
    case 'In Progress': return 'text-amber-600 bg-amber-50';
    case 'Closed': return 'text-gray-500 bg-gray-100';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const Support = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(mockTickets[0]);
  const [replyText, setReplyText] = useState('');
  const [tickets, setTickets] = useState(mockTickets);

  // CMS States
  const [activePage, setActivePage] = useState(cmsPages[0]);
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState('edit');
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

  const renderPreview = (markdown) => {
    if (!markdown) return '';
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

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        const updatedTicket = {
          ...ticket,
          messages: [
            ...ticket.messages,
            { id: Date.now(), sender: 'agent', text: replyText, time: 'Just now' }
          ]
        };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return ticket;
    });
    
    setTickets(updatedTickets);
    setReplyText('');
  };

  const handleAgentChange = (e) => {
    const newAgent = e.target.value;
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === selectedTicket.id) {
        const updatedTicket = { ...ticket, agent: newAgent };
        setSelectedTicket(updatedTicket);
        return updatedTicket;
      }
      return ticket;
    });
    setTickets(updatedTickets);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:ml-[260px] flex-1 flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleSidebar} />

        <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support & CMS</h1>
              <p className="text-sm text-gray-500 mt-1">Manage customer queries, support tickets, and legal content</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center bg-gray-200/50 rounded-lg p-1">
                <button 
                  onClick={() => setActiveMainTab('tickets')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeMainTab === 'tickets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Support Tickets
                </button>
                <button 
                  onClick={() => setActiveMainTab('cms')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeMainTab === 'cms' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  CMS & Legal
                </button>
              </div>

              {activeMainTab === 'tickets' ? (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    />
                  </div>
                  <button className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium text-sm shadow-sm disabled:opacity-70"
                >
                  {isSaving ? <CheckCircle className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          {activeMainTab === 'tickets' ? (
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-200px)]">
            
            {/* Ticket List (Left Pane) */}
            <div className={`w-full lg:w-1/3 border-r border-gray-100 flex flex-col ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Active Tickets
                </h3>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                  {tickets.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 rounded-xl ${
                      selectedTicket?.id === ticket.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-500">{ticket.id}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ticket.time}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{ticket.subject}</h4>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-600 truncate">{ticket.customer}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600" title={ticket.agent}>
                        {ticket.agent !== 'Unassigned' ? ticket.agent.charAt(0) : '?'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Detail (Right Pane) */}
            <div className={`w-full lg:w-2/3 flex flex-col bg-gray-50/30 ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
              {selectedTicket ? (
                <>
                  {/* Detail Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-200 bg-white shadow-sm z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-3 lg:hidden">
                      <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="font-semibold text-gray-800">Back to Tickets</span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${getPriorityColor(selectedTicket.priority)}`}>
                            {selectedTicket.priority} Priority
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {selectedTicket.customer}</span>
                          <span className="flex items-center gap-1.5 hidden sm:flex"><Tag className="w-4 h-4" /> {selectedTicket.category}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 font-medium text-gray-700 focus:outline-none focus:border-primary transition-colors"
                          value={selectedTicket.agent}
                          onChange={handleAgentChange}
                        >
                          {agents.map(agent => (
                            <option key={agent} value={agent}>{agent}</option>
                          ))}
                        </select>
                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Thread Area */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {selectedTicket.messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                          msg.sender === 'customer' 
                            ? 'bg-white border border-gray-100 rounded-tl-none' 
                            : 'bg-primary text-white rounded-tr-none'
                        }`}>
                          <div className="flex items-center justify-between mb-1 opacity-80 gap-4">
                            <span className="text-xs font-semibold">
                              {msg.sender === 'customer' ? selectedTicket.customer : selectedTicket.agent}
                            </span>
                            <span className="text-[10px] whitespace-nowrap">{msg.time}</span>
                          </div>
                          <p className={`text-sm leading-relaxed ${msg.sender === 'customer' ? 'text-gray-700' : 'text-primary-foreground'}`}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                      <button className="p-2 text-gray-400 hover:text-primary transition-colors shrink-0 cursor-pointer">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <textarea
                        rows="2"
                        placeholder="Type your reply..."
                        className="flex-1 bg-transparent border-none focus:outline-none resize-none py-2 text-sm text-gray-700"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button 
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 hidden lg:flex">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600">No ticket selected</h3>
                  <p className="text-sm mt-1">Select a ticket from the list to view details and reply.</p>
                </div>
              )}
            </div>

            </div>
          ) : (
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all min-w-[180px] lg:min-w-0 cursor-pointer ${
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        viewMode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Support;
