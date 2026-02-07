import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      toastOptions={{
        duration: 2500,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-foreground/90 group-[.toaster]:text-background group-[.toaster]:border-0 group-[.toaster]:backdrop-blur-xl group-[.toaster]:rounded-2xl group-[.toaster]:shadow-lg group-[.toaster]:px-4 group-[.toaster]:py-3",
          description: "group-[.toast]:text-background/80",
          actionButton: "group-[.toast]:bg-background/20 group-[.toast]:text-background group-[.toast]:rounded-full",
          cancelButton: "group-[.toast]:bg-background/10 group-[.toast]:text-background/80 group-[.toast]:rounded-full",
          success: "group-[.toaster]:bg-primary/90 group-[.toaster]:text-primary-foreground",
          error: "group-[.toaster]:bg-destructive/90 group-[.toaster]:text-destructive-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
