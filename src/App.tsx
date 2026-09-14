import React, { useState } from 'react';
import './index.css';
import './components/aeroComponents.css';

import { AeroNavbar } from './components/AeroNavbar';
import { AeroHero } from './components/AeroHero';
import { AboutBento } from './components/AboutBento';
import { AeroProjectsGallery } from './components/AeroProjectsGallery';
import { AeroFlightLog } from './components/AeroFlightLog';
import { AeroContact } from './components/AeroContact';
import { AeroFooter } from './components/AeroFooter';
import { AeroModelViewer } from './components/AeroModelViewer';
import type { AeroProject } from './data/aerospaceData';
import { AEROSPACE_DATA } from './data/aerospaceData';

export const App: React.FC = () => {
  const [activeProject, setActiveProject] = useState<AeroProject | null>(AEROSPACE_DATA.projects[0]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleOpenModel = (projOrId?: AeroProject | string) => {
    if (typeof projOrId === 'string') {
      const found = AEROSPACE_DATA.projects.find((p) => p.id === projOrId);
      if (found) setActiveProject(found);
    } else if (projOrId) {
      setActiveProject(projOrId);
    }
    setIsViewerOpen(true);
  };

  return (
    <div className="aero-portfolio-app">
      {/* 1. Header & Telemetry Navigation */}
      <AeroNavbar onOpenModelModal={() => handleOpenModel(AEROSPACE_DATA.projects[0])} />

      {/* 2. Main Flight Deck Sections */}
      <main>
        {/* Hero Section with 4-Stage Model-Morph Sequence */}
        <AeroHero onOpenModelModal={handleOpenModel} />

        {/* 01-04 Middle Bento Grid: About, Experience, Skills, Contact, Polaroid */}
        <AboutBento />

        {/* 05 Featured Projects Row */}
        <AeroProjectsGallery onOpenModelModal={handleOpenModel} />

        {/* 06 Experience & Education: Building Towards a Greater Vision */}
        <AeroFlightLog />

        {/* Touchdown & Comms Contact */}
        <AeroContact />
      </main>

      {/* 3. Footer */}
      <AeroFooter />

      {/* 4. Interactive 3D Model Modal Viewer */}
      <AeroModelViewer
        project={activeProject}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onSelectProject={(proj) => setActiveProject(proj)}
      />
    </div>
  );
};

export default App;
