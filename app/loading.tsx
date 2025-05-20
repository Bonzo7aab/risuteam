import React from "react";

const Loading = () => {
  return (
    <div className="absolute top-0 -translate-x-1/2 left-1/2 z-50">
      <div className="relative">
        <h1 className="font-semibold text-4xl text-risu-400 mb-8">
          Ładowanie strony...
        </h1>
      </div>
    </div>
  );
};

export default Loading;
