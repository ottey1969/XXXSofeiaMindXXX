import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Plus, Search, Euro, MessageSquare, Ban, Check, X, Users, Activity, Volume2, VolumeX } from "lucide-react";

const ADMIN_KEY = "0f5db72a966a8d5f7ebae96c6a1e2cc574c2bf926c62dc4526bd43df1c0f42eb";

interface User {
  id: string;
  email: string;
  credits: number;
  emailVerified: boolean;
  createdAt: string;
}

const creditPackages = [
  { credits: 10, price: 2.30, description: "Basic starter pack", pricePerCredit: undefined, popular: false, bestValue: false, ultimate: false },
  { credits: 50, price: 11.50, description: "Most popular choice", pricePerCredit: undefined, popular: false, bestValue: false, ultimate: false },
  { credits: 150, price: 35, description: "Perfect for regular content creation", pricePerCredit: "€0.23", popular: false, bestValue: false, ultimate: false },
  { credits: 1500, price: 300, description: "Great for businesses & agencies", pricePerCredit: "€0.20", popular: true, bestValue: false, ultimate: false },
  { credits: 5000, price: 899, description: "Enterprise level content volume", pricePerCredit: "€0.18", popular: false, bestValue: true, ultimate: false },
  { credits: 10000, price: 1527, description: "Ultimate enterprise package", pricePerCredit: "€0.15", popular: false, bestValue: false, ultimate: true }
];

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [creditsToAdd, setCreditsToAdd] = useState<string>("10");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  
  // Notification fields
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"info" | "warning" | "success" | "error">("info");
  const [expiresInHours, setExpiresInHours] = useState<string>("24");
  const [activeTab, setActiveTab] = useState<"addCredits" | "searchUser" | "sendNotification" | "adminMessages" | "security">("addCredits");
  
  // Security tab fields
  const [ipAddress, setIpAddress] = useState("");
  const [ipReason, setIpReason] = useState("");
  const [blockUserEmail, setBlockUserEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [logoutUserEmail, setLogoutUserEmail] = useState("");
  
  // Sound notification state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [continuousSound, setContinuousSound] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  
  const { toast } = useToast();

  // Audio refs for sound notifications
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const continuousAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Create notification sound (higher frequency beep)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create notification beep programmatically
    const createBeep = (frequency: number, duration: number) => {
      const sampleRate = audioContext.sampleRate;
      const frames = sampleRate * duration;
      const buffer = audioContext.createBuffer(1, frames, sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < frames; i++) {
        data[i] = Math.sin(2 * Math.PI * frequency * (i / sampleRate)) * 0.3;
      }
      
      const arrayBuffer = new ArrayBuffer(44 + data.length * 2);
      const view = new DataView(arrayBuffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + data.length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, data.length * 2, true);
      
      for (let i = 0; i < data.length; i++) {
        view.setInt16(44 + i * 2, data[i] * 0x7FFF, true);
      }
      
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    };
    
    // Notification sound: 800Hz beep for 0.3 seconds
    const notificationUrl = createBeep(800, 0.3);
    notificationAudioRef.current = new Audio(notificationUrl);
    
    // Continuous sound: 600Hz beep for 0.5 seconds with 1 second interval
    const continuousUrl = createBeep(600, 0.5);
    continuousAudioRef.current = new Audio(continuousUrl);
    continuousAudioRef.current.loop = true;
    continuousAudioRef.current.volume = 0.4;
  }, []);

  // Sound functions
  const playNotificationSound = () => {
    if (notificationAudioRef.current && soundEnabled) {
      notificationAudioRef.current.currentTime = 0;
      notificationAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const startContinuousSound = () => {
    if (continuousAudioRef.current && soundEnabled && continuousSound) {
      continuousAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const stopContinuousSound = () => {
    if (continuousAudioRef.current) {
      continuousAudioRef.current.pause();
      continuousAudioRef.current.currentTime = 0;
    }
  };

  // User Messages Component
  const UserMessages = () => {
    const { data: userMessages = [], refetch } = useQuery({
      queryKey: ["/api/admin/messages"],
      refetchInterval: 5000, // Refresh every 5 seconds for real-time notifications
      queryFn: async () => {
        const response = await apiRequest("GET", `/api/admin/messages?adminKey=${ADMIN_KEY}`);
        return response.json();
      },
      enabled: isAuthenticated, // Only fetch when admin is authenticated
    });

    // Sound notification logic
    useEffect(() => {
      if (!Array.isArray(userMessages) || !soundEnabled) return;
      
      const unreadCount = userMessages.filter((msg: any) => !msg.isRead).length;
      const totalCount = userMessages.length;
      
      // Check for new messages
      if (totalCount > previousMessageCount && previousMessageCount > 0) {
        // Play notification sound for new message
        playNotificationSound();
        
        toast({
          title: "New User Message",
          description: `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`,
          variant: "default",
        });
      }
      
      // Handle continuous sound for unread messages
      if (unreadCount > 0 && soundEnabled && continuousSound) {
        startContinuousSound();
      } else {
        stopContinuousSound();
      }
      
      setPreviousMessageCount(totalCount);
    }, [userMessages, soundEnabled, continuousSound, previousMessageCount]);

    const markAsReadMutation = useMutation({
      mutationFn: async (messageId: string) => {
        await apiRequest("PATCH", `/api/admin/messages/${messageId}/read`, {
          adminKey: ADMIN_KEY,
        });
      },
      onSuccess: () => {
        refetch();
        toast({
          title: "Message marked as read",
          description: "The message has been successfully marked as read.",
        });
      },
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              User Messages
              {Array.isArray(userMessages) && userMessages.filter((msg: any) => !msg.isRead).length > 0 && (
                <Badge variant="destructive">
                  {userMessages.filter((msg: any) => !msg.isRead).length} new
                </Badge>
              )}
            </div>
            
            {/* Sound Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {soundEnabled ? "Sound On" : "Sound Off"}
              </Button>
              
              <Button
                variant={continuousSound ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setContinuousSound(!continuousSound);
                  if (continuousSound) {
                    // Stop sound when disabling
                    stopContinuousSound();
                  }
                }}
                disabled={!soundEnabled}
                className="flex items-center gap-1"
              >
                📢 Alert Mode
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => playNotificationSound()}
                disabled={!soundEnabled}
                className="flex items-center gap-1"
              >
                🔊 Test
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Messages from users that need your attention • Sound alerts {soundEnabled ? 'enabled' : 'disabled'}
            {soundEnabled && continuousSound && " • Continuous alert active"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-xs text-gray-500">
            Debug: {Array.isArray(userMessages) ? `${userMessages.length} messages` : `Type: ${typeof userMessages}`}
          </div>
          {Array.isArray(userMessages) && userMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet</p>
              <p className="text-sm">User messages will appear here when they contact you.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array.isArray(userMessages) && userMessages.map((message: any) => (
                <div 
                  key={message.id} 
                  className={`p-4 border rounded-lg ${message.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={message.isRead ? "secondary" : "default"}>
                        {message.isRead ? "Read" : "New"}
                      </Badge>
                      <span className="font-medium text-sm">{message.userEmail}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {!message.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(message.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{message.subject}</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.message}</p>
                    {message.userCredits !== undefined && (
                      <p className="text-xs text-gray-500">User has {message.userCredits} credits</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Security action handlers
  const handleIpAction = async (action: "block" | "allow") => {
    if (!ipAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter an IP address",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/admin/ip-security", {
        adminKey: ADMIN_KEY,
        ipAddress: ipAddress.trim(),
        ruleType: action,
        reason: ipReason.trim() || undefined,
      });

      toast({
        title: "Success",
        description: `IP address ${action === "block" ? "blocked" : "allowed"} successfully`,
      });

      setIpAddress("");
      setIpReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} IP address`,
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = async () => {
    if (!blockUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/admin/block-user", {
        adminKey: ADMIN_KEY,
        userEmail: blockUserEmail.trim(),
        reason: blockReason.trim() || undefined,
      });

      toast({
        title: "Success",
        description: "User blocked successfully",
      });

      setBlockUserEmail("");
      setBlockReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  const handleForceLogout = async () => {
    if (!logoutUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/admin/force-logout", {
        adminKey: ADMIN_KEY,
        userEmail: logoutUserEmail.trim(),
      });

      toast({
        title: "Success",
        description: "User logged out successfully",
      });

      setLogoutUserEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout user",
        variant: "destructive",
      });
    }
  };

  const handleAdminLogin = () => {
    if (adminKey === ADMIN_KEY) {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin key",
        variant: "destructive",
      });
    }
  };

  const addCreditsMutation = useMutation({
    mutationFn: async ({ email, credits }: { email: string; credits: number }) => {
      const response = await fetch(`/api/admin/add-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify({ email, credits }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add credits');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Credits Added Successfully",
        description: `Added ${creditsToAdd} credits to ${userEmail}`,
      });
      setUserEmail("");
      setCreditsToAdd("10");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add credits",
        variant: "destructive",
      });
    },
  });

  const searchUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/admin/user/${email}`, {
        method: "GET",
        headers: {
          "x-admin-key": ADMIN_KEY,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'User not found');
      }
      
      return response.json();
    },
    onSuccess: (data: User) => {
      setSearchedUser(data);
    },
    onError: (error: any) => {
      toast({
        title: "User Not Found",
        description: error.message || "User does not exist",
        variant: "destructive",
      });
      setSearchedUser(null);
    },
  });

  const handleAddCredits = () => {
    if (!userEmail || !creditsToAdd) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and credit amount",
        variant: "destructive",
      });
      return;
    }

    const credits = parseInt(creditsToAdd);
    if (credits < 1 || credits > 100) {
      toast({
        title: "Invalid Amount",
        description: "Credits must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }

    addCreditsMutation.mutate({ email: userEmail, credits });
  };

  const handleSearchUser = () => {
    if (!searchEmail) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address to search",
        variant: "destructive",
      });
      return;
    }
    searchUserMutation.mutate(searchEmail);
  };

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ email, title, message, type, expiresInHours }: {
      email: string;
      title: string;
      message: string;
      type: "info" | "warning" | "success" | "error";
      expiresInHours?: number;
    }) => {
      const response = await fetch(`/api/admin/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_KEY,
        },
        body: JSON.stringify({ email, title, message, type, expiresInHours }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send notification');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: `Message sent to ${notificationEmail}`,
      });
      setNotificationEmail("");
      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationType("info");
      setExpiresInHours("24");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  const handleSendNotification = () => {
    if (!notificationEmail || !notificationTitle || !notificationMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all notification fields",
        variant: "destructive",
      });
      return;
    }

    const expires = parseInt(expiresInHours);
    if (expires < 1 || expires > 168) {
      toast({
        title: "Invalid Expiry",
        description: "Expiry must be between 1 and 168 hours",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate({
      email: notificationEmail,
      title: notificationTitle,
      message: notificationMessage,
      type: notificationType,
      expiresInHours: expires,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Admin Panel Access</CardTitle>
            <CardDescription>Enter admin key to manage user credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminKey">Admin Key</Label>
              <Input
                id="adminKey"
                type="password"
                placeholder="Enter admin key..."
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
            </div>
            <Button onClick={handleAdminLogin} className="w-full">
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Sofeia AI Admin Panel</h1>
          <p className="text-purple-200">Manage user credits and monitor system usage</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={() => setActiveTab("addCredits")} variant={activeTab === "addCredits" ? "default" : "outline"}>
          <Plus className="w-4 h-4 mr-2" />
          Add Credits to User
        </Button>
        <Button onClick={() => setActiveTab("searchUser")} variant={activeTab === "searchUser" ? "default" : "outline"}>
          <Search className="w-4 h-4 mr-2" />
          Search User
        </Button>
        <Button onClick={() => setActiveTab("sendNotification")} variant={activeTab === "sendNotification" ? "default" : "outline"}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Notification
        </Button>
        <Button onClick={() => setActiveTab("adminMessages")} variant={activeTab === "adminMessages" ? "default" : "outline"}>
          <MessageSquare className="w-4 h-4 mr-2" />
          User Messages
        </Button>
        <Button onClick={() => setActiveTab("security")} variant={activeTab === "security" ? "default" : "outline"}>
          <Shield className="w-4 h-4 mr-2" />
          Security
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {/* Add Credits Section */}
          {activeTab === "addCredits" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Credits to User
              </CardTitle>
              <CardDescription>
                Grant additional credits to any user account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userEmail">User Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits to Add</Label>
                <Select value={creditsToAdd} onValueChange={setCreditsToAdd}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select credits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Credit</SelectItem>
                    <SelectItem value="5">5 Credits</SelectItem>
                    <SelectItem value="10">10 Credits</SelectItem>
                    <SelectItem value="25">25 Credits</SelectItem>
                    <SelectItem value="50">50 Credits</SelectItem>
                    <SelectItem value="100">100 Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddCredits} 
                className="w-full"
                disabled={addCreditsMutation.isPending}
              >
                {addCreditsMutation.isPending ? "Adding Credits..." : "Add Credits"}
              </Button>
            </CardContent>
          </Card>
          )}

          {/* Search User Section */}
          {activeTab === "searchUser" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search User
              </CardTitle>
              <CardDescription>
                Look up user information and current credit balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchEmail">User Email</Label>
                <Input
                  id="searchEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                />
              </div>
              <Button 
                onClick={handleSearchUser} 
                className="w-full"
                disabled={searchUserMutation.isPending}
              >
                {searchUserMutation.isPending ? "Searching..." : "Search User"}
              </Button>
              
              {searchedUser && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span>{searchedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Credits:</span>
                    <Badge variant="secondary">{searchedUser.credits}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Verified:</span>
                    <Badge variant={searchedUser.emailVerified ? "default" : "destructive"}>
                      {searchedUser.emailVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Joined:</span>
                    <span className="text-sm">{new Date(searchedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Send Notification Section */}
          {activeTab === "sendNotification" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Send Notification
              </CardTitle>
              <CardDescription>
                Send popup message to any user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">User Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationTitle">Title</Label>
                <Input
                  id="notificationTitle"
                  placeholder="Important Message"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationMessage">Message</Label>
                <Textarea
                  id="notificationMessage"
                  placeholder="Your message here..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationType">Type</Label>
                  <Select value={notificationType} onValueChange={(value: "info" | "warning" | "success" | "error") => setNotificationType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresInHours">Expires (Hours)</Label>
                  <Input
                    id="expiresInHours"
                    type="number"
                    min="1"
                    max="168"
                    value={expiresInHours}
                    onChange={(e) => setExpiresInHours(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSendNotification} 
                className="w-full"
                disabled={sendNotificationMutation.isPending}
              >
                {sendNotificationMutation.isPending ? "Sending..." : "Send Notification"}
              </Button>
            </CardContent>
          </Card>
          )}

          {/* Admin Messages Section */}
          {activeTab === "adminMessages" && (
            <UserMessages />
          )}

          {/* Security Section */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* IP Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    IP Address Management
                  </CardTitle>
                  <CardDescription>
                    Block or allow specific IP addresses for security control
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ipAddress">IP Address</Label>
                      <Input
                        id="ipAddress"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="192.168.1.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ipReason">Reason</Label>
                      <Input
                        id="ipReason"
                        value={ipReason}
                        onChange={(e) => setIpReason(e.target.value)}
                        placeholder="Suspicious activity, spam, etc."
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleIpAction("block")}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Block IP
                    </Button>
                    <Button 
                      onClick={() => handleIpAction("allow")}
                      variant="default"
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Allow IP
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Security Actions
                  </CardTitle>
                  <CardDescription>
                    Block users or force logout for security reasons
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Block User */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Block User Account</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="blockUserEmail">User Email</Label>
                        <Input
                          id="blockUserEmail"
                          value={blockUserEmail}
                          onChange={(e) => setBlockUserEmail(e.target.value)}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="blockReason">Block Reason</Label>
                        <Input
                          id="blockReason"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="Violation of terms, abuse, etc."
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleBlockUser}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Block User
                    </Button>
                  </div>

                  {/* Force Logout */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Force User Logout</h4>
                    <div>
                      <Label htmlFor="logoutUserEmail">User Email</Label>
                      <Input
                        id="logoutUserEmail"
                        value={logoutUserEmail}
                        onChange={(e) => setLogoutUserEmail(e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>
                    <Button 
                      onClick={handleForceLogout}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Force Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Security Activity
                  </CardTitle>
                  <CardDescription>
                    Monitor user activity and security events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecurityActivityLog />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Credit Packages Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5" />
              Credit Packages & Pricing
            </CardTitle>
            <CardDescription>
              Current pricing tiers for credit purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creditPackages.map((pkg, index) => (
                <div 
                  key={index}
                  className={`relative p-4 border rounded-lg ${
                    pkg.popular 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : pkg.bestValue 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : pkg.ultimate
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                      POPULAR
                    </Badge>
                  )}
                  {pkg.bestValue && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500">
                      BEST VALUE
                    </Badge>
                  )}
                  {pkg.ultimate && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-orange-500">
                      ULTIMATE
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold">{pkg.credits} Credits</div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                      €{pkg.price}
                    </div>
                    {pkg.pricePerCredit && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.pricePerCredit} per credit
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {pkg.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Alert className="mt-6">
              <AlertDescription>
                ⚠️ Credits expire at the end of each month • No rollover to next month
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle>Support Channels</CardTitle>
            <CardDescription>Contact information for user support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">WhatsApp Support:</span>
              <span className="text-blue-600 dark:text-blue-400">+31 6 2807 3996</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Facebook Group:</span>
              <a 
                href="https://www.facebook.com/groups/1079321647257618" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ContentScale Facebook Group
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Security Activity Log Component
function SecurityActivityLog() {
  const { data: activityLog = [] } = useQuery({
    queryKey: ["/api/admin/activity-log"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="space-y-4">
      {Array.isArray(activityLog) && activityLog.length === 0 ? (
        <p className="text-muted-foreground">No recent activity</p>
      ) : (
        <div className="space-y-2">
          {Array.isArray(activityLog) && activityLog.slice(0, 10).map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={log.action.includes("block") ? "destructive" : "default"}>
                    {log.action}
                  </Badge>
                  <span className="font-medium">{log.userEmail || log.userId}</span>
                </div>
                <p className="text-sm text-muted-foreground">IP: {log.ipAddress}</p>
                {log.details && (
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}