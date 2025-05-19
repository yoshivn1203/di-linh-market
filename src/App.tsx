import React from 'react';
import MarketMap from './MarketMap';

const App: React.FC = () => {
  return (
    <div>
      <h1 className='text-2xl font-bold text-red-500'>Bản đồ chợ Di Linh</h1>
      <MarketMap />
    </div>
  );
};

export default App;
