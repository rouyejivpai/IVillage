import { User, News, Product, Post, Comment, GovernmentAffair, UserRole, NewsCategory, AffairStatus } from '../types';

// Mock Data
let mockUsers: User[] = [
  { id: 1, username: 'admin', userType: UserRole.ADMIN, createTime: '2023-01-01T00:00:00Z', avatar: 'https://i.pravatar.cc/150?u=admin' },
  { id: 2, username: 'villager1', userType: UserRole.USER, phone: '13800138000', createTime: '2023-02-01T00:00:00Z', avatar: 'https://i.pravatar.cc/150?u=user1' },
];

let mockNews: News[] = [
  { id: 1, title: "关于开展2025年春季农田水利建设的通知", content: "全村各组需在5月30日前完成水渠清理工作。", category: NewsCategory.NOTICE, publishTime: "2025-05-20T10:00:00Z", coverImage: "https://picsum.photos/seed/water/300/150" },
  { id: 2, title: "我村特色苹果入选“省级名优产品”", content: "在省农业厅举办的评选活动中，我村红富士苹果荣获金奖。", category: NewsCategory.NEWS, publishTime: "2025-05-18T09:00:00Z", coverImage: "https://picsum.photos/seed/apple/300/150" },
  { id: 3, title: "2025年新型农村合作医疗缴费政策解读", content: "今年新农合政策有三大变化，报销比例提升至70%。", category: NewsCategory.POLICY, publishTime: "2025-05-15T14:30:00Z", coverImage: "https://picsum.photos/seed/med/300/150" },
];

let mockProducts: Product[] = [
  { id: 1, name: "高山有机红富士", price: 68, userId: 2, stock: 100, category: "新鲜水果", coverImage: "https://picsum.photos/seed/apple/200/200", user: mockUsers[1] },
  { id: 2, name: "农家自制腊肉", price: 45, userId: 2, stock: 50, category: "肉禽蛋奶", coverImage: "https://picsum.photos/seed/meat/200/200", user: mockUsers[1] },
];

// Track likes: { userId, postId }
let mockLikes: { userId: number, postId: number }[] = [
    { userId: 1, postId: 1 } // Admin liked post 1 initially
];

let mockPosts: Post[] = [
  { id: 1, userId: 1, boardId: 1, content: "今天的村民大会讨论了修路的问题，大家都很积极。", viewCount: 100, likeCount: 1, commentCount: 0, createTime: "2025-05-21T08:00:00Z", user: mockUsers[0] },
  { id: 2, userId: 2, boardId: 2, content: "【出售】自家种的南瓜，吃不完了，谁要？", viewCount: 50, likeCount: 0, commentCount: 1, createTime: "2025-05-21T10:00:00Z", user: mockUsers[1] },
];

let mockComments: Comment[] = [
    { id: 1, postId: 2, userId: 1, content: "我要两个！", likeCount: 0, createTime: "2025-05-21T10:30:00Z", user: mockUsers[0] }
];

let mockAffairs: GovernmentAffair[] = [
    { id: 101, userId: 2, title: "2024年秋季农机补贴申请", description: "购买了拖拉机一台", type: "GENERAL", status: AffairStatus.PENDING, createTime: "2024-10-12T00:00:00Z", user: mockUsers[1] },
];

const delay = <T>(ms: number, value: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(value), ms));

export const api = {
  auth: {
    login: async (username: string, password: string, role: number): Promise<User> => {
      await delay(500, null);
      
      // Check hardcoded admin first (legacy)
      if (username === 'admin' && password === '123456') {
          return { ...mockUsers[0], token: 'mock-token-admin' };
      }

      // Find existing user
      const user = mockUsers.find(u => u.username === username);
      if (user) {
          return { ...user, token: 'mock-token' };
      }
      
      // Auto-register for demo purposes (allows any username to log in)
      if (username) {
           const newUser: User = {
               id: Math.floor(Math.random() * 10000) + 100, // Avoid ID collision
               username, 
               userType: role, // Create user with the requested role (Admin/User)
               createTime: new Date().toISOString(),
               avatar: `https://i.pravatar.cc/150?u=${username}`,
               token: `mock-token-${Date.now()}`
           };
           mockUsers.push(newUser);
           return newUser;
      }
      
      throw new Error("Invalid credentials");
    },
    register: async (data: any): Promise<void> => {
        await delay(500, null);
        const newUser: User = {
            id: mockUsers.length + 1,
            username: data.username,
            phone: data.phone,
            userType: UserRole.USER,
            createTime: new Date().toISOString(),
            avatar: `https://i.pravatar.cc/150?u=${data.username}`
        };
        mockUsers.push(newUser);
    },
    logout: async () => {
        await delay(200, null);
    },
    listUsers: async (): Promise<User[]> => {
        await delay(300, null);
        return mockUsers;
    },
    deleteUser: async (id: number): Promise<void> => {
        await delay(300, null);
        mockUsers = mockUsers.filter(u => u.id !== id);
    }
  },
  news: {
    list: async (): Promise<News[]> => {
      await delay(300, null);
      return mockNews;
    },
    create: async (data: Partial<News>): Promise<News> => {
        await delay(300, null);
        const newNews: News = {
            id: Date.now(),
            title: data.title!,
            content: data.content!,
            category: data.category || NewsCategory.NEWS,
            publishTime: new Date().toISOString(),
            coverImage: data.coverImage,
            status: 1,
            createTime: new Date().toISOString()
        } as News;
        mockNews.unshift(newNews);
        return newNews;
    },
    delete: async (id: number): Promise<void> => {
        await delay(300, null);
        mockNews = mockNews.filter(n => n.id !== id);
    }
  },
  market: {
    listProducts: async (): Promise<Product[]> => {
      await delay(300, null);
      return mockProducts;
    },
    createOrder: async (productIds: number[]): Promise<void> => {
        await delay(1000, null);
        mockProducts = mockProducts.map(p => {
            if (productIds.includes(p.id)) {
                return { ...p, stock: Math.max(0, p.stock - 1) };
            }
            return p;
        });
    }
  },
  community: {
    listPosts: async (currentUserId?: number): Promise<Post[]> => {
      await delay(300, null);
      return mockPosts.map(p => {
          // Dynamically calculate comment count to ensure it is correct
          const commentCount = mockComments.filter(c => c.postId === p.id).length;
          // Check if the current user has liked this post
          const isLiked = currentUserId ? mockLikes.some(l => l.userId === currentUserId && l.postId === p.id) : false;
          
          return { ...p, commentCount, isLiked, likeCount: mockPosts.find(mp => mp.id === p.id)?.likeCount || 0 };
      });
    },
    getComments: async (postId: number): Promise<Comment[]> => {
        await delay(300, null);
        return mockComments.filter(c => c.postId === postId);
    },
    createPost: async (data: any): Promise<Post> => {
        await delay(500, null);
        const userId = data.userId || 2; // Default fallback
        const user = mockUsers.find(u => u.id === userId) || mockUsers[1];
        
        const newPost: Post = {
            id: Date.now(),
            userId: userId,
            boardId: data.boardId,
            title: data.title || '新动态',
            content: data.content,
            viewCount: 0,
            likeCount: 0,
            commentCount: 0,
            createTime: new Date().toISOString(),
            user: user
        };
        mockPosts.unshift(newPost);
        return newPost;
    },
    like: async (postId: number, userId: number): Promise<{ success: boolean, liked: boolean, count: number }> => {
        await delay(200, null);
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) throw new Error("Post not found");

        const existingLikeIndex = mockLikes.findIndex(l => l.userId === userId && l.postId === postId);
        let liked = false;
        let count = mockPosts[postIndex].likeCount;

        if (existingLikeIndex > -1) {
            // User already liked, so unlike it
            mockLikes.splice(existingLikeIndex, 1);
            count = Math.max(0, count - 1);
            liked = false;
        } else {
            // User hasn't liked, so like it
            mockLikes.push({ userId, postId });
            count++;
            liked = true;
        }
        
        mockPosts[postIndex].likeCount = count;
        return { success: true, liked, count };
    },
    addComment: async (data: { postId: number, content: string, userId?: number }): Promise<Comment> => {
        await delay(300, null);
        const userId = data.userId || 2;
        const user = mockUsers.find(u => u.id === userId) || mockUsers[1];

        const newComment: Comment = {
            id: Date.now(),
            postId: data.postId,
            userId: userId,
            content: data.content,
            likeCount: 0,
            createTime: new Date().toISOString(),
            user: user
        };
        mockComments.unshift(newComment);
        // We calculate counts dynamically in listPosts, so no need to increment post.commentCount manually
        // but for consistency in the mock object:
        const post = mockPosts.find(p => p.id === data.postId);
        if (post) post.commentCount++;
        
        return newComment;
    },
    deletePost: async (id: number): Promise<void> => {
      await delay(300, null);
      mockPosts = mockPosts.filter(p => p.id !== id);
      mockComments = mockComments.filter(c => c.postId !== id);
      mockLikes = mockLikes.filter(l => l.postId !== id);
    },
    deleteComment: async (id: number): Promise<void> => {
        await delay(300, null);
        const comment = mockComments.find(c => c.id === id);
        if(comment) {
            const post = mockPosts.find(p => p.id === comment.postId);
            if(post) post.commentCount = Math.max(0, post.commentCount - 1);
        }
        mockComments = mockComments.filter(c => c.id !== id);
    },
  },
  gov: {
    listAffairs: async (): Promise<GovernmentAffair[]> => {
        await delay(300, null);
        return mockAffairs;
    },
    createAffair: async (data: any): Promise<GovernmentAffair> => {
        await delay(500, null);
        const userId = data.userId || 2;
        const user = mockUsers.find(u => u.id === userId) || mockUsers[1];

        const newAffair: GovernmentAffair = {
            id: Date.now(),
            userId: userId,
            title: data.title,
            description: data.description,
            type: data.type,
            status: data.status,
            createTime: new Date().toISOString(),
            user: user
        };
        mockAffairs.unshift(newAffair);
        return newAffair;
    },
    updateStatus: async (id: number, status: AffairStatus): Promise<void> => {
        await delay(300, null);
        const affair = mockAffairs.find(a => a.id === id);
        if (affair) {
            affair.status = status;
            if (status === AffairStatus.APPROVED && affair.type === 'PRODUCT_LISTING') {
                try {
                    const productData = JSON.parse(affair.description);
                    mockProducts.push({
                        id: Date.now(),
                        name: productData.name,
                        price: parseFloat(productData.price),
                        stock: parseInt(productData.stock),
                        category: productData.category,
                        coverImage: productData.image,
                        userId: affair.userId,
                        user: affair.user
                    });
                } catch (e) {
                    console.error("Failed to create product from affair", e);
                }
            }
        }
    }
  }
};
