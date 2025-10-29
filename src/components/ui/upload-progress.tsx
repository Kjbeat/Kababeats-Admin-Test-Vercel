import React from 'react';
import { Check, Upload, Music, Image, Database, Globe, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

export interface UploadStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress?: number;
}

interface UploadProgressProps {
  steps: UploadStep[];
  currentStep: number;
  overallProgress: number;
  isUploading: boolean;
  error?: string;
}

export function UploadProgress({ 
  steps, 
  currentStep, 
  overallProgress, 
  isUploading, 
  error 
}: UploadProgressProps) {
  const getStepIcon = (step: UploadStep, index: number) => {
    if (step.status === 'completed') {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (step.status === 'in-progress' || (index === currentStep && isUploading)) {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    }
    if (step.status === 'error') {
      return <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
        <span className="text-white text-xs">!</span>
      </div>;
    }
    return <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />;
  };

  const getStepStatus = (step: UploadStep, index: number) => {
    if (step.status === 'completed') return 'text-green-600';
    if (step.status === 'in-progress' || (index === currentStep && isUploading)) return 'text-primary';
    if (step.status === 'error') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">
                {isUploading ? 'Publishing Your Beat' : 'Upload Complete'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isUploading 
                ? 'Please wait while we process your beat...' 
                : error ? 'Upload failed. Please try again.' : 'Your beat has been successfully published!'
              }
            </p>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
            </div>
            <Progress 
              value={overallProgress} 
              className="h-2"
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getStepIcon(step, index)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm font-medium ${getStepStatus(step, index)}`}>
                      {step.label}
                    </span>
                  </div>
                  {step.progress !== undefined && step.status === 'in-progress' && (
                    <div className="mt-1">
                      <Progress value={step.progress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Predefined steps for beat upload
export const BEAT_UPLOAD_STEPS: UploadStep[] = [
  {
    id: 'upload-files',
    label: 'Uploading audio and artwork',
    icon: Upload,
    status: 'pending'
  },
  {
    id: 'process-audio',
    label: 'Processing audio file',
    icon: Music,
    status: 'pending'
  },
  {
    id: 'process-artwork',
    label: 'Processing artwork',
    icon: Image,
    status: 'pending'
  },
  {
    id: 'save-database',
    label: 'Saving to database',
    icon: Database,
    status: 'pending'
  },
  {
    id: 'make-live',
    label: 'Making beat live',
    icon: Globe,
    status: 'pending'
  }
];
