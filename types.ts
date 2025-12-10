
// 统一响应结构
export interface Result<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 枚举定义
export enum UserRole {
  ADMIN = 0, // 管理员
  USER = 1   // 普通用户/村民/农户
}

export enum NewsCategory {
  NOTICE = 'NOTICE',
  NEWS = 'NEWS',
  POLICY = 'POLICY'
}

export enum AffairStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// 实体定义

export interface User {
  id: number;
  username: string;
  phone?: string;
  avatar?: string;
  userType?: number;
  createTime?: string;
  token?: string; // 登录后返回
}

export interface News {
  id: number;
  title: string;
  content: string;
  coverImage?: string; // 原 imageUrl
  category: NewsCategory;
  status?: number;
  isTop?: number;
  publishTime: string; // ISO String
  createTime?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  userId: number; // 卖家ID
  stock: number;
  coverImage: string; // 原 image
  category: string;
  status?: string; // UNAUDITED, ACTIVE, etc.
  description?: string;
  // 扩展字段，用于前端显示卖家信息，后端需在DTO中填充
  user?: User; 
}

export interface ServiceGuide {
  id: number;
  title: string;
  iconName: string; // 存储图标名称，如 "CreditCard"
}

export interface GovernmentAffair {
  id: number;
  userId: number;
  title: string; // 原 serviceName
  description: string; // 原 note
  amount?: number;
  deadline?: string;
  type: string;
  status: AffairStatus;
  createTime: string;
  user?: User;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  parentId?: number;
  content: string;
  likeCount: number;
  status?: number;
  createTime: string;
  user?: User; // 包含评论者信息
  parentComment?: Comment;
}

export interface Post {
  id: number;
  userId: number;
  boardId: number;
  title?: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  status?: number;
  createTime: string;
  updateTime?: string;
  user?: User; // 发帖人信息
  board?: any;
  isLiked?: boolean; // 当前用户是否点赞
}

export interface CartItem extends Product {
  quantity: number;
}
