import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MessageSquare, Image, MessageCircle, Settings, ListChecks } from 'lucide-react';
import AdminCommentsTab from '@/components/admin/AdminCommentsTab';
import AdminImagesTab from '@/components/admin/AdminImagesTab';
import AdminChatTab from '@/components/admin/AdminChatTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import AdminLiveListTab from '@/components/admin/AdminLiveListTab';

type AdminTab = 'comments' | 'images' | 'chat' | 'settings' | 'livelist';

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('comments');

  const tabs = [
    { id: 'comments' as AdminTab, label: 'Comments', icon: MessageSquare },
    { id: 'images' as AdminTab, label: 'Images', icon: Image },
    { id: 'chat' as AdminTab, label: 'Chat', icon: MessageCircle },
    { id: 'livelist' as AdminTab, label: 'Live List', icon: ListChecks },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 text-lg">Manage comments, images, chat, live lists, and settings</p>
          </div>
        </div>
      </div>

      {/* Secondary Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'comments' && <AdminCommentsTab />}
        {activeTab === 'images' && <AdminImagesTab />}
        {activeTab === 'chat' && <AdminChatTab />}
        {activeTab === 'livelist' && <AdminLiveListTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </div>
    </div>
  );
}
