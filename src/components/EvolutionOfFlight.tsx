import React, { useState } from 'react';
import { Wind, Feather } from 'lucide-react';
import { EvolutionStageViewer } from './EvolutionStageViewer';
import { AEROSPACE_DATA } from '../data/aerospaceData';

export const EvolutionOfFlight: React.FC = () => {
  const { evolutionStages } = AEROSPACE_DATA;
  const [selectedStageId, setSelectedStageId] = useState(evolutionStages[0].id);

  const activeStage =
    evolutionStages.find((s) => s.id === selectedStageId) || evolutionStages[0];

  return (
    <section id="evolution" className="ref-evolution-section">
      <div className="container">
        {/* 3.1 Section Header Entrance */}
        <div className="section-header text-center">
          <div className="telemetry-tag">
            <Wind size={13} color="#2563eb" />
            <span>EVOLUTION OF FLIGHT // AIRFLOW DISCIPLINE</span>
          </div>
          <h2 className="section-title">
            From Nature's Feathers to <span className="cfd-text-gradient">Laminar Autonomy</span>
          </h2>
          <p className="section-subtitle">
            Observe the airflow visibly purify across 4 distinct eras: notice how organic turbulence transitions into structured biplane flow, culminating in modern computational precision.
          </p>
        </div>

        {/* Stage Switcher Tabs */}
        <div className="evolution-nav-tabs">
          {evolutionStages.map((stg, idx) => (
            <button
              key={stg.id}
              type="button"
              className={`evolution-tab-btn ${selectedStageId === stg.id ? 'active' : ''}`}
              onClick={() => setSelectedStageId(stg.id)}
            >
              <span className="tab-idx">0{idx + 1}</span>
              <span className="tab-title">{stg.title}</span>
              <span className={`tab-flow-badge flow-${stg.flowType}`}>
                {stg.flowType.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* Active Stage Interactive Showcase */}
        <div className="evolution-showcase-card aero-card">
          <div className="showcase-left-viewport">
            <EvolutionStageViewer stage={activeStage} isActive={true} />
          </div>

          <div className="showcase-right-dossier">
            <div className="stage-era-pill">
              <span className="pulse-dot" />
              <span>{activeStage.era}</span>
            </div>

            <h3 className="stage-main-title">{activeStage.title}</h3>
            <span className="stage-period">{activeStage.period}</span>

            <p className="stage-description">{activeStage.description}</p>

            <div className="stage-telemetry-metrics">
              <div className="st-metric">
                <span className="st-lbl">FLOW REGIME</span>
                <span className={`st-val flow-${activeStage.flowType}`}>
                  {activeStage.flowType.toUpperCase()}
                </span>
              </div>
              <div className="st-metric">
                <span className="st-lbl">VELOCITY</span>
                <span className="st-val">{activeStage.speed}</span>
              </div>
              <div className="st-metric">
                <span className="st-lbl">REYNOLDS NUMBER</span>
                <span className="st-val">{activeStage.reynolds}</span>
              </div>
            </div>

            <div className="stage-narrative-box">
              <div className="narrative-heading">
                <Feather size={14} color="#2563eb" />
                <span>Historical Aerodynamic Intent</span>
              </div>
              <p className="narrative-text">{activeStage.narrative}</p>
            </div>
          </div>
        </div>

        {/* 3.2 Stage Cards Carousel / Grid (Spec 3.2, 3.5) */}
        <div className="evolution-cards-grid">
          {evolutionStages.map((stage, idx) => (
            <div
              key={stage.id}
              className={`evo-stage-card ${selectedStageId === stage.id ? 'selected' : ''} ${
                stage.flowType === 'laminar' ? 'drone-hero-card' : ''
              }`}
              onClick={() => setSelectedStageId(stage.id)}
              data-flow={stage.flowType}
            >
              <div className="card-top-row">
                <span className="card-era-num">0{idx + 1}</span>
                <span className={`card-flow-tag flow-${stage.flowType}`}>{stage.flowType}</span>
              </div>
              <h4 className="card-stage-name">{stage.title}</h4>
              <span className="card-period">{stage.period}</span>
              <p className="card-brief">{stage.description.slice(0, 75)}...</p>
              <div className="card-bottom-action">
                <span>View Aerodynamics & 3D Model →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
