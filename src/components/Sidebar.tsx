import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          <p className="text-white">Menu temporaire</p>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;