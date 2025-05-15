import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Video, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DUMMY_JOBS } from "@/lib/constants";
import NavBar from "@/components/NavBar";

const Interview = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // Separate states for video and audio
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<{
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({
    microphones: [],
    speakers: [],
  });

  const [selectedDevices, setSelectedDevices] = useState({
    camera: "",
    microphone: "",
    speaker: "",
  });

  // Separate refs for video and audio streams
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // For demo purposes, we'll use the first job from DUMMY_JOBS
  const job = DUMMY_JOBS[0];

  const updateDeviceList = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras = devices
        .filter((device) => device.kind === "videoinput")
        .sort((a, b) => {
          if (a.label.toLowerCase().includes("default")) return -1;
          if (b.label.toLowerCase().includes("default")) return 1;
          if (
            a.label.toLowerCase().includes("built-in") ||
            a.label.toLowerCase().includes("mac")
          )
            return -1;
          if (
            b.label.toLowerCase().includes("built-in") ||
            b.label.toLowerCase().includes("mac")
          )
            return 1;
          return 0;
        });

      const microphones = devices
        .filter((device) => device.kind === "audioinput")
        .sort((a, b) => {
          if (a.label.toLowerCase().includes("default")) return -1;
          if (b.label.toLowerCase().includes("default")) return 1;
          if (
            a.label.toLowerCase().includes("built-in") ||
            a.label.toLowerCase().includes("mac")
          )
            return -1;
          if (
            b.label.toLowerCase().includes("built-in") ||
            b.label.toLowerCase().includes("mac")
          )
            return 1;
          return 0;
        });

      const speakers = devices
        .filter((device) => device.kind === "audiooutput")
        .sort((a, b) => {
          if (a.label.toLowerCase().includes("default")) return -1;
          if (b.label.toLowerCase().includes("default")) return 1;
          if (
            a.label.toLowerCase().includes("built-in") ||
            a.label.toLowerCase().includes("mac")
          )
            return -1;
          if (
            b.label.toLowerCase().includes("built-in") ||
            b.label.toLowerCase().includes("mac")
          )
            return 1;
          return 0;
        });

      setVideoDevices(cameras);
      setAudioDevices({ microphones, speakers });

      // Update selected devices if current ones are no longer available
      setSelectedDevices((prev) => {
        const newSelected = { ...prev };

        if (!cameras.find((c) => c.deviceId === prev.camera)) {
          newSelected.camera = cameras[0]?.deviceId || "";
        }
        if (!microphones.find((m) => m.deviceId === prev.microphone)) {
          newSelected.microphone = microphones[0]?.deviceId || "";
        }
        if (!speakers.find((s) => s.deviceId === prev.speaker)) {
          newSelected.speaker = speakers[0]?.deviceId || "";
        }

        return newSelected;
      });
    } catch (error) {
      console.error("Error updating device list:", error);
    }
  }, []);

  const setupVideoStream = useCallback(async (deviceId?: string) => {
    try {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoStreamRef.current = stream;

      // Update video element with stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error("Error setting up video stream:", error);
      throw error;
    }
  }, []);

  const setupAudioStream = useCallback(async (deviceId?: string) => {
    try {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: false,
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      audioStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error setting up audio stream:", error);
      throw error;
    }
  }, []);

  const handleDeviceChange = async (
    type: "camera" | "microphone" | "speaker",
    deviceId: string
  ) => {
    setSelectedDevices((prev) => ({ ...prev, [type]: deviceId }));

    try {
      if (type === "camera") {
        await setupVideoStream(deviceId);
      } else if (type === "microphone") {
        await setupAudioStream(deviceId);
      }
      // Speaker changes don't require stream updates
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error switching device",
        description: "Failed to switch device. Please try again.",
      });
    }
  };

  useEffect(() => {
    const initializeDevices = async () => {
      try {
        // Initialize both video and audio streams
        await setupVideoStream();
        await setupAudioStream();
        await updateDeviceList();
        setPermissionsGranted(true);
      } catch (error) {
        console.error("Error initializing devices:", error);
        toast({
          variant: "destructive",
          title: "Permission denied",
          description: "Please allow camera and microphone access to continue.",
        });
      }
    };

    initializeDevices();

    // Add device change listener
    navigator.mediaDevices.addEventListener("devicechange", updateDeviceList);

    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        updateDeviceList
      );
    };
  }, [setupVideoStream, setupAudioStream, updateDeviceList, toast]);

  const handleStartInterview = () => {
    navigate(`/interview/${candidateId}/start`);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Video Preview and Device Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{job.title} Interview</CardTitle>
                <p className="text-muted-foreground">
                  Please ensure your camera and microphone are working properly
                  before starting the interview.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Preview */}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>

                {/* Device Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-muted-foreground" />
                    <Select
                      value={selectedDevices.camera}
                      onValueChange={(value) =>
                        handleDeviceChange("camera", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoDevices.map((camera) => (
                          <SelectItem
                            key={camera.deviceId}
                            value={camera.deviceId}
                          >
                            {camera.label ||
                              `Camera ${camera.deviceId.slice(0, 5)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-muted-foreground" />
                    <Select
                      value={selectedDevices.microphone}
                      onValueChange={(value) =>
                        handleDeviceChange("microphone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices.microphones.map((mic) => (
                          <SelectItem key={mic.deviceId} value={mic.deviceId}>
                            {mic.label ||
                              `Microphone ${mic.deviceId.slice(0, 5)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <Select
                      value={selectedDevices.speaker}
                      onValueChange={(value) =>
                        handleDeviceChange("speaker", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select speaker" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices.speakers.map((speaker) => (
                          <SelectItem
                            key={speaker.deviceId}
                            value={speaker.deviceId}
                          >
                            {speaker.label ||
                              `Speaker ${speaker.deviceId.slice(0, 5)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Ready to Join */}
          <div className="flex flex-col justify-center">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold">Ready to join?</h2>
                  <p className="text-muted-foreground">
                    Your interview is about to begin. Make sure your camera and
                    microphone are working properly.
                  </p>
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleStartInterview}
                      disabled={!permissionsGranted}
                    >
                      Start Interview
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Support",
                          description:
                            "Our support team will contact you shortly.",
                        });
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Having Issues?
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to AI Interview</DialogTitle>
            <DialogDescription>
              This interview will take approximately 10 minutes to complete.
              Please ensure you have a quiet environment and stable internet
              connection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">What to expect:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Technical questions related to the position</li>
                <li>Problem-solving scenarios</li>
                <li>Behavioral questions</li>
                <li>Real-time feedback and evaluation</li>
              </ul>
            </div>
            <Button
              className="w-full"
              onClick={() => setShowWelcomeModal(false)}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interview;
