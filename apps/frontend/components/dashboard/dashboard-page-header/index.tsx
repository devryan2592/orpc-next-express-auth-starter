import { FC } from "react";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const DashboardPageHeader: FC<DashboardPageHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default DashboardPageHeader;
