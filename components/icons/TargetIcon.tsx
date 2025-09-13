import React from 'react';

export const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v3.75m0 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 12h.008v.008H12V12zm-3.75 0h.008v.008H8.25V12zm0 3.75h.008v.008H8.25v-3.75zm3.75 0h.008v.008H12v-3.75zm0 3.75h.008v.008H12v-3.75zm3.75 0h.008v.008h-.008v-3.75zm0-3.75h.008v.008h-.008V12z" />
  </svg>
);
