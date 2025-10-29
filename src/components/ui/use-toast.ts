import { toast } from "sonner";

// Create a useToast hook that works with sonner
export const useToast = () => {
  return {
    toast: (options: any) => {
      if (options.variant === 'destructive') {
        toast.error(options.description, { title: options.title });
      } else {
        toast.success(options.description, { title: options.title });
      }
    }
  };
};

export { toast };
