import React from 'react';
import { Wind, Activity, ArrowRight } from 'lucide-react';

interface FlightBandProps {
  fromRegime: string;
  toRegime: string;
  machTransition: string;
  reynoldsTransition?: string;
  flavor: 'laminar-blue' | 'transonic-cyan' | 'supersonic-red';
  hint: string;
}

export const FlightBand: React.FC<FlightBandProps> = ({
  fromRegime,
  toRegime,
  machTransition,
  reynoldsTransition,
  flavor,
  hint,
}) => {
  return (
    <div className={`flight-band-wrapper flavor-${flavor}`}>
      <div className="flight-band-streamlines">
        <div className="streamline-line line-1"></div>
        <div className="streamline-line line-2"></div>
        <div className="streamline-line line-3"></div>
        <div className="streamline-vortex-particle"></div>
      </div>

      <div className="container flight-band-content">
        <div className="band-left">
          <div className="band-icon-wrap">
            <Wind size={16} />
          </div>
          <div className="band-regimes">
            <span className="regime-from">{fromRegime}</span>
            <ArrowRight size={13} className="band-arrow" />
            <span className="regime-to">{toRegime}</span>
          </div>
          <span className="band-hint">// {hint}</span>
        </div>

        <div className="band-right">
          <div className="band-telemetry">
            <Activity size={13} />
            <span className="telemetry-label">TRANSITION:</span>
            <span className="telemetry-mach cfd-text-gradient">{machTransition}</span>
            {reynoldsTransition && (
              <span className="telemetry-re hide-mobile">| Re: {reynoldsTransition}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
