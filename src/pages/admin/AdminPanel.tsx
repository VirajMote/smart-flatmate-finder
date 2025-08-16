import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users,
  Home,
  Shield,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { useState } from 'react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for dashboard
  const stats = [
    {
      title: "Total Users",
      value: "12,543",
      change: "+12.5%",
      trend: "up",
      icon: Users
    },
    {
      title: "Active Listings",
      value: "3,421",
      change: "+8.2%",
      trend: "up",
      icon: Home
    },
    {
      title: "Successful Matches",
      value: "1,876",
      change: "+15.3%",
      trend: "up",
      icon: CheckCircle
    },
    {
      title: "Pending Reports",
      value: "23",
      change: "-5.1%",
      trend: "down",
      icon: AlertTriangle
    }
  ];

  // Mock user data
  const mockUsers = [
    {
      id: 1,
      name: "Priya Sharma",
      email: "priya@email.com",
      type: "Seeker",
      location: "Bangalore",
      joinDate: "2024-01-15",
      status: "Active",
      verified: true,
      reports: 0
    },
    {
      id: 2,
      name: "Rahul Mehta",
      email: "rahul@email.com",
      type: "Lister",
      location: "Mumbai",
      joinDate: "2024-01-10",
      status: "Active",
      verified: true,
      reports: 0
    },
    {
      id: 3,
      name: "Anjali Gupta",
      email: "anjali@email.com",
      type: "Seeker",
      location: "Delhi",
      joinDate: "2024-01-20",
      status: "Suspended",
      verified: false,
      reports: 2
    },
    {
      id: 4,
      name: "Arjun Singh",
      email: "arjun@email.com",
      type: "Lister",
      location: "Pune",
      joinDate: "2024-01-12",
      status: "Active",
      verified: true,
      reports: 1
    }
  ];

  // Mock listing data
  const mockListings = [
    {
      id: 1,
      title: "Modern 2BHK in Koramangala",
      owner: "Priya Sharma",
      location: "Bangalore",
      rent: 25000,
      posted: "2024-01-15",
      status: "Active",
      views: 156,
      reports: 0
    },
    {
      id: 2,
      title: "Cozy Studio near Metro",
      owner: "Anjali Gupta",
      location: "Delhi",
      rent: 22000,
      posted: "2024-01-18",
      status: "Under Review",
      views: 89,
      reports: 1
    },
    {
      id: 3,
      title: "Shared Room in Tech Park",
      owner: "Rahul Mehta",
      location: "Mumbai",
      rent: 18000,
      posted: "2024-01-20",
      status: "Active",
      views: 134,
      reports: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-success text-success-foreground';
      case 'Suspended':
      case 'Under Review':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp 
                      className={`w-4 h-4 mr-1 ${
                        stat.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`} 
                    />
                    <span 
                      className={`text-sm ${
                        stat.trend === 'up' ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-hero-gradient rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.type} • {user.location}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{user.joinDate}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockListings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-light/20 rounded-full flex items-center justify-center">
                      <Home className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{listing.title}</p>
                      <p className="text-sm text-muted-foreground">₹{listing.rent.toLocaleString()}/month</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(listing.status)}>
                    {listing.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">User</th>
                  <th className="text-left p-4 font-medium text-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-foreground">Location</th>
                  <th className="text-left p-4 font-medium text-foreground">Join Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Reports</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-hero-gradient rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1">
                            <p className="font-medium text-foreground">{user.name}</p>
                            {user.verified && (
                              <Shield className="w-4 h-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{user.type}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        {user.location}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.joinDate}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {user.reports > 0 ? (
                        <Badge variant="destructive">{user.reports}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Ban className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Listing Management</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search listings..." className="pl-10 w-64" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Listing</th>
                  <th className="text-left p-4 font-medium text-foreground">Owner</th>
                  <th className="text-left p-4 font-medium text-foreground">Rent</th>
                  <th className="text-left p-4 font-medium text-foreground">Posted</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Views</th>
                  <th className="text-left p-4 font-medium text-foreground">Reports</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent-light/20 rounded-full flex items-center justify-center">
                          <Home className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{listing.title}</p>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            {listing.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{listing.owner}</td>
                    <td className="p-4 font-medium">₹{listing.rent.toLocaleString()}</td>
                    <td className="p-4 text-muted-foreground">{listing.posted}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(listing.status)}>
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{listing.views}</td>
                    <td className="p-4">
                      {listing.reports > 0 ? (
                        <Badge variant="destructive">{listing.reports}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabContent = {
    overview: renderOverview(),
    users: renderUsers(),
    listings: renderListings(),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, listings, and monitor platform activity</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <Card className="border-border">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'users'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'listings'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Listings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {tabContent[activeTab as keyof typeof tabContent]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;