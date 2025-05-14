import { useEffect } from 'react';
import L from 'leaflet';

const FixLeafletIcons = () => {
  useEffect(() => {
    // Fix for leaflet's default icons not showing
    delete L.Icon.Default.prototype._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);

  return null;
};

export default FixLeafletIcons;