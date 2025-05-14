import { useState, useEffect } from 'react';
import { 
  FileText, Download, Search, User, 
  Phone, FileSearch, Loader2, Check, 
  ShieldCheck, CheckCircle, ChevronDown, ChevronUp,
  FileUp
} from 'lucide-react';
import axios from 'axios';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import '../styles/Reports.css';

const Reports = () => {
  const API_BASE_URL = 'http://127.0.0.1:8000/api/';
  const [searchTerm, setSearchTerm] = useState('');
  const [ownersData, setOwnersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedFirearms, setSelectedFirearms] = useState([]);
  const [showFirearmsTable, setShowFirearmsTable] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Fetch all owners data on component mount
  useEffect(() => {
    const fetchOwnersData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}owners/`);
        setOwnersData(response.data);
      } catch (err) {
        console.error('Error fetching owners data:', err);
        setError('Failed to load owners data');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnersData();
  }, []);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const debouncedSearch = debounce(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const filteredResults = ownersData.filter(owner => 
        owner.full_legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.contact_number.includes(searchTerm) ||
        owner.residential_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, 300);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      setIsSearching(true);
      debouncedSearch(term);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const selectUser = (owner) => {
    setSelectedOwner(owner);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedFirearms([]);
    setShowFirearmsTable(true);
  };

  const toggleFirearmSelection = (firearmId) => {
    setSelectedFirearms(prev => 
      prev.includes(firearmId) 
        ? prev.filter(id => id !== firearmId) 
        : [...prev, firearmId]
    );
  };

  const toggleSelectAllFirearms = () => {
    if (!selectedOwner) return;
    
    const ownerFirearms = selectedOwner.firearms || [];
    
    if (selectedFirearms.length === ownerFirearms.length) {
      setSelectedFirearms([]);
    } else {
      setSelectedFirearms(ownerFirearms.map(firearm => firearm.serial_number));
    }
  };

 const generatePDFReport = async () => {
    if (!selectedOwner || selectedFirearms.length === 0) return;
    
    setGeneratingPDF(true);
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      
      // Load fonts
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Variables for positioning
      const margin = 50;
      const leftMargin = 50;
      let currentY = height - margin; // Start from top with margin
      
      // Add logo/image
      try {
        const imageUrl = '/src/assets/pnp-logo.png';
        const imageResponse = await fetch(imageUrl);
        const imageBytes = await imageResponse.arrayBuffer();
        const image = await pdfDoc.embedPng(imageBytes);
        
        // Scale image to reasonable size (adjust scale factor as needed)
        const imageDims = image.scale(0.09);
        
        // Draw logo at top center
        page.drawImage(image, {
          x: leftMargin, // Center horizontally
          y: currentY - imageDims.height,
          width: imageDims.width,
          height: imageDims.height,
        });
        
        currentY -= imageDims.height + 20; // Move down below logo
      } catch (imageError) {
        console.warn('Could not load logo image, proceeding without it', imageError);
      }
      
      // Add title
      page.drawText('PNP BACNOTAN FIREARM OWNERSHIP REPORT', {
        x: margin,
        y: currentY,
        size: 18,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      currentY -= 30;
      
      // Add date
      page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: margin,
        y: currentY,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      currentY -= 40;
      
      // Add owner information header
      page.drawText('OWNER INFORMATION:', {
        x: margin,
        y: currentY,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      currentY -= 25;
      
      // Add owner details
      const ownerDetails = [
        `Name: ${selectedOwner.full_legal_name}`,
        `Contact Number: ${selectedOwner.contact_number}`,
        `Address: ${selectedOwner.residential_address}`,
        `Age: ${selectedOwner.age}`,
        `License Status: ${selectedOwner.license_status}`,
        `Registration Date: ${selectedOwner.registration_date}`,
      ];
      
      ownerDetails.forEach((detail) => {
        page.drawText(detail, {
          x: margin + 10, // Indent slightly
          y: currentY,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        currentY -= 20;
      });
      
      currentY -= 20; // Extra space before firearms section
      
      // Add firearms header
      page.drawText('REGISTERED FIREARMS:', {
        x: margin,
        y: currentY,
        size: 14,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      currentY -= 25;
      
      // Add table headers
      const tableHeaders = ['Serial', 'Type', 'Model', 'Ammo', 'Status', 'Reg. Date', 'Location'];
      const colWidths = [80, 70, 80, 70, 80, 80, 100];
      
      tableHeaders.forEach((header, colIndex) => {
        page.drawText(header, {
          x: margin + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y: currentY,
          size: 12,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      });
      currentY -= 25;
      
      // Add firearms data
      const selectedFirearmsData = selectedOwner.firearms.filter(firearm => 
        selectedFirearms.includes(firearm.serial_number)
      );
      
      selectedFirearmsData.forEach((firearm) => {
        const rowData = [
          firearm.serial_number,
          firearm.gun_type,
          firearm.gun_model,
          firearm.ammunition_type,
          firearm.firearm_status,
          firearm.date_of_collection,
          firearm.registration_location
        ];
        
        // Check if we need a new page (leave 100px margin at bottom)
        if (currentY < 100) {
          page = pdfDoc.addPage([600, 800]);
          currentY = height - margin;
          
          // Add continuation header
          page.drawText('REGISTERED FIREARMS (continued):', {
            x: margin,
            y: currentY,
            size: 14,
            font: fontBold,
            color: rgb(0, 0, 0),
          });
          currentY -= 25;
          
          // Redraw table headers
          tableHeaders.forEach((header, colIndex) => {
            page.drawText(header, {
              x: margin + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
              y: currentY,
              size: 12,
              font: fontBold,
              color: rgb(0, 0, 0),
            });
          });
          currentY -= 25;
        }
        
        rowData.forEach((cell, colIndex) => {
          page.drawText(cell, {
            x: margin + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
            y: currentY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
        });
        
        currentY -= 20;
      });
      
      // Add footer
      const footerY = 50;
      page.drawText('Official Document - PNP Bacnotan', {
        x: margin,
        y: footerY,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Download the PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `firearm_report_${selectedOwner.full_legal_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="error-message">
          <FileSearch size={24} />
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="police-evidence-banner">
        <ShieldCheck size={20} />
        <span>FIREARM OWNERSHIP REPORT GENERATOR</span>
        <ShieldCheck size={20} />
      </div>

      <div className="reports-header">
        <div className="header-title">
          <FileText size={24} className="header-icon" />
          <h2>PNP Bacnotan Firearm Ownership Reports</h2>
        </div>
      </div>

      <div className="owner-report-content">
        <div className="user-search-container">
          <div className="form-group">
            <label htmlFor="user-search">
              <div className="input-icon-container">
                <Search size={18} className="input-icon" />
              </div>
              Search Firearm Owners
            </label>
            <div className="search-input-container">
              <input
                type="text"
                id="user-search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by owner name, contact number, or address..."
              />
              {isSearching && (
                <Loader2 size={18} className="animate-spin search-loading" />
              )}
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="search-results">
              <div className="results-header">
                <span>Matching Owners</span>
                <span>{searchResults.length} found</span>
              </div>
              <div className="results-list">
                {searchResults.map((owner) => (
                  <div
                    key={owner.id}
                    className="result-item"
                    onClick={() => selectUser(owner)}
                  >
                    <div className="user-info">
                      <User size={16} />
                      <span>{owner.full_legal_name}</span>
                    </div>
                    <div className="user-details">
                      <span>
                        <Phone size={14} /> {owner.contact_number || 'N/A'}
                      </span>
                      <span>
                        Firearms: {owner.firearms?.length || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchTerm.trim() && !isSearching ? (
            <div className="search-results empty-results">
              <div className="results-header">
                <span>No matching owners found</span>
              </div>
              <div className="empty-state">
                <FileSearch size={24} />
                <p>No owners match your search</p>
              </div>
            </div>
          ) : null}
        </div>

        {selectedOwner && (
          <div className="owner-report-section">
            <div className="owner-info-card">
              <div className="owner-header">
                <div className='owner-blah'>

                <User size={24} />
                <h3>{selectedOwner.full_legal_name}</h3>
                </div>
                <button 
                  className="toggle-firearms-btn"
                  onClick={() => setShowFirearmsTable(!showFirearmsTable)}
                >
                  {showFirearmsTable ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  <span>{showFirearmsTable ? 'Hide Firearms' : 'Show Firearms'}</span>
                </button>
              </div>
              
              <div className="owner-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Contact Number:</span>
                  <span className="detail-value">{selectedOwner.contact_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{selectedOwner.residential_address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{selectedOwner.age}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">License Status:</span>
                  <span className={`detail-value status-badge ${selectedOwner.license_status}`}>
                    {selectedOwner.license_status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registration Date:</span>
                  <span className="detail-value">{selectedOwner.registration_date}</span>
                </div>
              </div>
            </div>

            {showFirearmsTable && (
              <div className="firearms-table-container">
                <div className="table-header">
                  <h4>Registered Firearms ({selectedOwner.firearms?.length || 0})</h4>
                  <div className="table-actions" >
                    <button 
                      className="select-all-btn"
                      onClick={toggleSelectAllFirearms}
                      disabled={!selectedOwner.firearms || selectedOwner.firearms.length === 0}
                    >
                      {selectedFirearms.length === selectedOwner.firearms?.length ? (
                        <>
                          <CheckCircle size={16} />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Select All</span>
                        </>
                      )}
                    </button>
                    <button 
                      className="generate-pdf-btn"
                      onClick={generatePDFReport}
                      disabled={selectedFirearms.length === 0 || generatingPDF}
                    >
                      {generatingPDF ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <FileUp size={16} />
                      )}
                      <span>
                        {generatingPDF ? 'Generating...' : 'Generate PDF Report'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {selectedOwner.firearms && selectedOwner.firearms.length > 0 ? (
                  <table className="firearms-table">
                    <thead>
                      <tr>
                        <th width="50px"></th>
                        <th>Serial Number</th>
                        <th>Type</th>
                        <th>Model</th>
                        <th>Ammunition</th>
                        <th>Status</th>
                        <th>Collection Date</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOwner.firearms.map(firearm => (
                        <tr key={firearm.serial_number}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedFirearms.includes(firearm.serial_number)}
                              onChange={() => toggleFirearmSelection(firearm.serial_number)}
                            />
                          </td>
                          <td>{firearm.serial_number}</td>
                          <td>{firearm.gun_type}</td>
                          <td>{firearm.gun_model}</td>
                          <td>{firearm.ammunition_type}</td>
                          <td>
                            <span className={`status-badge ${firearm.firearm_status}`}>
                              {firearm.firearm_status}
                            </span>
                          </td>
                          <td>{firearm.date_of_collection}</td>
                          <td>{firearm.registration_location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <FileSearch size={24} />
                    <p>No firearms registered for this owner</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!selectedOwner && (
          <div className="empty-state">
            <FileSearch size={48} />
            <h3>No Owner Selected</h3>
            <p>Search for an owner to view their details and generate reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;