export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isOutgoing: boolean;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  messages: Message[];
  isOnline?: boolean;
}
