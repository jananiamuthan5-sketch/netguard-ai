import React from 'react';
import RoutePlaceholder from '../components/RoutePlaceholder';

export default function ModelPerformancePage() {
  return (
    <RoutePlaceholder
      title="Machine Learning Model Performance"
      description="Real validation metrics including Confusion Matrix, Precision, Recall / Detection Rate, F1-Scores, and ROC-AUC curves calculated on benchmark datasets will be displayed in Phase 2."
      plannedPhase="Phase 2"
    />
  );
}
