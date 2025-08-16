import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send,
  MoreVertical,
  Phone,
  Video,
  Users,
  Shield,
  Paperclip,
  Smile,
  Search
} from 'lucide-react';
import { useState } from 'react';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  // Mock chat list data
  const chatList = [
    {
      id: 1,
      name: "Priya Sharma",
      lastMessage: "That sounds perfect! When can we schedule a viewing?",
      timestamp: "2m ago",
      unread: 2,
      online: true,
      verified: true,
      type: "listing",
      property: "Modern 2BHK in Koramangala"
    },
    {
      id: 2,
      name: "Rahul Mehta",
      lastMessage: "I'm looking for a place near tech parks. Do you have anything available?",
      timestamp: "1h ago",
      unread: 0,
      online: false,
      verified: true,
      type: "seeker",
      property: null
    },
    {
      id: 3,
      name: "Anjali Gupta",
      lastMessage: "Thanks for sharing the details. The room looks great!",
      timestamp: "3h ago",
      unread: 1,
      online: true,
      verified: false,
      type: "listing",
      property: "Cozy Studio near Metro"
    },
    {
      id: 4,
      name: "Arjun Singh",
      lastMessage: "Can you tell me more about the house rules?",
      timestamp: "1d ago",
      unread: 0,
      online: false,
      verified: true,
      type: "listing",
      property: "Shared Room in Whitefield"
    }
  ];

  // Mock messages for selected chat
  const messages = [
    {
      id: 1,
      sender: "them",
      content: "Hi! I saw your listing for the room in Koramangala. Is it still available?",
      timestamp: "10:30 AM",
      read: true
    },
    {
      id: 2,
      sender: "me",
      content: "Yes, it's still available! Would you like to know more details about the place?",
      timestamp: "10:32 AM",
      read: true
    },
    {
      id: 3,
      sender: "them",
      content: "That would be great! Can you tell me about the amenities and house rules?",
      timestamp: "10:35 AM",
      read: true
    },
    {
      id: 4,
      sender: "me",
      content: "Sure! The room comes with WiFi, AC, parking, and access to a fully equipped kitchen. We prefer working professionals, no smoking inside, and guests are welcome with prior notice.",
      timestamp: "10:37 AM",
      read: true
    },
    {
      id: 5,
      sender: "them",
      content: "That sounds perfect! When can we schedule a viewing?",
      timestamp: "10:40 AM",
      read: false
    }
  ];

  const selectedChatData = chatList.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement send message logic
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">Connect with potential flatmates and property owners</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {chatList.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                        selectedChat === chat.id ? 'bg-primary-light/10 border-r-2 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-hero-gradient rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary-foreground" />
                            </div>
                            {chat.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                              <h3 className="font-medium text-foreground truncate">{chat.name}</h3>
                              {chat.verified && (
                                <Shield className="w-3 h-3 text-success flex-shrink-0" />
                              )}
                            </div>
                            {chat.property && (
                              <p className="text-xs text-muted-foreground truncate">{chat.property}</p>
                            )}
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                          {chat.unread > 0 && (
                            <Badge variant="default" className="bg-primary text-primary-foreground text-xs mt-1">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            <Card className="border-border h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-hero-gradient rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-foreground" />
                      </div>
                      {selectedChatData?.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <h3 className="font-medium text-foreground">{selectedChatData?.name}</h3>
                        {selectedChatData?.verified && (
                          <Shield className="w-4 h-4 text-success" />
                        )}
                      </div>
                      {selectedChatData?.property && (
                        <p className="text-sm text-muted-foreground">{selectedChatData.property}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {selectedChatData?.online ? 'Online' : 'Last seen 2h ago'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          msg.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === 'me' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="hero" 
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;