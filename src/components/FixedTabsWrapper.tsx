import React, { ReactNode } from 'react';

interface FixedTabsWrapperProps {
  children: ReactNode;
}

const FixedTabsWrapper: React.FC<FixedTabsWrapperProps> = ({ children }) => {
  return (
    <div className="fixed-tabs-container">
      <style jsx>{`
        .fixed-tabs-container {
          position: relative;
        }
        
        /* Rendre la navigation des onglets fixe */
        .fixed-tabs-container .tabs-navigation {
          position: fixed;
          top: 64px; /* Ajuster selon la hauteur de votre header principal */
          left: 256px; /* Ajuster selon la largeur de votre sidebar */
          right: 0;
          z-index: 40;
          background-color: #0f172a; /* bg-slate-900 */
        }
        
        /* Ajouter un padding pour compenser la hauteur de la navigation fixe */
        .fixed-tabs-container .tabs-content {
          padding-top: 60px; /* Hauteur de la barre de navigation des onglets */
        }
        
        /* Pour mobile */
        @media (max-width: 1024px) {
          .fixed-tabs-container .tabs-navigation {
            left: 0;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default FixedTabsWrapper;