import * as React from "react";

export const Card = ({ className = "", ...props }) => (
  <div className={`rounded-xl border border-gray-200 bg-white shadow ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }) => (
  <div className={`p-4 ${className}`} {...props} />
);
