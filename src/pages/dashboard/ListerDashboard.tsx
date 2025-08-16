import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus,
  Home,
  Users,
  Edit,
  Trash2,
  MapPin,
  IndianRupee,
  Camera,
  Wifi,
  Car,
  Utensils,
  Shield,
  MessageSquare,
  Eye,
  Star,
  Settings
} from 'lucide-react';
import { useState } from 'react';

const ListerDashboard = () => {
  const [activeTab, setActiveTab] = useState('listings');
  
  // Mock data for existing listings
  const mockListings = [
    {
      id: 1,
      title: "Modern 2BHK in Koramangala",
      location: "Koramangala, Bangalore",
      rent: 25000,
      deposit: 50000,
      roomType: "Private Room",
      status: "Active",
      views: 156,
      applications: 12,
      posted: "2 weeks ago",
      amenities: ["WiFi", "Parking", "Kitchen", "AC"]
    },
    {
      id: 2,
      title: "Spacious Room near Metro",
      location: "HSR Layout, Bangalore",
      rent: 18000,
      deposit: 36000,
      roomType: "Shared Room", 
      status: "Rented",
      views: 89,
      applications: 8,
      posted: "1 month ago",
      amenities: ["WiFi", "Kitchen", "Gym"]
    }
  ];

  // Mock seeker matches
  const mockMatches = [
    {
      id: 1,
      name: "Priya Sharma",
      age: 26,
      gender: "Female",
      occupation: "Software Engineer",
      compatibility: 92,
      budget: "20k-25k",
      moveIn: "Immediate",
      bio: "Working professional looking for a peaceful place with good connectivity.",
      verified: true
    },
    {
      id: 2,
      name: "Rahul Patel", 
      age: 28,
      gender: "Male",
      occupation: "Marketing Manager",
      compatibility: 87,
      budget: "22k-28k",
      moveIn: "Next month",
      bio: "Clean, responsible flatmate. Non-smoker, social drinker.",
      verified: true
    },
    {
      id: 3,
      name: "Anjali Gupta",
      age: 24,
      gender: "Female", 
      occupation: "Designer",
      compatibility: 84,
      budget: "18k-22k",
      moveIn: "2 weeks",
      bio: "Creative professional, loves cooking and keeping spaces tidy.",
      verified: false
    }
  ];

  const [listingData, setListingData] = useState({
    title: '',
    location: '',
    rent: '',
    deposit: '',
    roomType: '',
    furnished: '',
    amenities: [] as string[],
    description: '',
    houseRules: '',
    genderPreference: '',
    occupationPreference: '',
    ageRange: ''
  });

  const handleListingChange = (field: string, value: string | string[]) => {
    setListingData(prev => ({ ...prev, [field]: value }));
  };

  const amenityOptions = [
    "WiFi", "Parking", "Kitchen", "AC", "Washing Machine", "Gym", 
    "Swimming Pool", "Security", "Elevator", "Balcony", "Furnished"
  ];

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-success text-success-foreground';
    if (score >= 80) return 'bg-accent text-accent-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const renderCreateListing = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Create New Listing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Property Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Modern 2BHK in Koramangala"
                  value={listingData.title}
                  onChange={(e) => handleListingChange('title', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter full address"
                    value={listingData.location}
                    onChange={(e) => handleListingChange('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rent"
                    placeholder="Enter monthly rent"
                    value={listingData.rent}
                    onChange={(e) => handleListingChange('rent', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Security Deposit</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="deposit"
                    placeholder="Enter security deposit"
                    value={listingData.deposit}
                    onChange={(e) => handleListingChange('deposit', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType">Room Type</Label>
                <Select value={listingData.roomType} onValueChange={(value) => handleListingChange('roomType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private Room</SelectItem>
                    <SelectItem value="shared">Shared Room</SelectItem>
                    <SelectItem value="studio">Studio Apartment</SelectItem>
                    <SelectItem value="1bhk">1 BHK</SelectItem>
                    <SelectItem value="2bhk">2 BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="furnished">Furnished Status</Label>
                <Select value={listingData.furnished} onValueChange={(value) => handleListingChange('furnished', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select furnished status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fully">Fully Furnished</SelectItem>
                    <SelectItem value="semi">Semi Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Photos</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Upload property photos</p>
              <Button variant="outline">Choose Files</Button>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-border text-primary focus:ring-primary"
                    checked={listingData.amenities.includes(amenity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleListingChange('amenities', [...listingData.amenities, amenity]);
                      } else {
                        handleListingChange('amenities', listingData.amenities.filter(a => a !== amenity));
                      }
                    }}
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Property Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your property, neighborhood, and what makes it special..."
              value={listingData.description}
              onChange={(e) => handleListingChange('description', e.target.value)}
              rows={4}
            />
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Flatmate Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genderPreference">Gender Preference</Label>
                <Select value={listingData.genderPreference} onValueChange={(value) => handleListingChange('genderPreference', value)}>
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
                <Label htmlFor="occupationPreference">Occupation Preference</Label>
                <Input
                  id="occupationPreference"
                  placeholder="e.g., Working professionals"
                  value={listingData.occupationPreference}
                  onChange={(e) => handleListingChange('occupationPreference', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <Input
                  id="ageRange"
                  placeholder="e.g., 22-30"
                  value={listingData.ageRange}
                  onChange={(e) => handleListingChange('ageRange', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* House Rules */}
          <div className="space-y-2">
            <Label htmlFor="houseRules">House Rules</Label>
            <Textarea
              id="houseRules"
              placeholder="List any house rules, policies, or expectations..."
              value={listingData.houseRules}
              onChange={(e) => handleListingChange('houseRules', e.target.value)}
              rows={3}
            />
          </div>

          <Button variant="hero" className="w-full">
            Create Listing
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <Button variant="hero" onClick={() => setActiveTab('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockListings.map((listing) => (
          <Card key={listing.id} className="border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{listing.title}</h3>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-3 h-3 mr-1" />
                    {listing.location}
                  </div>
                </div>
                <Badge variant={listing.status === 'Active' ? 'default' : 'secondary'}>
                  {listing.status}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <IndianRupee className="w-4 h-4 mr-1 text-primary" />
                  <span className="font-medium">₹{listing.rent.toLocaleString()}/month</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {listing.roomType} • Posted {listing.posted}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {listing.views} views
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {listing.applications} applications
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Seeker Matches</h2>
        <Badge variant="secondary">{mockMatches.length} potential matches</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockMatches.map((match) => (
          <Card key={match.id} className="border-border shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-hero-gradient rounded-full flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{match.name}</h3>
                    <p className="text-sm text-muted-foreground">{match.age} years • {match.gender}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCompatibilityColor(match.compatibility)}>
                    {match.compatibility}%
                  </Badge>
                  {match.verified && (
                    <Shield className="w-4 h-4 text-success" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Occupation:</span> {match.occupation}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Budget:</span> ₹{match.budget}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Move-in:</span> {match.moveIn}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {match.bio}
              </p>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  View Profile
                </Button>
                <Button variant="hero" size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const tabContent = {
    listings: renderListings(),
    create: renderCreateListing(),
    matches: renderMatches(),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Lister Dashboard</h1>
          <p className="text-muted-foreground">Manage your property listings and find the perfect flatmate</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64">
            <Card className="border-border">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'listings'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    My Listings
                  </button>
                  <button
                    onClick={() => setActiveTab('create')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'create'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </button>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'matches'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Seeker Matches
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

export default ListerDashboard;