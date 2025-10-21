"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Settings,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import AppButton from "@/components/app-ui/button";
import { updateProfile, formatDate, getInitials } from "../actions";
import type { User as UserType } from "../actions/types";

// Profile form validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileTabProps {
  user: UserType;
  onUserUpdate: () => void;
}

export default function ProfileTab({ user, onUserUpdate }: ProfileTabProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile form setup
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  /**
   * Handles profile update submission
   */
  const handleProfileUpdate = async (data: ProfileFormData) => {
    const success = await updateProfile({ name: data.name });
    
    if (success) {
      setIsEditingProfile(false);
      onUserUpdate(); // Refresh user data in parent component
    }
  };

  /**
   * Cancels profile editing and resets form
   */
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    profileForm.reset({
      name: user.name,
      email: user.email,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal information and profile settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              title="Change profile picture"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant={user.emailVerified ? "default" : "secondary"}>
                {user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={
                          !isEditingProfile ||
                          profileForm.formState.isSubmitting
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        disabled={
                          !isEditingProfile ||
                          profileForm.formState.isSubmitting
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              {!isEditingProfile ? (
                <AppButton
                  type="button"
                  icon={Edit}
                  iconPosition="left"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </AppButton>
              ) : (
                <div className="flex items-center gap-2">
                  <AppButton
                    type="submit"
                    icon={Save}
                    iconPosition="left"
                    loading={profileForm.formState.isSubmitting}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </AppButton>
                  <AppButton
                    type="button"
                    variant="outline"
                    icon={X}
                    iconPosition="left"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </AppButton>
                </div>
              )}
            </div>
          </form>
        </Form>

        <Separator />

        {/* Account Information */}
        <div className="space-y-4">
          <h4 className="font-semibold">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last updated:</span>
              <span>{formatDate(user.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}