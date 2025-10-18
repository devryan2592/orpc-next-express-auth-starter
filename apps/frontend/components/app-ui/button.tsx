import { FC } from "react";
import {
  Button as UIButton,
  buttonVariants,
} from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { IconType } from "react-icons";
import { LucideIcon } from "lucide-react";
import { VariantProps } from "class-variance-authority";

interface AppButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  icon?: IconType | LucideIcon;
  iconPosition?: "left" | "right" | "start" | "end";
  buttonSize?: "big" | "medium" | "small";
  buttonWidth?: "full" | "inherit";
  asChild?: boolean;
}

const AppButton: FC<AppButtonProps> = ({
  children,
  icon: Icon,
  iconPosition = "left",
  buttonSize = "medium",
  buttonWidth = "inherit",
  className,
  ...props
}) => {
  // Map custom buttonSize to UI package size variants
  const getSizeVariant = (size: "big" | "medium" | "small") => {
    switch (size) {
      case "big":
        return "lg";
      case "medium":
        return "default";
      case "small":
        return "sm";
      default:
        return "default";
    }
  };

  // Handle icon position (left/start are equivalent, right/end are equivalent)
  const isIconLeft = iconPosition === "left" || iconPosition === "start";
  const isIconRight = iconPosition === "right" || iconPosition === "end";

  // Custom height for medium size (h-10)
  const customSizeClass = buttonSize === "medium" ? "h-10" : "";

  // Width classes
  const widthClass = buttonWidth === "full" ? "w-full" : "";

  return (
    <UIButton
      size={getSizeVariant(buttonSize)}
      className={cn(
        customSizeClass,
        widthClass,
        "flex items-center justify-center gap-2 cursor-pointer",
        className
      )}
      {...props}
    >
      {Icon && isIconLeft && <Icon className="shrink-0" />}
      {children}
      {Icon && isIconRight && <Icon className="shrink-0" />}
    </UIButton>
  );
};

export default AppButton;
