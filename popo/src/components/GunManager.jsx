import React, { useState, useEffect } from 'react'; 
import { 
  Crosshair, 
  ChevronDown, 
  Plus, 
  Layers, 
  Search,
  Edit,
  Trash2,
  Archive,
  ArchiveRestore,
  Type,
  Folder,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import '../styles/GunManager.css';

const API_BASE_URL = 'http://localhost:8000/api/';

const GunManager = () => {
  const [types, setTypes] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [models, setModels] = useState([]);
  const [archivedTypes, setArchivedTypes] = useState([]);
  const [archivedSubtypes, setArchivedSubtypes] = useState([]);
  const [archivedModels, setArchivedModels] = useState([]);
  const [activeTab, setActiveTab] = useState('types');
  const [newType, setNewType] = useState('');
  const [newSubtype, setNewSubtype] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [newModel, setNewModel] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [confirmation, setConfirmation] = useState({ 
    show: false, 
    message: '', 
    onConfirm: null, 
    onCancel: null 
  });
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  
  const apiEndpoints = {
    types: `${API_BASE_URL}gun-types/`,
    subtypes: `${API_BASE_URL}gun-subtypes/`,
    models: `${API_BASE_URL}gun-models/`,
  };

  useEffect(() => {
    fetchTypes();
    fetchSubtypes();
    fetchModels();
    fetchArchivedTypes();
    fetchArchivedSubtypes();
    fetchArchivedModels();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const showErrorModal = (message) => {
    setErrorModal({ show: true, message });
  };

  const hideErrorModal = () => {
    setErrorModal({ show: false, message: '' });
  };

  const showConfirmation = (message, onConfirm, onCancel = () => {}) => {
    setConfirmation({
      show: true,
      message,
      onConfirm: () => {
        setConfirmation({ show: false, message: '', onConfirm: null, onCancel: null });
        onConfirm();
      },
      onCancel: () => {
        setConfirmation({ show: false, message: '', onConfirm: null, onCancel: null });
        onCancel();
      }
    });
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch(`${apiEndpoints.types}?archived=false`);
      const data = await response.json();
      setTypes(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch types', 'error');
    }
  };

  const fetchSubtypes = async () => {
    try {
      const response = await fetch(`${apiEndpoints.subtypes}?archived=false`);
      const data = await response.json();
      setSubtypes(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch subtypes', 'error');
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch(`${apiEndpoints.models}?archived=false`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch models', 'error');
    }
  };

  const fetchArchivedTypes = async () => {
    try {
      const response = await fetch(`${apiEndpoints.types}?archived=true`);
      const data = await response.json();
      setArchivedTypes(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch archived types', 'error');
    }
  };

  const fetchArchivedSubtypes = async () => {
    try {
      const response = await fetch(`${apiEndpoints.subtypes}?archived=true`);
      const data = await response.json();
      setArchivedSubtypes(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch archived subtypes', 'error');
    }
  };

  const fetchArchivedModels = async () => {
    try {
      const response = await fetch(`${apiEndpoints.models}?archived=true`);
      const data = await response.json();
      setArchivedModels(data);
    } catch (error) {
      console.error(error);
      showNotification('Failed to fetch archived models', 'error');
    }
  };

  // Check for duplicates (case-insensitive)
  const isDuplicateType = (name) => {
    return types.some(type => 
      type.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const isDuplicateSubtype = (name, typeId) => {
    return subtypes.some(subtype => 
      subtype.typeId === typeId && 
      subtype.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const isDuplicateModel = (name, subtypeId) => {
    return models.some(model => 
      model.subtypeId === subtypeId && 
      model.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const addType = async () => {
    if (!newType.trim()) return;
    
    // Check for duplicates
    if (isDuplicateType(newType)) {
      showErrorModal(`"${newType}" already exists as a gun type. Please use a different name.`);
      return;
    }
    
    showConfirmation(
      `Are you sure you want to add "${newType}" as a new gun type?`,
      async () => {
        setIsAdding(true);
        try {
          const response = await fetch(apiEndpoints.types, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newType.trim() }),
          });
          const data = await response.json();
          setTypes([...types, data]);
          setNewType('');
          showNotification(`Type "${newType}" added successfully`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to add type', 'error');
        } finally {
          setIsAdding(false);
        }
      }
    );
  };

  const addSubtype = async () => {
    if (!newSubtype.trim() || !selectedType) return;
    
    // Check for duplicates
    if (isDuplicateSubtype(newSubtype, selectedType)) {
      const typeName = types.find(t => t.id === selectedType)?.name || 'Unknown';
      showErrorModal(`"${newSubtype}" already exists as a subtype under "${typeName}". Please use a different name.`);
      return;
    }
    
    const typeName = types.find(t => t.id === selectedType)?.name || 'Unknown';
    
    showConfirmation(
      `Are you sure you want to add "${newSubtype}" as a new subtype under "${typeName}"?`,
      async () => {
        setIsAdding(true);
        try {
          const response = await fetch(apiEndpoints.subtypes, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ typeId: selectedType, name: newSubtype.trim() }),
          });
          const data = await response.json();
          setSubtypes([...subtypes, data]);
          setNewSubtype('');
          setSelectedType('');
          showNotification(`Subtype "${newSubtype}" added to ${typeName}`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to add subtype', 'error');
        } finally {
          setIsAdding(false);
        }
      }
    );
  };

  const addModel = async () => {
    if (!newModel.trim() || !selectedSubtype) return;
    
    // Check for duplicates
    if (isDuplicateModel(newModel, selectedSubtype)) {
      const subtype = subtypes.find(s => s.id === selectedSubtype);
      const typeName = types.find(t => t.id === subtype?.typeId)?.name || 'Unknown';
      showErrorModal(`"${newModel}" already exists as a model under "${typeName} > ${subtype?.name}". Please use a different name.`);
      return;
    }
    
    const subtype = subtypes.find(s => s.id === selectedSubtype);
    const typeName = types.find(t => t.id === subtype?.typeId)?.name || 'Unknown';
    
    showConfirmation(
      `Are you sure you want to add "${newModel}" as a new model under "${typeName} > ${subtype?.name}"?`,
      async () => {
        setIsAdding(true);
        try {
          const response = await fetch(apiEndpoints.models, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtypeId: selectedSubtype, name: newModel.trim() }),
          });
          const data = await response.json();
          setModels([...models, data]);
          setNewModel('');
          setSelectedSubtype('');
          showNotification(`Model "${newModel}" added to ${typeName} > ${subtype?.name}`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to add model', 'error');
        } finally {
          setIsAdding(false);
        }
      }
    );
  };

  // Archive functions
  const archiveType = async (id) => {
    const typeToArchive = types.find(t => t.id === id);
    
    showConfirmation(
      `Archive "${typeToArchive.name}"? This will also archive all its subtypes and models.`,
      async () => {
        try {
          await fetch(`${apiEndpoints.types}${id}/archive/`, { method: 'POST' });
          setTypes(types.filter(t => t.id !== id));
          await fetchArchivedTypes();
          await fetchArchivedSubtypes();
          await fetchArchivedModels();
          showNotification(`Type "${typeToArchive.name}" archived successfully`);
        } catch (error) {
          console.error("Archive failed:", error);
          showNotification("Archive failed. Please try again.", 'error');
        }
      }
    );
  };

  const archiveSubtype = async (id) => {
    const subtypeToArchive = subtypes.find(s => s.id === id);
    
    showConfirmation(
      `Archive "${subtypeToArchive.name}"? This will also archive all its models.`,
      async () => {
        try {
          await fetch(`${apiEndpoints.subtypes}${id}/archive/`, { method: 'POST' });
          setSubtypes(subtypes.filter(s => s.id !== id));
          await fetchArchivedSubtypes();
          await fetchArchivedModels();
          showNotification(`Subtype "${subtypeToArchive.name}" archived`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to archive subtype', 'error');
        }
      }
    );
  };

  const archiveModel = async (id) => {
    const modelToArchive = models.find(m => m.id === id);
    
    showConfirmation(
      `Archive model "${modelToArchive.name}"?`,
      async () => {
        try {
          await fetch(`${apiEndpoints.models}${id}/archive/`, { method: 'POST' });
          setModels(models.filter(m => m.id !== id));
          await fetchArchivedModels();
          showNotification(`Model "${modelToArchive.name}" archived`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to archive model', 'error');
        }
      }
    );
  };

  // Unarchive functions
  const unarchiveType = async (id) => {
    const typeToUnarchive = archivedTypes.find(t => t.id === id);
    
    showConfirmation(
      `Restore "${typeToUnarchive.name}"? This will also restore all its subtypes and models.`,
      async () => {
        try {
          await fetch(`${apiEndpoints.types}${id}/unarchive/`, { method: 'POST' });
          setArchivedTypes(archivedTypes.filter(t => t.id !== id));
          await fetchTypes();
          await fetchArchivedTypes();
          await fetchArchivedSubtypes();
          await fetchArchivedModels();
          showNotification(`Type "${typeToUnarchive.name}" restored successfully`);
        } catch (error) {
          console.error("Restore failed:", error);
          showNotification("Restore failed. Please try again.", 'error');
        }
      }
    );
  };

  const unarchiveSubtype = async (id) => {
    const subtypeToUnarchive = archivedSubtypes.find(s => s.id === id);
    
    showConfirmation(
      `Restore "${subtypeToUnarchive.name}"? This will also restore all its models.`,
      async () => {
        try {
          await fetch(`${apiEndpoints.subtypes}${id}/unarchive/`, { method: 'POST' });
          setArchivedSubtypes(archivedSubtypes.filter(s => s.id !== id));
          await fetchSubtypes();
          await fetchArchivedSubtypes();
          await fetchArchivedModels();
          showNotification(`Subtype "${subtypeToUnarchive.name}" restored`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to restore subtype', 'error');
        }
      }
    );
  };

  const unarchiveModel = async (id) => {
    const modelToUnarchive = archivedModels.find(m => m.id === id);
    
    showConfirmation(
      `Restore model "${modelToUnarchive.name}"?`,
      async () => {
        try {
          await fetch(`${apiEndpoints.models}${id}/unarchive/`, { method: 'POST' });
          setArchivedModels(archivedModels.filter(m => m.id !== id));
          await fetchModels();
          await fetchArchivedModels();
          showNotification(`Model "${modelToUnarchive.name}" restored`);
        } catch (error) {
          console.error(error);
          showNotification('Failed to restore model', 'error');
        }
      }
    );
  };

  // Filter items based on search
  const filteredTypes = types.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSubtypes = subtypes.filter(subtype => 
    subtype.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    types.find(t => t.id === subtype.typeId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subtypes.find(s => s.id === model.subtypeId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    types.find(t => t.id === subtypes.find(s => s.id === model.subtypeId)?.typeId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Archived filters
  const filteredArchivedTypes = archivedTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredArchivedSubtypes = archivedSubtypes.filter(subtype => 
    subtype.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredArchivedModels = archivedModels.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Split types into two columns
  const midpoint = Math.ceil(filteredTypes.length / 2);
  const typesColumn1 = filteredTypes.slice(0, midpoint);
  const typesColumn2 = filteredTypes.slice(midpoint);

  return (
    <div className="gun-manager">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Error Modal */}
      {errorModal.show && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal error-modal">
            <div className="confirmation-header">
              <AlertCircle size={24} className="confirmation-icon error-icon" />
              <h3>Duplicate Entry</h3>
            </div>
            <div className="confirmation-body">
              <p>{errorModal.message}</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="confirm-button"
                onClick={hideErrorModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation.show && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <HelpCircle size={24} className="confirmation-icon" />
              <h3>Confirmation</h3>
            </div>
            <div className="confirmation-body">
              <p>{confirmation.message}</p>
            </div>
            <div className="confirmation-actions">
              <button 
                className="confirm-button"
                onClick={confirmation.onConfirm}
              >
                Yes
              </button>
              <button 
                className="cancel-button"
                onClick={confirmation.onCancel}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header">
        <div className="title-section">
          <div className="title">
            <Crosshair size={28} className="title-icon" />
            <h2>Firearm Classification System</h2>
          </div>
          <div className="search-container">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search across all categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="search-info">
                <Filter size={14} />
                <span>Filtering results</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={activeTab === 'types' ? 'active' : ''}
            onClick={() => setActiveTab('types')}
          >
            <Layers size={18} className="tab-icon" />
            <span>Types</span>
            <span className="count-badge">{types.length}</span>
          </button>
          <button 
            className={activeTab === 'subtypes' ? 'active' : ''}
            onClick={() => setActiveTab('subtypes')}
          >
            <Folder size={18} className="tab-icon" />
            <span>Subtypes</span>
            <span className="count-badge">{subtypes.length}</span>
          </button>
          <button 
            className={activeTab === 'models' ? 'active' : ''}
            onClick={() => setActiveTab('models')}
          >
            <Type size={18} className="tab-icon" />
            <span>Models</span>
            <span className="count-badge">{models.length}</span>
          </button>
          <button 
            className={activeTab === 'archives' ? 'active archive-tab' : 'archive-tab'}
            onClick={() => setActiveTab('archives')}
          >
            <Archive size={18} className="tab-icon" />
            <span>Archives</span>
            <span className="count-badge">{archivedTypes.length + archivedSubtypes.length + archivedModels.length}</span>
          </button>
        </div>
      </div>

      {/* Type Management */}
      {activeTab === 'types' && (
        <div className="form-section">
          <div className="section-header">
            <h3><Layers size={20} className="section-icon" /> Gun Types</h3>
            <p className="section-description">Manage firearm categories like rifles, handguns, and shotguns</p>
          </div>
          <div className="input-card">
            <div className="input-group">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Add new type (e.g., Shotgun)"
                onKeyPress={(e) => e.key === 'Enter' && addType()}
                disabled={isAdding}
              />
              <button 
                onClick={addType} 
                className="add-button"
                disabled={!newType.trim() || isAdding}
              >
                {isAdding ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Plus size={18} />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="types-grid">
            <div className="card-container">
              {typesColumn1.length > 0 ? (
                <ul className="item-list">
                  {typesColumn1.map(type => (
                    <li key={type.id} className="list-item">
                      <div className="item-content">
                        <div className="item-info">
                          <span className="item-name">{type.name}</span>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="archive-button"
                            onClick={() => archiveType(type.id)}
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <Layers size={48} className="empty-icon" />
                  <p>No gun types found</p>
                  <span className="empty-subtext">
                    {searchTerm ? 'Try a different search term' : 'Add your first type above'}
                  </span>
                </div>
              )}
            </div>
            <div className="card-container">
              {typesColumn2.length > 0 ? (
                <ul className="item-list">
                  {typesColumn2.map(type => (
                    <li key={type.id} className="list-item">
                      <div className="item-content">
                        <div className="item-info">
                          <span className="item-name">{type.name}</span>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="archive-button"
                            onClick={() => archiveType(type.id)}
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : filteredTypes.length === 0 ? (
                <div className="empty-state">
                  <Layers size={48} className="empty-icon" />
                  <p>No gun types found</p>
                  <span className="empty-subtext">
                    {searchTerm ? 'Try a different search term' : 'Add your first type above'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Subtype Management */}
      {activeTab === 'subtypes' && (
        <div className="form-section">
          <div className="section-header">
            <h3><Folder size={20} className="section-icon" /> Gun Subtypes</h3>
            <p className="section-description">Manage subtypes within each firearm category</p>
          </div>
          <div className="input-card">
            <div className="input-group">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="type-selector"
                disabled={isAdding}
              >
                <option value="">Select Type</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newSubtype}
                onChange={(e) => setNewSubtype(e.target.value)}
                placeholder="Add new subtype (e.g., Pump-Action)"
                onKeyPress={(e) => e.key === 'Enter' && addSubtype()}
                disabled={isAdding}
              />
              <button 
                onClick={addSubtype} 
                className="add-button"
                disabled={!selectedType || !newSubtype.trim() || isAdding}
              >
                {isAdding ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Plus size={18} />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="card-container">
            {filteredSubtypes.length > 0 ? (
              <ul className="item-list">
                {filteredSubtypes.map(subtype => {
                  const type = types.find(t => t.id === subtype.typeId);
                  return (
                    <li key={subtype.id} className="list-item">
                      <div className="item-content">
                        <div className="item-info">
                          <div className="item-category">
                            <span className="type-badge">{type?.name || 'Unknown'}</span>
                            <ChevronDown size={14} className="chevron" />
                          </div>
                          <span className="item-name">{subtype.name}</span>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="archive-button"
                            onClick={() => archiveSubtype(subtype.id)}
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <Folder size={48} className="empty-icon" />
                <p>No subtypes found</p>
                <span className="empty-subtext">
                  {searchTerm ? 'Try a different search term' : 'Add your first subtype above'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Management */}
      {activeTab === 'models' && (
        <div className="form-section">
          <div className="section-header">
            <h3><Type size={20} className="section-icon" /> Gun Models</h3>
            <p className="section-description">Manage specific firearm models within subtypes</p>
          </div>
          <div className="input-card">
            <div className="input-group">
              <select
                value={selectedSubtype}
                onChange={(e) => setSelectedSubtype(e.target.value)}
                className="subtype-selector"
                disabled={isAdding}
              >
                <option value="">Select Subtype</option>
                {subtypes.map(subtype => (
                  <option key={subtype.id} value={subtype.id}>
                    {types.find(t => t.id === subtype.typeId)?.name} - {subtype.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="Model name (e.g., Mossberg 500)"
                onKeyPress={(e) => e.key === 'Enter' && addModel()}
                disabled={isAdding}
              />
              <button 
                onClick={addModel} 
                className="add-button"
                disabled={!selectedSubtype || !newModel.trim() || isAdding}
              >
                {isAdding ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Plus size={18} />
                    Add
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="card-container">
            {filteredModels.length > 0 ? (
              <div className="model-table-container">
                <table className="model-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Subtype</th>
                      <th>Model</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModels.map(model => {
                      const subtype = subtypes.find(s => s.id === model.subtypeId);
                      const type = types.find(t => t.id === subtype?.typeId);
                      return (
                        <tr key={model.id} className="table-row">
                          <td>
                            <span className="type-badge">{type?.name || 'N/A'}</span>
                          </td>
                          <td>{subtype?.name || 'N/A'}</td>
                          <td className="model-name">{model.name}</td>
                          <td className="actions">
                            <button 
                              className="archive-button"
                              onClick={() => archiveModel(model.id)}
                              title="Archive"
                            >
                              <Archive size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <Type size={48} className="empty-icon" />
                <p>No models found</p>
                <span className="empty-subtext">
                  {searchTerm ? 'Try a different search term' : 'Add your first model above'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archives Tab */}
      {activeTab === 'archives' && (
        <div className="form-section">
          <div className="section-header">
            <h3><Archive size={20} className="section-icon" /> Archived Items</h3>
            <p className="section-description">View and restore archived gun types, subtypes, and models</p>
          </div>
          
          {/* Archived Types */}
          {filteredArchivedTypes.length > 0 && (
            <div className="archive-section">
              <h4 className="archive-category-title">
                <Layers size={18} /> Archived Types ({filteredArchivedTypes.length})
              </h4>
              <div className="card-container">
                <ul className="item-list">
                  {filteredArchivedTypes.map(type => (
                    <li key={type.id} className="list-item archived-item">
                      <div className="item-content">
                        <div className="item-info">
                          <span className="item-name">{type.name}</span>
                          <span className="archived-badge">Archived</span>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="restore-button"
                            onClick={() => unarchiveType(type.id)}
                            title="Restore"
                          >
                            <ArchiveRestore size={16} />
                            Restore
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Archived Subtypes */}
          {filteredArchivedSubtypes.length > 0 && (
            <div className="archive-section">
              <h4 className="archive-category-title">
                <Folder size={18} /> Archived Subtypes ({filteredArchivedSubtypes.length})
              </h4>
              <div className="card-container">
                <ul className="item-list">
                  {filteredArchivedSubtypes.map(subtype => (
                    <li key={subtype.id} className="list-item archived-item">
                      <div className="item-content">
                        <div className="item-info">
                          <span className="item-name">{subtype.name}</span>
                          <span className="archived-badge">Archived</span>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="restore-button"
                            onClick={() => unarchiveSubtype(subtype.id)}
                            title="Restore"
                          >
                            <ArchiveRestore size={16} />
                            Restore
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Archived Models */}
          {filteredArchivedModels.length > 0 && (
            <div className="archive-section">
              <h4 className="archive-category-title">
                <Type size={18} /> Archived Models ({filteredArchivedModels.length})
              </h4>
              <div className="card-container">
                <ul className="item-list">
                  {filteredArchivedModels.map(model => (
                    <li key={model.id} className="list-item archived-item">
                      <div className="item-content">
                        <div className="item-info">
                          <span className="item-name">{model.name}</span>
                          <span className="archived-badge">Archived</span>
                        </div>
                        <div className="item-actions">
                          <button 
                            className="restore-button"
                            onClick={() => unarchiveModel(model.id)}
                            title="Restore"
                          >
                            <ArchiveRestore size={16} />
                            Restore
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Empty State for Archives */}
          {filteredArchivedTypes.length === 0 && 
           filteredArchivedSubtypes.length === 0 && 
           filteredArchivedModels.length === 0 && (
            <div className="empty-state">
              <Archive size={48} className="empty-icon" />
              <p>No archived items</p>
              <span className="empty-subtext">
                {searchTerm ? 'Try a different search term' : 'Archived items will appear here'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GunManager;
