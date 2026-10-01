import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-700">© 2019-2025 Pearson Education, Inc. or its affiliate(s). All rights reserved.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ordinate and Versant are trademarks, in the U.S. and/or other countries, of Pearson Education, Inc. or its affiliate(s).
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <a
            href="https://www.versanttests.com"
            target="_blank"
            rel="noreferrer"
            className="text-[#007788] hover:underline font-medium"
          >
            VersantTests.com
          </a>
          <span>·</span>
          <span>Scorekeeper Portal</span>
          <span>·</span>
          <span>TIN: 27146819</span>
        </div>
      </div>
    </footer>
  );
};
