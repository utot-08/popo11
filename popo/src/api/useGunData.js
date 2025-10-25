import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

export const useGunData = () => {
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGunData = async () => {
      try {
        setLoading(true);
        const [typesRes, subtypesRes, modelsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}gun-types/`),
          axios.get(`${API_BASE_URL}gun-subtypes/`),
          axios.get(`${API_BASE_URL}gun-models/`),
        ]);
        setGunTypes(typesRes.data);
        setGunSubtypes(subtypesRes.data);
        setGunModels(modelsRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGunData();
  }, []);

  const getTypeName = (typeId) => {
    const type = gunTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  const getSubtypeName = (subtypeId) => {
    const subtype = gunSubtypes.find(s => s.id === subtypeId);
    return subtype ? subtype.name : 'Unknown Subtype';
  };

  const getModelName = (modelId) => {
    const model = gunModels.find(m => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  return {
    gunTypes,
    gunSubtypes,
    gunModels,
    loading,
    error,
    getTypeName,
    getSubtypeName,
    getModelName
  };
};