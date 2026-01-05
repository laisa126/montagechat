import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ScreenType, NavigationNode, NavigationState, GraphNavigationState } from './types';

interface NavigationContextValue {
  currentNode: NavigationNode | null;
  history: NavigationNode[];
  navigate: (screen: ScreenType, params?: Record<string, unknown>, state?: NavigationState) => void;
  goBack: () => boolean;
  updateState: (state: Partial<NavigationState>) => void;
  canGoBack: boolean;
  getNodeState: (nodeId: string) => NavigationState | undefined;
  clearHistory: () => void;
  originTab: 'home' | 'chat' | 'reels' | 'account';
  setOriginTab: (tab: 'home' | 'chat' | 'reels' | 'account') => void;
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
  initialTab?: 'home' | 'chat' | 'reels' | 'account';
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialTab = 'home' 
}) => {
  const [state, setState] = useState<GraphNavigationState>({
    nodes: new Map(),
    history: [],
    currentNode: null
  });
  const [originTab, setOriginTab] = useState<'home' | 'chat' | 'reels' | 'account'>(initialTab);
  const [hideBottomNav, setHideBottomNav] = useState(false);
  const nodeIdCounter = useRef(0);

  const generateNodeId = useCallback((screen: ScreenType) => {
    nodeIdCounter.current += 1;
    return `${screen}-${Date.now()}-${nodeIdCounter.current}`;
  }, []);

  const navigate = useCallback((
    screen: ScreenType, 
    params?: Record<string, unknown>,
    initialState?: NavigationState
  ) => {
    const nodeId = generateNodeId(screen);
    const newNode: NavigationNode = {
      id: nodeId,
      screen,
      params,
      state: initialState,
      originTab,
      timestamp: Date.now()
    };

    setState(prev => {
      const nodes = new Map(prev.nodes);
      nodes.set(nodeId, newNode);
      
      // Save current node's state before navigating
      if (prev.currentNode) {
        const currentNodeState = nodes.get(prev.currentNode.id);
        if (currentNodeState) {
          nodes.set(prev.currentNode.id, currentNodeState);
        }
      }

      return {
        nodes,
        history: prev.currentNode 
          ? [...prev.history, prev.currentNode]
          : prev.history,
        currentNode: newNode
      };
    });
  }, [generateNodeId, originTab]);

  const goBack = useCallback((): boolean => {
    if (state.history.length === 0) {
      return false;
    }

    setState(prev => {
      const history = [...prev.history];
      const previousNode = history.pop();
      
      if (!previousNode) {
        return { ...prev, currentNode: null };
      }

      // Restore previous node's cached state
      const cachedNode = prev.nodes.get(previousNode.id);
      const restoredNode = cachedNode || previousNode;

      return {
        nodes: prev.nodes,
        history,
        currentNode: restoredNode
      };
    });

    return true;
  }, [state.history.length]);

  const updateState = useCallback((newState: Partial<NavigationState>) => {
    setState(prev => {
      if (!prev.currentNode) return prev;

      const updatedNode: NavigationNode = {
        ...prev.currentNode,
        state: {
          ...prev.currentNode.state,
          ...newState
        }
      };

      const nodes = new Map(prev.nodes);
      nodes.set(updatedNode.id, updatedNode);

      return {
        ...prev,
        nodes,
        currentNode: updatedNode
      };
    });
  }, []);

  const getNodeState = useCallback((nodeId: string): NavigationState | undefined => {
    return state.nodes.get(nodeId)?.state;
  }, [state.nodes]);

  const clearHistory = useCallback(() => {
    setState({
      nodes: new Map(),
      history: [],
      currentNode: null
    });
    setHideBottomNav(false);
  }, []);

  const value: NavigationContextValue = {
    currentNode: state.currentNode,
    history: state.history,
    navigate,
    goBack,
    updateState,
    canGoBack: state.history.length > 0,
    getNodeState,
    clearHistory,
    originTab,
    setOriginTab,
    hideBottomNav,
    setHideBottomNav
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
