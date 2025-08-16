import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  MapPin,
  IndianRupee,
  Users,
  Heart,
  MessageSquare,
  Shield,
  Star,
  Sliders,
  Home,
  Wifi,
  Car,
  Utensils
} from 'lucide-react';
import { useState } from 'react';

const MatchingResults = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    location: '',
    roomType: '',
    gender: '',
    furnished: ''
  });

  // Mock matching results data
  const mockResults = [
    {
      id: 1,
      type: 'listing',
      title: "Modern 2BHK in Koramangala",
      location: "Koramangala, Bangalore",
      rent: 25000,
      deposit: 50000,
      roomType: "Private Room",
      listerName: "Priya Sharma",
      listerAge: 26,
      listerGender: "Female",
      compatibility: 95,
      amenities: ["WiFi", "Parking", "Kitchen", "AC", "Gym"],
      images: ["room1.jpg"],
      description: "Spacious room in a well-maintained apartment with great connectivity to tech parks.",
      furnished: "Fully Furnished",
      verified: true,
      posted: "2 days ago"
    },
    {
      id: 2,
      type: 'seeker',
      name: "Rahul Mehta",
      age: 28,
      gender: "Male",
      occupation: "Software Engineer",
      budget: "20k-25k",
      preferredLocation: "Koramangala, HSR Layout",
      compatibility: 92,
      bio: "Clean, organized working professional. Non-smoker, occasional social drinker.",
      moveInDate: "Immediate",
      verified: true,
      interests: ["Fitness", "Reading", "Movies"]
    },
    {
      id: 3,
      type: 'listing',
      title: "Cozy Studio near Metro",
      location: "HSR Layout, Bangalore",
      rent: 22000,
      deposit: 44000,
      roomType: "Studio",
      listerName: "Anjali Gupta",
      listerAge: 24,
      listerGender: "Female",
      compatibility: 89,
      amenities: ["WiFi", "Kitchen", "AC", "Metro Access"],
      images: ["room2.jpg"],
      description: "Perfect studio apartment for working professionals with metro connectivity.",
      furnished: "Semi Furnished",
      verified: true,
      posted: "1 week ago"
    },
    {
      id: 4,
      type: 'seeker',
      name: "Sneha Patel",
      age: 25,
      gender: "Female",
      occupation: "Marketing Manager",
      budget: "18k-23k",
      preferredLocation: "Whitefield, Marathahalli",
      compatibility: 87,
      bio: "Friendly, responsible flatmate. Love cooking and maintaining clean spaces.",
      moveInDate: "Next month",
      verified: false,
      interests: ["Cooking", "Yoga", "Travel"]
    },
    {
      id: 5,
      type: 'listing',
      title: "Shared Room in Whitefield",
      location: "Whitefield, Bangalore",
      rent: 15000,
      deposit: 30000,
      roomType: "Shared Room",
      listerName: "Arjun Singh",
      listerAge: 29,
      listerGender: "Male",
      compatibility: 84,
      amenities: ["WiFi", "Kitchen", "Gym", "Swimming Pool"],
      images: ["room3.jpg"],
      description: "Great shared accommodation in gated community with all amenities.",
      furnished: "Unfurnished",
      verified: true,
      posted: "3 days ago"
    }
  ];

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-success text-success-foreground';
    if (score >= 80) return 'bg-accent text-accent-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderListingCard = (result: any) => (
    <Card key={result.id} className="border-border shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center relative">
          <Home className="w-16 h-16 text-muted-foreground" />
          <Badge 
            className={`absolute top-3 right-3 ${getCompatibilityColor(result.compatibility)}`}
          >
            {result.compatibility}% Match
          </Badge>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground mb-1">{result.title}</h3>
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {result.location}
              </div>
            </div>
            {result.verified && (
              <Shield className="w-5 h-5 text-success" />
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <IndianRupee className="w-4 h-4 mr-1 text-primary" />
              <span className="font-medium">₹{result.rent.toLocaleString()}/month</span>
              <span className="text-muted-foreground ml-2">• {result.roomType}</span>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              {result.listerName}, {result.listerAge} • {result.listerGender}
            </div>

            <div className="text-sm text-muted-foreground">
              {result.furnished} • Posted {result.posted}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {result.amenities.slice(0, 4).map((amenity: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {result.amenities.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{result.amenities.length - 4} more
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {result.description}
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
        </div>
      </CardContent>
    </Card>
  );

  const renderSeekerCard = (result: any) => (
    <Card key={result.id} className="border-border shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-hero-gradient rounded-full flex items-center justify-center mr-3">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{result.name}</h3>
              <p className="text-sm text-muted-foreground">{result.age} years • {result.gender}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getCompatibilityColor(result.compatibility)}>
              {result.compatibility}% Match
            </Badge>
            {result.verified && (
              <Shield className="w-4 h-4 text-success" />
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="font-medium">Occupation:</span> {result.occupation}
          </div>
          <div className="text-sm">
            <span className="font-medium">Budget:</span> ₹{result.budget}
          </div>
          <div className="text-sm">
            <span className="font-medium">Preferred Location:</span> {result.preferredLocation}
          </div>
          <div className="text-sm">
            <span className="font-medium">Move-in:</span> {result.moveInDate}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {result.interests.map((interest: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {result.bio}
        </p>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Profile
          </Button>
          <Button variant="hero" size="sm" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-1" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Matching Results</h1>
          <p className="text-muted-foreground">
            Found {mockResults.length} compatible matches based on your preferences
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location, preferences, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-15000">Under ₹15,000</SelectItem>
                    <SelectItem value="15000-25000">₹15,000 - ₹25,000</SelectItem>
                    <SelectItem value="25000-35000">₹25,000 - ₹35,000</SelectItem>
                    <SelectItem value="35000+">Above ₹35,000</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="koramangala">Koramangala</SelectItem>
                    <SelectItem value="hsr">HSR Layout</SelectItem>
                    <SelectItem value="whitefield">Whitefield</SelectItem>
                    <SelectItem value="marathahalli">Marathahalli</SelectItem>
                    <SelectItem value="btm">BTM Layout</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.roomType} onValueChange={(value) => handleFilterChange('roomType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private Room</SelectItem>
                    <SelectItem value="shared">Shared Room</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="1bhk">1 BHK</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.furnished} onValueChange={(value) => handleFilterChange('furnished', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Furnished" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="fully">Fully Furnished</SelectItem>
                    <SelectItem value="semi">Semi Furnished</SelectItem>
                    <SelectItem value="unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="ghost" onClick={() => setFilters({ priceRange: '', location: '', roomType: '', gender: '', furnished: '' })}>
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {mockResults.length} Results Found
            </h2>
            <Select defaultValue="compatibility">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compatibility">Best Match</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockResults.map((result) => 
              result.type === 'listing' ? renderListingCard(result) : renderSeekerCard(result)
            )}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchingResults;