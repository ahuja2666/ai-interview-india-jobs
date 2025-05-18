import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/lib/constants";
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
} from "lucide-react";

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <CardDescription>{job.company}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{job.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.experience.min}-{job.experience.max} {job.experience.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.education.degree} in {job.education.field}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Posted {new Date(job.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <Badge key={index} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {job.workMode}
            </Badge>
            <span className="text-sm text-muted-foreground">
              • {job.companyInfo.size}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm">
          <p className="text-muted-foreground">{job.location}</p>
          <p className="font-medium text-foreground">{job.salary}</p>
        </div>
        <Button onClick={() => navigate(`/job/${job.id}`)}>View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
