import { useToast } from "@chakra-ui/react";

export const useNotify = () => {
  const toast = useToast();

  const isMobile = () => window.innerWidth < 768;

  const notify = (title: string, description: string, status: 'success' | 'error' | 'info' | 'warning') => {
    const toastId = `${title}-${status}`;

    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        duration: 3000,
        isClosable: true,
        position: isMobile() ? 'top' : 'bottom-right',
        status,
        title,
        description,
      });
    }
  };

  return { notify };
};
