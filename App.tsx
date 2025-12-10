
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, CartItem, Product, Post, News, GovernmentAffair, Comment, AffairStatus, User, NewsCategory } from './types';
import Layout from './components/Layout';
import AIAssistant from './components/AIAssistant';
import { api } from './services/mockApi'; // Now points to real API implementation
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  ShoppingCart, Activity, ChevronRight, MapPin, Plus, MessageCircle, Heart, Share2, ArrowRight, Sun, Users, X, CheckCircle, AlertCircle, Filter, Search, Clock, FileText, User as UserIcon, CreditCard, Settings, HelpCircle, Map, GraduationCap, HeartPulse, Camera, LogOut, Award, Wallet, Loader2, Lock, Phone, Shield, Eye, Check, XCircle, ClipboardCheck, Building2, Send, ShoppingBag, Upload, Trash2, Edit3, Grid, Image as ImageIcon
} from 'lucide-react';
import { Package, Truck, RotateCcw } from 'lucide-react';

// --- UTILS ---
const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

const formatTimeAgo = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    return `${Math.floor(diffInSeconds / 86400)}天前`;
};


// --- SHARED COMPONENTS ---

const Toast = ({ message, onClose, type = 'success' }: { message: string, onClose: () => void, type?: 'success' | 'info' }) => (
  <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-down ${
    type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
  }`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose}><X size={16} className="opacity-50 hover:opacity-100" /></button>
  </div>
);

const SectionHeader = ({ title, moreLink, onClickMore }: { title: string, moreLink?: string, onClickMore?: () => void }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
      <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    </div>
    {moreLink && (
      <button 
        onClick={onClickMore} 
        className="text-xs text-gray-500 flex items-center hover:text-blue-600 transition-colors"
      >
        查看更多 <ChevronRight size={14} />
      </button>
    )}
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- IMAGE UPLOADER COMPONENT ---

const ImageUploader = ({ value, onChange, className, placeholder = "点击或拖拽图片到此处上传" }: { value: string, onChange: (val: string) => void, className?: string, placeholder?: string }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert("请上传图片文件");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            onChange(result);
        };
        reader.readAsDataURL(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative overflow-hidden ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            } ${className}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
        >
            {value ? (
                <div className="relative group w-full h-full min-h-[160px] flex items-center justify-center">
                    <img src={value} alt="Preview" className="max-h-64 object-contain rounded-lg shadow-sm" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white font-medium flex items-center gap-2"><Edit3 size={18}/> 点击更换</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-gray-500">
                    <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">{placeholder}</p>
                        <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF</p>
                    </div>
                </div>
            )}
            <input 
                ref={inputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
        </div>
    );
};


// --- LOGIN COMPONENT ---

const LoginScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [activeTab, setActiveTab] = useState<'villager' | 'admin'>('villager');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isRegister) {
          // Register logic
          if (activeTab === 'admin') {
              throw new Error("管理员账号请联系后台添加");
          }
          await api.auth.register({ username, password, phone });
          alert("注册成功，请登录");
          setIsRegister(false);
          setPassword(""); // Clear password for safety
      } else {
          // Login logic
          const selectedRole = activeTab === 'admin' ? UserRole.ADMIN : UserRole.USER;
          const user = await api.auth.login(username, password, selectedRole);
          onLogin(user); 
      }
    } catch (error: any) {
      console.error(isRegister ? "Registration failed" : "Login failed", error);
      alert(error.message || (isRegister ? "注册失败" : "登录失败"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative" 
         style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-scale-in border border-white/50">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
             SV
           </div>
           <h1 className="text-2xl font-bold text-gray-800">智慧乡村综合管理平台</h1>
           <p className="text-gray-500 text-sm mt-1">数字赋能乡村 · 科技引领未来</p>
        </div>

        {/* Tabs - Only show when not registering, or disable Admin tab during registration */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
           <button 
             onClick={() => { setActiveTab('villager'); setIsRegister(false); }}
             className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
               activeTab === 'villager' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             我是村民
           </button>
           <button 
             onClick={() => { setActiveTab('admin'); setIsRegister(false); }}
             className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
               activeTab === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
             }`}
           >
             我是管理员
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {activeTab === 'villager' ? '用户名' : '管理员账号'}
              </label>
              <div className="relative">
                 <div className="absolute left-3 top-3 text-gray-400">
                    <UserIcon size={20} />
                 </div>
                 <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={activeTab === 'villager' ? "请输入用户名" : "请输入管理员账号"}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                 />
              </div>
           </div>
           
           {isRegister && activeTab === 'villager' && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <div className="relative">
                   <div className="absolute left-3 top-3 text-gray-400">
                      <Phone size={20} />
                   </div>
                   <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="请输入手机号"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                   />
                </div>
             </div>
           )}

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div className="relative">
                 <div className="absolute left-3 top-3 text-gray-400">
                    <Lock size={20} />
                 </div>
                 <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                 />
              </div>
           </div>

           <button 
             type="submit"
             disabled={isLoading}
             className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"
           >
             {isLoading ? (
                <>
                   <Loader2 className="animate-spin" size={20} /> {isRegister ? '注册中...' : '登录中...'}
                </>
             ) : (isRegister ? '立即注册' : '立即登录')}
           </button>
        </form>
        
        {activeTab === 'villager' && (
            <div className="mt-6 text-center">
                <button 
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
                </button>
            </div>
        )}
        
        <div className="mt-6 text-center">
           <p className="text-xs text-gray-400">
              测试账号: admin / 123456 <br/>
              技术支持热线: 400-123-4567
           </p>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD COMPONENT ---

interface AdminDashboardProps {
  users: User[];
  news: News[];
  posts: Post[];
  applications: GovernmentAffair[];
  activeTab: string; // Passed from parent
  onApproveAffair: (id: number) => void;
  onRejectAffair: (id: number) => void;
  onDeleteUser: (id: number) => void;
  onCreateNews: (news: Partial<News>) => void;
  onDeleteNews: (id: number) => void;
  onDeletePost: (id: number) => void;
  onDeleteComment: (id: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, news, posts, applications, activeTab,
    onApproveAffair, onRejectAffair, onDeleteUser, onCreateNews, onDeleteNews, onDeletePost, onDeleteComment
}) => {
   // activeTab is now controlled by parent via 'currentView' which maps to 'admin_overview', etc.
   // We strip the prefix "admin_" to get the actual tab key if needed, or just match strings.
   
   const tabKey = activeTab.replace('admin_', '');

   const [showNewsModal, setShowNewsModal] = useState(false);
   const [newNewsData, setNewNewsData] = useState<Partial<News>>({ title: '', content: '', category: NewsCategory.NEWS, coverImage: '' });
   
   // State for viewing a specific post's details
   const [viewingPost, setViewingPost] = useState<Post | null>(null);
   const [viewingPostComments, setViewingPostComments] = useState<Comment[]>([]);

   const pendingApps = applications.filter(app => app.status === 'PENDING');

   const handleCreateNews = () => {
       if(!newNewsData.title || !newNewsData.content) return;
       onCreateNews(newNewsData);
       setShowNewsModal(false);
       setNewNewsData({ title: '', content: '', category: NewsCategory.NEWS, coverImage: '' });
   }

   const handleViewPost = async (post: Post) => {
       setViewingPost(post);
       try {
           const comments = await api.community.getComments(post.id);
           setViewingPostComments(comments);
       } catch (error) {
           console.error("Failed to load comments", error);
       }
   }

   const handleDeleteCommentLocal = async (id: number) => {
       if(window.confirm("确定要删除这条评论吗？")) {
           onDeleteComment(id);
           setViewingPostComments(prev => prev.filter(c => c.id !== id));
       }
   }

   const handleDeletePostLocal = async (id: number) => {
       onDeletePost(id);
       if (viewingPost?.id === id) {
           setViewingPost(null);
       }
   }

   const renderOverview = () => (
      <div className="animate-fade-in">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Users} label="注册用户" value={users.length} color="bg-blue-500" />
            <StatCard icon={FileText} label="待办政务" value={pendingApps.length} color="bg-red-500" />
            <StatCard icon={MessageCircle} label="今日帖子" value={posts.filter(p => new Date(p.createTime).getDate() === new Date().getDate()).length} color="bg-green-500" />
            <StatCard icon={Activity} label="系统状态" value="正常" color="bg-purple-500" />
         </div>
      </div>
   );

   const renderUserManagement = () => (
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800">用户管理</h3>
               <div className="relative">
                   <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                   <input type="text" placeholder="搜索用户..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
               </div>
           </div>
           <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500">
                   <tr>
                       <th className="px-6 py-3">ID</th>
                       <th className="px-6 py-3">用户名</th>
                       <th className="px-6 py-3">手机号</th>
                       <th className="px-6 py-3">角色</th>
                       <th className="px-6 py-3">注册时间</th>
                       <th className="px-6 py-3 text-right">操作</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                   {users.map(u => (
                       <tr key={u.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4">#{u.id}</td>
                           <td className="px-6 py-4 flex items-center gap-2">
                               <img src={u.avatar} className="w-6 h-6 rounded-full" />
                               {u.username}
                           </td>
                           <td className="px-6 py-4">{u.phone || '-'}</td>
                           <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded text-xs ${u.userType === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                   {u.userType === UserRole.ADMIN ? '管理员' : '村民'}
                               </span>
                           </td>
                           <td className="px-6 py-4 text-gray-400">{formatDate(u.createTime)}</td>
                           <td className="px-6 py-4 text-right">
                               {u.userType !== UserRole.ADMIN && (
                                   <button onClick={() => onDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="删除用户">
                                       <Trash2 size={16} />
                                   </button>
                               )}
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>
   );

   const renderNewsManagement = () => (
       <div className="space-y-4 animate-fade-in">
           <div className="flex justify-between items-center">
               <h3 className="font-bold text-gray-800 text-lg">新闻公告管理</h3>
               <button onClick={() => setShowNewsModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                   <Plus size={18} /> 发布新闻
               </button>
           </div>
           <div className="grid gap-4">
               {news.map(n => (
                   <div key={n.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                       <div className="flex gap-4">
                           {n.coverImage && <img src={n.coverImage} className="w-24 h-16 object-cover rounded-lg" />}
                           <div>
                               <div className="flex items-center gap-2 mb-1">
                                   <span className={`text-xs px-2 py-0.5 rounded border ${n.category === 'NOTICE' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{n.category}</span>
                                   <h4 className="font-bold text-gray-800">{n.title}</h4>
                               </div>
                               <p className="text-sm text-gray-500 line-clamp-1 mb-1">{n.content}</p>
                               <p className="text-xs text-gray-400">发布于 {formatDate(n.publishTime)}</p>
                           </div>
                       </div>
                       <button onClick={() => onDeleteNews(n.id)} className="text-gray-400 hover:text-red-500 p-2">
                           <Trash2 size={18} />
                       </button>
                   </div>
               ))}
           </div>
       </div>
   );

   const renderGovManagement = () => (
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-gray-800">政务审批 ({pendingApps.length})</h3>
             </div>
             {pendingApps.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                   <CheckCircle size={48} className="mx-auto mb-3 opacity-20" />
                   <p>当前没有待处理的申请</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500">
                         <tr>
                            <th className="px-6 py-3">类型</th>
                            <th className="px-6 py-3">申请事项</th>
                            <th className="px-6 py-3">申请人</th>
                            <th className="px-6 py-3">日期</th>
                            <th className="px-6 py-3">备注/详情</th>
                            <th className="px-6 py-3 text-right">操作</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {pendingApps.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50">
                               <td className="px-6 py-4">
                                   {app.type === 'PRODUCT_LISTING' ? 
                                     <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">商品上架</span> : 
                                     <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">常规服务</span>
                                   }
                               </td>
                               <td className="px-6 py-4 font-medium text-gray-800">{app.title}</td>
                               <td className="px-6 py-4">{app.user?.username || '未知'}</td>
                               <td className="px-6 py-4 text-gray-400">{formatDate(app.createTime)}</td>
                               <td className="px-6 py-4 text-gray-500 truncate max-w-xs">
                                   {app.type === 'PRODUCT_LISTING' ? '查看商品详情' : app.description}
                               </td>
                               <td className="px-6 py-4 text-right space-x-2">
                                  <button 
                                     onClick={() => onApproveAffair(app.id)}
                                     className="text-green-600 hover:bg-green-50 px-3 py-1 rounded border border-green-200 text-xs font-bold transition-colors"
                                  >
                                     通过
                                  </button>
                                  <button 
                                     onClick={() => onRejectAffair(app.id)}
                                     className="text-red-500 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-xs font-bold transition-colors"
                                  >
                                     驳回
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
       </div>
   );

   const renderCommunityManagement = () => (
       <div className="space-y-4 animate-fade-in">
           <h3 className="font-bold text-gray-800 text-lg">圈子内容管理</h3>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
               {posts.map(post => (
                   <div 
                      key={post.id} 
                      className="p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleViewPost(post)}
                   >
                       <img src={post.user?.avatar} className="w-10 h-10 rounded-full bg-gray-200" />
                       <div className="flex-1">
                           <div className="flex justify-between items-start">
                               <div>
                                   <span className="font-bold text-gray-800 text-sm">{post.user?.username}</span>
                                   <span className="text-gray-400 text-xs ml-2">{formatTimeAgo(post.createTime)}</span>
                               </div>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); onDeletePost(post.id); }} 
                                  className="text-gray-400 hover:text-red-500 text-xs flex items-center gap-1 border border-gray-200 px-2 py-1 rounded hover:border-red-200 transition-colors"
                               >
                                   <Trash2 size={12} /> 删除帖子
                               </button>
                           </div>
                           <p className="text-gray-700 text-sm mt-2 line-clamp-2">{post.content}</p>
                           <div className="flex gap-4 mt-2 text-xs text-gray-400">
                               <span>点赞 {post.likeCount}</span>
                               <span>评论 {post.commentCount}</span>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
   );

   return (
      <div className="flex flex-col gap-6 animate-fade-in">
          {/* Main Content Area (Sidebar removed) */}
          <div className="flex-1">
              {tabKey === 'overview' && renderOverview()}
              {tabKey === 'users' && renderUserManagement()}
              {tabKey === 'news' && renderNewsManagement()}
              {tabKey === 'gov' && renderGovManagement()}
              {tabKey === 'community' && renderCommunityManagement()}
          </div>

          {/* Create News Modal */}
          {showNewsModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
                      <h3 className="text-xl font-bold mb-4">发布新闻公告</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                              <input 
                                type="text" 
                                value={newNewsData.title}
                                onChange={e => setNewNewsData({...newNewsData, title: e.target.value})}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="请输入标题"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                              <select 
                                value={newNewsData.category}
                                onChange={e => setNewNewsData({...newNewsData, category: e.target.value as NewsCategory})}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                  <option value="NEWS">新闻</option>
                                  <option value="NOTICE">通知</option>
                                  <option value="POLICY">政策</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                              <textarea 
                                value={newNewsData.content}
                                onChange={e => setNewNewsData({...newNewsData, content: e.target.value})}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                placeholder="请输入详细内容..."
                              ></textarea>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">封面图片</label>
                              <ImageUploader 
                                value={newNewsData.coverImage || ''} 
                                onChange={(val) => setNewNewsData({...newNewsData, coverImage: val})}
                              />
                          </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                          <button onClick={() => setShowNewsModal(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
                          <button onClick={handleCreateNews} className="flex-1 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">发布</button>
                      </div>
                  </div>
              </div>
          )}

          {/* Admin Post Detail Modal */}
          {viewingPost && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setViewingPost(null)}>
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
                      <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl">
                          <h3 className="font-bold text-gray-800">帖子详情管理</h3>
                          <button onClick={() => setViewingPost(null)}><X size={20} className="text-gray-400" /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                          <div className="mb-6">
                              <div className="flex items-center gap-3 mb-3">
                                  <img src={viewingPost.user?.avatar} className="w-10 h-10 rounded-full bg-gray-200" />
                                  <div>
                                      <h4 className="font-bold text-gray-800">{viewingPost.user?.username}</h4>
                                      <p className="text-xs text-gray-400">{formatTimeAgo(viewingPost.createTime)}</p>
                                  </div>
                                  <button onClick={() => handleDeletePostLocal(viewingPost.id)} className="ml-auto text-red-500 hover:bg-red-50 px-3 py-1 rounded text-xs border border-red-100">删除帖子</button>
                              </div>
                              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{viewingPost.content}</p>
                          </div>

                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                              评论列表 <span className="text-sm font-normal text-gray-500">({viewingPostComments.length})</span>
                          </h4>
                          <div className="space-y-3">
                              {viewingPostComments.length === 0 ? (
                                  <p className="text-center text-gray-400 py-4">暂无评论</p>
                              ) : viewingPostComments.map(comment => (
                                  <div key={comment.id} className="flex gap-3 group">
                                      <img src={comment.user?.avatar} className="w-8 h-8 rounded-full bg-gray-200" />
                                      <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none relative">
                                          <div className="flex justify-between items-center mb-1">
                                              <span className="font-bold text-xs text-gray-700">{comment.user?.username}</span>
                                              <span className="text-[10px] text-gray-400">{formatTimeAgo(comment.createTime)}</span>
                                          </div>
                                          <p className="text-sm text-gray-600">{comment.content}</p>
                                          <button 
                                              onClick={() => handleDeleteCommentLocal(comment.id)}
                                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                              title="删除评论"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
   );
}

// --- SUB-PAGE COMPONENT ---

const SubPageView = ({ title, icon: Icon, color, onBack }: any) => (
   <div className="animate-fade-in">
      <div className={`h-32 ${color} rounded-2xl mb-6 flex items-center px-8 relative overflow-hidden shadow-md`}>
          <div className="relative z-10 text-white">
             <h1 className="text-3xl font-bold flex items-center gap-3"><Icon /> {title}</h1>
             <p className="opacity-90 mt-1">连接乡村资源，共创美好生活</p>
          </div>
          <Icon className="absolute right-4 bottom-[-20px] w-48 h-48 text-white opacity-20 rotate-[-10deg]" />
      </div>
      
      <button onClick={onBack} className="mb-4 flex items-center text-gray-500 hover:text-blue-600">
         <ChevronRight className="rotate-180 mr-1" size={16} /> 返回首页
      </button>

      <div className="grid md:grid-cols-3 gap-6">
          {/* Mock Content for Subpages */}
          {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="h-32 bg-gray-100 rounded-lg mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
             </div>
          ))}
          <div className="md:col-span-3 bg-blue-50 p-6 rounded-xl text-center text-blue-700 flex flex-col items-center">
             <Loader2 className="animate-spin mb-2" />
             <p>此模块正在建设中，更多精彩内容敬请期待！</p>
          </div>
      </div>
   </div>
);

// --- PROFILE COMPONENT ---

const ProfileView = ({ currentUser, points, onLogout }: { currentUser: User | null, points: number, onLogout: () => void }) => {
   const role = currentUser?.userType || UserRole.USER;
   
   return (
   <div className="animate-fade-in space-y-6">
       {/* Header Card */}
       <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-6">
             <img src={currentUser?.avatar || `https://picsum.photos/seed/${role}/100/100`} alt="avatar" className="w-24 h-24 rounded-full border-4 border-white/30" />
             <div>
                <h1 className="text-2xl font-bold mb-1">
                    {currentUser?.username || (role === UserRole.ADMIN ? '管理员' : '村民')}
                </h1>
                <p className="text-blue-100 text-sm mb-3 flex items-center gap-2">
                   <span className="bg-blue-800/30 px-2 py-0.5 rounded text-xs border border-white/20 capitalize">
                    {role === UserRole.ADMIN ? '系统管理员' : '认证村民'}
                   </span>
                   <span>ID: {currentUser?.id || (role === UserRole.ADMIN ? '001' : '883721')}</span>
                </p>
                {role !== UserRole.ADMIN && (
                   <div className="flex gap-6">
                      <div>
                         <p className="text-xs opacity-70">我的积分</p>
                         <p className="text-xl font-bold">{points}</p>
                      </div>
                      <div>
                         <p className="text-xs opacity-70">待办事项</p>
                         <p className="text-xl font-bold">2</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
       </div>

       {role !== UserRole.ADMIN && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <SectionHeader title="我的订单" moreLink="orders" />
             <div className="flex justify-between px-2">
                {['待付款', '待发货', '待收货', '退换/售后'].map((item, idx) => (
                   <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 relative">
                         {idx === 0 && <CreditCard size={20} />}
                         {idx === 1 && <Package size={20} />}
                         {idx === 2 && <Truck size={20} />}
                         {idx === 3 && <RotateCcw size={20} />}
                         {idx === 1 && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}
                      </div>
                      <span className="text-xs text-gray-600">{item}</span>
                   </div>
                ))}
             </div>
          </div>
       )}

       {/* Menu List */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           {[
             { icon: MapPin, label: '收货地址', hidden: role === UserRole.ADMIN },
             { icon: Heart, label: '我的收藏', hidden: role === UserRole.ADMIN },
             { icon: MessageCircle, label: '消息通知' },
             { icon: Settings, label: '账户设置' },
             { icon: HelpCircle, label: '帮助与反馈' },
           ].filter(i => !i.hidden).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                 <div className="flex items-center gap-3 text-gray-700">
                    <item.icon size={18} className="text-gray-400" />
                    <span className="text-sm">{item.label}</span>
                 </div>
                 <ChevronRight size={16} className="text-gray-300" />
              </div>
           ))}
       </div>
       
       <button 
          onClick={onLogout}
          className="w-full py-3 text-red-500 bg-white rounded-xl shadow-sm border border-gray-100 font-medium hover:bg-red-50 flex items-center justify-center gap-2"
       >
          <LogOut size={18} /> 退出登录
       </button>
   </div>
)};

// --- APP COMPONENT ---

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [role, setRole] = useState<number>(UserRole.USER);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Data States (loaded from API)
  const [posts, setPosts] = useState<Post[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [applications, setApplications] = useState<GovernmentAffair[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Add users state
  const [isLoadingData, setIsLoadingData] = useState(false);
  // Separate state to track which post's comments are being viewed
  const [activePostComments, setActivePostComments] = useState<Comment[]>([]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{msg: string, type?: 'success'|'info'} | null>(null);
  const [points, setPoints] = useState(1250);
  const [showServiceModal, setShowServiceModal] = useState<{title:string, icon: any} | null>(null);
  const [serviceNote, setServiceNote] = useState(""); 
  const [showNewsModal, setShowNewsModal] = useState<News | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  // BoardId hardcoded for demo
  const [newPostBoardId, setNewPostBoardId] = useState<number>(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null); 
  const [commentInput, setCommentInput] = useState(""); 

  // Product Application State
  const [showProductAppModal, setShowProductAppModal] = useState(false);
  const [productForm, setProductForm] = useState({
      name: '',
      price: '',
      stock: '',
      category: '新鲜水果',
      image: '',
      description: ''
  });
  // Removed isDragging as we use ImageUploader now

  // Initial Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [newsData, productsData, postsData, appsData] = await Promise.all([
          api.news.list(),
          api.market.listProducts(),
          api.community.listPosts(currentUser?.id), // Pass currentUser ID to check likes
          api.gov.listAffairs()
        ]);
        setNews(newsData);
        setProducts(productsData);
        setPosts(postsData);
        setApplications(appsData);

        // Fetch users if admin
        if (role === UserRole.ADMIN) {
           const usersData = await api.auth.listUsers();
           setUsers(usersData);
        }
      } catch (error) {
        console.error("Failed to load initial data", error);
        showToast("数据加载失败，请确保后端服务已启动", 'info');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, role, currentUser]); // Added currentUser dependency

  // Fetch comments when a post is selected
  useEffect(() => {
    if (selectedPostId) {
      api.community.getComments(selectedPostId).then(setActivePostComments).catch(console.error);
    }
  }, [selectedPostId]);


  // Show toast helper
  const showToast = (msg: string, type: 'success'|'info' = 'success') => {
     setToast({ msg, type });
     setTimeout(() => setToast(null), 3000);
  }

  // Login Function
  const handleLogin = (user: User) => {
     setCurrentUser(user);
     const selectedRole = user.userType || UserRole.USER;
     setRole(selectedRole);
     setIsLoggedIn(true);
     if (selectedRole === UserRole.ADMIN) {
        setCurrentView('admin_overview');
     } else {
        setCurrentView('home');
     }
     const roleName = selectedRole === UserRole.ADMIN ? '管理员' : '村民';
     showToast(`欢迎回来，${user.username || roleName}！`);
  };

  const handleLogout = () => {
     api.auth.logout();
     setIsLoggedIn(false);
     setCurrentUser(null);
     setCart([]);
     setCurrentView('home');
     showToast("已成功退出登录", 'info');
  };

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`已将 ${product.name} 加入购物车`);
  };

  const updateQuantity = (id: number, delta: number) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQ = item.quantity + delta;
              return newQ > 0 ? { ...item, quantity: newQ } : item;
          }
          return item;
      }));
  }

  const removeFromCart = (id: number) => {
      setCart(prev => prev.filter(item => item.id !== id));
  }
  
  const handleCheckout = async () => {
      if (cart.length === 0) return;
      setIsCheckingOut(true);
      try {
        await api.market.createOrder(cart.map(i => i.id));
        setCart([]);
        setIsCartOpen(false);
        // Calculate points based on purchase (Mock logic for frontend)
        setPoints(p => p + Math.floor(cart.reduce((sum, i) => sum + i.price * i.quantity, 0)));
        showToast("支付成功！订单已生成。", 'success');
      } catch (e) {
        showToast("支付失败，请重试", 'info');
      } finally {
        setIsCheckingOut(false);
      }
  }

  // Post Functions
  const handlePostSubmit = async () => {
      if (!newPostContent.trim()) return;
      if (!currentUser) return;
      
      try {
        const newPost = await api.community.createPost({
            title: "新动态", // API requires title
            content: newPostContent,
            boardId: newPostBoardId,
            userId: currentUser.id
        });
        setPosts([newPost, ...posts]);
        setNewPostContent("");
        setShowPostModal(false);
        setPoints(p => p + 5); 
        showToast("发布成功！积分 +5");
      } catch (e) {
        showToast("发布失败", 'info');
      }
  }

  const toggleLike = async (id: number) => {
      if (!currentUser) return;
      
      // Optimistic update first to feel instant
      setPosts(prev => prev.map(p => {
          if (p.id === id) {
              const isLiked = !p.isLiked;
              const count = isLiked ? p.likeCount + 1 : Math.max(0, p.likeCount - 1);
              return { ...p, isLiked, likeCount: count };
          }
          return p;
      }));

      // Call API
      try {
          const result = await api.community.like(id, currentUser.id);
          // Sync with server result just in case
          setPosts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, isLiked: result.liked, likeCount: result.count };
            }
            return p;
          }));
      } catch (e) {
          // Revert on failure (simple revert, re-fetch list would be safer)
          console.error("Like failed", e);
          showToast("操作失败", 'info');
      }
  }

  const handleAddComment = async (postId: number) => {
    if (!commentInput.trim()) return;
    if (!currentUser) return;
    
    try {
       const newComment = await api.community.addComment({ postId, content: commentInput, userId: currentUser.id });
       setActivePostComments([newComment, ...activePostComments]);
       
       setPosts(prev => prev.map(p => {
         if (p.id === postId) {
           return {
             ...p,
             commentCount: p.commentCount + 1,
           };
         }
         return p;
       }));
       setCommentInput("");
    } catch (e) {
       showToast("评论失败", 'info');
    }
  };

  // Service Application Functions
  const handleServiceSubmit = async () => {
      if (!showServiceModal) return;
      if (!currentUser) return;
      
      try {
        const newApp = await api.gov.createAffair({
             title: showServiceModal.title,
             description: serviceNote || '无备注',
             type: 'GENERAL', // Simplify for demo
             status: AffairStatus.PENDING,
             userId: currentUser.id
        });

        setApplications([newApp, ...applications]);
        setShowServiceModal(null);
        setServiceNote("");
        showToast("申请提交成功！请在我的待办中查看进度。");
      } catch (e) {
        showToast("申请提交失败", 'info');
      }
  }

  const handleProductAppSubmit = async () => {
      if(!productForm.name || !productForm.price) {
          showToast("请填写完整信息", 'info');
          return;
      }
      if (!currentUser) return;
      
      try {
          // In a real app, description might hold JSON or we'd use a different DTO.
          // For this mock, we serialize product data into description.
          const description = JSON.stringify(productForm);
          const newApp = await api.gov.createAffair({
              title: `商品上架申请: ${productForm.name}`,
              description: description,
              type: 'PRODUCT_LISTING',
              status: AffairStatus.PENDING,
              userId: currentUser.id
          });
          setApplications([newApp, ...applications]);
          setShowProductAppModal(false);
          setProductForm({ name: '', price: '', stock: '', category: '新鲜水果', image: '', description: '' });
          showToast("商品上架申请已提交！");
      } catch (e) {
          showToast("申请提交失败", 'info');
      }
  }

  const handleApproveApp = async (id: number) => {
     await api.gov.updateStatus(id, AffairStatus.APPROVED);
     setApplications(prev => prev.map(app => app.id === id ? { ...app, status: AffairStatus.APPROVED } : app));
     // Refresh products if it was a product listing, as the mock api creates a product on approval
     const app = applications.find(a => a.id === id);
     if (app?.type === 'PRODUCT_LISTING') {
         const newProducts = await api.market.listProducts();
         setProducts(newProducts);
         showToast("已批准上架，商品已添加至集市");
     } else {
         showToast("已通过该申请");
     }
  }

  const handleRejectApp = async (id: number) => {
     await api.gov.updateStatus(id, AffairStatus.REJECTED);
     setApplications(prev => prev.map(app => app.id === id ? { ...app, status: AffairStatus.REJECTED } : app));
     showToast("已驳回该申请", 'info');
  }

  // --- Admin Handlers ---
  const handleDeleteUser = async (id: number) => {
      if(window.confirm("确定要删除该用户吗？")) {
          await api.auth.deleteUser(id);
          setUsers(prev => prev.filter(u => u.id !== id));
          showToast("用户已删除");
      }
  }

  const handleCreateNews = async (newsData: Partial<News>) => {
      const newNews = await api.news.create(newsData);
      setNews(prev => [newNews, ...prev]);
      showToast("新闻发布成功");
  }

  const handleDeleteNews = async (id: number) => {
      if(window.confirm("确定要删除这条新闻吗？")) {
          await api.news.delete(id);
          setNews(prev => prev.filter(n => n.id !== id));
          showToast("新闻已删除");
      }
  }

  const handleDeletePost = async (id: number) => {
      if(window.confirm("确定要删除这条帖子吗？")) {
          await api.community.deletePost(id);
          setPosts(prev => prev.filter(p => p.id !== id));
          showToast("帖子已删除");
      }
  }

  const handleDeleteComment = async (id: number) => {
      await api.community.deleteComment(id);
      // Update comments list if viewing this post
      if (selectedPostId && activePostComments.some(c => c.id === id)) {
           setActivePostComments(prev => prev.filter(c => c.id !== id));
      }
      showToast("评论已删除");
  }


  // --- VIEWS ---

  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatCard icon={Wallet} label="我的资产" value="¥ 12,450" color="bg-orange-500" />
         <StatCard icon={Award} label="乡村积分" value={points} color="bg-blue-500" />
         <StatCard icon={Users} label="村友互动" value="128" color="bg-purple-500" />
         <StatCard icon={FileText} label="待办事项" value={applications.filter(a => a.status === 'PENDING').length} color="bg-green-500" />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         {[
           { id: 'tourism', label: '乡村旅游', icon: Camera, color: 'text-green-600 bg-green-50' },
           { id: 'health', label: '医疗健康', icon: HeartPulse, color: 'text-red-600 bg-red-50' },
           { id: 'education', label: '在线教育', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
           { id: 'finance', label: '普惠金融', icon: Wallet, color: 'text-yellow-600 bg-yellow-50' },
         ].map((item) => (
            <button 
               key={item.id} 
               onClick={() => setCurrentView(item.id)}
               className="flex flex-col items-center justify-center gap-2 p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
               <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon size={24} />
               </div>
               <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </button>
         ))}
      </div>

      {/* News Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <SectionHeader title="最新资讯" moreLink="news" onClickMore={() => setCurrentView('news')} />
        <div className="space-y-4">
          {isLoadingData ? (
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex gap-4 p-3">
                   <div className="w-24 h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                   <div className="flex-1 space-y-2">
                     <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                     <div className="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
                   </div>
                 </div>
               ))}
             </div>
          ) : news.slice(0, 3).map(item => (
            <div key={item.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={() => setShowNewsModal(item)}>
              {item.coverImage && <img src={item.coverImage} alt={item.title} className="w-24 h-16 object-cover rounded-lg" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded border text-blue-600 border-blue-200 bg-blue-50">{item.category}</span>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                </div>
                <div className="text-xs text-gray-500 line-clamp-2 mb-1" dangerouslySetInnerHTML={{__html: item.content.substring(0, 50) + "..."}} />
                <span className="text-[10px] text-gray-400">{formatDate(item.publishTime)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGov = () => {
    // Hardcoded service list for UI presentation, as the API only returns applications
    const serviceGuides = [
        { title: '社保缴纳', icon: CreditCard },
        { title: '医疗报销', icon: Activity },
        { title: '农田补贴', icon: Sun },
        { title: '宅基地申请', icon: MapPin },
        { title: '证明开具', icon: FileText },
        { title: '法律咨询', icon: HelpCircle },
    ];

    return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold mb-1">政务大厅</h2>
             <p className="text-blue-100 text-sm">让数据多跑路，让群众少跑腿</p>
          </div>
          <Building2 className="text-blue-400 w-16 h-16 opacity-50" />
       </div>

       {role !== UserRole.ADMIN && (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {/* All villagers are farmers, so they can access product listing */}
             <div 
               className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-all cursor-pointer"
               onClick={() => setShowProductAppModal(true)}
             >
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                   <ShoppingBag size={24} />
                </div>
                <span className="font-medium text-gray-800">农产品上架</span>
             </div>

            {serviceGuides.map((service, idx) => (
               <div 
                  key={idx} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setShowServiceModal(service)}
               >
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                     <service.icon size={24} />
                  </div>
                  <span className="font-medium text-gray-800">{service.title}</span>
               </div>
            ))}
         </div>
       )}

       {role === UserRole.ADMIN ? (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center py-12">
            <ClipboardCheck size={48} className="mx-auto text-blue-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">服务审批管理</h3>
            <p className="text-gray-400 mb-6">请前往管理后台处理村民的政务申请。</p>
            <button 
               onClick={() => setCurrentView('admin_gov')}
               className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
               前往管理后台
            </button>
         </div>
       ) : (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <SectionHeader title="我的待办" />
            <div className="space-y-3">
               {applications.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">暂无申请记录</p>
               ) : (
                 applications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                       <div>
                          <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(item.createTime)} · {item.type === 'PRODUCT_LISTING' ? '商品审核' : '常规服务'}</p>
                       </div>
                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                          item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                          'bg-red-100 text-red-700'
                       }`}>
                          {item.status === 'PENDING' ? '审核中' : item.status === 'APPROVED' ? '已通过' : '已驳回'}
                       </span>
                    </div>
                 ))
               )}
            </div>
         </div>
       )}
    </div>
  )};

  const renderMarket = () => {
    const categories = ['All', '新鲜水果', '新鲜蔬菜', '肉禽蛋奶', '粮油副食', '手工艺品'];
    const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

    return (
    <div className="space-y-4 animate-fade-in pb-20 md:pb-0">
       <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 sticky top-0 bg-gray-50 z-10 py-2">
          {categories.map(cat => (
             <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                   activeCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
                }`}
             >
                {cat === 'All' ? '全部' : cat}
             </button>
          ))}
       </div>

       {isLoadingData ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-64 animate-pulse"></div>
             ))}
           </div>
       ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="relative h-32 w-full">
                    <img src={product.coverImage || 'https://via.placeholder.com/200'} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-600">
                        库存: {product.stock}
                    </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.user?.username || '未知农户'}</p>
                    <div className="mt-auto flex items-center justify-between">
                        <span className="text-red-500 font-bold text-lg">¥{product.price}</span>
                        <button 
                            onClick={() => addToCart(product)}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 active:scale-90 transition-all"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    </div>
                </div>
            ))}
        </div>
       )}
       
       {/* Floating Cart Button */}
       <button 
         onClick={() => setIsCartOpen(true)}
         className="fixed bottom-24 right-4 md:bottom-8 md:right-24 bg-gray-900 text-white px-4 py-3 rounded-full shadow-xl z-30 flex items-center gap-2 hover:scale-105 transition-transform"
       >
          <div className="relative">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
          </div>
          <span className="font-bold pr-1">¥{cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</span>
       </button>
    </div>
  )};

  const renderCommunity = () => (
    <div className="space-y-4 animate-fade-in">
       <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex gap-4">
             <button 
                onClick={() => setActiveCategory('All')} 
                className={`font-bold text-lg relative ${activeCategory !== 'Trade' ? 'text-gray-800' : 'text-gray-400'}`}
             >
                全部动态
                {activeCategory !== 'Trade' && <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400 rounded-full"></span>}
             </button>
             {/* Note: Backend API filtering by category (Trade/General) depends on Board ID logic which we simulate here */}
             <button 
                onClick={() => setActiveCategory('Trade')} 
                className={`font-bold text-lg relative ${activeCategory === 'Trade' ? 'text-gray-800' : 'text-gray-400'}`}
             >
                二手交易
                {activeCategory === 'Trade' && <span className="absolute -bottom-1 left-0 w-full h-1 bg-yellow-400 rounded-full"></span>}
             </button>
          </div>
          <button 
             onClick={() => setShowPostModal(true)}
             className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
             <Plus size={16} /> 发布
          </button>
       </div>

       <div className="space-y-4">
          {isLoadingData ? [1,2,3].map(i => (
              <div key={i} className="bg-white p-5 rounded-2xl h-40 animate-pulse"></div>
          )) : posts.map(post => (
             <div 
               key={post.id} 
               onClick={() => setSelectedPostId(post.id)}
               className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
             >
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <img src={post.user?.avatar || `https://picsum.photos/seed/${post.userId}/40/40`} alt="avatar" />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm text-gray-800">{post.user?.username || '匿名用户'}</h4>
                      <p className="text-[10px] text-gray-400">{formatTimeAgo(post.createTime)}</p>
                   </div>
                </div>
                <div className="text-gray-700 text-sm leading-relaxed mb-4" dangerouslySetInnerHTML={{__html: post.content}} />
                <div className="flex items-center gap-6 border-t border-gray-50 pt-3">
                   <button 
                     onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }} 
                     className={`flex items-center gap-1 text-xs transition-colors ${post.isLiked ? "text-red-500 font-bold" : "text-gray-500 hover:text-red-500"}`}
                   >
                      <Heart size={16} className={post.isLiked ? "fill-red-500 text-red-500" : ""} /> {post.likeCount || '点赞'}
                   </button>
                   <button className="flex items-center gap-1 text-gray-500 text-xs hover:text-blue-500 transition-colors">
                      <MessageCircle size={16} /> {post.commentCount || '评论'}
                   </button>
                   <button className="flex items-center gap-1 text-gray-500 text-xs ml-auto">
                      <Share2 size={16} /> 分享
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <AdminDashboard 
        users={users}
        news={news}
        posts={posts}
        applications={applications} 
        activeTab={currentView} // Pass the full current view string (e.g., 'admin_overview')
        onApproveAffair={handleApproveApp} 
        onRejectAffair={handleRejectApp}
        onDeleteUser={handleDeleteUser}
        onCreateNews={handleCreateNews}
        onDeleteNews={handleDeleteNews}
        onDeletePost={handleDeletePost}
        onDeleteComment={handleDeleteComment}
    />
  );

  const renderView = () => {
    switch(currentView) {
      case 'home': return renderHome();
      case 'gov': return renderGov();
      case 'market': return renderMarket();
      case 'community': return renderCommunity();
      case 'profile': return <ProfileView currentUser={currentUser} points={points} onLogout={handleLogout} />;
      case 'tourism': return <SubPageView title="乡村旅游" icon={Camera} color="bg-green-500" onBack={() => setCurrentView('home')} />;
      case 'health': return <SubPageView title="医疗健康" icon={HeartPulse} color="bg-red-500" onBack={() => setCurrentView('home')} />;
      case 'education': return <SubPageView title="在线教育" icon={GraduationCap} color="bg-blue-500" onBack={() => setCurrentView('home')} />;
      case 'finance': return <SubPageView title="普惠金融" icon={Wallet} color="bg-yellow-500" onBack={() => setCurrentView('home')} />;
      case 'news': return (
         <div className="space-y-4 animate-fade-in">
             <button onClick={() => setCurrentView('home')} className="mb-2 flex items-center text-gray-500 hover:text-blue-600"><ChevronRight className="rotate-180 mr-1" size={16} /> 返回</button>
             {news.map(item => (
                <div key={item.id} onClick={() => setShowNewsModal(item)} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 cursor-pointer hover:bg-gray-50">
                   {item.coverImage && <img src={item.coverImage} className="w-24 h-24 rounded-xl object-cover" />}
                   <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                      <div className="text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{__html: item.content.substring(0, 60)}} />
                      <div className="mt-2 flex gap-2">
                         <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.category}</span>
                         <span className="text-xs text-gray-400">{formatDate(item.publishTime)}</span>
                      </div>
                   </div>
                </div>
             ))}
         </div>
      );
      // Admin Views
      case 'admin_overview':
      case 'admin_users':
      case 'admin_news':
      case 'admin_gov':
      case 'admin_community':
          return renderAdminDashboard();
      default: return renderHome();
    }
  };

  const selectedPost = posts.find(p => p.id === selectedPostId);

  if (!isLoggedIn) {
     return (
        <>
           {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
           <LoginScreen onLogin={handleLogin} />
        </>
     );
  }

  return (
    <Layout 
      currentView={currentView} 
      role={role} 
      onNavigate={setCurrentView}
      onPublish={() => setShowPostModal(true)}
    >
      
      {renderView()}

      <AIAssistant currentContext={currentView} onNavigate={setCurrentView} />

      {/* --- MODALS --- */}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsCartOpen(false)}
        >
           <div 
              className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col animate-slide-left"
              onClick={(e) => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> 购物车</h2>
                 <button onClick={() => setIsCartOpen(false)}><X className="text-gray-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4">
                 {cart.length === 0 ? (
                    <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
                       <ShoppingCart size={48} className="mb-4 opacity-20" />
                       <p>购物车是空的</p>
                    </div>
                 ) : (
                    cart.map(item => (
                       <div key={item.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl">
                          <img src={item.coverImage || 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-lg object-cover bg-white" />
                          <div className="flex-1">
                             <h4 className="font-bold text-sm">{item.name}</h4>
                             <p className="text-red-500 font-bold">¥{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white rounded-full px-2 py-1 border border-gray-200">
                             <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500">-</button>
                             <span className="text-sm font-bold">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-blue-600">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                       </div>
                    ))
                 )}
              </div>
              {cart.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                     <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-500">总计</span>
                        <span className="text-2xl font-bold text-red-600">¥{cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</span>
                     </div>
                     <button 
                        onClick={handleCheckout} 
                        disabled={isCheckingOut}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                     >
                        {isCheckingOut ? <Loader2 className="animate-spin" /> : '立即结算'}
                     </button>
                  </div>
              )}
           </div>
        </div>
      )}

      {/* News Modal */}
      {showNewsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowNewsModal(null)}
         >
           <div 
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 relative animate-scale-in"
              onClick={(e) => e.stopPropagation()}
           >
              <button onClick={() => setShowNewsModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></button>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{showNewsModal.title}</h1>
              <div className="flex gap-3 text-sm text-gray-500 mb-6 pb-4 border-b">
                 <span>{formatDate(showNewsModal.publishTime)}</span>
                 <span className="text-blue-600">#{showNewsModal.category}</span>
              </div>
              {showNewsModal.coverImage && <img src={showNewsModal.coverImage} className="w-full h-64 object-cover rounded-xl mb-6" />}
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                 <div dangerouslySetInnerHTML={{__html: showNewsModal.content}} />
              </div>
           </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
         <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowServiceModal(null)}
         >
            <div 
               className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in"
               onClick={(e) => e.stopPropagation()}
            >
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><showServiceModal.icon size={24} /></div>
                  <h3 className="text-xl font-bold">{showServiceModal.title}申请</h3>
               </div>
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">申请人姓名</label>
                     <input type="text" value={role === UserRole.ADMIN ? '管理员' : '我'} readOnly className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">备注信息</label>
                     <textarea 
                        value={serviceNote}
                        onChange={(e) => setServiceNote(e.target.value)}
                        placeholder="请输入您的具体需求..." 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                     ></textarea>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setShowServiceModal(null)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200">取消</button>
                  <button onClick={handleServiceSubmit} className="flex-1 py-3 text-white bg-blue-600 rounded-xl font-medium hover:bg-blue-700">确认提交</button>
               </div>
            </div>
         </div>
      )}

      {/* Product Application Modal */}
      {showProductAppModal && (
         <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowProductAppModal(false)}
         >
            <div 
               className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
            >
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><ShoppingBag size={24} /></div>
                  <h3 className="text-xl font-bold">农产品上架申请</h3>
               </div>
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">商品名称</label>
                     <input 
                        type="text" 
                        value={productForm.name} 
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        placeholder="例如：红富士苹果"
                        className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">价格 (元)</label>
                         <input 
                            type="number" 
                            value={productForm.price} 
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            placeholder="0.00"
                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" 
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">库存</label>
                         <input 
                            type="number" 
                            value={productForm.stock} 
                            onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                            placeholder="1"
                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none" 
                         />
                      </div>
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                     <select 
                        value={productForm.category} 
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
                     >
                        {['新鲜水果', '新鲜蔬菜', '肉禽蛋奶', '粮油副食', '手工艺品'].map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">商品图片</label>
                    <ImageUploader 
                        value={productForm.image} 
                        onChange={(val) => setProductForm({...productForm, image: val})} 
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                     <textarea 
                        value={productForm.description}
                        onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                        placeholder="简单描述一下您的商品..." 
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none h-24"
                     ></textarea>
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => setShowProductAppModal(false)} className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200">取消</button>
                  <button onClick={handleProductAppSubmit} className="flex-1 py-3 text-white bg-purple-600 rounded-xl font-medium hover:bg-purple-700">提交审核</button>
               </div>
            </div>
         </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
         <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowPostModal(false)}
         >
            <div 
               className="bg-white rounded-2xl w-full max-w-lg p-6 animate-scale-in"
               onClick={(e) => e.stopPropagation()}
            >
               <h3 className="text-xl font-bold mb-4">发布动态</h3>
               <div className="flex gap-2 mb-4">
                  <button onClick={() => setNewPostBoardId(1)} className={`px-4 py-2 rounded-full text-sm font-medium ${newPostBoardId === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>生活分享</button>
                  <button onClick={() => setNewPostBoardId(2)} className={`px-4 py-2 rounded-full text-sm font-medium ${newPostBoardId === 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>二手交易</button>
               </div>
               <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="分享新鲜事..." 
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-32 mb-4 resize-none"
               ></textarea>
               <div className="flex justify-end gap-3">
                  <button onClick={() => setShowPostModal(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                  <button onClick={handlePostSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">发布</button>
               </div>
            </div>
         </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
         <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedPostId(null)}
         >
            <div 
               className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col relative animate-scale-in"
               onClick={(e) => e.stopPropagation()}
            >
               
               {/* Header */}
               <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl z-10">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        <img src={selectedPost.user?.avatar || `https://picsum.photos/seed/${selectedPost.userId}/40/40`} alt="avatar" />
                     </div>
                     <div>
                        <h4 className="font-bold text-sm text-gray-800">{selectedPost.user?.username || '匿名用户'}</h4>
                        <p className="text-[10px] text-gray-400">{formatTimeAgo(selectedPost.createTime)}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedPostId(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                     <X size={20} />
                  </button>
               </div>

               {/* Content - Scrollable Area */}
               <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                  <div className="text-gray-800 text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{__html: selectedPost.content}} />
                  
                  {/* Actions */}
                  <div className="flex items-center gap-6 border-y border-gray-100 py-3 mb-6">
                     <button 
                        onClick={() => toggleLike(selectedPost.id)} 
                        className={`flex items-center gap-1.5 text-sm transition-colors ${selectedPost.isLiked ? "text-red-500 font-bold" : "text-gray-500 hover:text-red-500"}`}
                     >
                        <Heart size={20} className={selectedPost.isLiked ? "fill-red-500" : ""} /> {selectedPost.likeCount || '点赞'}
                     </button>
                     <button className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <MessageCircle size={20} /> {selectedPost.commentCount || '评论'}
                     </button>
                     <button className="flex items-center gap-1.5 text-gray-500 text-sm ml-auto">
                        <Share2 size={20} /> 分享
                     </button>
                  </div>

                  {/* Comments List */}
                  <h3 className="font-bold text-gray-800 mb-4">全部评论 ({selectedPost.commentCount})</h3>
                  <div className="space-y-4 pb-4">
                     {activePostComments && activePostComments.length > 0 ? (
                        activePostComments.map(comment => (
                           <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                 <img src={comment.user?.avatar || `https://picsum.photos/seed/${comment.userId}/32/32`} alt="avatar" />
                              </div>
                              <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                                 <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-xs text-gray-700">{comment.user?.username || '未知用户'}</span>
                                    <span className="text-[10px] text-gray-400">{formatTimeAgo(comment.createTime)}</span>
                                 </div>
                                 <p className="text-sm text-gray-600">{comment.content}</p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-center text-gray-400 text-sm py-4">暂无评论，快来抢沙发吧~</p>
                     )}
                  </div>
               </div>

               {/* Footer Input */}
               <div className="p-4 border-t bg-white rounded-b-2xl">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                     <input 
                        type="text" 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="写下你的评论..." 
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost.id)}
                     />
                     <button 
                        onClick={() => handleAddComment(selectedPost.id)}
                        disabled={!commentInput.trim()}
                        className={`p-1.5 rounded-full transition-colors ${commentInput.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                     >
                        <Send size={16} />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </Layout>
  );
};

export default App;
