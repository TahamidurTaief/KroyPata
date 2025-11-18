// app/Components/Common/PageLoader.jsx
import React from "react";

const PageLoader = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--color-button-primary)]"></div>
    </div>
  );
};

export default PageLoader;
