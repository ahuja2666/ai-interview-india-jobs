import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Share2, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";

const InterviewCall = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);

  // Ref to track if initial stream setup is complete
  const initialSetupCompleteRef = useRef(false);

  // Function to stop all tracks in a stream
  const stopStreamTracks = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  // Effect to get initial user media (camera/mic) and display media (screen share)
  useEffect(() => {
    // Prevent running more than once on mount
    if (initialSetupCompleteRef.current) {
      return;
    }
    initialSetupCompleteRef.current = true;

    const startInitialStreams = async () => {
      let userMediaStream = null;
      let displayMediaStream = null;

      try {
        // 1. Start user's camera and audio first
        console.log("Attempting initial get user media (camera/mic).");
        userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        userStreamRef.current = userMediaStream; // Store the user stream
        console.log("Initial User stream obtained.", userStreamRef.current);

        // Show the user's camera feed in the bottom-right preview immediately
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = userMediaStream;
        }

        // Ensure audio track is enabled by default (based on initial isMuted state)
        const audioTrack = userMediaStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isMuted;
          console.log(
            "Initial User audio track enabled status:",
            audioTrack.enabled
          );
        }
        const videoTrack = userMediaStream.getVideoTracks()[0];
        if (videoTrack) {
          console.log(
            "Initial User video track enabled status:",
            videoTrack.enabled
          );
        }

        // 2. Then request screen sharing (user will be prompted)
        console.log("Attempting initial get display media (screen share).");
        displayMediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        console.log("Initial Display stream obtained.", displayMediaStream);

        // Check if the user shared the entire screen
        const track = displayMediaStream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log(
          "Initial Screen share displaySurface:",
          settings.displaySurface
        );

        if (settings.displaySurface !== "monitor") {
          console.warn(
            "Initial screen share not entire screen. Stopping display stream."
          );
          stopStreamTracks(displayMediaStream); // Stop the invalid screen stream
          toast({
            variant: "destructive",
            title: "Share your entire screen",
            description:
              "Please share your entire screen to continue the interview.",
          });
          setIsScreenSharing(false); // Mark sharing as not active
          // User stream continues to run
        } else {
          console.log("Initial entire screen shared. Storing display stream.");
          screenStreamRef.current = displayMediaStream; // Store valid screen stream

          // Handle when user stops sharing screen via browser controls
          displayMediaStream.getVideoTracks()[0].onended = () => {
            console.log("Screen share ended by user.");
            setIsScreenSharing(false);
            toast({
              variant: "destructive",
              title: "Screen sharing ended",
              description:
                "Screen sharing was stopped. Please re-share your entire screen to continue.",
            });
          };

          setIsScreenSharing(true); // Mark sharing as active and validated
        }
      } catch (error) {
        console.error("Error starting initial streams:", error);
        // Handle errors specifically for camera/mic or screen share denial

        // If error occurred during getUserMedia (camera/mic)
        if (userMediaStream === null) {
          // userMediaStream would be null if getUserMedia failed
          console.error("Error specifically from getUserMedia.", error);
          toast({
            variant: "destructive",
            title: "Permissions required",
            description:
              "Camera and microphone access are required to start the interview. Please ensure permissions are granted in your browser settings.",
          });
          // Stop any display stream that might have started (unlikely if user media failed first)
          stopStreamTracks(displayMediaStream);
          screenStreamRef.current = null;
          setIsScreenSharing(false); // Interview cannot proceed without user media
          userStreamRef.current = null; // Clear user stream ref as it failed

          // If error occurred during getDisplayMedia (screen share) AFTER successful getUserMedia
        } else {
          // userMediaStream is NOT null, meaning getUserMedia succeeded
          console.error(
            "Error specifically from getDisplayMedia or unexpected.",
            error
          );
          toast({
            variant: "destructive",
            title: "Screen Sharing Required",
            description:
              "Screen sharing access is required to continue the interview. Please click share again.",
          });
          // Stop the display stream that failed
          stopStreamTracks(displayMediaStream);
          screenStreamRef.current = null; // Clear screen stream ref as it failed
          setIsScreenSharing(false); // Screen sharing is not active
          // userStreamRef.current remains intact as user media was successful
        }

        // In case of any error during initial setup, ensure screen sharing status is false
        setIsScreenSharing(false);
      }
    };

    startInitialStreams();

    // Cleanup streams on unmount
    return () => {
      console.log("Cleaning up streams on unmount.");
      stopStreamTracks(screenStreamRef.current);
      screenStreamRef.current = null; // Clear ref on cleanup
      console.log("Screen stream cleaned up.");

      stopStreamTracks(userStreamRef.current);
      userStreamRef.current = null; // Clear ref on cleanup
      console.log("User stream cleaned up.");
    };
    // Empty dependency array means this effect runs only once on mount and cleans up on unmount
  }, [toast, stopStreamTracks]); // Removed isMuted from dependency array

  // Effect to handle audio track enabled state when isMuted changes
  useEffect(() => {
    console.log("isMuted state changed:", isMuted);
    if (userStreamRef.current) {
      const audioTrack = userStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        console.log(
          "User audio track enabled status updated:",
          audioTrack.enabled
        );
      } else {
        console.warn(
          "No audio track found on user stream when isMuted changed."
        );
      }
    } else {
      console.warn(
        "userStreamRef is null when isMuted changed. Cannot update audio track."
      );
    }
  }, [isMuted]); // This effect runs ONLY when isMuted changes

  // Effect to handle video track enabled state when isVideoOff changes
  useEffect(() => {
    console.log("isVideoOff state changed:", isVideoOff);
    if (userStreamRef.current) {
      const videoTrack = userStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
        console.log(
          "User video track enabled status updated:",
          videoTrack.enabled
        );
      } else {
        console.warn(
          "No video track found on user stream when isVideoOff changed."
        );
      }
    } else {
      console.warn(
        "userStreamRef is null when isVideoOff changed. Cannot update video track."
      );
    }
  }, [isVideoOff]); // This effect runs ONLY when isVideoOff changes

  const toggleMute = () => {
    console.log("toggleMute clicked.");
    setIsMuted(!isMuted);
    // The useEffect for isMuted will handle enabling/disabling the audio track
  };

  const toggleVideo = () => {
    console.log("toggleVideo clicked.");
    setIsVideoOff(!isVideoOff);
    // The useEffect for isVideoOff will handle enabling/disabling the video track
  };

  const toggleScreenShare = async () => {
    console.log("toggleScreenShare clicked. isScreenSharing:", isScreenSharing);
    // This function is now primarily for *re-starting* or *stopping* screen share via button
    if (isScreenSharing) {
      // If currently sharing (and validated as entire screen), stop screen share
      console.log("Attempting to stop current screen stream.");
      stopStreamTracks(screenStreamRef.current);
      screenStreamRef.current = null; // Clear ref when stopping
      setIsScreenSharing(false);
      console.log(
        "Current screen stream stopped. isScreenSharing set to false."
      );
    } else {
      // If not currently sharing (either stopped by user or failed validation), try starting
      // We should NOT attempt to get user media (camera/mic) again here.
      // The user stream should persist from the initial useEffect call.
      if (
        !userStreamRef.current ||
        userStreamRef.current
          .getTracks()
          .some((track) => track.readyState === "ended")
      ) {
        console.error(
          "User stream is not active. Cannot re-share screen without active user stream."
        );
        toast({
          variant: "destructive",
          title: "Camera/Mic Required",
          description:
            "Your camera and microphone need to be active to share your screen.",
        });
        setIsScreenSharing(false);
        // Potentially guide user back to setup or show a blocked state
        return; // Prevent screen share attempt if user stream is bad
      }

      try {
        console.log(
          "Requesting screen share (display media) again from toggleScreenShare."
        );
        // Request screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        console.log("Display stream obtained on re-share.", stream);

        // Check if the user shared the entire screen
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log(
          "Screen share displaySurface on re-share:",
          settings.displaySurface
        );

        if (settings.displaySurface !== "monitor") {
          console.warn(
            "Re-shared screen not entire screen. Stopping display stream."
          );
          stopStreamTracks(stream);
          toast({
            variant: "destructive",
            title: "Share your entire screen",
            description:
              "Please share your entire screen to continue the interview.",
          });
          setIsScreenSharing(false);
          return;
        }

        // Successfully shared entire screen on re-share
        console.log("Successfully re-shared entire screen.");
        stopStreamTracks(screenStreamRef.current); // Stop old screen stream if any
        screenStreamRef.current = stream; // Store the new screen stream
        console.log("New screen stream stored.", screenStreamRef.current);

        // User stream should still be active and attached to userVideoRef from initial effect
        // We just need to handle its tracks being enabled/disabled by other controls if necessary,
        // which is handled by the separate useEffects for isMuted and isVideoOff.

        // Handle when user stops sharing screen via browser controls
        stream.getVideoTracks()[0].onended = () => {
          console.log("Re-shared screen share ended by user.");
          setIsScreenSharing(false);
          toast({
            variant: "destructive",
            title: "Screen sharing ended",
            description:
              "Screen sharing was stopped. Please re-share your entire screen to continue.",
          });
        };

        setIsScreenSharing(true);
        console.log("isScreenSharing set to true after successful re-share.");
      } catch (error) {
        console.error("Error re-starting screen share:", error);
        // User likely denied permissions or closed the dialog for screen share
        toast({
          variant: "destructive",
          title: "Screen sharing Required",
          description:
            "Screen sharing access is required to continue the interview.",
        });
        setIsScreenSharing(false);
      }
    }
  };

  const endCall = () => {
    console.log("End call clicked.");
    stopStreamTracks(screenStreamRef.current);
    screenStreamRef.current = null;

    stopStreamTracks(userStreamRef.current);
    userStreamRef.current = null;

    navigate("/");
    console.log("Navigating to home.");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Meeting View (AI Avatar) */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardContent className="p-0 h-full relative">
                {/* AI Avatar (Large) */}
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="relative">
                    {/* AI Avatar Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full bg-primary/20 animate-pulse" />
                    </div>
                    {/* AI Avatar Image */}
                    <div className="relative z-10">
                      <div className="w-40 h-40 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-lg">
                        <span className="text-6xl font-bold text-primary">
                          AI
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The candidate video preview is now in the right sidebar */}
                {/* ... */}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Info, User Video, and Controls */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mt-4 text-center">
                  <h3 className="font-semibold text-lg">AI Interviewer</h3>
                  <p className="text-sm text-muted-foreground">
                    {isSpeaking ? "Speaking..." : "Listening..."}
                  </p>
                  {/* Interview Status Indicator */}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isScreenSharing ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {isScreenSharing
                        ? "Interview Running"
                        : "Interview Paused (Screen Share Required)"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Video Preview (now in sidebar) */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <video
                    ref={userVideoRef}
                    autoPlay
                    playsInline
                    muted // Mute local preview to avoid echo
                    className="w-full h-full object-cover"
                  />
                  {!isScreenSharing && (
                    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                      <p className="text-white text-center px-4 text-sm">
                        Entire Screen sharing required.
                        <br />
                        Click the share button below to re-share.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center gap-4">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={isVideoOff ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? (
                      <VideoOff className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={!isScreenSharing ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleScreenShare} // This button now triggers re-prompt if needed
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={endCall}>
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCall;
