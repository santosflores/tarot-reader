import React from 'react';

export const Background: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10">
            {/* Base image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/images/bg.jpg)' }}
            />
            {/* CSS Effects overlay */}
            <div className="tarot-background absolute inset-0" style={{ background: 'transparent' }}>
                {/* Slow rotating aurora */}
                <div className="aurora" />
                {/* Rising particles */}
                <div className="mystical-particles">
                    <span /><span /><span /><span /><span />
                    <span /><span /><span /><span /><span />
                    <span /><span /><span /><span /><span />
                    <span /><span /><span /><span /><span />
                    <span /><span /><span /><span /><span />
                    <span /><span /><span /><span /><span />
                    <span /><span /><span /><span /><span />
                </div>
                {/* Vignette */}
                <div className="vignette" />
            </div>
        </div>
    );
};
