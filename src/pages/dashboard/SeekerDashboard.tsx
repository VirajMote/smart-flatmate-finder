import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Heart, 
  MessageSquare, 
  MapPin, 
  IndianRupee,
  Wifi,
  Car,
  Utensils,
  Users,
  Shield,
  Star,
  Settings,
  Search
} from 'lucide-react';
import { useState } from 'react';

const SeekerDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Mock data for listings
  const mockListings = [
    {
      id: 1,
      title: "Modern 2BHK in Koramangala",
      location: "Koramangala, Bangalore",
      rent: 25000,
      deposit: 50000,
      roomType: "Private Room",
      listerName: "Priya Sharma",
      listerAge: 26,
      listerGender: "Female",
      compatibility: 92,
      amenities: ["WiFi", "Parking", "Kitchen", "AC"],
      images: ["room1.jpg"],
      description: "Spacious room in a well-maintained apartment with great connectivity.",
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Cozy Room in Whitefield",
      location: "Whitefield, Bangalore", 
      rent: 18000,
      deposit: 36000,
      roomType: "Shared Room",
      listerName: "Rahul Patel",
      listerAge: 28,
      listerGender: "Male",
      compatibility: 87,
      amenities: ["WiFi", "Kitchen", "Gym"],
      images: ["room2.jpg"],
      description: "Perfect for working professionals, close to tech parks.",
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "Studio Apartment in HSR Layout",
      location: "HSR Layout, Bangalore",
      rent: 35000,
      deposit: 70000,
      roomType: "Studio",
      listerName: "Anjali Gupta",
      listerAge: 24,
      listerGender: "Female", 
      compatibility: 89,
      amenities: ["WiFi", "Parking", "Kitchen", "AC", "Balcony"],
      images: ["room3.jpg"],
      description: "Fully furnished studio with modern amenities and metro connectivity.",
      posted: "3 days ago"
    }
  ];

  const [profileData, setProfileData] = useState({
    budget: '',
    location: '',
    roomType: '',
    gender: '',
    occupation: '',
    smoking: '',
    drinking: '',
    pets: '',
    foodHabits: '',
    bio: ''
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-success text-success-foreground';
    if (score >= 80) return 'bg-accent text-accent-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const renderProfileSetup = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (Monthly Rent)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="budget"
                  placeholder="Enter your budget"
                  value={profileData.budget}
                  onChange={(e) => handleProfileChange('budget', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Preferred Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter preferred area"
                  value={profileData.location}
                  onChange={(e) => handleProfileChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type</Label>
              <Select value={profileData.roomType} onValueChange={(value) => handleProfileChange('roomType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private Room</SelectItem>
                  <SelectItem value="shared">Shared Room</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender Preference</Label>
              <Select value={profileData.gender} onValueChange={(value) => handleProfileChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                placeholder="Your occupation"
                value={profileData.occupation}
                onChange={(e) => handleProfileChange('occupation', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smoking">Smoking</Label>
              <Select value={profileData.smoking} onValueChange={(value) => handleProfileChange('smoking', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drinking">Drinking</Label>
              <Select value={profileData.drinking} onValueChange={(value) => handleProfileChange('drinking', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="socially">Socially</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pets">Pet Friendly</Label>
              <Select value={profileData.pets} onValueChange={(value) => handleProfileChange('pets', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foodHabits">Food Habits</Label>
              <Select value={profileData.foodHabits} onValueChange={(value) => handleProfileChange('foodHabits', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select food habits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veg">Vegetarian</SelectItem>
                  <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="jain">Jain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself, your lifestyle, and what you're looking for in a flatmate..."
              value={profileData.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={4}
            />
          </div>

          <Button variant="hero" className="w-full">
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recommended Listings</h2>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockListings.map((listing) => (
          <Card key={listing.id} className="border-border shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{listing.title}</h3>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location}
                    </div>
                  </div>
                  <Badge className={getCompatibilityColor(listing.compatibility)}>
                    {listing.compatibility}% Match
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <IndianRupee className="w-4 h-4 mr-1 text-primary" />
                    <span className="font-medium">₹{listing.rent.toLocaleString()}/month</span>
                    <span className="text-muted-foreground ml-2">• Deposit: ₹{listing.deposit.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {listing.listerName}, {listing.listerAge} • {listing.listerGender}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {listing.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {listing.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{listing.amenities.length - 3} more
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {listing.description}
                </p>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="hero" size="sm" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mt-3 flex items-center justify-between">
                  <span>Posted {listing.posted}</span>
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const tabContent = {
    profile: renderProfileSetup(),
    listings: renderListings(),
    saved: (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Saved Listings</h3>
        <p className="text-muted-foreground">Start browsing and save listings that interest you.</p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Seeker Dashboard</h1>
          <p className="text-muted-foreground">Find your perfect room and flatmate match</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <Card className="border-border">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile Setup
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'listings'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'saved'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Saved Listings
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

export default SeekerDashboard;