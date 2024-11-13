import React from "react";

export default function ScrollableContent({
  children,
  className = "",
  width = "w-full",
  height = "h-64",
}) {
  return (
    <div
      className={`
        ${width} ${height} h-64 scrollbar-corner-sky-100 scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-50
        ${className}
      `}
      // style={{
      //     scrollbarWidth: 'thin',
      //     scrollbarColor: 'rgba(209, 213, 219, 0.5) transparent',
      // }}
    >
      {children}
    </div>
  );
}

// <div
//     className="scrollbar-corner-sky-500 scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300 h-32 overflow-scroll">
//     <div className="h-64 w-[100vw] bg-slate-400"></div>
// </div>
