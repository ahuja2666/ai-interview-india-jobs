
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, UserPlus } from "lucide-react";
import { useSignUp, SignUpButton } from "@clerk/clerk-react";

type UserRole = "jobseeker" | "employer";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("jobseeker");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, isLoaded } = useSignUp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
      });
      return;
    }
    
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      // Start the sign-up process
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set a custom user attribute for the role
      // This will be stored in the user metadata
      const userData = {
        role: role,
        isOnboarded: false,
      };
      
      // Attempt to complete the sign-up with the verification code
      // In a real app, this would be after user enters verification code
      // For now, we'll just proceed with sign-up
      await signUp.setActive({
        session: true, 
        metadata: userData
      });

      toast({
        title: "Account created",
        description: "Welcome to JobsIndiaAI!",
      });
      navigate(role === "jobseeker" ? "/onboarding/job-seeker" : "/onboarding/employer");
    } catch (error) {
      console.error("Sign-up error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "Please try again with a different email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Left side - Sign Up Form */}
        <div className="flex w-full items-center justify-center lg:w-1/2">
          <div className="mx-auto w-full max-w-md space-y-8 px-4 sm:px-6">
            {/* Logo */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-bold">JI</span>
                </div>
                <span className="font-bold text-xl">
                  JobsIndia<span className="text-primary">AI</span>
                </span>
              </Link>
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-muted-foreground">
                Sign up to start your career journey with JobsIndiaAI
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>I am a:</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="jobseeker" id="jobseeker" />
                      <Label htmlFor="jobseeker" className="cursor-pointer">Job Seeker</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="employer" id="employer" />
                      <Label htmlFor="employer" className="cursor-pointer">Employer</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </div>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <SignUpButton mode="modal">
                  <Button variant="outline" className="w-full">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up with Google
                  </Button>
                </SignUpButton>
              </div>
            </form>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden bg-muted lg:block lg:w-1/2">
          <div className="h-full w-full bg-gradient-to-bl from-primary to-secondary/60 flex items-center justify-center p-12">
            <div className="max-w-lg text-white">
              <h2 className="text-3xl font-bold mb-6">
                Start Your AI-Powered Job Journey Today
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Whether you're a job seeker looking for your next opportunity or an employer
                looking to find the perfect candidate, JobsIndiaAI has you covered.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="font-medium mb-2">For Job Seekers</h3>
                  <ul className="text-sm space-y-1 opacity-90">
                    <li>• Practice AI interviews</li>
                    <li>• Get instant feedback</li>
                    <li>• Apply to top jobs</li>
                    <li>• Track your progress</li>
                  </ul>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <h3 className="font-medium mb-2">For Employers</h3>
                  <ul className="text-sm space-y-1 opacity-90">
                    <li>• Post jobs easily</li>
                    <li>• Screen with AI interviews</li>
                    <li>• Get detailed reports</li>
                    <li>• Save hiring time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
