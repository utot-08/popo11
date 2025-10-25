import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, User, Crosshair, FileText, BookOpen, Database, Shield, Clock } from 'lucide-react';
import { performGlobalSearch, saveRecentSearch, getRecentSearches } from '../api/search';
import '../styles/GlobalSearch.css';

const GlobalSearch = ({ onResultClick, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    console.log('Search query changed:', searchQuery); // Debug log
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        console.log('Generating suggestions for query:', searchQuery); // Debug log
        // Always show suggestions while typing
        generateSuggestions(searchQuery);
        setShowSuggestions(true);
        
        // Also perform search for longer queries
        if (searchQuery.trim().length >= 1) {
          performSearch(searchQuery);
          // Keep showing suggestions alongside results
        }
      } else {
        // If query is empty but input is focused, show suggestions
        if (isFocused) {
          generateSuggestions('');
          setShowSuggestions(true);
        }
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isFocused]);

  // Generate suggestions when input is focused
  useEffect(() => {
    if (isFocused && searchQuery.length === 0) {
      generateSuggestions('');
    }
  }, [isFocused]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate intelligent suggestions based on keywords
  const generateSuggestions = (query) => {
    console.log('Generating suggestions for:', query); // Debug log
    
    // Comprehensive suggestions for empty query
    if (!query || query.trim().length === 0) {
      const comprehensiveSuggestions = [
        // Firearm-related
        { text: 'firearm', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 100 },
        { text: 'firearms', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 95 },
        { text: 'gun', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 90 },
        { text: 'AK-47', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 85 },
        { text: 'pistol', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 80 },
        { text: 'rifle', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 80 },
        
        // Status-related
        { text: 'captured', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 75 },
        { text: 'confiscated', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 75 },
        { text: 'active', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 70 },
        { text: 'expired', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 70 },
        
        // User-related
        { text: 'police', category: 'Users', icon: <Shield size={16} />, type: 'suggestion', score: 75 },
        { text: 'officer', category: 'Users', icon: <Shield size={16} />, type: 'suggestion', score: 70 },
        { text: 'admin', category: 'Users', icon: <Shield size={16} />, type: 'suggestion', score: 65 },
        
        // Owner-related
        { text: 'owner', category: 'Owners', icon: <User size={16} />, type: 'suggestion', score: 70 },
        { text: 'owners', category: 'Owners', icon: <User size={16} />, type: 'suggestion', score: 65 },
        
        // License-related
        { text: 'license', category: 'Licenses', icon: <FileText size={16} />, type: 'suggestion', score: 65 },
        { text: 'permit', category: 'Licenses', icon: <FileText size={16} />, type: 'suggestion', score: 60 }
      ];
      
      setSearchSuggestions(comprehensiveSuggestions);
      return;
    }
    
    // Generate suggestions based on query
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
    const suggestions = [];

    // Enhanced firearm-related keywords with more variations
    const firearmKeywords = [
      'fire', 'firearm', 'firearms', 'gun', 'guns', 'weapon', 'weapons',
      'ak', 'ak47', 'ak-47', 'm16', 'm4', 'pistol', 'pistols', 'rifle', 'rifles',
      'shotgun', 'shotguns', 'handgun', 'handguns', 'revolver', 'revolvers',
      'ammunition', 'ammo', 'bullet', 'bullets', 'cartridge', 'cartridges',
      'assault rifle', 'semi-automatic', 'automatic', 'machine gun', 'machinegun',
      'sniper rifle', 'combat rifle', 'tactical rifle', 'service pistol',
      'service weapon', 'military weapon', 'law enforcement weapon'
    ];

    // Enhanced status-related keywords
    const statusKeywords = [
      'captured', 'confiscated', 'surrendered', 'deposited', 'abandoned', 'forfeited',
      'active', 'expired', 'pending', 'registered', 'unregistered', 'under investigation',
      'in custody', 'released', 'returned', 'destroyed', 'lost', 'stolen'
    ];

    // Enhanced role-related keywords
    const roleKeywords = [
      'police', 'officer', 'officers', 'admin', 'administrator', 'client', 'clients',
      'municipality', 'municipalities', 'pnp', 'rcsu', 'law enforcement', 'security',
      'detective', 'inspector', 'chief', 'supervisor', 'personnel', 'staff'
    ];

    // Enhanced license-related keywords
    const licenseKeywords = [
      'license', 'licenses', 'permit', 'permits', 'registration', 'registered',
      'control', 'number', 'numbers', 'expiry', 'expired', 'valid', 'invalid',
      'renewal', 'renewed', 'cancelled', 'suspended', 'revoked', 'application'
    ];

    // Enhanced owner-related keywords
    const ownerKeywords = [
      'owner', 'owners', 'person', 'people', 'individual', 'individuals',
      'name', 'names', 'contact', 'address', 'residential', 'citizen', 'resident',
      'applicant', 'holder', 'possessor', 'registered owner', 'legal owner'
    ];

    // Create phrase suggestions for multi-word queries
    const phraseSuggestions = [
      'firearm license', 'gun license', 'weapon permit', 'firearm registration',
      'police officer', 'law enforcement', 'firearm owner', 'gun owner',
      'license renewal', 'permit application', 'registration process',
      'captured firearm', 'confiscated weapon', 'surrendered gun',
      'active license', 'expired permit', 'registered firearm'
    ];

    // Combine all keywords
    const allKeywords = [
      ...firearmKeywords.map(k => ({ text: k, category: 'Firearms', icon: <Crosshair size={16} /> })),
      ...statusKeywords.map(k => ({ text: k, category: 'Status', icon: <Database size={16} /> })),
      ...roleKeywords.map(k => ({ text: k, category: 'Users', icon: <Shield size={16} /> })),
      ...licenseKeywords.map(k => ({ text: k, category: 'Licenses', icon: <FileText size={16} /> })),
      ...ownerKeywords.map(k => ({ text: k, category: 'Owners', icon: <User size={16} /> })),
      ...phraseSuggestions.map(k => ({ text: k, category: 'Phrases', icon: <Search size={16} /> }))
    ];

    // Enhanced matching logic for multi-word queries
    allKeywords.forEach(keyword => {
      const keywordLower = keyword.text.toLowerCase();
      let matchScore = 0;
      
      // Exact match gets highest score
      if (keywordLower === queryLower) {
        matchScore = 100;
      }
      // Starts with query gets high score
      else if (keywordLower.startsWith(queryLower)) {
        matchScore = 80;
      }
      // Contains query gets medium score
      else if (keywordLower.includes(queryLower)) {
        matchScore = 60;
      }
      // Multi-word matching
      else if (queryWords.length > 1) {
        const keywordWords = keywordLower.split(' ');
        let wordMatches = 0;
        
        queryWords.forEach(queryWord => {
          keywordWords.forEach(keywordWord => {
            if (keywordWord.includes(queryWord) || queryWord.includes(keywordWord)) {
              wordMatches++;
            }
          });
        });
        
        // If most query words match, give it a score
        if (wordMatches >= Math.ceil(queryWords.length * 0.5)) {
          matchScore = 40 + (wordMatches * 10);
        }
      }
      // Individual word matching within phrases
      else {
        queryWords.forEach(queryWord => {
          const keywordWords = keyword.text.toLowerCase().split(' ');
          if (keywordWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
            matchScore = Math.max(matchScore, 30);
          }
        });
      }
      
      if (matchScore > 0) {
        suggestions.push({
          text: keyword.text,
          category: keyword.category,
          icon: keyword.icon,
          type: 'suggestion',
          score: matchScore
        });
      }
    });

    // Add recent searches that match with enhanced logic
    const recentSearches = getRecentSearches();
    recentSearches.forEach(search => {
      const searchLower = search.toLowerCase();
      let recentMatchScore = 0;
      
      if (searchLower.includes(queryLower) && !suggestions.find(s => s.text === search)) {
        recentMatchScore = 20;
        
        suggestions.push({
          text: search,
          category: 'Recent',
          icon: <Clock size={16} />,
          type: 'recent',
          score: recentMatchScore
        });
      }
    });

    // Sort by score and limit suggestions
    const sortedSuggestions = suggestions
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10);
    
    // For specific queries, generate contextual suggestions
    const contextualSuggestions = [];
    
    // Firearm-related suggestions
    if (queryLower.includes('fire') || queryLower.includes('gun') || queryLower.includes('weapon')) {
      contextualSuggestions.push(
        { text: 'AK-47', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 100 },
        { text: 'M16', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 95 },
        { text: 'Pistol', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 90 },
        { text: 'Rifle', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 90 },
        { text: 'Shotgun', category: 'Firearms', icon: <Crosshair size={16} />, type: 'suggestion', score: 85 }
      );
    }
    
    // Status-related suggestions
    if (queryLower.includes('capture') || queryLower.includes('confiscat') || queryLower.includes('surrender')) {
      contextualSuggestions.push(
        { text: 'captured', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 100 },
        { text: 'confiscated', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 95 },
        { text: 'surrendered', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 90 },
        { text: 'deposited', category: 'Status', icon: <Database size={16} />, type: 'suggestion', score: 85 }
      );
    }
    
    // User-related suggestions
    if (queryLower.includes('polic') || queryLower.includes('offic') || queryLower.includes('admin')) {
      contextualSuggestions.push(
        { text: 'police officer', category: 'Users', icon: <Shield size={16} />, type: 'suggestion', score: 100 },
        { text: 'administrator', category: 'Users', icon: <Shield size={16} />, type: 'suggestion', score: 95 },
        { text: 'municipality', category: 'Users', icon: <Shield size={16} />, type: 'suggestion', score: 90 }
      );
    }
    
    // License-related suggestions
    if (queryLower.includes('licens') || queryLower.includes('permit') || queryLower.includes('registr')) {
      contextualSuggestions.push(
        { text: 'firearm license', category: 'Licenses', icon: <FileText size={16} />, type: 'suggestion', score: 100 },
        { text: 'permit application', category: 'Licenses', icon: <FileText size={16} />, type: 'suggestion', score: 95 },
        { text: 'registration', category: 'Licenses', icon: <FileText size={16} />, type: 'suggestion', score: 90 }
      );
    }
    
    // If we have contextual suggestions, use them; otherwise use the general ones
    const finalSuggestions = contextualSuggestions.length > 0 ? contextualSuggestions : sortedSuggestions;
    
    console.log('Generated suggestions:', finalSuggestions); // Debug log
    setSearchSuggestions(finalSuggestions);
    console.log('Show suggestions set to true'); // Debug log
  };

  const performSearch = async (query) => {
    console.log('performSearch called with query:', query);
    setIsSearching(true);
    try {
      const results = await performGlobalSearch(query, { limit: 50 });
      console.log('Search results received:', results);
      setSearchResults(results);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowResults(true); // Show results even on error to display "no results found"
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Combine suggestions and results for navigation
    const allItems = [...searchSuggestions, ...searchResults];
    const totalItems = allItems.length;
    
    if (!showSuggestions && !showResults) return;
    if (totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalItems) {
          const selectedItem = allItems[selectedIndex];
          if (selectedItem.type === 'suggestion' || selectedItem.type === 'recent') {
            handleSuggestionClick(selectedItem);
          } else {
            handleResultClick(selectedItem);
          }
        }
        break;
      case 'Escape':
        setShowResults(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // For recent searches, perform the actual search instead of direct navigation
    if (suggestion.type === 'recent') {
      // Trigger search with the suggestion text
      performSearch(suggestion.text);
      return;
    }
    
    // Navigate directly based on suggestion category
    const navigationResult = {
      type: getSuggestionType(suggestion),
      category: suggestion.category,
      data: { 
        suggestion: suggestion.text,
        // Add specific navigation hints for different suggestion types
        ...(suggestion.category === 'Status' && { firearm_status: suggestion.text }),
        ...(suggestion.category === 'Firearms' && { search_term: suggestion.text })
      }
    };
    
    if (onResultClick) {
      onResultClick(navigationResult);
    }
  };

  // Map suggestion categories to result types for navigation
  const getSuggestionType = (suggestion) => {
    switch (suggestion.category) {
      case 'Firearms':
        return 'firearm';
      case 'Owners':
        return 'owner';
      case 'Users':
        return 'user';
      case 'Licenses':
        return 'license';
      case 'Status':
        return 'firearm'; // Status suggestions navigate to firearms with filter
      case 'Phrases':
        return 'firearm'; // Phrase suggestions default to firearms
      case 'Recent':
        // For recent searches, we'll perform the search instead of direct navigation
        return 'search';
      default:
        return 'firearm'; // Default to firearms
    }
  };

  const handleResultClick = (result) => {
    // Save search query to recent searches
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    
    if (onResultClick) {
      onResultClick(result);
    }
    setShowResults(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchSuggestions([]);
    setShowResults(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const getResultIcon = (category) => {
    switch (category) {
      case 'Firearms': return <Crosshair size={16} className="search-result-icon" />;
      case 'Owners': return <User size={16} className="search-result-icon" />;
      case 'Users': return <Shield size={16} className="search-result-icon" />;
      case 'Licenses': return <FileText size={16} className="search-result-icon" />;
      case 'Blotter': return <BookOpen size={16} className="search-result-icon" />;
      case 'Audit Logs': return <Clock size={16} className="search-result-icon" />;
      default: return <Database size={16} className="search-result-icon" />;
    }
  };

  // Group results by category
  const groupedResults = searchResults.reduce((groups, result) => {
    const category = result.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {});

  return (
    <div className={`global-search ${className}`} ref={searchRef}>
      <div className="search-input-container">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search firearms, owners, users, licenses..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="search-input"
          autoComplete="off"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="clear-search-button"
            type="button"
          >
            <X size={16} />
          </button>
        )}
        {isSearching && (
          <div className="search-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {(() => {
        // If we have search results, show them
        if (searchResults.length > 0) {
          return true;
        }
        
        // Show suggestions when focused and we have suggestions
        const shouldShowSuggestions = isFocused && searchSuggestions.length > 0;
        
        console.log('Should show results:', shouldShowSuggestions, {
          isFocused,
          searchQueryLength: searchQuery.length,
          suggestionsLength: searchSuggestions.length,
          resultsLength: searchResults.length
        });
        
        return shouldShowSuggestions;
      })() && (
        <div className="search-results" ref={resultsRef}>
          <div className="search-results-header">
            <span className="results-count">
              {searchResults.length > 0 
                ? `${searchResults.length} results found`
                : searchSuggestions.length > 0 
                  ? `${searchSuggestions.length} suggestions`
                  : 'No results'
              }
            </span>
          </div>
          
          <div className="search-results-content">
            {/* Show suggestions when we have them and no search results */}
            {searchSuggestions.length > 0 && searchResults.length === 0 && (
              <div className="search-category">
                <div className="search-category-header">
                  <Search size={16} className="search-result-icon" />
                  <span className="category-title">Suggestions</span>
                  <span className="category-count">({searchSuggestions.length})</span>
                </div>
                
                <div className="search-category-results">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={`suggestion-${suggestion.text}-${index}`}
                      className={`search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="result-content">
                        <div className="result-title">{suggestion.text}</div>
                        <div className="result-description">{suggestion.category} • Click to navigate</div>
                      </div>
                      <ArrowRight size={16} className="result-arrow" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show search results */}
            {searchResults.length > 0 && (
              <>
                {Object.entries(groupedResults).map(([category, results]) => (
                  <div key={category} className="search-category">
                    <div className="search-category-header">
                      {getResultIcon(category)}
                      <span className="category-title">{category}</span>
                      <span className="category-count">({results.length})</span>
                    </div>
                    
                    <div className="search-category-results">
                      {results.map((result, index) => {
                        const globalIndex = searchSuggestions.length + searchResults.indexOf(result);
                        const isSelected = selectedIndex === globalIndex;
                        
                        return (
                          <div
                            key={`${result.type}-${result.id}`}
                            className={`search-result-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="result-content">
                              <div className="result-title">{result.title}</div>
                              <div className="result-description">{result.description}</div>
                            </div>
                            <ArrowRight size={16} className="result-arrow" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          <div className="search-results-footer">
            <span className="search-hint">
              Use ↑↓ to navigate, Enter to select, Esc to close
            </span>
          </div>
        </div>
      )}

      {(() => {
        const shouldShowNoResults = showResults && searchResults.length === 0 && searchQuery.length >= 1 && !isSearching && searchSuggestions.length === 0;
        console.log('Should show no results:', shouldShowNoResults, {
          showResults,
          searchResultsLength: searchResults.length,
          searchQueryLength: searchQuery.length,
          isSearching,
          suggestionsLength: searchSuggestions.length
        });
        return shouldShowNoResults;
      })() && (
        <div className="search-no-results">
          <Search size={24} className="no-results-icon" />
          <div className="no-results-text">
            <div className="no-results-title">No results found</div>
            <div className="no-results-description">
              Try searching for firearms, owners, users, or licenses
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
