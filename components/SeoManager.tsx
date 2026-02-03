import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiService } from '../services/api';
import { SeoSettings } from '../types';

const SeoManager: React.FC = () => {
  const [seo, setSeo] = useState<SeoSettings | null>(null);

  useEffect(() => {
    const fetchSeo = async () => {
      // Fetch 'home' settings by default. 
      const data = await apiService.getSeoSettings('home');
      if (data) {
        setSeo(data);
      }
    };

    fetchSeo();
  }, []);

  // Use a Fragment instead of null to be safe with all React versions/Helmet combinations
  if (!seo) return <></>;

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      
      {/* Open Graph / Social Sharing */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SeoManager;