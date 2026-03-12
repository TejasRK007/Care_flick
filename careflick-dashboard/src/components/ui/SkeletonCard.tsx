import React from 'react';
import './SkeletonCard.css';

const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton-avatar shimmer"></div>
        <div className="skeleton-info">
          <div className="skeleton-line shimmer title-line"></div>
          <div className="skeleton-line shimmer subtitle-line"></div>
        </div>
      </div>
      
      <div className="skeleton-body">
        <div className="skeleton-contact">
          <div className="skeleton-line shimmer"></div>
          <div className="skeleton-line shimmer w-75"></div>
        </div>
      </div>

      <div className="skeleton-footer">
        <div className="skeleton-btn shimmer"></div>
        <div className="skeleton-btn shimmer"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
