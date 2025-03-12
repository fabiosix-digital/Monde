import React from 'react';

export function WorldMap() {
  return (
    <div className="h-[400px] w-full rounded-xl border bg-card p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Distribuição Global
      </h3>
      <div className="relative h-[calc(100%-2rem)] w-full">
        <img
          src="https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?auto=format&fit=crop&w=800&q=80"
          alt="Mapa Mundial"
          className="h-full w-full rounded-lg object-cover opacity-50"
        />
        {[
          { top: '30%', left: '20%', value: '234' },
          { top: '40%', left: '45%', value: '567' },
          { top: '25%', left: '70%', value: '189' },
        ].map((point, index) => (
          <div
            key={index}
            className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ top: point.top, left: point.left }}
          >
            <div className="absolute h-4 w-4 animate-ping rounded-full bg-blue-500 opacity-75"></div>
            <div className="absolute h-4 w-4 rounded-full bg-blue-500"></div>
            <div className="absolute -top-8 rounded-full bg-gray-900 px-2 py-1 text-xs font-semibold text-white">
              {point.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}