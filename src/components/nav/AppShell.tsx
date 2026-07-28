import React from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomTabBar from './BottomTabBar';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-canvas">
    <Sidebar />
    <MobileHeader />
    <main className="lg:pl-20 pb-20 lg:pb-0 min-h-screen">{children}</main>
    <BottomTabBar />
  </div>
);

export default AppShell;
