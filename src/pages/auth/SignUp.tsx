
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, UserPlus } from "lucide-react";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"jobseeker" | "employer">("jobseeker");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

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
    
    setIsLoading(true);

    try {
      await signup(email, password, role);
      toast({
        title: "Account created",
        description: "Welcome to JobsIndiaAI!",
      });
      navigate(role === "jobseeker" ? "/onboarding/job-seeker" : "/onboarding/employer");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "Please try again with a different email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
      toast({
        title: "Account created",
        description: "Welcome to JobsIndiaAI!",
      });
      navigate("/onboarding/job-seeker");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google sign up failed",
        description: "Please try again later",
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
                    onValueChange={(value) => setRole(value as "jobseeker" | "employer")}
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

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="48px"
                  height="48px"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                <span>Google</span>
              </Button>
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
