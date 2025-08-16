import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Home, 
  Users, 
  Shield, 
  Star,
  CheckCircle,
  MapPin,
  MessageSquare,
  UserCheck,
  Target,
  Clock,
  Award
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Search,
      title: "Smart Matching",
      description: "AI-powered compatibility matching based on lifestyle, preferences, and budget."
    },
    {
      icon: Shield,
      title: "Verified Profiles",
      description: "All users are verified for safety and authenticity before joining the platform."
    },
    {
      icon: MessageSquare,
      title: "In-app Chat",
      description: "Connect with potential flatmates through our secure messaging system."
    },
    {
      icon: UserCheck,
      title: "Background Checks",
      description: "Optional background verification for added peace of mind."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Profile",
      description: "Tell us about yourself, your preferences, and what you're looking for."
    },
    {
      number: "02", 
      title: "Browse & Match",
      description: "Discover verified listings and compatible flatmates with smart matching."
    },
    {
      number: "03",
      title: "Connect & Chat",
      description: "Message potential flatmates and schedule viewings through our platform."
    },
    {
      number: "04",
      title: "Move In",
      description: "Complete the process with confidence and start your new living journey."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      text: "Found my perfect flatmate within a week! The compatibility matching really works.",
      compatibility: 95
    },
    {
      name: "Rahul Patel", 
      location: "Bangalore",
      rating: 5,
      text: "Safe, reliable, and easy to use. ApnaRoom made my relocation stress-free.",
      compatibility: 88
    },
    {
      name: "Ankita Singh",
      location: "Delhi",
      rating: 5,
      text: "The verification process gave me confidence. Highly recommend ApnaRoom!",
      compatibility: 92
    }
  ];

  const trustBadges = [
    { icon: Shield, text: "Verified Users" },
    { icon: Award, text: "5000+ Happy Matches" },
    { icon: Clock, text: "24/7 Support" },
    { icon: Target, text: "95% Success Rate" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-background/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-primary-light/20 text-primary-foreground">
              India's Trusted Flatmate Finder
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Find the right room.<br />
              Find the right people.
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Connect with verified, compatible flatmates through our smart matching platform. 
              Safe, simple, and stress-free room finding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/seeker-dashboard">
                <Button variant="accent" size="xl" className="w-full sm:w-auto">
                  <Search className="w-5 h-5 mr-2" />
                  Find a Room
                </Button>
              </Link>
              <Link to="/lister-dashboard">
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="w-full sm:w-auto bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
                >
                  <Home className="w-5 h-5 mr-2" />
                  List a Room
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-muted-foreground">
                <badge.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose ApnaRoom?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We make finding the perfect flatmate simple and secure with cutting-edge technology and verified profiles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and find your perfect flatmate match.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-accent-foreground">{step.number}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border transform -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of happy users who found their perfect living situation through ApnaRoom.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{testimonial.name}</p>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {testimonial.location}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-success-light text-success">
                      {testimonial.compatibility}% Match
                    </Badge>
                  </div>
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
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join ApnaRoom today and discover your ideal living situation in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="accent" size="xl" className="w-full sm:w-auto">
                <Users className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto bg-background/10 backdrop-blur border-primary-foreground/20 text-primary-foreground hover:bg-background/20"
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

export default Landing;