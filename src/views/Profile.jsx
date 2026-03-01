import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Navigation,
  Save,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import OnboardingWelcome from '../components/profile/OnboardingWelcome';

const PROVINCES = [
  "Gauteng", 
  "Western Cape", 
  "KwaZulu-Natal", 
  "Eastern Cape", 
  "Free State", 
  "Limpopo", 
  "Mpumalanga", 
  "North West", 
  "Northern Cape"
];

const SAMPLE_MALLS = [
  "Mall of Africa",
  "Sandton City",
  "Carnival City",
  "Eastgate Shopping Centre",
  "Menlyn Park Shopping Centre",
  "Gateway Theatre of Shopping",
  "Canal Walk Shopping Centre",
  "V&A Waterfront"
];

export default function Profile() {
  const queryClient = useQueryClient();
  const [isLocating, setIsLocating] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: user?.id }),
    enabled: !!user?.id,
  });

  const profile = profiles[0];

  const [formData, setFormData] = useState({
    phone_number: '',
    default_address: '',
    suburb: '',
    city: '',
    province: '',
    postal_code: '',
    preferred_mall: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone_number: profile.phone_number || '',
        default_address: profile.default_address || '',
        suburb: profile.suburb || '',
        city: profile.city || '',
        province: profile.province || '',
        postal_code: profile.postal_code || '',
        preferred_mall: profile.preferred_mall || ''
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create({ ...data, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success('Profile saved successfully');
    }
  });

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ 
            ...prev, 
            latitude, 
            longitude 
          }));
          setIsLocating(false);
          toast.success('Location detected! You can now see nearby malls.');
        },
        () => {
          setIsLocating(false);
          toast.error('Could not get location. Please enter your address manually.');
        }
      );
    } else {
      setIsLocating(false);
      toast.error('Geolocation not supported by your browser');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isProfileComplete = profile && profile.preferred_mall && profile.default_address && profile.city;

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">
            {!profile ? 'Complete Your Profile' : 'My Profile'}
          </h1>
          <p className="text-stone-600 mt-1">
            {!profile 
              ? 'Set up your profile to start shopping' 
              : 'Manage your delivery preferences'}
          </p>
        </div>

        {/* Onboarding Welcome */}
        {!profile && (
          <div className="mb-8">
            <OnboardingWelcome />
          </div>
        )}

        {/* Profile Incomplete Warning */}
        {profile && !isProfileComplete && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Profile Incomplete</h4>
              <p className="text-sm text-amber-700 mt-1">
                Please complete your address and select a preferred mall to start shopping.
              </p>
            </div>
          </div>
        )}

        {/* User Info */}
        <Card className="border-stone-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.full_name?.charAt(0) || 'M'}
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-lg">{user?.full_name || 'Moreki User'}</h3>
                <p className="text-stone-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border-stone-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-600" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-stone-600">Phone Number</Label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+27 XX XXX XXXX"
                  className="mt-1.5 border-stone-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  Delivery Address
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  {isLocating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-2" />
                  )}
                  Use My Location
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-stone-600">Street Address</Label>
                <Input
                  value={formData.default_address}
                  onChange={(e) => setFormData({ ...formData, default_address: e.target.value })}
                  placeholder="123 Main Street"
                  className="mt-1.5 border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-stone-600">Suburb</Label>
                  <Input
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                    placeholder="Sandton"
                    className="mt-1.5 border-stone-200"
                  />
                </div>
                <div>
                  <Label className="text-stone-600">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Johannesburg"
                    className="mt-1.5 border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-stone-600">Province</Label>
                  <Select
                    value={formData.province}
                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                  >
                    <SelectTrigger className="mt-1.5 border-stone-200">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((province) => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-stone-600">Postal Code</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="2196"
                    className="mt-1.5 border-stone-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                Select Your Mall *
              </CardTitle>
              <p className="text-sm text-stone-500 mt-2">
                <strong>Important:</strong> We shop from ALL stores within your selected mall 
                (Spar, Woolworths, Pick n Pay, Checkers, etc. inside the mall)
              </p>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.preferred_mall}
                onValueChange={(value) => setFormData({ ...formData, preferred_mall: value })}
              >
                <SelectTrigger className="border-stone-200">
                  <SelectValue placeholder="Select your preferred mall" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_MALLS.map((mall) => (
                    <SelectItem key={mall} value={mall}>{mall}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  💡 <strong>How it works:</strong> All your items (groceries, meals, gadgets, fashion, etc.) 
                  will be collected from every store inside {formData.preferred_mall || 'your selected mall'} 
                  and consolidated at the mall hub for pickup or delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-6"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : saved ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {saved ? 'Saved!' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
