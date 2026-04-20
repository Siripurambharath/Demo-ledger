import React from 'react';
import RetailerMobileLayout from '../RetailerMobileLayout';
import RetailerHome from './Home';

function RetailerHomeWrapper() {
  return (
    <RetailerMobileLayout>
      <RetailerHome />
    </RetailerMobileLayout>
  );
}

export default RetailerHomeWrapper;