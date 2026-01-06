'use client';

import dynamic from 'next/dynamic';

const NewExperimentForm = dynamic(() => import('./NewExperimentForm'), {
  ssr: false,
  loading: () => <div />,
});

export default function NewExperimentClient() {
  return <NewExperimentForm />;
}

