import { useState, useEffect } from 'react'; 
import { 
  FileText, Download, Search, User, 
  Phone, FileSearch, Loader2, Check, 
  ShieldCheck, CheckCircle, ChevronDown, ChevronUp,
  FileUp, Filter, Eye, X, Calendar, FileSpreadsheet
} from 'lucide-react';
import axios from 'axios';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import '../styles/Reports.css';
import { useAuth } from '../context/AuthContext';
import eventBus from '../utils/eventBus';

const Reports = () => {
  const API_BASE_URL = 'http://127.0.0.1:8000/api/';
  const { user } = useAuth();
  const [ownersData, setOwnersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedFirearms, setSelectedFirearms] = useState([]);
  const [showFirearmsTable, setShowFirearmsTable] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingCSV, setGeneratingCSV] = useState(false);
  const [firearmsData, setFirearmsData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState([
    'all', 'active', 'expired', 'pending', 'revoked', 'suspended', 
    'captured', 'confiscated', 'surrendered', 'deposited', 'abandoned', 'forfeited'
  ]);
  const [availableTypes, setAvailableTypes] = useState(['all']);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [reportMode, setReportMode] = useState('owner'); // 'owner' or 'firearm'
  const [selectedFirearmsOnly, setSelectedFirearmsOnly] = useState([]);
  const [filteredFirearmsOnly, setFilteredFirearmsOnly] = useState([]);

  // Manage PDF blob URL lifecycle
  useEffect(() => {
    if (pdfBlob) {
      // Create blob URL
      const url = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(url);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfBlobUrl(null);
    }
  }, [pdfBlob]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        
        const [ownersRes, typesRes, subtypesRes, modelsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}owners/`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}gun-types/`),
          axios.get(`${API_BASE_URL}gun-subtypes/`),
          axios.get(`${API_BASE_URL}gun-models/`)
        ]);

        console.log('📦 Raw owners data received in Reports:', ownersRes.data);

        const createLookupMap = (data, key = 'id', value = 'name') => 
          new Map(data?.map(item => [item[key], item[value]])) || new Map();

        const typesMap = createLookupMap(typesRes.data);
        const subtypesMap = createLookupMap(subtypesRes.data);
        const modelsMap = createLookupMap(modelsRes.data);

        // Rely on backend scoping; use owners as-is (same as OwnerProfile)
        let processedOwners = ownersRes.data.map(owner => {
          const firearms = Array.isArray(owner.firearms) ? owner.firearms : [];
          
          const processedFirearms = firearms.map(firearm => {
            const gunType = firearm?.gun_type;
            const gunSubtype = firearm?.gun_subtype;
            const gunModel = firearm?.gun_model;

            const getDisplayName = (obj, id, map, defaultText) => 
              obj?.name || (id ? map.get(id) : null) || defaultText;

            return {
              ...firearm,
              gun_type: gunType || null,
              gun_subtype: gunSubtype || null,
              gun_model: gunModel || null,
              gun_type_name: getDisplayName(gunType, firearm?.gun_type, typesMap, 'Unknown Type'),
              gun_subtype_name: getDisplayName(gunSubtype, firearm?.gun_subtype, subtypesMap, 'Unknown Subtype'),
              gun_model_name: getDisplayName(gunModel, firearm?.gun_model, modelsMap, 'Unknown Model'),
              gun_type_id: firearm?.gun_type,
              gun_subtype_id: firearm?.gun_subtype,
              gun_model_id: firearm?.gun_model
            };
          });

          return {
            ...owner,
            firearms: processedFirearms
          };
        });

        // Sort owners by ID in descending order (Last In First Out)
        const sortedOwners = processedOwners.sort((a, b) => (b.id || 0) - (a.id || 0));

        setOwnersData(sortedOwners);
        setFilteredOwners(sortedOwners);
        
        // Create firearms data with owner information for firearm-only mode
        const firearmsWithOwnerInfo = sortedOwners.flatMap(owner => 
          (owner.firearms || []).map(firearm => ({
            ...firearm,
            owner_name: owner.full_legal_name,
            owner_contact: owner.contact_number,
            owner_id: owner.id
          }))
        );

        // Sort firearms by ID in descending order (Last In First Out)
        const sortedFirearmsWithOwnerInfo = firearmsWithOwnerInfo.sort((a, b) => (b.id || 0) - (a.id || 0));

        setFirearmsData(sortedFirearmsWithOwnerInfo);
        
        // Extract unique statuses
        const statuses = [...new Set(
          processedOwners.flatMap(owner => 
            owner.firearms?.map(f => f.firearm_status?.toLowerCase()) || []
          ).filter(Boolean)
        )];
        if (statuses.length > 0) {
          setAvailableStatuses(['all', ...statuses]);
        }

        // Extract unique gun types
        const types = [...new Set(
          processedOwners.flatMap(owner => 
            owner.firearms?.map(f => f.gun_type_name) || []
          ).filter(Boolean)
        )];
        if (types.length > 0) {
          setAvailableTypes(['all', ...types]);
        }
      } catch (err) {
        console.error('Error fetching data in Reports:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Apply filters whenever filter values change
  useEffect(() => {
    applyFilters();
  }, [statusFilter, typeFilter, dateFrom, dateTo, ownersData, firearmsData, reportMode]);

  const applyFilters = () => {
    if (reportMode === 'firearm') {
      // Firearm-only mode: filter firearms directly
      let filteredFirearms = [...firearmsData];

      // Filter by gun status
      if (statusFilter !== 'all') {
        filteredFirearms = filteredFirearms.filter(firearm => 
          firearm.firearm_status?.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // Filter by gun type
      if (typeFilter !== 'all') {
        filteredFirearms = filteredFirearms.filter(firearm => 
          firearm.gun_type_name === typeFilter
        );
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        filteredFirearms = filteredFirearms.filter(firearm => {
          const collectionDate = firearm.date_of_collection;
          if (!collectionDate) return false;

          const firearmDate = new Date(collectionDate);
          
          if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            return firearmDate >= fromDate && firearmDate <= toDate;
          } else if (dateFrom) {
            const fromDate = new Date(dateFrom);
            return firearmDate >= fromDate;
          } else if (dateTo) {
            const toDate = new Date(dateTo);
            return firearmDate <= toDate;
          }
          return true;
        });
      }

      setFilteredFirearmsOnly(filteredFirearms);
    } else {
      // Owner mode: filter owners and their firearms (existing logic)
      let filtered = ownersData;

      // Filter by gun status
      if (statusFilter !== 'all') {
        filtered = filtered.map(owner => {
          const filteredFirearms = owner.firearms?.filter(firearm => 
            firearm.firearm_status?.toLowerCase() === statusFilter.toLowerCase()
          ) || [];
          
          return {
            ...owner,
            firearms: filteredFirearms
          };
        }).filter(owner => owner.firearms.length > 0);
      }

      // Filter by gun type
      if (typeFilter !== 'all') {
        filtered = filtered.map(owner => {
          const filteredFirearms = owner.firearms?.filter(firearm => 
            firearm.gun_type_name === typeFilter
          ) || [];
          
          return {
            ...owner,
            firearms: filteredFirearms
          };
        }).filter(owner => owner.firearms.length > 0);
      }

      // Filter by date range
      if (dateFrom || dateTo) {
        filtered = filtered.map(owner => {
          const filteredFirearms = owner.firearms?.filter(firearm => {
            const collectionDate = firearm.date_of_collection;
            if (!collectionDate) return false;

            const firearmDate = new Date(collectionDate);
            
            if (dateFrom && dateTo) {
              const fromDate = new Date(dateFrom);
              const toDate = new Date(dateTo);
              return firearmDate >= fromDate && firearmDate <= toDate;
            } else if (dateFrom) {
              const fromDate = new Date(dateFrom);
              return firearmDate >= fromDate;
            } else if (dateTo) {
              const toDate = new Date(dateTo);
              return firearmDate <= toDate;
            }
            return true;
          }) || [];
          
          return {
            ...owner,
            firearms: filteredFirearms
          };
        }).filter(owner => owner.firearms.length > 0);
      }

      setFilteredOwners(filtered);
    }
  };

  const resetFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setSelectedFirearmsOnly([]);
    setSelectedFirearms([]);
  };

  const selectUser = (owner) => {
    setSelectedOwner(owner);
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

  const toggleFirearmOnlySelection = (firearmId) => {
    setSelectedFirearmsOnly(prev => 
      prev.includes(firearmId) 
        ? prev.filter(id => id !== firearmId) 
        : [...prev, firearmId]
    );
  };

  const toggleSelectAllFirearmsOnly = () => {
    if (selectedFirearmsOnly.length === filteredFirearmsOnly.length) {
      setSelectedFirearmsOnly([]);
    } else {
      setSelectedFirearmsOnly(filteredFirearmsOnly.map(firearm => firearm.serial_number));
    }
  };

  const toggleSelectAllFirearms = () => {
    if (!selectedOwner) return;
    
    const filteredFirearms = getFilteredFirearms();
    
    if (selectedFirearms.length === filteredFirearms.length) {
      setSelectedFirearms([]);
    } else {
      setSelectedFirearms(filteredFirearms.map(firearm => firearm.serial_number));
    }
  };

  const getFilteredFirearms = () => {
    if (!selectedOwner?.firearms) return [];
    return selectedOwner.firearms;
  };

  const generateCSVReport = async () => {
    if (reportMode === 'owner') {
      if (!selectedOwner || selectedFirearms.length === 0) return;
    } else {
      if (selectedFirearmsOnly.length === 0) return;
    }
    
    setGeneratingCSV(true);
    
    try {
      let selectedFirearmsData;
      let fileName;
      
      if (reportMode === 'owner') {
        selectedFirearmsData = selectedOwner.firearms.filter(firearm => 
          selectedFirearms.includes(firearm.serial_number)
        );
        fileName = `PNP_Firearm_Report_${selectedOwner.full_legal_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
      } else {
        selectedFirearmsData = filteredFirearmsOnly.filter(firearm => 
          selectedFirearmsOnly.includes(firearm.serial_number)
        );
        fileName = `PNP_Firearms_Only_Report_${new Date().toISOString().slice(0,10)}.csv`;
      }

      // Professional CSV header with company information
      const csvContent = [];
      
      // Company Header Section
      csvContent.push('"CIVIL SECURITY GROUP - REGIONAL CIVIL SECURITY UNIT"');
      csvContent.push('"FIREARM REGISTRATION DIVISION"');
      csvContent.push(`"${reportMode === 'owner' ? 'OFFICIAL FIREARM OWNERSHIP REPORT' : 'OFFICIAL FIREARMS INVENTORY REPORT'}"`);
      csvContent.push('""'); // Empty line for spacing
      
      // Report Metadata
      csvContent.push(`"Report Date:","${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"`);
      csvContent.push(`"Report ID:","FR-${Date.now().toString().slice(-6)}"`);
      csvContent.push(`"Report Type:","${reportMode === 'owner' ? 'Owner-Based Report' : 'Firearms-Only Report'}"`);
      csvContent.push(`"Document Type:","CSV Export"`);
      csvContent.push('""'); // Empty line for spacing
      
      if (reportMode === 'owner') {
        // Owner Information Section (only for owner mode)
        csvContent.push('"OWNER INFORMATION"');
        csvContent.push('""'); // Empty line for spacing
        csvContent.push(`"Full Legal Name:","${selectedOwner.full_legal_name}"`);
        csvContent.push(`"Contact Number:","${selectedOwner.contact_number}"`);
        csvContent.push(`"Residential Address:","${selectedOwner.residential_address}"`);
        csvContent.push(`"Age:","${selectedOwner.age}"`);
        csvContent.push('""'); // Empty line for spacing
        csvContent.push('""'); // Empty line for spacing
      }
      
      // Firearms Data Section Header
      csvContent.push('"REGISTERED FIREARMS"');
      csvContent.push('""'); // Empty line for spacing
      
      // Column Headers
      const headers = reportMode === 'owner' ? [
        'Serial Number',
        'Firearm Type',
        'Subtype',
        'Model',
        'Caliber',
        'Ammunition Type',
        'Status',
        'Collection Date'
      ] : [
        'Serial Number',
        'Owner Name',
        'Owner Contact',
        'Firearm Type',
        'Subtype',
        'Model',
        'Caliber',
        'Ammunition Type',
        'Status',
        'Collection Date'
      ];
      csvContent.push(`"${headers.join('","')}"`);
      
      // Firearms Data Rows
      selectedFirearmsData.forEach(firearm => {
        const row = reportMode === 'owner' ? [
          firearm.serial_number || 'N/A',
          firearm.gun_type_name || firearm.gun_type || 'Unknown',
          firearm.gun_subtype_name || firearm.gun_subtype || 'N/A',
          firearm.gun_model_name || firearm.gun_model || 'Unknown',
          firearm.caliber || 'N/A',
          firearm.ammunition_type || 'N/A',
          firearm.firearm_status || 'N/A',
          firearm.date_of_collection || 'N/A'
        ] : [
          firearm.serial_number || 'N/A',
          firearm.owner_name || 'N/A',
          firearm.owner_contact || 'N/A',
          firearm.gun_type_name || firearm.gun_type || 'Unknown',
          firearm.gun_subtype_name || firearm.gun_subtype || 'N/A',
          firearm.gun_model_name || firearm.gun_model || 'Unknown',
          firearm.caliber || 'N/A',
          firearm.ammunition_type || 'N/A',
          firearm.firearm_status || 'N/A',
          firearm.date_of_collection || 'N/A'
        ];
        csvContent.push(`"${row.join('","')}"`);
      });
      
      // Footer Section
      csvContent.push('""'); // Empty line for spacing
      csvContent.push('""'); // Empty line for spacing
      csvContent.push('"DOCUMENT FOOTER"');
      csvContent.push(`"Total Firearms in Report:","${selectedFirearmsData.length}"`);
      csvContent.push(`"Report Generated On:","${new Date().toISOString()}"`);
      csvContent.push(`"Generated By:","RCSU Firearm Registration System"`);
      csvContent.push('"Official Document - Civil Security Group Regional Civil Security Unit"');
      csvContent.push('"Firearm Registration Division - CONFIDENTIAL - For Official Use Only"');
      
      // Create and download CSV file
      const csvString = csvContent.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error generating CSV:', err);
      setError('Failed to generate CSV report');
    } finally {
      setGeneratingCSV(false);
    }
  };

  const generatePDFReport = async (previewOnly = false, openInNewTab = false) => {
    if (reportMode === 'owner') {
      if (!selectedOwner || selectedFirearms.length === 0) return;
    } else {
      if (selectedFirearmsOnly.length === 0) return;
    }
    
    setGeneratingPDF(true);
    
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Modern color scheme inspired by RCSU branding
      const primaryColor = rgb(0.122, 0.306, 0.545); // Deep blue
      const secondaryColor = rgb(0.047, 0.137, 0.278); // Darker blue
      const accentColor = rgb(0.851, 0.325, 0.102); // Orange accent
      const successColor = rgb(0.2, 0.6, 0.3); // Green
      const lightGray = rgb(0.98, 0.98, 0.98);
      const mediumGray = rgb(0.85, 0.85, 0.85);
      const darkGray = rgb(0.25, 0.25, 0.25);
      const textGray = rgb(0.4, 0.4, 0.4);
      const white = rgb(1, 1, 1);
      
      const margin = 40;
      const leftMargin = 40;
      let currentY = height - margin;
      
      // Enhanced header with gradient-like effect - increased height to prevent logo cutoff
      const headerHeight = 100;
      
      // Main header background
      page.drawRectangle({
        x: 0,
        y: currentY - 10,
        width,
        height: headerHeight,
        color: primaryColor,
      });
      
      // Subtle accent line at bottom of header
      page.drawRectangle({
        x: 0,
        y: currentY - 10,
        width,
        height: 3,
        color: accentColor,
      });
      
      try {
        const imageUrl = '/src/assets/rcsu-logo.png';
        const imageResponse = await fetch(imageUrl);
        const imageBytes = await imageResponse.arrayBuffer();
        const image = await pdfDoc.embedPng(imageBytes);
        
        const logoHeight = headerHeight - 30;
        const logoWidth = image.width * (logoHeight / image.height);
        
        const logoY = currentY - 10 + (headerHeight - logoHeight) / 2;
        
        // Add subtle shadow effect for logo
        page.drawRectangle({
          x: leftMargin + 2,
          y: logoY - 2,
          width: logoWidth,
          height: logoHeight,
          color: rgb(0, 0, 0, 0.1),
        });
        
        page.drawImage(image, {
          x: leftMargin,
          y: logoY,
          width: logoWidth,
          height: logoHeight,
        });
        
        const textX = leftMargin + logoWidth + 25;
        
        // Main organization title
        page.drawText('CIVIL SECURITY GROUP', {
          x: textX,
          y: currentY + 45,
          size: 16,
          font: fontBold,
          color: white,
        });
        
        // Subtitle
        page.drawText('REGIONAL CIVIL SECURITY UNIT', {
          x: textX,
          y: currentY + 25,
          size: 12,
          font: font,
          color: rgb(0.9, 0.9, 0.9),
        });
        
        // Report type indicator
        page.drawText('FIREARM REGISTRATION DIVISION', {
          x: textX,
          y: currentY + 5,
          size: 10,
          font: font,
          color: rgb(0.8, 0.8, 0.8),
        });
        
        currentY -= headerHeight + 30;
      } catch (imageError) {
        console.warn('Could not load RCSU logo image, proceeding without it', imageError);
        page.drawText('CIVIL SECURITY GROUP - REGIONAL CIVIL SECURITY UNIT', {
          x: leftMargin,
          y: currentY + 20,
          size: 14,
          font: fontBold,
          color: white,
        });
        page.drawText('FIREARM REGISTRATION DIVISION', {
          x: leftMargin,
          y: currentY,
          size: 12,
          font: font,
          color: white,
        });
        currentY -= 60;
      }

      // Report title with enhanced styling
      const reportTitle = reportMode === 'owner' ? 'FIREARM OWNERSHIP REPORT' : 'FIREARMS INVENTORY REPORT';
      
      // Title background
      page.drawRectangle({
        x: leftMargin - 10,
        y: currentY - 5,
        width: 350,
        height: 35,
        color: lightGray,
        borderColor: accentColor,
        borderWidth: 1,
      });
      
      page.drawText(reportTitle, {
        x: leftMargin,
        y: currentY + 10,
        size: 18,
        font: fontBold,
        color: secondaryColor,
      });
      
      currentY -= 50;
      
      // Report metadata in a clean card layout
      page.drawRectangle({
        x: leftMargin,
        y: currentY - 10,
        width: width - margin * 2,
        height: 40,
        color: lightGray,
        borderColor: mediumGray,
        borderWidth: 1,
      });
      
      page.drawText(`Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, {
        x: leftMargin + 15,
        y: currentY + 5,
        size: 11,
        font: font,
        color: darkGray,
      });
      
      page.drawText(`Report ID: FR-${Date.now().toString().slice(-6)}`, {
        x: width - margin - 180,
        y: currentY + 5,
        size: 11,
        font: font,
        color: darkGray,
      });
      
      page.drawText(`Generated By: RCSU Firearm Registration System`, {
        x: leftMargin + 15,
        y: currentY - 10,
        size: 10,
        font: font,
        color: textGray,
      });
      
      page.drawText(`Document Type: ${reportMode === 'owner' ? 'Owner-Based Report' : 'Firearms-Only Report'}`, {
        x: width - margin - 180,
        y: currentY - 10,
        size: 10,
        font: font,
        color: textGray,
      });
      
      currentY -= 60;
      
      if (reportMode === 'owner') {
        // Enhanced owner information section
        page.drawRectangle({
          x: leftMargin,
          y: currentY + 5,
          width: width - margin * 2,
          height: 30,
          color: primaryColor,
          borderColor: accentColor,
          borderWidth: 1,
        });
        
        page.drawText('OWNER INFORMATION', {
          x: leftMargin + 15,
          y: currentY + 15,
          size: 14,
          font: fontBold,
          color: white,
        });
        
        currentY -= 45;
        
        // Owner details in a clean grid layout
        const ownerDetailsLeft = [
          { label: 'Full Legal Name', value: selectedOwner.full_legal_name },
          { label: 'Contact Number', value: selectedOwner.contact_number },
          { label: 'Residential Address', value: selectedOwner.residential_address },
        ];
        
        const ownerDetailsRight = [
          { label: 'Age', value: selectedOwner.age },
        ];
        
        // Left column
        ownerDetailsLeft.forEach((detail, index) => {
          const yPos = currentY - (index * 25);
          
          // Label
          page.drawText(`${detail.label}:`, {
            x: leftMargin + 10,
            y: yPos,
            size: 10,
            font: fontBold,
            color: secondaryColor,
          });
          
          // Value
          page.drawText(String(detail.value || 'N/A'), {
            x: leftMargin + 10,
            y: yPos - 15,
            size: 11,
            font: font,
            color: darkGray,
          });
        });
        
        // Right column
        ownerDetailsRight.forEach((detail, index) => {
          const yPos = currentY - (index * 25);
          
          // Label
          page.drawText(`${detail.label}:`, {
            x: width / 2 + 20,
            y: yPos,
            size: 10,
            font: fontBold,
            color: secondaryColor,
          });
          
          // Value color
          const valueColor = darkGray;
          
          page.drawText(String(detail.value || 'N/A'), {
            x: width / 2 + 20,
            y: yPos - 15,
            size: 11,
            font: font,
            color: valueColor,
          });
        });
        
        currentY -= (ownerDetailsLeft.length * 25) + 40;
      }
      
      // Enhanced firearms section header
      page.drawRectangle({
        x: leftMargin,
        y: currentY + 5,
        width: width - margin * 2,
        height: 30,
        color: secondaryColor,
        borderColor: accentColor,
        borderWidth: 1,
      });
      
      page.drawText('REGISTERED FIREARMS', {
        x: leftMargin + 15,
        y: currentY + 15,
        size: 14,
        font: fontBold,
        color: white,
      });
      
      currentY -= 40;
      
      const tableHeaders = reportMode === 'owner' ? 
        ['Serial No.', 'Type', 'Subtype', 'Model', 'Caliber', 'Ammo', 'Status', 'Reg. Date'] :
        ['Serial No.', 'Owner', 'Type', 'Subtype', 'Model', 'Caliber', 'Status', 'Reg. Date'];
      const colWidths = reportMode === 'owner' ? 
        [90, 75, 80, 85, 70, 65, 85, 85] :
        [90, 110, 75, 70, 85, 70, 85, 85];
      
      // Enhanced table header
      page.drawRectangle({
        x: leftMargin,
        y: currentY + 5,
        width: width - margin * 2,
        height: 25,
        color: primaryColor,
      });
      
      // Add subtle border to table header
      page.drawRectangle({
        x: leftMargin,
        y: currentY + 5,
        width: width - margin * 2,
        height: 25,
        color: rgb(0, 0, 0, 0),
        borderColor: accentColor,
        borderWidth: 0.5,
      });
      
      tableHeaders.forEach((header, colIndex) => {
        page.drawText(header, {
          x: leftMargin + 8 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
          y: currentY + 12,
          size: 10,
          font: fontBold,
          color: white,
        });
      });
      
      currentY -= 30;
      
      let selectedFirearmsData;
      if (reportMode === 'owner') {
        selectedFirearmsData = selectedOwner.firearms.filter(firearm => 
          selectedFirearms.includes(firearm.serial_number)
        );
      } else {
        selectedFirearmsData = filteredFirearmsOnly.filter(firearm => 
          selectedFirearmsOnly.includes(firearm.serial_number)
        );
      }
      
      let rowColor = true;
      
      selectedFirearmsData.forEach((firearm, index) => {
        if (currentY < 120) {
          page = pdfDoc.addPage([612, 792]);
          currentY = height - margin;
          
          // Redraw header on new page
          page.drawRectangle({
            x: leftMargin,
            y: currentY + 5,
            width: width - margin * 2,
            height: 25,
            color: primaryColor,
          });
          
          page.drawRectangle({
            x: leftMargin,
            y: currentY + 5,
            width: width - margin * 2,
            height: 25,
            color: rgb(0, 0, 0, 0),
            borderColor: accentColor,
            borderWidth: 0.5,
          });
          
          tableHeaders.forEach((header, colIndex) => {
            page.drawText(header, {
              x: leftMargin + 8 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
              y: currentY + 12,
              size: 10,
              font: fontBold,
              color: white,
            });
          });
          
          currentY -= 30;
          rowColor = true;
        }
        
        // Enhanced row styling with alternating colors
        const rowBgColor = rowColor ? lightGray : white;
        const rowBorderColor = rowColor ? mediumGray : lightGray;
        
        page.drawRectangle({
          x: leftMargin,
          y: currentY + 2,
          width: width - margin * 2,
          height: 22,
          color: rowBgColor,
          borderColor: rowBorderColor,
          borderWidth: 0.5,
        });
        
        rowColor = !rowColor;
        
        const rowData = reportMode === 'owner' ? [
          String(firearm.serial_number || 'N/A'),
          String(firearm.gun_type_name || firearm.gun_type || 'Unknown'),
          String(firearm.gun_subtype_name || firearm.gun_subtype || 'N/A'),
          String(firearm.gun_model_name || firearm.gun_model || 'Unknown'),
          String(firearm.caliber || 'N/A'),
          String(firearm.ammunition_type || 'N/A'),
          String(firearm.firearm_status || 'N/A'),
          String(firearm.date_of_collection || 'N/A')
        ] : [
          String(firearm.serial_number || 'N/A'),
          String(firearm.owner_name || 'N/A'),
          String(firearm.gun_type_name || firearm.gun_type || 'Unknown'),
          String(firearm.gun_subtype_name || firearm.gun_subtype || 'N/A'),
          String(firearm.gun_model_name || firearm.gun_model || 'Unknown'),
          String(firearm.caliber || 'N/A'),
          String(firearm.firearm_status || 'N/A'),
          String(firearm.date_of_collection || 'N/A')
        ];
        
        rowData.forEach((cell, colIndex) => {
          // Special styling for status column
          const cellColor = colIndex === 6 ? // Status column (updated index due to added caliber column)
            (cell === 'active' ? successColor : 
             cell === 'expired' ? accentColor : 
             cell === 'pending' ? rgb(0.8, 0.6, 0.2) : darkGray) : darkGray;
          
          page.drawText(String(cell), {
            x: leftMargin + 8 + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0),
            y: currentY + 10,
            size: 9,
            font: font,
            color: cellColor,
            maxWidth: colWidths[colIndex] - 15,
          });
        });
        
        currentY -= 25;
      });
    
      // Enhanced footer section
      const footerY = 50;
      
      // Footer background
      page.drawRectangle({
        x: 0,
        y: footerY - 15,
        width,
        height: 40,
        color: lightGray,
        borderColor: accentColor,
        borderWidth: 1,
      });
      
      // Footer content
      page.drawText('Official Document - Civil Security Group Regional Civil Security Unit', {
        x: leftMargin,
        y: footerY + 5,
        size: 9,
        font: font,
        color: secondaryColor,
      });
      
      page.drawText('Firearm Registration Division - RCSU Firearm Registration System', {
        x: leftMargin,
        y: footerY - 5,
        size: 8,
        font: font,
        color: textGray,
      });
      
      page.drawText(`Page ${pdfDoc.getPageCount()} of ${pdfDoc.getPageCount()}`, {
        x: width - leftMargin - 60,
        y: footerY + 5,
        size: 9,
        font: fontBold,
        color: secondaryColor,
      });
      
      page.drawText(`Report ID: FR-${Date.now().toString().slice(-6)}`, {
        x: width - leftMargin - 60,
        y: footerY - 5,
        size: 8,
        font: font,
        color: textGray,
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      if (openInNewTab) {
        // Open PDF in a new browser tab for preview
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, '_blank');
        
        // Clean up the URL after a delay to allow the browser to load it
        if (newWindow) {
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        } else {
          // If popup was blocked, show alert
          alert('Please allow popups for this site to preview the PDF.');
          URL.revokeObjectURL(url);
        }
        setGeneratingPDF(false);
        return;
      }
      
      if (previewOnly) {
        setPdfBlob(blob);
        setShowPreview(true);
        setGeneratingPDF(false);
        return;
      }
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = reportMode === 'owner' ? 
        `PNP_Firearm_Report_${selectedOwner.full_legal_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf` :
        `PNP_Firearms_Only_Report_${new Date().toISOString().slice(0,10)}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF report');
    } finally {
      if (!previewOnly) {
        setGeneratingPDF(false);
      }
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(pdfBlob);
    link.href = url;
    const fileName = reportMode === 'owner' ? 
      `PNP_Firearm_Report_${selectedOwner.full_legal_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf` :
      `PNP_Firearms_Only_Report_${new Date().toISOString().slice(0,10)}.pdf`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowPreview(false);
    setPdfBlob(null);
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
      {/* Preview Modal */}
      {showPreview && pdfBlobUrl && (
        <div className="preview-modal-overlay" onClick={(e) => {
          if (e.target.className === 'preview-modal-overlay') {
            setShowPreview(false);
            setPdfBlob(null);
          }
        }}>
          <div className="preview-modal">
            <div className="preview-modal-header">
              <h3>Report Preview</h3>
              <button 
                className="close-preview-btn"
                onClick={() => {
                  setShowPreview(false);
                  setPdfBlob(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="preview-content">
              <iframe 
                src={pdfBlobUrl} 
                title="Report Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </div>
            <div className="preview-actions">
              <button 
                className="cancel-preview-btn"
                onClick={() => {
                  setShowPreview(false);
                  setPdfBlob(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="download-preview-btn"
                onClick={handleDownload}
              >
                <Download size={16} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="police-evidence-banner">
        <ShieldCheck size={20} />
        <span>FIREARM OWNERSHIP REPORT GENERATOR</span>
        <ShieldCheck size={20} />
      </div>

      <div className="reports-header">
        <div className="header-title">
          <FileText size={24} className="header-icon" />
          <h2>Firearm Ownership Reports</h2>
          {user?.role === 'administrator' && user?.municipality && (
            <span className="municipality-badge">
              Municipality: {user.municipality}
            </span>
          )}
        </div>
        
        <div className="report-mode-toggle">
          <div className="toggle-container">
            <label className="toggle-label">
              <input
                type="radio"
                name="reportMode"
                value="owner"
                checked={reportMode === 'owner'}
                onChange={(e) => {
                  setReportMode(e.target.value);
                  setSelectedFirearmsOnly([]);
                  setSelectedFirearms([]);
                }}
              />
              <span className="toggle-option">By Owner</span>
            </label>
            <label className="toggle-label">
              <input
                type="radio"
                name="reportMode"
                value="firearm"
                checked={reportMode === 'firearm'}
                onChange={(e) => {
                  setReportMode(e.target.value);
                  setSelectedFirearmsOnly([]);
                  setSelectedFirearms([]);
                  setSelectedOwner(null);
                }}
              />
              <span className="toggle-option">Firearms Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="owner-report-content">
        <div className="filter-container">
          <div className="filter-header">
            <Filter size={20} />
            <h3>Filter Firearm Owners</h3>
          </div>
          
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="status-filter">Firearm Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="type-filter">Gun Type</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="date-from">
                <Calendar size={16} />
                Date From
              </label>
              <input
                type="date"
                id="date-from"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="date-to">
                <Calendar size={16} />
                Date To
              </label>
              <input
                type="date"
                id="date-to"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button 
                className="reset-filters-btn"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="filter-results-info">
            <span>
              {reportMode === 'owner' 
                ? `Showing ${filteredOwners.length} owner(s) matching your filters`
                : `Showing ${filteredFirearmsOnly.length} firearm(s) matching your filters`
              }
            </span>
            {user?.role === 'administrator' && (
              <span className="scope-info">
                (Scoped to your registered data)
              </span>
            )}
          </div>
        </div>

        {reportMode === 'firearm' ? (
          // Firearm-only mode view
          filteredFirearmsOnly.length > 0 ? (
            <div className="firearms-only-view">
              <div className="firearms-table-container">
                <div className="table-header">
                  <h4>
                    Filtered Firearms ({filteredFirearmsOnly.length})
                    <span className="total-count"> / {firearmsData.length} total</span>
                  </h4>
                  <div className="table-actions">
                    <button 
                      className="select-all-btn"
                      onClick={toggleSelectAllFirearmsOnly}
                      disabled={filteredFirearmsOnly.length === 0}
                    >
                      {selectedFirearmsOnly.length === filteredFirearmsOnly.length && filteredFirearmsOnly.length > 0 ? (
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
                    
                    <div className="export-buttons">
                      <button 
                        className="preview-pdf-btn"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          generatePDFReport(false, true); // openInNewTab = true
                        }}
                        disabled={selectedFirearmsOnly.length === 0 || generatingPDF}
                      >
                        {generatingPDF ? <Loader2 size={16} className="spinner" /> : <Eye size={16} />}
                        <span>Preview PDF</span>
                      </button>
                      
                      <button 
                        className="download-pdf-btn"
                        onClick={() => generatePDFReport(false)}
                        disabled={selectedFirearmsOnly.length === 0 || generatingPDF}
                      >
                        {generatingPDF ? <Loader2 size={16} className="spinner" /> : <FileUp size={16} />}
                        <span>Download PDF</span>
                      </button>
                      
                      <button 
                        className="download-csv-btn"
                        onClick={generateCSVReport}
                        disabled={selectedFirearmsOnly.length === 0 || generatingCSV}
                      >
                        {generatingCSV ? <Loader2 size={16} className="spinner" /> : <FileSpreadsheet size={16} />}
                        <span>Download CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="selection-info">
                  {selectedFirearmsOnly.length > 0 ? (
                    <div className="selection-count">
                      <CheckCircle size={16} className="check-icon" />
                      <span>{selectedFirearmsOnly.length} firearm(s) selected for report</span>
                    </div>
                  ) : (
                    <div className="selection-hint">
                      <span>Select firearms to include in the report</span>
                    </div>
                  )}
                </div>

                <div className="firearms-table-wrapper">
                  <table className="firearms-table">
                    <thead>
                      <tr>
                        <th className="select-column">Select</th>
                        <th>Serial Number</th>
                        <th>Owner Name</th>
                        <th>Owner Contact</th>
                        <th>Type</th>
                        <th>Subtype</th>
                        <th>Model</th>
                        <th>Caliber</th>
                        <th>Ammunition Type</th>
                        <th>Status</th>
                        <th>Collection Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFirearmsOnly.map((firearm) => (
                        <tr key={firearm.serial_number}>
                          <td className="select-cell">
                            <input
                              type="checkbox"
                              checked={selectedFirearmsOnly.includes(firearm.serial_number)}
                              onChange={() => toggleFirearmOnlySelection(firearm.serial_number)}
                              className="firearm-checkbox"
                            />
                          </td>
                          <td className="serial-number">{firearm.serial_number}</td>
                          <td>{firearm.owner_name || 'N/A'}</td>
                          <td>{firearm.owner_contact || 'N/A'}</td>
                          <td>{firearm.gun_type_name}</td>
                          <td>{firearm.gun_subtype_name}</td>
                          <td>{firearm.gun_model_name}</td>
                          <td>{firearm.caliber}</td>
                          <td>{firearm.ammunition_type}</td>
                          <td>
                            <span className={`status-badge ${firearm.firearm_status}`}>
                              {firearm.firearm_status}
                            </span>
                          </td>
                          <td>{firearm.date_of_collection}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FileSearch size={48} />
              <h3>No Firearms Found</h3>
              <p>No firearms match the current filters. Try adjusting your filter criteria.</p>
              {user?.role === 'administrator' && (
                <p className="scope-note">
                  Note: You can only see firearms from owners you registered.
                </p>
              )}
            </div>
          )
        ) : filteredOwners.length > 0 ? (
          <div className="owners-list">
            <div className="owners-list-header">
              <h4>Filtered Owners</h4>
              <span>{filteredOwners.length} result(s)</span>
            </div>
            <div className="owners-grid">
              {filteredOwners.map((owner) => (
                <div
                  key={owner.id}
                  className={`owner-card ${selectedOwner?.id === owner.id ? 'selected' : ''}`}
                  onClick={() => selectUser(owner)}
                >
                  <div className="owner-card-header">
                    <User size={20} />
                    <h4>{owner.full_legal_name}</h4>
                    {owner.created_by === user?.id && (
                      <span className="created-by-badge">Registered by You</span>
                    )}
                  </div>
                  <div className="owner-card-details">
                    <div className="detail">
                      <Phone size={14} />
                      <span>{owner.contact_number || 'N/A'}</span>
                    </div>
                    <div className="detail">
                      <span>Firearms: {owner.firearms?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <FileSearch size={48} />
            <h3>No Owners Found</h3>
            <p>No owners match the current filters. Try adjusting your filter criteria.</p>
            {user?.role === 'administrator' && (
              <p className="scope-note">
                Note: You can only see owners you registered.
              </p>
            )}
          </div>
        )}

        {selectedOwner && (
          <div className="owner-report-section">
            <div className="owner-info-card">
              <div className="owner-header">
                <div className='owner-blah'>
                  <User size={24} />
                  <h3>{selectedOwner.full_legal_name}</h3>
                  {selectedOwner.created_by === user?.id && (
                    <span className="created-by-indicator">(Registered by You)</span>
                  )}
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
              </div>
            </div>

            {showFirearmsTable && (
              <div className="firearms-table-container">
                <div className="table-header">
                  <h4>
                    Registered Firearms ({getFilteredFirearms().length})
                    <span className="total-count"> / {selectedOwner.firearms?.length || 0} total</span>
                  </h4>
                  <div className="table-actions">
                    <button 
                      className="select-all-btn"
                      onClick={toggleSelectAllFirearms}
                      disabled={!selectedOwner.firearms || getFilteredFirearms().length === 0}
                    >
                      {selectedFirearms.length === getFilteredFirearms().length && getFilteredFirearms().length > 0 ? (
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
                    
                    <div className="export-buttons">
                      <button 
                        className="preview-pdf-btn"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          generatePDFReport(false, true); // openInNewTab = true
                        }}
                        disabled={reportMode === 'owner' ? selectedFirearms.length === 0 : selectedFirearmsOnly.length === 0 || generatingPDF}
                      >
                        {generatingPDF ? <Loader2 size={16} className="spinner" /> : <Eye size={16} />}
                        <span>Preview PDF</span>
                      </button>
                      
                      <button 
                        className="download-pdf-btn"
                        onClick={() => generatePDFReport(false)}
                        disabled={reportMode === 'owner' ? selectedFirearms.length === 0 : selectedFirearmsOnly.length === 0 || generatingPDF}
                      >
                        {generatingPDF ? <Loader2 size={16} className="spinner" /> : <FileUp size={16} />}
                        <span>Download PDF</span>
                      </button>
                      
                      <button 
                        className="download-csv-btn"
                        onClick={generateCSVReport}
                        disabled={reportMode === 'owner' ? selectedFirearms.length === 0 : selectedFirearmsOnly.length === 0 || generatingCSV}
                      >
                        {generatingCSV ? <Loader2 size={16} className="spinner" /> : <FileSpreadsheet size={16} />}
                        <span>Download CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="selection-info">
                  {selectedFirearms.length > 0 ? (
                    <div className="selection-count">
                      <CheckCircle size={16} className="check-icon" />
                      <span>{selectedFirearms.length} firearm(s) selected for report</span>
                    </div>
                  ) : (
                    <div className="selection-hint">
                      <span>Select firearms to include in the report</span>
                    </div>
                  )}
                </div>

                {getFilteredFirearms().length > 0 ? (
                  <div className="firearms-table-wrapper">
                    <table className="firearms-table">
                      <thead>
                        <tr>
                          <th className="select-column">
                            Select
                          </th>
                          <th>Serial Number</th>
                          <th>Type</th>
                          <th>Subtype</th>
                          <th>Model</th>
                          <th>Caliber</th>
                          <th>Ammunition Type</th>
                          <th>Status</th>
                          <th>Collection Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredFirearms().map((firearm) => (
                          <tr key={firearm.serial_number}>
                            <td className="select-cell">
                              <input
                                type="checkbox"
                                checked={selectedFirearms.includes(firearm.serial_number)}
                                onChange={() => toggleFirearmSelection(firearm.serial_number)}
                                className="firearm-checkbox"
                              />
                            </td>
                            <td className="serial-number">{firearm.serial_number}</td>
                            <td>{firearm.gun_type_name}</td>
                            <td>{firearm.gun_subtype_name}</td>
                            <td>{firearm.gun_model_name}</td>
                            <td>{firearm.caliber}</td>
                            <td>{firearm.ammunition_type}</td>
                            <td>
                              <span className={`status-badge ${firearm.firearm_status}`}>
                                {firearm.firearm_status}
                              </span>
                            </td>
                            <td>{firearm.date_of_collection}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-firearms-message">
                    <FileSearch size={32} />
                    <p>No firearms match the current filters</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;