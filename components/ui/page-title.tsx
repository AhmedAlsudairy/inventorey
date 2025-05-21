"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
}

export const PageTitle = ({ title, subtitle, backUrl }: PageTitleProps) => {
  return (
    <div className="flex flex-col gap-1">
      {backUrl && (
        <Link 
          href={backUrl} 
          className="flex items-center text-sm text-muted-foreground mb-2 hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
};