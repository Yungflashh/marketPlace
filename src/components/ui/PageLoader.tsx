import React from 'react';
import Spinner from './Spinner';

const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center min-h-[70vh]">
    <Spinner size="lg" />
  </div>
);

export default PageLoader;
