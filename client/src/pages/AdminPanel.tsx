import { useState } from "react";
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
import { Shield, Plus, Search, Euro, MessageSquare } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"addCredits" | "searchUser" | "sendNotification">("addCredits");
  const { toast } = useToast();

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