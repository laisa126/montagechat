// Navigation Node Types
export type ScreenType = 
  | 'feed'
  | 'profile'
  | 'post-detail'
  | 'reel-viewer'
  | 'comment-thread'
  | 'notifications'
  | 'notification-detail'
  | 'dm-thread'
  | 'search'
  | 'search-results'
  | 'create-post'
  | 'create-story'
  | 'settings'
  | 'edit-profile'
  | 'chat-list'
  | 'audio-page'
  | 'hashtag-page'
  | 'follow-list'
  | 'follow-requests';

export interface NavigationState {
  scrollPosition?: number;
  selectedTab?: string;
  mediaPosition?: number;
  filters?: Record<string, unknown>;
}

export interface NavigationNode {
  id: string;
  screen: ScreenType;
  params?: Record<string, unknown>;
  state?: NavigationState;
  originTab?: 'home' | 'chat' | 'reels' | 'account';
  timestamp: number;
}

export interface NavigationEdge {
  from: string; // node id
  to: string; // node id
  interaction: 'tap' | 'swipe' | 'long-press' | 'back';
}

export interface GraphNavigationState {
  nodes: Map<string, NavigationNode>;
  history: NavigationNode[];
  currentNode: NavigationNode | null;
}
