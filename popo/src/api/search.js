import api from './axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Global search functionality for the firearms management system
 * Searches across multiple data types and returns unified results
 */

/**
 * Search firearms by serial number, model, or owner name
 */
export const searchFirearms = async (query, filters = {}) => {
  try {
    const params = {
      search: query,
      ...filters
    };
    
    const response = await api.get('/api/firearms/', { params });
    console.log('Firearms response:', response.data);
    
    // Handle both direct array and paginated response formats
    const firearms = response.data?.results || response.data || [];
    if (!Array.isArray(firearms)) {
      console.error('Firearms response is not an array:', firearms);
      return [];
    }
    return firearms.map(firearm => ({
      id: firearm.serial_number,
      type: 'firearm',
      title: `${firearm.gun_model_details?.name || 'Unknown Model'} - ${firearm.serial_number}`,
      description: `Status: ${firearm.firearm_status} | Owner: ${firearm.owner_details?.full_legal_name || 'Unknown'}`,
      category: 'Firearms',
      data: firearm,
      metadata: {
        serialNumber: firearm.serial_number,
        status: firearm.firearm_status,
        ownerName: firearm.owner_details?.full_legal_name,
        modelName: firearm.gun_model_details?.name,
        typeName: firearm.gun_type_details?.name,
        subtypeName: firearm.gun_subtype_details?.name,
        registrationDate: firearm.date_of_collection,
        location: firearm.registration_location
      }
    }));
  } catch (error) {
    console.error('Error searching firearms:', error);
    console.error('Error details:', error.response?.data, error.response?.status);
    return [];
  }
};

/**
 * Search owners by name, contact number, or address
 */
export const searchOwners = async (query, filters = {}) => {
  try {
    const params = {
      search: query,
      ...filters
    };
    
    const response = await api.get('/api/owners/', { params });
    console.log('Owners response:', response.data);
    
    // Handle both direct array and paginated response formats
    const owners = response.data?.results || response.data || [];
    if (!Array.isArray(owners)) {
      console.error('Owners response is not an array:', owners);
      return [];
    }
    return owners.map(owner => ({
      id: owner.id,
      type: 'owner',
      title: owner.full_legal_name,
      description: `Contact: ${owner.contact_number} | Age: ${owner.age} | Gender: ${owner.gender}`,
      category: 'Owners',
      data: owner,
      metadata: {
        fullName: owner.full_legal_name,
        contactNumber: owner.contact_number,
        age: owner.age,
        gender: owner.gender,
        address: owner.residential_address,
        createdAt: owner.created_at
      }
    }));
  } catch (error) {
    console.error('Error searching owners:', error);
    console.error('Error details:', error.response?.data, error.response?.status);
    return [];
  }
};

/**
 * Search users by name, email, or role
 */
export const searchUsers = async (query, filters = {}) => {
  try {
    const params = {
      search: query,
      ...filters
    };
    
    const response = await api.get('/api/users/', { params });
    console.log('Users response:', response.data);
    
    // Handle both direct array and paginated response formats
    const users = response.data?.results || response.data || [];
    if (!Array.isArray(users)) {
      console.error('Users response is not an array:', users);
      return [];
    }
    return users.map(user => ({
      id: user.id,
      type: 'user',
      title: `${user.first_name} ${user.last_name}`,
      description: `Email: ${user.email} | Role: ${user.role} | Municipality: ${user.municipality || 'N/A'}`,
      category: 'Users',
      data: user,
      metadata: {
        fullName: `${user.first_name} ${user.last_name}`,
        email: user.email,
        username: user.username,
        role: user.role,
        municipality: user.municipality,
        phoneNumber: user.phone_number
      }
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    console.error('Error details:', error.response?.data, error.response?.status);
    return [];
  }
};

/**
 * Search firearm licenses by license number, control number, or owner
 */
export const searchLicenses = async (query, filters = {}) => {
  try {
    const params = {
      search: query,
      ...filters
    };
    
    const response = await api.get('/api/firearm-licenses/', { params });
    console.log('Licenses response:', response.data);
    
    // Handle paginated response format
    const licenses = response.data?.results || response.data || [];
    if (!Array.isArray(licenses)) {
      console.error('Licenses response is not an array:', licenses);
      return [];
    }
    return licenses.map(license => ({
      id: license.id,
      type: 'license',
      title: `License: ${license.license_number}`,
      description: `Control: ${license.control_number} | Status: ${license.status} | Owner: ${license.owner?.username || 'Unknown'}`,
      category: 'Licenses',
      data: license,
      metadata: {
        licenseNumber: license.license_number,
        controlNumber: license.control_number,
        status: license.status,
        ownerName: license.owner?.username,
        issueDate: license.date_issued,
        expiryDate: license.expiry_date,
        serialNumber: license.serial_number,
        kindMake: license.kind_make,
        modelCaliber: license.model_caliber
      }
    }));
  } catch (error) {
    console.error('Error searching licenses:', error);
    console.error('Error details:', error.response?.data, error.response?.status);
    return [];
  }
};

/**
 * Search blotter entries (currently not available in backend)
 */
export const searchBlotter = async (query, filters = {}) => {
  // Blotter functionality not available in current backend
  console.log('Blotter search not available in current backend');
  return [];
};

/**
 * Search audit logs
 */
export const searchAuditLogs = async (query, filters = {}) => {
  try {
    const params = {
      search: query,
      ...filters
    };
    
    const response = await api.get('/api/audit-logs/', { params });
    console.log('Audit logs response:', response.data);
    
    // Handle paginated response format
    const logs = response.data?.results || response.data || [];
    if (!Array.isArray(logs)) {
      console.error('Audit logs response is not an array:', logs);
      return [];
    }
    return logs.map(log => ({
      id: log.id,
      type: 'audit_log',
      title: `${log.action} by ${log.user?.username || 'System'}`,
      description: `${log.details || 'No details'} | ${new Date(log.timestamp).toLocaleDateString()}`,
      category: 'Audit Logs',
      data: log,
      metadata: {
        action: log.action,
        user: log.user?.username,
        details: log.details,
        timestamp: log.timestamp,
        ipAddress: log.ip_address
      }
    }));
  } catch (error) {
    console.error('Error searching audit logs:', error);
    console.error('Error details:', error.response?.data, error.response?.status);
    return [];
  }
};

/**
 * Perform a global search across all content types
 */
export const performGlobalSearch = async (query, options = {}) => {
  console.log('performGlobalSearch called with query:', query, 'options:', options);
  const {
    categories = ['firearms', 'owners', 'users', 'licenses', 'audit_logs'],
    limit = 50,
    filters = {}
  } = options;

  const searchPromises = [];

  // Build search promises based on requested categories
  if (categories.includes('firearms')) {
    searchPromises.push(searchFirearms(query, filters));
  }
  if (categories.includes('owners')) {
    searchPromises.push(searchOwners(query, filters));
  }
  if (categories.includes('users')) {
    searchPromises.push(searchUsers(query, filters));
  }
  if (categories.includes('licenses')) {
    searchPromises.push(searchLicenses(query, filters));
  }
  // Note: Blotter endpoint doesn't exist in current backend
  // if (categories.includes('blotter')) {
  //   searchPromises.push(searchBlotter(query, filters));
  // }
  if (categories.includes('audit_logs')) {
    searchPromises.push(searchAuditLogs(query, filters));
  }

  try {
    console.log('Executing search promises:', searchPromises.length);
    // Execute all searches in parallel
    const results = await Promise.allSettled(searchPromises);
    
    console.log('Search results:', results);
    
    // Combine all successful results
    const allResults = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    console.log('Combined results:', allResults);

    // Sort results by relevance
    const sortedResults = sortResultsByRelevance(allResults, query);

    // Apply limit
    const finalResults = sortedResults.slice(0, limit);
    console.log('Final search results:', finalResults);
    return finalResults;
  } catch (error) {
    console.error('Error performing global search:', error);
    return [];
  }
};

/**
 * Sort search results by relevance to the query with enhanced word matching
 */
const sortResultsByRelevance = (results, query) => {
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
  
  return results.sort((a, b) => {
    const aScore = calculateEnhancedRelevanceScore(a, queryLower, queryWords);
    const bScore = calculateEnhancedRelevanceScore(b, queryLower, queryWords);
    return bScore - aScore;
  });
};

/**
 * Calculate enhanced relevance score with word-by-word matching
 */
const calculateEnhancedRelevanceScore = (item, queryLower, queryWords) => {
  let score = 0;
  
  // Exact phrase match gets highest score
  if (item.title.toLowerCase().includes(queryLower)) {
    score += 50;
  }
  
  // Exact phrase match in description
  if (item.description.toLowerCase().includes(queryLower)) {
    score += 30;
  }
  
  // Word-by-word matching with enhanced scoring
  queryWords.forEach(word => {
    const wordScore = calculateWordScore(item, word);
    score += wordScore;
  });
  
  // Boost score for matches in metadata
  if (item.metadata) {
    Object.values(item.metadata).forEach(value => {
      if (typeof value === 'string') {
        const valueLower = value.toLowerCase();
        
        // Exact match in metadata
        if (valueLower.includes(queryLower)) {
          score += 25;
        }
        
        // Word matches in metadata
        queryWords.forEach(word => {
          if (valueLower.includes(word)) {
            score += 5;
          }
        });
      }
    });
  }
  
  return score;
};

/**
 * Calculate score for individual word matches
 */
const calculateWordScore = (item, word) => {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const descriptionLower = item.description.toLowerCase();
  
  // Exact word match in title (word boundaries)
  if (new RegExp(`\\b${word}\\b`).test(titleLower)) {
    score += 15;
  } else if (titleLower.includes(word)) {
    score += 8;
  }
  
  // Exact word match in description
  if (new RegExp(`\\b${word}\\b`).test(descriptionLower)) {
    score += 10;
  } else if (descriptionLower.includes(word)) {
    score += 4;
  }
  
  // Boost score for intelligent keyword matching
  score += calculateKeywordBoost(item, word);
  
  // Boost score for starts with
  if (titleLower.startsWith(word)) {
    score += 12;
  }
  
  return score;
};

/**
 * Calculate enhanced keyword boost for intelligent matching
 */
const calculateKeywordBoost = (item, word) => {
  let boost = 0;
  
  // Firearm-related keyword matching
  if (item.category === 'Firearms') {
    const firearmKeywords = {
      'fire': 3, 'firearm': 4, 'firearms': 4, 'gun': 3, 'guns': 3,
      'weapon': 3, 'weapons': 3, 'ak': 2, 'ak47': 2, 'ak-47': 2,
      'm16': 2, 'm4': 2, 'pistol': 2, 'rifle': 2, 'shotgun': 2,
      'handgun': 2, 'revolver': 2, 'ammo': 2, 'ammunition': 2,
      'bullet': 2, 'cartridge': 2, 'serial': 2, 'number': 1,
      'model': 1, 'make': 1, 'caliber': 2, 'barrel': 1
    };
    boost += firearmKeywords[word] || 0;
  }
  
  // Status-related keyword matching
  const statusKeywords = {
    'captured': 3, 'confiscated': 3, 'surrendered': 3, 'deposited': 3,
    'abandoned': 3, 'forfeited': 3, 'active': 2, 'expired': 2,
    'pending': 2, 'registered': 2, 'unregistered': 2, 'under': 1,
    'investigation': 2, 'custody': 2, 'released': 2, 'returned': 2,
    'destroyed': 2, 'lost': 2, 'stolen': 2, 'missing': 2
  };
  boost += statusKeywords[word] || 0;
  
  // Role-related keyword matching
  if (item.category === 'Users') {
    const roleKeywords = {
      'police': 3, 'officer': 3, 'admin': 3, 'administrator': 3,
      'client': 3, 'municipality': 2, 'chief': 2, 'inspector': 2,
      'detective': 2, 'supervisor': 2, 'personnel': 2, 'staff': 2,
      'pnp': 2, 'rcsu': 2, 'law': 2, 'enforcement': 2, 'security': 2
    };
    boost += roleKeywords[word] || 0;
  }
  
  // License-related keyword matching
  if (item.category === 'Licenses') {
    const licenseKeywords = {
      'license': 3, 'licenses': 3, 'permit': 2, 'permits': 2,
      'registration': 2, 'registered': 2, 'expiry': 2, 'expired': 2,
      'valid': 2, 'invalid': 2, 'renewal': 2, 'renewed': 2,
      'cancelled': 2, 'suspended': 2, 'revoked': 2, 'application': 2,
      'control': 2, 'number': 1, 'issue': 1, 'issued': 1
    };
    boost += licenseKeywords[word] || 0;
  }
  
  // Owner-related keyword matching
  if (item.category === 'Owners') {
    const ownerKeywords = {
      'owner': 3, 'owners': 3, 'person': 2, 'people': 2,
      'individual': 2, 'individuals': 2, 'name': 1, 'names': 1,
      'contact': 2, 'address': 2, 'residential': 2, 'citizen': 2,
      'resident': 2, 'applicant': 2, 'holder': 2, 'possessor': 2
    };
    boost += ownerKeywords[word] || 0;
  }
  
  // General search terms
  const generalKeywords = {
    'search': 1, 'find': 1, 'look': 1, 'query': 1, 'term': 1,
    'data': 1, 'record': 2, 'records': 2, 'entry': 1, 'entries': 1,
    'info': 1, 'information': 1, 'detail': 1, 'details': 1
  };
  boost += generalKeywords[word] || 0;
  
  return boost;
};

/**
 * Get search suggestions based on recent searches or popular terms
 */
export const getSearchSuggestions = async (query) => {
  try {
    // This could be enhanced to include recent searches from localStorage
    // or popular search terms from the backend
    const suggestions = [];
    
    if (query.length >= 2) {
      // Add common search terms that match the query
      const commonTerms = [
        'AK-47', 'M16', 'Pistol', 'Shotgun', 'Rifle',
        'Captured', 'Confiscated', 'Surrendered',
        'Active', 'Expired', 'Pending',
        'Police Officer', 'Administrator', 'Client'
      ];
      
      const matchingTerms = commonTerms.filter(term => 
        term.toLowerCase().includes(query.toLowerCase())
      );
      
      suggestions.push(...matchingTerms.map(term => ({
        text: term,
        type: 'suggestion'
      })));
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

/**
 * Save search query to recent searches (localStorage)
 */
export const saveRecentSearch = (query) => {
  try {
    const recentSearches = getRecentSearches();
    const updatedSearches = [query, ...recentSearches.filter(search => search !== query)]
      .slice(0, 10); // Keep only last 10 searches
    
    localStorage.setItem('recent_searches', JSON.stringify(updatedSearches));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

/**
 * Get recent search queries from localStorage
 */
export const getRecentSearches = () => {
  try {
    const recentSearches = localStorage.getItem('recent_searches');
    return recentSearches ? JSON.parse(recentSearches) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

/**
 * Clear recent searches
 */
export const clearRecentSearches = () => {
  try {
    localStorage.removeItem('recent_searches');
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};

export default {
  searchFirearms,
  searchOwners,
  searchUsers,
  searchLicenses,
  searchBlotter,
  searchAuditLogs,
  performGlobalSearch,
  getSearchSuggestions,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches
};
