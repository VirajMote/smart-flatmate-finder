import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Search, 
  MessageSquare, 
  Home,
  Shield,
  Star,
  CheckCircle,
  Users,
  Zap,
  Heart
} from 'lucide-react';

const HowItWorks = () => {
  const seekerSteps = [
    {
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Tell us about yourself, your budget, location preferences, and lifestyle habits.",
      details: ["Basic information & photo", "Budget & location preferences", "Lifestyle choices (smoking, pets, etc.)", "Background verification"]
    },
    {
      icon: Search,
      title: "Browse Matches",
      description: "See listings and flatmates matched to your preferences with compatibility scores.",
      details: ["AI-powered matching algorithm", "Compatibility scores up to 100%", "Filter by budget, location, amenities", "Save favorites for later"]
    },
    {
      icon: MessageSquare,
      title: "Connect & Chat",
      description: "Message potential flatmates and schedule viewings through our secure platform.",
      details: ["In-app messaging system", "Schedule property viewings", "Video call integration", "Share verified documents"]
    },
    {
      icon: Home,
      title: "Move In",
      description: "Complete the process and start your new living journey with your perfect match.",
      details: ["Digital agreement support", "Move-in checklist", "Community support", "Ongoing assistance"]
    }
  ];

  const listerSteps = [
    {
      icon: Home,
      title: "List Your Space",
      description: "Upload photos, set your rent, and describe what makes your place special.",
      details: ["Professional photo guidelines", "Detailed property description", "Amenities and house rules", "Neighborhood information"]
    },
    {
      icon: Users,
      title: "Set Preferences",
      description: "Define what kind of flatmate you're looking for based on lifestyle and habits.",
      details: ["Demographic preferences", "Lifestyle compatibility", "Budget requirements", "Move-in timeline"]
    },
    {
      icon: Star,
      title: "Review Applications",
      description: "See potential flatmates with compatibility scores and verified profiles.",
      details: ["Pre-screened candidates", "Compatibility analysis", "Background verification status", "Application timeline tracking"]
    },
    {
      icon: CheckCircle,
      title: "Select & Confirm",
      description: "Choose your ideal flatmate and complete the rental process seamlessly.",
      details: ["Digital contract support", "Security deposit handling", "Move-in coordination", "Ongoing support"]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Users",
      description: "Every user goes through our verification process including ID checks and background screening."
    },
    {
      icon: Zap,
      title: "Smart Matching",
      description: "Our AI algorithm considers 50+ factors to find your perfect compatibility match."
    },
    {
      icon: Heart,
      title: "Safe Environment",
      description: "Secure messaging, verified listings, and trusted community guidelines."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-primary-light/20 text-primary-foreground">
            How It Works
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Finding Your Perfect Match Is Simple
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            Whether you're looking for a room or listing one, our step-by-step process makes it easy and safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/seeker-dashboard">
              <Button variant="accent" size="xl">
                <Search className="w-5 h-5 mr-2" />
                I'm Looking for a Room
              </Button>
            </Link>
            <Link to="/lister-dashboard">
              <Button 
                variant="outline" 
                size="xl"
                className="bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
              >
                <Home className="w-5 h-5 mr-2" />
                I Have a Room to List
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Room Seekers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              For Room Seekers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your perfect flatmate in 4 simple steps
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            {seekerSteps.map((step, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 mb-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <Card className="border-border shadow-card">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center mr-4">
                          <step.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2">Step {index + 1}</Badge>
                          <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1 lg:max-w-lg">
                  <div className="w-full h-64 bg-card-gradient rounded-lg flex items-center justify-center border border-border">
                    <step.icon className="w-24 h-24 text-primary/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Property Listers */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              For Property Listers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your ideal flatmate in 4 easy steps
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            {listerSteps.map((step, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 mb-16 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <Card className="border-border shadow-card">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-accent-light/20 rounded-lg flex items-center justify-center mr-4">
                          <step.icon className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2 bg-accent-light text-accent">Step {index + 1}</Badge>
                          <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1 lg:max-w-lg">
                  <div className="w-full h-64 bg-card-gradient rounded-lg flex items-center justify-center border border-border">
                    <step.icon className="w-24 h-24 text-accent/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Makes Us Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology and human insight for the perfect match
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-hero-gradient rounded-lg flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have found their perfect living situation through ApnaRoom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="accent" size="xl">
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </Link>
            <Link to="/">
              <Button 
                variant="outline" 
                size="xl"
                className="bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;