
import React, { ReactNode, useState } from 'react';
import { Home, Building2, ShoppingBag, Users, LogOut, Settings, Search, Bell, Check, MessageSquare, Info, Grid, FileText, ClipboardCheck, MessageCircle } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  role: UserRole;
  onNavigate: (view: string) => void;
  onPublish?: () => void;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, title: '审核通过', message: '您的“农机补贴申请”已通过审核。', time: '10分钟前', isUnread: true, type: 'success' },
  { id: 2, title: '新评论', message: '李二婶评论了您的动态：“南瓜还有吗？”', time: '30分钟前', isUnread: true, type: 'message' },
  { id: 3, title: '系统公告', message: '系统将于今晚进行维护升级，请留意。', time: '2小时前', isUnread: false, type: 'system' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentView, role, onNavigate, onPublish }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const navItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'gov', label: '办事', icon: Building2 },
    { id: 'market', label: '集市', icon: ShoppingBag },
    { id: 'community', label: '圈子', icon: Users },
  ];

  const adminNavItems = [
      { id: 'admin_overview', label: '总览', icon: Grid },
      { id: 'admin_users', label: '用户管理', icon: Users },
      { id: 'admin_news', label: '新闻管理', icon: FileText },
      { id: 'admin_gov', label: '政务审批', icon: ClipboardCheck },
      { id: 'admin_community', label: '圈子管理', icon: MessageCircle },
  ];

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
  };

  const currentNavItems = role === UserRole.ADMIN ? adminNavItems : navItems;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR (Visible on md+) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-30 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
             SV
           </div>
           <div>
             <h1 className="text-lg font-bold text-gray-800">智慧乡村</h1>
             <p className="text-xs text-gray-400 tracking-wide">Smart Village</p>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           <div className="text-xs font-semibold text-gray-400 mb-2 px-3 uppercase">
               {role === UserRole.ADMIN ? '管理中心' : '菜单'}
           </div>
           {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              );
           })}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div 
             onClick={() => onNavigate('profile')}
             className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
             title="点击进入个人中心"
           >
              <img src={`https://picsum.photos/seed/${role}/40/40`} alt="avatar" className="w-10 h-10 rounded-full border border-gray-200 group-hover:border-blue-300 transition-colors" />
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">当前用户</p>
                 <p className="text-xs text-gray-500 truncate capitalize">{role === UserRole.ADMIN ? '管理员' : '村民'}</p>
              </div>
              <Settings size={16} className="text-gray-300 group-hover:text-blue-400" />
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* MOBILE HEADER (Visible on < md) */}
        <header className="md:hidden bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 pb-12 rounded-b-[2rem] shadow-md z-10 relative shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-wide">智慧乡村</h1>
              <p className="text-blue-100 text-xs">Smart Countryside</p>
            </div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm cursor-pointer" onClick={() => onNavigate('profile')}>
              <img src={`https://picsum.photos/seed/${role}/40/40`} alt="avatar" className="w-8 h-8 rounded-full border-2 border-white" />
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-full flex items-center px-4 py-2 text-blue-50">
            <Search size={16} className="mr-2" />
            <span className="text-sm">搜索服务...</span>
          </div>
        </header>

        {/* DESKTOP HEADER (Visible on md+) */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 shrink-0 relative z-40">
           <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
              <Search size={18} className="text-gray-400 mr-2" />
              <input type="text" placeholder="搜索服务、商品或新闻..." className="bg-transparent border-none outline-none text-sm w-full text-gray-700" />
           </div>
           <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                   <Bell size={20} />
                   {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-scale-in origin-top-right">
                      <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                         <h3 className="font-bold text-gray-800">通知中心</h3>
                         {unreadCount > 0 && (
                           <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                             <Check size={12} /> 全部已读
                           </button>
                         )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                           <div className="p-8 text-center text-gray-400 text-sm">暂无新通知</div>
                        ) : (
                           notifications.map(n => (
                             <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${n.isUnread ? 'bg-blue-50/30' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                   <div className="flex items-center gap-2">
                                      {n.isUnread && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                                      <span className="font-bold text-sm text-gray-700">{n.title}</span>
                                   </div>
                                   <span className="text-[10px] text-gray-400">{n.time}</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed ml-3.5">{n.message}</p>
                             </div>
                           ))
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-50 text-center">
                         <button className="text-xs text-gray-500 hover:text-blue-600 w-full py-1">查看全部历史消息</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <button 
                onClick={onPublish}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
              >
                 发布信息
              </button>
           </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto no-scrollbar md:p-8 p-3 pb-24 md:pb-8 z-0">
           <div className="md:max-w-7xl md:mx-auto -mt-8 md:mt-0 relative z-20">
              {children}
           </div>
        </main>

        {/* MOBILE BOTTOM NAV (Visible on < md) */}
        <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-40 pb-safe">
          <div className="flex justify-around items-center h-16">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </div>
  );
};

export default Layout;
