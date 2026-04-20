import React from 'react';
import RetailerMobileLayout from '../RetailerMobileLayout';
import RetailerProfile from './Profile';

function RetailerProfileWrapper() {
  return (
    <RetailerMobileLayout>
      <RetailerProfile />
    </RetailerMobileLayout>
  );
}

export default RetailerProfileWrapper;