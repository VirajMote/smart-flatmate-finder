import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Heart, 
  Target,
  Award,
  Zap,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Every user is verified and background-checked for your peace of mind."
    },
    {
      icon: Heart,
      title: "Community Focused",
      description: "Building meaningful connections between compatible flatmates."
    },
    {
      icon: Zap,
      title: "Smart Technology",
      description: "AI-powered matching that understands your lifestyle and preferences."
    },
    {
      icon: Target,
      title: "Precise Matching",
      description: "95% compatibility rate through our advanced matching algorithm."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Active Users" },
    { number: "5,000+", label: "Successful Matches" },
    { number: "95%", label: "Satisfaction Rate" },
    { number: "25+", label: "Cities Covered" }
  ];

  const team = [
    {
      name: "Priya Sharma",
      role: "CEO & Co-founder",
      description: "Former product manager at a leading tech company, passionate about solving housing challenges.",
    },
    {
      name: "Arjun Patel", 
      role: "CTO & Co-founder",
      description: "Expert in AI and machine learning, focused on building smart matching algorithms.",
    },
    {
      name: "Meera Singh",
      role: "Head of Safety",
      description: "Former law enforcement officer, ensuring user safety and trust on the platform.",
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-primary-light/20 text-primary-foreground">
            About ApnaRoom
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Revolutionizing Flatmate Finding in India
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            We're on a mission to make finding the perfect living situation simple, safe, and stress-free for everyone in India.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                ApnaRoom was born from a simple frustration: finding a trustworthy flatmate in India's bustling cities shouldn't be this hard. 
                Our founders experienced firsthand the challenges of sifting through countless listings, dealing with unreliable people, 
                and the stress of making the wrong choice.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                In 2023, we decided to change this. By combining smart technology with human insight, we created a platform that 
                doesn't just match you with any available room, but finds you compatible people who share your lifestyle, values, and living preferences.
              </p>
              <p className="text-lg leading-relaxed">
                Today, ApnaRoom is India's most trusted flatmate finding platform, with thousands of successful matches and a 
                community that's changing how young professionals find their perfect living situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-border shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-light/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-border shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              To create a world where finding the perfect living situation is as easy as finding the perfect match. 
              We believe everyone deserves to live with people they genuinely connect with, in spaces that feel like home.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verified & Safe</span>
              </div>
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Smart Matching</span>
              </div>
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;