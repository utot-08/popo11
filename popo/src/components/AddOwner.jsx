import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
import {
  User,
  Shield,
  Phone,
  Home,
  FileText,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
  ShieldAlert,
  Target,
  Calendar,
  BadgeCheck,
  FileSearch,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Edit,
  Barcode,
  MapPin,
  Clock,
  Bomb,
  CircleDot,
  Loader2,
  AlertCircle,
  Search,
  UserPlus,
  Mail,
  UserCog,
  ShieldHalf,
  Save,
  ChevronDown,
  Circle,
  UserCheck2,
  UserX,
  CheckCircle,
  ImagePlus,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/AddOwner.css';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api/';

// Region 1 Data Structure
const REGION_1_DATA = {
  "Ilocos Norte": {
    "Adams": ["Adams", "Burgos", "Cagayan", "Dumalneg", "Laoag City", "Pasuquin", "Piddig", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Bacarra": ["Bacarra", "Badoc", "Bangui", "Burgos", "Carasi", "Currimao", "Dingras", "Dumalneg", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Badoc": ["Badoc", "Bangui", "Burgos", "Carasi", "Currimao", "Dingras", "Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Bangui": ["Bangui", "Burgos", "Carasi", "Currimao", "Dingras", "Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Burgos": ["Burgos", "Carasi", "Currimao", "Dingras", "Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Carasi": ["Carasi", "Currimao", "Dingras", "Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Currimao": ["Currimao", "Dingras", "Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Dingras": ["Dingras", "Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Dumalneg": ["Dumalneg", "Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Laoag City": ["Laoag City", "Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Marcos": ["Marcos", "Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Nueva Era": ["Nueva Era", "Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Pagudpud": ["Pagudpud", "Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Paoay": ["Paoay", "Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Pasuquin": ["Pasuquin", "Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Piddig": ["Piddig", "Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Pinili": ["Pinili", "San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "San Nicolas": ["San Nicolas", "Sarrat", "Solsona", "Vintar"],
    "Sarrat": ["Sarrat", "Solsona", "Vintar"],
    "Solsona": ["Solsona", "Vintar"],
    "Vintar": ["Vintar"]
  },
  "Ilocos Sur": {
    "Alilem": ["Alilem", "Banayoyo", "Bantay", "Burgos", "Cabugao", "Candon City", "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Banayoyo": ["Banayoyo", "Bantay", "Burgos", "Cabugao", "Candon City", "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Bantay": ["Bantay", "Burgos", "Cabugao", "Candon City", "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Burgos": ["Burgos", "Cabugao", "Candon City", "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Cabugao": ["Cabugao", "Candon City", "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Candon City": ["Candon City", "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Caoayan": ["Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Cervantes": ["Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Galimuyod": ["Galimuyod", "Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Gregorio del Pilar": ["Gregorio del Pilar", "Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Lidlidda": ["Lidlidda", "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Magsingal": ["Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Nagbukel": ["Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Narvacan": ["Narvacan", "Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Quirino": ["Quirino", "Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Salcedo": ["Salcedo", "San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "San Emilio": ["San Emilio", "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "San Esteban": ["San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "San Ildefonso": ["San Ildefonso", "San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "San Juan": ["San Juan", "San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "San Vicente": ["San Vicente", "Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santa": ["Santa", "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santa Catalina": ["Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santa Cruz": ["Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santa Lucia": ["Santa Lucia", "Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santa Maria": ["Santa Maria", "Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santiago": ["Santiago", "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Santo Domingo": ["Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Sigay": ["Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Sinait": ["Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Sugpon": ["Sugpon", "Suyo", "Tagudin", "Vigan City"],
    "Suyo": ["Suyo", "Tagudin", "Vigan City"],
    "Tagudin": ["Tagudin", "Vigan City"],
    "Vigan City": ["Vigan City"]
  },
  "La Union": {
    "Agoo": ["Agoo", "Aringay", "Bacnotan", "Bagulin", "Balaoan", "Bangar", "Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Aringay": ["Aringay", "Bacnotan", "Bagulin", "Balaoan", "Bangar", "Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Bacnotan": ["Bacnotan", "Bagulin", "Balaoan", "Bangar", "Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Bagulin": ["Bagulin", "Balaoan", "Bangar", "Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Balaoan": ["Balaoan", "Bangar", "Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Bangar": ["Bangar", "Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Bauang": ["Bauang", "Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Burgos": ["Burgos", "Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Caba": ["Caba", "Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Luna": ["Luna", "Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Naguilian": ["Naguilian", "Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Pugo": ["Pugo", "Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Rosario": ["Rosario", "San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "San Fernando City": ["San Fernando City", "San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "San Gabriel": ["San Gabriel", "San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "San Juan": ["San Juan", "Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Santo Tomas": ["Santo Tomas", "Santol", "Sudipen", "Tubao"],
    "Santol": ["Santol", "Sudipen", "Tubao"],
    "Sudipen": ["Sudipen", "Tubao"],
    "Tubao": ["Tubao"]
  },
  "Pangasinan": {
    "Agno": ["Agno", "Aguilar", "Alaminos City", "Alcala", "Anda", "Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Aguilar": ["Aguilar", "Alaminos City", "Alcala", "Anda", "Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Alaminos City": ["Alaminos City", "Alcala", "Anda", "Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Alcala": ["Alcala", "Anda", "Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Anda": ["Anda", "Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Asingan": ["Asingan", "Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Balungao": ["Balungao", "Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Bani": ["Bani", "Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Basista": ["Basista", "Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Bautista": ["Bautista", "Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Bayambang": ["Bayambang", "Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Binalonan": ["Binalonan", "Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Binmaley": ["Binmaley", "Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Bolinao": ["Bolinao", "Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Bugallon": ["Bugallon", "Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Burgos": ["Burgos", "Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Calasiao": ["Calasiao", "Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Dagupan City": ["Dagupan City", "Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Dasol": ["Dasol", "Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Infanta": ["Infanta", "Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Labrador": ["Labrador", "Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Laoac": ["Laoac", "Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Lingayen": ["Lingayen", "Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Mabini": ["Mabini", "Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Malasiqui": ["Malasiqui", "Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Manaoag": ["Manaoag", "Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Mangaldan": ["Mangaldan", "Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Mangatarem": ["Mangatarem", "Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Mapandan": ["Mapandan", "Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Natividad": ["Natividad", "Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Pozorrubio": ["Pozorrubio", "Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Rosales": ["Rosales", "San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "San Carlos City": ["San Carlos City", "San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "San Fabian": ["San Fabian", "San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "San Jacinto": ["San Jacinto", "San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "San Manuel": ["San Manuel", "San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "San Nicolas": ["San Nicolas", "San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "San Quintin": ["San Quintin", "Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Santa Barbara": ["Santa Barbara", "Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Santa Maria": ["Santa Maria", "Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Santo Tomas": ["Santo Tomas", "Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Sison": ["Sison", "Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Sual": ["Sual", "Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Tayug": ["Tayug", "Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Umingan": ["Umingan", "Urdaneta City", "Villasis", "Lingayen"],
    "Urdaneta City": ["Urdaneta City", "Villasis", "Lingayen"],
    "Villasis": ["Villasis", "Lingayen"],
    "Lingayen": ["Lingayen"]
  }
};

const AddOwner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [newOwner, setNewOwner] = useState({
  full_legal_name: '',
  contact_number: '',
  age: 0,
  residential_address: '', // We'll keep this for backward compatibility
  house_number: '',
  barangay: '',
  municipality: '',
  province: '',
});

const getCurrentUserMunicipality = () => {
  try {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.municipality || '';
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  return '';
};

// Use useEffect to set the municipality after component mounts
useEffect(() => {
  const getCurrentUserMunicipality = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload); // Debug log
        
        // Try to get municipality from token claims first
        let municipality = payload.municipality || '';
        
        // If no municipality in claims, get it from username and capitalize it
        if (!municipality && payload.username) {
          municipality = payload.username
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        
        console.log('Extracted municipality:', municipality); // Debug log
        
        setCurrentUserMunicipality(municipality);
        setFirearm(prev => ({
          ...prev,
          registration_location: municipality
        }));
        return municipality;
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return '';
  };

  const municipality = getCurrentUserMunicipality();
  console.log('Current user municipality set to:', municipality); // Debug log
}, []);

useEffect(() => {
  const getCurrentUserInfo = () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token found:', !!token); // Debug log
      
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Debug: log everything in the token
        console.log('JWT Token payload:', payload);
        console.log('Available fields in token:', Object.keys(payload));
        
        // Extract user role
        const userRole = payload.role || '';
        setCurrentUserRole(userRole);
        console.log('User role:', userRole);
        
        // Try different possible fields - check what's actually available
        const municipality = payload.municipality || 
                           payload.username || 
                           payload.user_municipality ||
                           payload.municipality_name ||
                           '';
        
        console.log('Raw municipality value:', municipality);
        
        let formattedMunicipality = municipality;
        
        // Format if it's from username (snake_case to Proper Case)
        if (municipality && municipality.includes('_')) {
          formattedMunicipality = municipality
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        } else if (municipality) {
          // Capitalize first letter if it's a single word
          formattedMunicipality = municipality.charAt(0).toUpperCase() + municipality.slice(1).toLowerCase();
        }
        
        console.log('Final formatted municipality:', formattedMunicipality);
        
        if (formattedMunicipality) {
          setCurrentUserMunicipality(formattedMunicipality);
          setFirearm(prev => ({
            ...prev,
            registration_location: formattedMunicipality
          }));
          console.log('Municipality set successfully:', formattedMunicipality);
        } else {
          console.warn('No municipality found in token');
          // Set a default or show error
          setCurrentUserMunicipality('');
        }
        
        return formattedMunicipality;
      } else {
        console.warn('No access token found in localStorage');
        setCurrentUserMunicipality('');
        setCurrentUserRole('');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      setCurrentUserMunicipality('');
      setCurrentUserRole('');
    }
    return '';
  };

  getCurrentUserInfo();
}, []);

useEffect(() => {
  if (user?.municipality) {
    setFirearm(prev => ({
      ...prev,
      registration_location: user.municipality
    }));
  }
}, [user?.municipality]);

  //   const gunSubtypes = {
  //   handgun: [
  //     { value: 'pistol', label: 'Pistol' },
  //     { value: 'revolver', label: 'Revolver' },
  //   ],
  //   long_gun: [
  //     { value: 'rifle', label: 'Rifle' },
  //     { value: 'shotgun', label: 'Shotgun' },
  //   ],
  //   machine_gun: [
  //     { value: 'submachine_gun', label: 'Submachine Gun' },
  //     { value: 'light_machine_gun', label: 'Light Machine Gun' },
  //     { value: 'medium_machine_gun', label: 'Medium Machine Gun' },
  //     { value: 'heavy_machine_gun', label: 'Heavy Machine Gun' },
  //   ],
  // };

    // New state for user management
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    role: 'client',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    houseNumber: '',
    barangay: '',
    municipality: '',
    gender: 'prefer_not_to_say',
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [currentUserMunicipality, setCurrentUserMunicipality] = useState(getCurrentUserMunicipality());
  const [previewMode, setPreviewMode] = useState(false);
  
  // Regional address state - removed as location data comes from selected user
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [networkErrorDetails, setNetworkErrorDetails] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  
  // Existing owners table state
  const [existingOwners, setExistingOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 to show table directly
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [gunTypes, setGunTypes] = useState([]);
  const [gunSubtypes, setGunSubtypes] = useState([]);
  const [gunModels, setGunModels] = useState([]);
  const [filteredSubtypes, setFilteredSubtypes] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [lastRegisteredOwner, setLastRegisteredOwner] = useState(null);
  const [firearm, setFirearm] = useState({
  serial_number: '',
  gun_model: null,
  gun_type: null,
  gun_subtype: null,
  ammunition_type: '',
  firearm_status: 'captured',
  date_of_collection: '',
  registration_location: getCurrentUserMunicipality(), // Set it here
  status_comment: '',
  image: null,
});
  const [imagePreview, setImagePreview] = useState(null);

const token = localStorage.getItem('access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Full token payload:', payload);
  console.log('Available fields:', Object.keys(payload));
}

  useEffect(() => {
  // Fetch current user data to get municipality
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await axios.get(`${API_BASE_URL}users/current/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.municipality) {
          setCurrentUserMunicipality(response.data.municipality);
          // Automatically set registration location to municipality
          setFirearm(prev => ({
            ...prev,
            registration_location: response.data.municipality
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  fetchCurrentUser();
}, []);



  const MUNICIPALITIES = [
    'Agoo',
    'Aringay',
    'Bacnotan',
    'Bagulin',
    'Balaoan',
    'Bangar',
    'Bauang',
    'Burgos',
    'Caba',
    'Luna',
    'Naguilian',
    'Pugo',
    'Rosario',
    'San Gabriel',
    'San Juan',
    'Santo Tomas',
    'Santol',
    'Sudipen',
    'Tubao',
  ];

  const MUNICIPALITIES_WITH_BARANGAYS = {
    Agoo: [
      'Ambitacay',
      'Balawarte',
      'Capas',
      'Consolacion (Poblacion)',
      'Macalva Central',
      'Macalva Norte',
      'Macalva Sur',
      'Nazareno',
      'Purok',
      'San Agustin East',
      'San Agustin Norte',
      'San Agustin Sur',
      'San Antonino',
      'San Antonio',
      'San Francisco',
      'San Isidro',
      'San Joaquin Norte',
      'San Joaquin Sur',
      'San Jose Norte',
      'San Jose Sur',
      'San Juan',
      'San Julian Central',
      'San Julian East',
      'San Julian Norte',
      'San Julian West',
      'San Manuel Norte',
      'San Manuel Sur',
      'San Marcos',
      'San Miguel',
      'San Nicolas Central (Poblacion)',
      'San Nicolas East',
      'San Nicolas Norte (Poblacion)',
      'San Nicolas Sur (Poblacion)',
      'San Nicolas West',
      'San Pedro',
      'San Roque East',
      'San Roque West',
      'San Vicente Norte',
      'San Vicente Sur',
      'Santa Ana',
      'Santa Barbara (Poblacion)',
      'Santa Fe',
      'Santa Maria',
      'Santa Monica',
      'Santa Rita (Nalinac)',
      'Santa Rita East',
      'Santa Rita Norte',
      'Santa Rita Sur',
      'Santa Rita West',
    ],
    Aringay: [
      'Alaska',
      'Basca',
      'Dulao',
      'Gallano',
      'Macabato',
      'Manga',
      'Pangao aoan East',
      'Pangao aoan West',
      'Poblacion',
      'Samara',
      'San Antonio',
      'San Benito Norte',
      'San Benito Sur',
      'San Eugenio',
      'San Juan East',
      'San Juan West',
      'San Simon East',
      'San Simon West',
      'Santa Cecilia',
      'Santa Lucia',
      'Santa Rita East',
      'Santa Rita West',
      'Santo Rosario East',
      'Santo Rosario West',
    ],
    Bacnotan: [
      'Agtipal',
      'Arosip',
      'Bacqui',
      'Bacsil',
      'Bagutot',
      'Ballogo',
      'Baroro',
      'Bitalag',
      'Bulala',
      'Burayoc',
      'Bussaoit',
      'Cabaroan',
      'Cabarsican',
      'Cabugao',
      'Calautit',
      'Carcarmay',
      'Casiaman',
      'Galongen',
      'Guinabang',
      'Legleg',
      'Lisqueb',
      'Mabanengbeng 1st',
      'Mabanengbeng 2nd',
      'Maragayap',
      'Nangalisan',
      'Nagatiran',
      'Nagsaraboan',
      'Nagsimbaanan',
      'Narra',
      'Ortega',
      'Oya oy',
      'Paagan',
      'Pandan',
      'Pang pang',
      'Poblacion',
      'Quirino',
      'Raois',
      'Salincob',
      'San Martin',
      'Santa Cruz',
      'Santa Rita',
      'Sapilang',
      'Sayoan',
      'Sipulo',
      'Tammocalao',
      'Ubbog',
      'Zaragosa',
    ],
    Bagulin: [
      'Alibangsay',
      'Baay',
      'Cambaly',
      'Cardiz',
      'Dagup',
      'Libbo',
      'Suyo (Poblacion)',
      'Tagudtud',
      'Tio angan',
      'Wallayan',
    ],
    Balaoan: [
      'Almeida',
      'Antonino',
      'Apatut',
      'Ar-arampang',
      'Baracbac Este',
      'Baracbac Oeste',
      'Bet-ang',
      'Bulbulala',
      'Bungol',
      'Butubut Este',
      'Butubut Norte',
      'Butubut Oeste',
      'Butubut Sur',
      'Cabuaan Oeste',
      'Calliat',
      'Calungbuyan',
      'Camiling',
      'Dr. Camilo Osias (Poblacion)',
      'Guinaburan',
      'Masupe',
      'Nagsabaran Norte',
      'Nagsabaran Sur',
      'Nalasin',
      'Napaset',
      'Pagbennecan',
      'Pagleddegan',
      'Pantar Norte',
      'Pantar Sur',
      'Pa o',
      'Paraoir',
      'Patpata',
      'Sablut',
      'San Pablo',
      'Sinapangan Norte',
      'Sinapangan Sur',
      'Tallipugo',
    ],
    Bangar: [
      'Agdeppa',
      'Alzate',
      'Bangaoilan East',
      'Bangaoilan West',
      'Barraca',
      'Cadapli',
      'Caggao',
      'Central East No. 1 (Poblacion)',
      'Central East No. 2 (Poblacion)',
      'Central West No. 1 (Poblacion)',
      'Central West No. 2 (Poblacion)',
      'Central West No. 3 (Poblacion)',
      'Consuegra',
      'General Prim East',
      'General Prim West',
      'General Terrero',
      'Luzong Norte',
      'Luzong Sur',
      'Maria Cristina East',
      'Maria Cristina West',
      'Mindoro',
      'Nagsabaran',
      'Paratong Norte',
      'Paratong No. 3',
      'Paratong No. 4',
      'Quintarong',
      'Reyna Regente',
      'Rissing',
      'San Blas',
      'San Cristobal',
      'Sinapangan Norte',
      'Sinapangan Sur',
      'Ubbog',
    ],
    Bauang: [
      'Acao',
      'Baccuit Norte',
      'Baccuit Sur',
      'Bagbag',
      'Ballay',
      'Bawanta',
      'Boy-utan',
      'Bucayab',
      'Cabalayangan',
      'Cabisilan',
      'Calumbaya',
      'Carmay',
      'Casilagan',
      'Central East (Poblacion)',
      'Central West (Poblacion)',
      'Dili',
      'Disso or',
      'Guerrero',
      'Lower San Agustin',
      'Nagrebcan',
      'Pagdalagan Sur',
      'Palintucang',
      'Palugsi Limmansangan',
      'Parian Este',
      'Parian Oeste',
      'Paringao',
      'Payocpoc Norte Este',
      'Payocpoc Norte Oeste',
      'Payocpoc Sur',
      'Pilar',
      'Pottot',
      'Pudoc',
      'Pugo',
      'Quinavite',
      'Santa Monica',
      'Santiago',
      'Taberna',
      'Upper San Agustin',
      'Urayong',
    ],
    Burgos: [
      'Agpay',
      'Bilis',
      'Caoayan',
      'Dalacdac',
      'Delles',
      'Imelda',
      'Libtong',
      'Linuan',
      'New Poblacion',
      'Old Poblacion',
      'Lower Tumapoc',
      'Upper Tumapoc',
    ],
    Caba: [
      'Bautista',
      'Gana',
      'Juan Cartas',
      'Las ud',
      'Liquicia',
      'Poblacion Norte',
      'Poblacion Sur',
      'San Carlos',
      'San Cornelio',
      'San Fermin',
      'San Gregorio',
      'San Jose',
      'Santiago Norte',
      'Santiago Sur',
      'Sobredillo',
      'Urayong',
      'Wenceslao',
    ],
    Luna: [
      'Alcala (Poblacion)',
      'Ayaoan',
      'Barangobong',
      'Barrientos',
      'Bungro',
      'Buselbusel',
      'Cabalitocan',
      'Cantoria No. 1',
      'Cantoria No. 2',
      'Cantoria No. 3',
      'Cantoria No. 4',
      'Carisquis',
      'Darigayos',
      'Magallanes (Poblacion)',
      'Magsiping',
      'Mamay',
      'Nagrebcan',
      'Nalvo Norte',
      'Nalvo Sur',
      'Napaset',
      'Oaqui No. 1',
      'Oaqui No. 2',
      'Oaqui No. 3',
      'Oaqui No. 4',
      'Pila',
      'Pitpitac',
      'Rimos No. 1',
      'Rimos No. 2',
      'Rimos No. 3',
      'Rimos No. 4',
      'Rimos No. 5',
      'Rissing',
      'Salcedo (Poblacion)',
      'Santo Domingo Norte',
      'Santo Domingo Sur',
      'Sucoc Norte',
      'Sucoc Sur',
      'Suyo',
      'Tallaoen',
      'Victoria (Poblacion)',
    ],
    Naguilian: [
      'Aguioas',
      'Al alinao Norte',
      'Al alinao Sur',
      'Ambaracao Norte',
      'Ambaracao Sur',
      'Angin',
      'Balecbec',
      'Bancagan',
      'Baraoas Norte',
      'Baraoas Sur',
      'Bariquir',
      'Bato',
      'Bimmotobot',
      'Cabaritan Norte',
      'Cabaritan Sur',
      'Casilagan',
      'Dal lipaoen',
      'Daramuangan',
      'Guesset',
      'Gusing Norte',
      'Gusing Sur',
      'Imelda',
      'Lioac Norte',
      'Lioac Sur',
      'Magungunay',
      'Mamat ing Norte',
      'Mamat ing Sur',
      'Nagsidorisan',
      'Natividad (Poblacion)',
      'Ortiz (Poblacion)',
      'Ribsuan',
      'San Antonio',
      'San Isidro',
      'Sili',
      'Suguidan Norte',
      'Suguidan Sur',
      'Tuddingan',
    ],
    Pugo: [
      'Ambalite',
      'Ambangonan',
      'Cares',
      'Cuenca',
      'Duplas',
      'Maoasoas Norte',
      'Maoasoas Sur',
      'Palina',
      'Poblacion East',
      'Poblacion West',
      'San Luis',
      'Saytan',
      'Tavora East',
      'Tavora Proper',
    ],
    Rosario: [
      'Alipang',
      'Ambangonan',
      'Amlang',
      'Bacani',
      'Bangar',
      'Bani',
      'Benteng Sapilang',
      'Cadumanian',
      'Camp One',
      'Carunuan East',
      'Carunuan West',
      'Casilagan',
      'Cataguingtingan',
      'Concepcion',
      'Damortis',
      'Gumot Nagcolaran',
      'Inabaan Norte',
      'Inabaan Sur',
      'Marcos',
      'Nagtagaan',
      'Nangcamotian',
      'Parasapas',
      'Poblacion East',
      'Poblacion West',
      'Puzon',
      'Rabon',
      'San Jose',
      'Subusub',
      'Tabtabungao',
      'Tanglag',
      'Tay ac',
      'Udiao',
      'Vil',
    ],
    'San Gabriel': [
      'Amontoc',
      'Apayao',
      'Balbalayang',
      'Bayabas',
      'Bucao',
      'Bumbuneg',
      'Daking',
      'Lacong',
      'Lipay Este',
      'Lipay Norte',
      'Lipay Proper',
      'Lipay Sur',
      'Lon oy',
      'Poblacion',
      'Polipol',
    ],
    'San Juan': [
      'Allangigan',
      'Aludaid',
      'Bacsayan',
      'Balballosa',
      'Bambanay',
      'Bugbugcao',
      'Caarusipan',
      'Cabaroan',
      'Cabugnayan',
      'Cacapian',
      'Caculangan',
      'Calincamasan',
      'Casilagan',
      'Catdongan',
      'Dangdangla',
      'Dasay',
      'Dinanum',
      'Duplas',
      'Guinguinabang',
      'Ili Norte (Poblacion)',
      'Ili Sur (Poblacion)',
      'Legleg',
      'Lubing',
      'Nadsaag',
      'Nagsabaran',
      'Naguirangan',
      'Naguituban',
      'Nagyubuyuban',
      'Oaquing',
      'Pacpacac',
      'Pagdildilan',
      'Panicsican',
      'Quidem',
      'San Felipe',
      'Santa Rosa',
      'Santo Rosario',
      'Saracat',
      'Sinapangan',
      'Taboc',
      'Talogtog',
      'Urbiztondo',
    ],
    'Santo Tomas': [
      'Alitap',
      'Apalit',
      'Apo',
      'Antong',
      'Alzate',
      'Balaingud',
      'Bartolome',
      'Cabaruan',
      'Campias',
      'Dada an',
      'Gangonan',
      'Legleg',
      'Metro',
      'Nagcalagui',
      'Nagsabaran',
      'Nangalisan',
      'Payocpoc Norte',
      'Payocpoc Sur',
      'Pongpong',
      'Pugaro',
      'Santa Catalina (Poblacion)',
      'Santa Maria',
      'Santo Domingo',
      'Tubada',
    ],
    Santol: [
      'Albano',
      'Dionicia',
      'Gabon',
      'Maguing',
      'Namatucan',
      'Poblacion East',
      'Poblacion West',
      'Porras',
      'Sabangan',
      'San Francisco',
      'Ubbog',
    ],
    Sudipen: [
      'Bigbiga',
      'Bulalaan',
      'Castro',
      'Duplas',
      'Ilocano',
      'Ipet',
      'Maliclico',
      'Namaltugan',
      'Old Central (also known as Nagpanaoan)',
      'Poblacion',
      'Porporiket',
      'San Francisco Norte',
      'San Francisco Sur',
      'San Jose',
      'Sengngat',
      'Turod',
      'Up uplas',
    ],
    Tubao: [
      'Amallapay',
      'Anduyan',
      'Caoigue',
      'Francia Sur',
      'Francia West',
      'Garcia',
      'Gonzales',
      'Halog East',
      'Halog West',
      'Leones East',
      'Leones West',
      'Linapew',
      'Lloren',
      'Magsaysay',
      'Pideg',
      'Poblacion',
      'Rizal',
      'Santa Teresa',
    ],
  };

  // Custom Dropdown Component (copied from UserList.jsx)
  const CustomDropdown = ({ options, value, onChange, name, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.custom-dropdown')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className={`custom-dropdown ${className}`}>
        <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
          {value || 'Select Municipality'}
          <ChevronDown size={16} className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
        </div>
        {isOpen && (
          <div className="dropdown-options">
            {options.map((option) => (
              <div
                key={option}
                className="dropdown-option"
                onClick={() => {
                  onChange({ target: { name, value: option } });
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

   // User Management Functions
  const openAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setNewUserForm({
      username: '',
      email: '',
      role: 'client',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone_number: '',
      houseNumber: '',
      barangay: '',
      municipality: '',
      gender: 'prefer_not_to_say',
    });
    setUserFormErrors({});
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;

    if (name === 'municipality' && newUserForm.role === 'administrator') {
      setNewUserForm((prev) => ({
        ...prev,
        [name]: value,
        username: value.toLowerCase().replace(/\s+/g, '_'),
      }));
    } else {
      setNewUserForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (userFormErrors[name]) {
      setUserFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    if (newUserForm.municipality && MUNICIPALITIES_WITH_BARANGAYS[newUserForm.municipality]) {
      setAvailableBarangays(MUNICIPALITIES_WITH_BARANGAYS[newUserForm.municipality]);
      setNewUserForm((prev) => ({ ...prev, barangay: '' }));
    } else {
      setAvailableBarangays([]);
    }
  }, [newUserForm.municipality]);

  const validateUserForm = () => {
    const errors = {};

    if (!newUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)) {
      errors.email = 'Email is invalid';
    }

    if (!newUserForm.role) {
      errors.role = 'Role is required';
    }

    if (newUserForm.role === 'administrator') {
      if (!newUserForm.municipality) {
        errors.municipality = 'Municipality is required for administrators';
      } else if (newUserForm.municipality.length < 3) {
        errors.municipality = 'Municipality name must be at least 3 characters';
      }
    } else {
      if (!newUserForm.username.trim()) {
        errors.username = 'Username is required';
      } else if (newUserForm.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-z0-9_]+$/.test(newUserForm.username)) {
        errors.username = 'Username can only contain lowercase letters, numbers, and underscores';
      }
    }

    if (newUserForm.role === 'client') {
      if (!newUserForm.first_name.trim()) {
        errors.first_name = 'First name is required for clients';
      }
      if (!newUserForm.last_name.trim()) {
        errors.last_name = 'Last name is required for clients';
      }
      if (!newUserForm.date_of_birth) {
        errors.date_of_birth = 'Date of birth is required for clients';
      }
      if (!newUserForm.phone_number.trim()) {
        errors.phone_number = 'Phone number is required for clients';
      }
    }

    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateUserForm()) return;

    const userData = {
      username: newUserForm.role === 'administrator' 
        ? newUserForm.municipality.toLowerCase().replace(/\s+/g, '_')
        : newUserForm.username,
      email: newUserForm.email,
      role: newUserForm.role,
      first_name: newUserForm.first_name,
      last_name: newUserForm.last_name,
      date_of_birth: newUserForm.role === 'client' ? newUserForm.date_of_birth : null,
      phone_number: newUserForm.phone_number,
      house_number: newUserForm.houseNumber,
      barangay: newUserForm.barangay,
      municipality: newUserForm.municipality,
    };

    const confirmation = await Swal.fire({
      title: 'Confirm New User',
      html: `
        <div style="text-align: left;">
          <p>Are you sure you want to add this user?</p>
          <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <p><strong>Username:</strong> ${userData.username}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Role:</strong> ${userData.role === 'administrator' ? 'Municipality Admin' : 'Client'}</p>
            ${userData.role === 'administrator' 
              ? `<p><strong>Municipality:</strong> ${userData.municipality}</p>` 
              : `<p><strong>Name:</strong> ${userData.first_name} ${userData.last_name}</p>`
            }
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, add user',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Creating User Account...',
        html: `
          <div style="text-align: center;">
            <p>Setting up ${userData.role === 'administrator' ? 'municipality administrator' : 'client'} account</p>
            <p style="font-size: 0.9em; color: #666;">Username: ${userData.username}</p>
          </div>
        `,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(`${API_BASE_URL}users/`, userData);

      Swal.fire({
        icon: 'success',
        title: 'User Added Successfully!',
        html: `
          <div style="text-align: left;">
            <p>${userData.role === 'administrator' ? 'Municipality administrator account created:' : 'Client account created:'}</p>
            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <p><strong>Username:</strong> ${userData.username}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              ${userData.role === 'administrator' 
                ? `<p><strong>Municipality:</strong> ${userData.municipality}</p>` 
                : `<p><strong>Name:</strong> ${userData.first_name} ${userData.last_name}</p>`
              }
            </div>
          </div>
        `,
        confirmButtonText: 'OK',
      });

      closeAddUserModal();
    } catch (error) {
      Swal.close();
      
      let errorMessage = 'Failed to create user account';
      let errorDetails = '';

      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorDetails = Object.entries(error.response.data)
            .map(([field, messages]) => {
              if (field === 'username' && messages.includes('already exists')) {
                return `<strong>Municipality already exists:</strong> The selected municipality already has an administrator account.`;
              }
              return `<strong>${field}:</strong> ${Array.isArray(messages) ? messages.join(' ') : messages}`;
            })
            .join('<br>');
        } else {
          errorDetails = error.response.data.toString();
        }
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorDetails = error.message;
      }

      Swal.fire({
        icon: 'error',
        title: errorMessage,
        html: errorDetails ? `<div style="text-align: left;">${errorDetails}</div>` : errorMessage,
        confirmButtonText: 'OK',
      });
    }
  };

  // Helper function to capitalize the first letter of each word
  const capitalizeFirstLetter = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Fetch existing owners from the database
  const fetchExistingOwners = async () => {
    setIsLoadingOwners(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Get municipality and role from token
      let municipalityFromToken = '';
      let roleFromToken = '';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Token payload:', payload);
          
          // Get user role
          roleFromToken = payload.role || '';
          
          // Try to get municipality from different possible fields
          municipalityFromToken = payload.municipality || 
                                 payload.user_municipality ||
                                 '';
          
          // If municipality is in username format (e.g., bagulin), capitalize it
          if (!municipalityFromToken && payload.username) {
            const username = payload.username.toLowerCase();
            // Capitalize first letter of each word (e.g., bagulin -> Bagulin, san_juan -> San Juan)
            municipalityFromToken = username
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
          
          console.log('Municipality from token:', municipalityFromToken);
          console.log('Role from token:', roleFromToken);
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      }
      
      // Use the municipality from token as the filter
      const filterMunicipality = municipalityFromToken || currentUserMunicipality;
      const isPoliceOfficer = roleFromToken === 'police_officer' || currentUserRole === 'police_officer';
      
      const params = new URLSearchParams({
        role: 'client',
        ordering: '-date_joined'
      });
      
      // Police officers can see ALL users, administrators only see their municipality
      if (!isPoliceOfficer && filterMunicipality) {
        params.append('municipality', filterMunicipality);
        console.log('Administrator - Filtering by municipality:', filterMunicipality);
      } else if (isPoliceOfficer) {
        console.log('Police Officer - Showing all municipalities');
      } else {
        console.warn('No municipality found for filtering!');
      }
      
      const apiUrl = `${API_BASE_URL}users/?${params.toString()}`;
      console.log('Fetching owners from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log('API Response:', response.data);
      console.log('Number of owners returned:', response.data?.length || 0);
      
      const owners = response.data || [];
      
      // Additional client-side filtering - only for administrators
      const filteredByMunicipality = !isPoliceOfficer && filterMunicipality 
        ? owners.filter(owner => {
            const ownerMunicipality = owner.municipality?.toLowerCase();
            const targetMunicipality = filterMunicipality.toLowerCase();
            const match = ownerMunicipality === targetMunicipality;
            
            if (!match) {
              console.warn(`Filtering out owner ${owner.first_name} ${owner.last_name} from ${owner.municipality} (expected ${filterMunicipality})`);
            }
            
            return match;
          })
        : owners;
      
      console.log('Owners after client-side filtering:', filteredByMunicipality.length);
      
      setExistingOwners(filteredByMunicipality);
      setFilteredOwners(filteredByMunicipality);
    } catch (error) {
      console.error('Error fetching existing owners:', error);
      setExistingOwners([]);
      setFilteredOwners([]);
    } finally {
      setIsLoadingOwners(false);
    }
  };

  // Filter owners based on table search
  useEffect(() => {
    if (!tableSearchTerm.trim()) {
      setFilteredOwners(existingOwners);
    } else {
      const searchLower = tableSearchTerm.toLowerCase();
      const filtered = existingOwners.filter(owner => {
        const fullName = `${owner.first_name || ''} ${owner.last_name || ''}`.toLowerCase();
        const phone = (owner.phone_number || '').toLowerCase();
        const email = (owner.email || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               phone.includes(searchLower) || 
               email.includes(searchLower);
      });
      setFilteredOwners(filtered);
    }
  }, [tableSearchTerm, existingOwners]);

  // Helper function to get user avatar initials
  const getUserAvatar = (firstName, lastName) => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '?';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '?';
    return `${firstInitial}${lastInitial}`;
  };

  // Format date for display
  const formatDateJoined = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchGunData = async () => {
      try {
        const [typesRes, subtypesRes, modelsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/gun-types/'),
          axios.get('http://localhost:8000/api/gun-subtypes/'),
          axios.get('http://localhost:8000/api/gun-models/'),
        ]);

        // Capitalize the names when setting the state
        const capitalizedTypes = typesRes.data.map(type => ({
          ...type,
          name: capitalizeFirstLetter(type.name)
        }));
        
        const capitalizedSubtypes = subtypesRes.data.map(subtype => ({
          ...subtype,
          name: capitalizeFirstLetter(subtype.name)
        }));
        
        const capitalizedModels = modelsRes.data.map(model => ({
          ...model,
          name: capitalizeFirstLetter(model.name)
        }));

        setGunTypes(capitalizedTypes);
        setGunSubtypes(capitalizedSubtypes);
        setGunModels(capitalizedModels);
      } catch (error) {
        console.error('Error fetching gun data:', error);
      }
    };

    fetchGunData();
    fetchExistingOwners();
  }, [currentUserMunicipality]);

  // Handle clicks outside search container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (firearm.gun_type) {
      const type = gunTypes.find((t) => t.id === firearm.gun_type.id);
      if (type) {
        const subs = gunSubtypes.filter((st) => st.typeId === type.id);
        setFilteredSubtypes(subs);
      } else {
        setFilteredSubtypes([]);
      }
    } else {
      setFilteredSubtypes([]);
    }
    setFirearm((prev) => ({ ...prev, gun_subtype: null, gun_model: null }));
  }, [firearm.gun_type, gunTypes, gunSubtypes]);

  useEffect(() => {
    if (firearm.gun_subtype) {
      const subtype = gunSubtypes.find(
        (st) => st.id === firearm.gun_subtype.id
      );
      if (subtype) {
        const mods = gunModels.filter((m) => m.subtypeId === subtype.id);
        setFilteredModels(mods);
      } else {
        setFilteredModels([]);
      }
    } else {
      setFilteredModels([]);
    }
    setFirearm((prev) => ({ ...prev, gun_model: null }));
  }, [firearm.gun_subtype, gunSubtypes, gunModels]);

  // Fetch users with role "client"
  // const searchUsers = async () => {
  //   if (!searchTerm.trim()) return;

  //   setIsSearching(true);
  //   setSearchError('');

  //   try {
  //     const response = await axios.get(`${API_BASE_URL}users/?search=${searchTerm}&role=client`);
  //     setSearchResults(response.data);
  //     console.log(response.data)
  //     if (response.data.length === 0) {
  //       setSearchError('No clients found with that name');
  //     }
  //   } catch (error) {
  //     console.error('Search error:', error);
  //     setSearchError('Failed to search users. Please try again.');
  //     setSearchResults([]);
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };
  const debouncedSearch = debounce(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      // Enhanced search with multiple parameters for better accuracy
      const searchParams = new URLSearchParams({
        search: searchTerm.trim(),
        role: 'client',
        ordering: 'first_name,last_name', // Sort by name for better results
        limit: 10 // Limit results for better performance
      });
      
      // Police officers can search ALL users, administrators only search their municipality
      const isPoliceOfficer = currentUserRole === 'police_officer';
      
      if (!isPoliceOfficer && currentUserMunicipality) {
        searchParams.append('municipality', currentUserMunicipality);
        console.log('Administrator - Filtering search by municipality:', currentUserMunicipality);
      } else if (isPoliceOfficer) {
        console.log('Police Officer - Searching all municipalities');
      } else {
        console.warn('No municipality set for filtering');
      }
      
      console.log('Search URL:', `${API_BASE_URL}users/?${searchParams.toString()}`);
      
      const response = await axios.get(
        `${API_BASE_URL}users/?${searchParams.toString()}`
      );
      
      console.log('Search results:', response.data);
      
      // Filter and sort results for better accuracy
      const filteredResults = response.data
        .filter(user => {
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          // Check for exact matches first, then partial matches
          return fullName.includes(searchLower) || 
                 user.first_name?.toLowerCase().includes(searchLower) ||
                 user.last_name?.toLowerCase().includes(searchLower) ||
                 user.phone_number?.includes(searchTerm);
        })
        .sort((a, b) => {
          const aName = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          const bName = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          // Prioritize exact matches
          const aExact = aName.startsWith(searchLower);
          const bExact = bName.startsWith(searchLower);
          
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          // Then sort alphabetically
          return aName.localeCompare(bName);
        });
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, 300); // Reduced delay for more responsive search

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      setIsSearching(true);
      setShowSearchDropdown(true);
      debouncedSearch(term);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      setShowSearchDropdown(false);
    }
  };

  // Step Navigation Functions
  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 0) {
      // Table: Check if owner is selected
      if (!selectedOwner) {
        setValidationErrors((prev) => ({
          ...prev,
          search: 'Please select an owner to continue'
        }));
        return;
      }
    } else if (currentStep === 1) {
      // Step 1: Firearm Information - validate firearm fields
      const errors = {};
      let hasErrors = false;

      if (!firearm.serial_number?.trim()) {
        errors.serial_number = 'Serial number is required';
        hasErrors = true;
      } else if (!/^[0-9-]+$/.test(firearm.serial_number.trim())) {
        errors.serial_number = 'Serial number can only contain numbers and dashes';
        hasErrors = true;
      }
      if (!firearm.gun_type) {
        errors.gun_type = 'Please select a gun type';
        hasErrors = true;
      }
      if (!firearm.gun_subtype) {
        errors.gun_subtype = 'Please select a gun subtype';
        hasErrors = true;
      }
      if (!firearm.gun_model) {
        errors.gun_model = 'Please select a gun model';
        hasErrors = true;
      }
      if (!firearm.ammunition_type?.trim()) {
        errors.ammunition_type = 'Ammunition type is required';
        hasErrors = true;
      }
      if (!firearm.firearm_status) {
        errors.firearm_status = 'Firearm status is required';
        hasErrors = true;
      }
      if (!firearm.date_of_collection) {
        errors.date_of_collection = 'Collection date is required';
        hasErrors = true;
      }
      if (firearm.firearm_status !== 'deposited' && !firearm.status_comment?.trim()) {
        errors.status_comment = 'Status comment is required for this status';
        hasErrors = true;
      }
      if (!firearm.image) {
        errors.image = 'Firearm image is required';
        hasErrors = true;
      }

      if (hasErrors) {
        setValidationErrors((prev) => ({ ...prev, ...errors }));
        return;
      }
    }

    // Clear any existing validation errors
    setValidationErrors({});
    
    // Proceed to next step
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = async () => {
    // Show confirmation dialog before going to previous step
    const result = await Swal.fire({
      title: 'Go to Previous Step?',
      text: 'Are you sure you want to go back? Any unsaved changes may be lost.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go back',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const goToStep = async (step) => {
    // Show confirmation dialog before changing steps
    const result = await Swal.fire({
      title: 'Change Step?',
      text: 'Are you sure you want to navigate to a different step? Any unsaved changes may be lost.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, change step',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setCurrentStep(step);
    }
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setSelectedOwner(null);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setNewOwner({
      full_legal_name: '',
      contact_number: '',
      age: 0,
      residential_address: '',
      house_number: '',
      barangay: '',
      municipality: '',
      province: '',
    });
    
    // Location state reset removed - location data comes from selected user
    setFirearm({
      serial_number: '',
      gun_model: null,
      gun_type: null,
      gun_subtype: null,
      ammunition_type: '',
      firearm_status: 'captured',
      date_of_collection: '',
      registration_location: getCurrentUserMunicipality(),
      status_comment: '',
      image: null,
    });
    setImagePreview(null);
    setValidationErrors({});
    setSubmitSuccess(false);
  };

  // Step Validation Functions
  const validateStep0 = () => {
    return selectedOwner !== null;
  };

  const validateStep1 = () => {
    const errors = {};
    let isValid = true;

    if (!firearm.serial_number?.trim()) {
      errors.serial_number = 'Serial number is required';
      isValid = false;
    } else if (!/^[0-9-]+$/.test(firearm.serial_number.trim())) {
      errors.serial_number = 'Serial number can only contain numbers and dashes';
      isValid = false;
    } else if (validationErrors.serial_number) {
      isValid = false;
    }

    if (!firearm.gun_type) {
      errors.gun_type = 'Please select a gun type';
      isValid = false;
    }

    if (!firearm.gun_subtype) {
      errors.gun_subtype = 'Please select a gun subtype';
      isValid = false;
    }

    if (!firearm.gun_model) {
      errors.gun_model = 'Please select a gun model';
      isValid = false;
    }

    if (!firearm.ammunition_type?.trim()) {
      errors.ammunition_type = 'Ammunition type is required';
      isValid = false;
    } else if (firearm.ammunition_type.trim().length < 2) {
      errors.ammunition_type = 'Ammunition type is too short';
      isValid = false;
    }

    if (!firearm.date_of_collection) {
      errors.date_of_collection = 'Collection date is required';
      isValid = false;
    } else if (new Date(firearm.date_of_collection) > new Date()) {
      errors.date_of_collection = 'Date cannot be in the future';
      isValid = false;
    }

    if (!currentUserMunicipality?.trim()) {
      errors.registration_location = 'Municipality not detected. Please ensure you are logged in.';
      isValid = false;
    }

    if (
      firearm.firearm_status !== 'deposited' &&
      !firearm.status_comment?.trim()
    ) {
      errors.status_comment = 'Status comment is required for this status';
      isValid = false;
    }

    if (!firearm.image) {
      errors.image = 'Firearm image is required';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleNextStep = async () => {
    let canProceed = false;

    switch (currentStep) {
      case 0:
        canProceed = validateStep0();
        break;
      case 1:
        canProceed = validateStep1();
        break;
      default:
        canProceed = true;
    }

    if (canProceed) {
      // Show confirmation dialog before proceeding to next step
      const result = await Swal.fire({
        title: 'Proceed to Next Step?',
        text: 'Are you sure you want to continue? Please review your information.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, continue',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        nextStep();
      }
    }
  };
  // Populate form fields when a user is selected (toggle selection)
const selectUser = (user) => {
  console.log('Selected User Data:', user);

  // If the same user is clicked again, deselect them
  if (selectedOwner?.id === user.id) {
    setSelectedOwner(null);
    setSearchResults([]);
    setSearchTerm('');
    setShowSearchDropdown(false);
    // Reset the owner form
    setNewOwner({
      full_legal_name: '',
      contact_number: '',
      license_status: 'active',
      registration_date: '',
      age: 0,
      residential_address: '',
      province: '',
      municipality: '',
      barangay: '',
      house_number: ''
    });
    console.log('User deselected');
    return;
  }

  // Safely calculate age with better error handling
  const getSafeAge = () => {
    try {
      const age = getAge(user.date_of_birth);
      return age && age !== 'N/A' ? age : '';
    } catch (error) {
      console.error('Error calculating age:', error);
      return '';
    }
  };

  // Enhanced address processing with complete location data including province
  const processAddressData = (userData) => {
    // Check for complete structured address first
    if (userData.municipality && (userData.house_number || userData.barangay)) {
      const addressParts = [
        userData.house_number,
        userData.barangay,
        userData.municipality,
        userData.province
      ].filter(Boolean);
      
      return {
        house_number: userData.house_number || '',
        barangay: userData.barangay || '',
        municipality: userData.municipality, // Always capture municipality
        province: userData.province || '',
        residential_address: addressParts.join(', ')
      };
    }
    
    // If municipality is available but other parts are missing
    if (userData.municipality) {
      return {
        house_number: userData.house_number || '',
        barangay: userData.barangay || '',
        municipality: userData.municipality,
        province: userData.province || '',
        residential_address: [
          userData.house_number,
          userData.barangay,
          userData.municipality,
          userData.province
        ].filter(Boolean).join(', ') || userData.municipality
      };
    }
    
    // Extract from legacy address field
    if (userData.address) {
      const extractedMunicipality = extractMunicipalityFromAddress(userData.address);
      const otherParts = userData.address
        .split(',')
        .filter(part => !extractedMunicipality || !part.toLowerCase().includes(extractedMunicipality.toLowerCase()))
        .join(',')
        .trim();
      
      return {
        house_number: '',
        barangay: otherParts || '',
        municipality: extractedMunicipality || '',
        province: userData.province || '',
        residential_address: userData.address
      };
    }
    
    // Final fallback
    return {
      house_number: '',
      barangay: '',
      municipality: '',
      province: '',
      residential_address: ''
    };
  };

  const addressData = processAddressData(user);

  // Update state with the selected user's information
  setNewOwner((prev) => ({
    ...prev,
    full_legal_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    contact_number: user.phone_number || '',
    age: getSafeAge(),
    ...addressData
  }));

  // Set selected owner (but don't auto-advance to next step)
  setSelectedOwner(user);
  setSearchResults([]);
  setSearchTerm(`${user.first_name || ''} ${user.last_name || ''}`.trim());
  setShowSearchDropdown(false);
  
  // Set the firearm registration_location to current admin's municipality
  setFirearm((prev) => ({
    ...prev,
    registration_location: currentUserMunicipality || ''
  }));
  
  // User must click "Next" button to proceed to firearm information
  
  // Optional: Log the captured data for debugging
  console.log('Selected User Data:', user);
  console.log('Processed Address Data:', addressData);
  console.log('Current User Municipality (for registration):', currentUserMunicipality);
};

// More robust municipality extraction
const extractMunicipalityFromAddress = (address) => {
  if (!address || typeof address !== 'string') return null;
  
  const municipalities = Object.keys(MUNICIPALITIES_WITH_BARANGAYS);
  const cleanAddress = address.trim().toLowerCase();
  
  // Sort by length (longer names first) to avoid partial matches
  const sortedMunicipalities = municipalities.sort((a, b) => b.length - a.length);
  
  for (const municipality of sortedMunicipalities) {
    const lowerMunicipality = municipality.toLowerCase();
    
    // More precise matching patterns
    const patterns = [
      `\\b${lowerMunicipality}\\b`, // Word boundary match
      `^${lowerMunicipality},`,     // Start of string
      `, ${lowerMunicipality}$`,    // End of string
      `, ${lowerMunicipality},`     // Middle of string
    ];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern);
      if (regex.test(cleanAddress)) {
        return municipality; // Return the original case
      }
    }
  }
  
  return null;
};

  // Helper functions
  const getLicenseStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <ShieldCheck size={18} className="icon-active" />;
      case 'revoked':
        return <ShieldOff size={18} className="icon-revoked" />;
      case 'suspended':
        return <ShieldAlert size={18} className="icon-suspended" />;
      case 'pending':
        return <ShieldQuestion size={18} className="icon-pending" />;
      default:
        return <Shield size={18} />;
    }
  };

  const getFirearmStatusIcon = (status) => {
    switch (status) {
      case 'confiscated':
        return <ShieldAlert size={18} className="icon-suspended" />;
      case 'surrendered':
        return <ShieldOff size={18} className="icon-revoked" />;
      case 'deposited':
        return <ShieldCheck size={18} className="icon-active" />;
      case 'abandoned':
        return <ShieldQuestion size={18} className="icon-pending" />;
      default:
        return <Shield size={18} />;
    }
  };
  /**
   * @param {string|Date} dateOfBirth - The date of birth (YYYY-MM-DD, MM/DD/YYYY, or Date object)
   * @returns {string} - The age in years or 'N/A' if invalid
   */
  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';

    try {
      // Parse the date (handles both string formats and Date objects)
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) return 'N/A'; // Invalid date check

      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return age >= 0 ? age.toString() : 'N/A';
    } catch (error) {
      console.error('Failed to calculate fucking age:', error);
      return 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Location change handlers removed - location data comes from selected user

  // Function to construct complete address for display from user's location data including province
  const getFullAddress = () => {
    const addressParts = [
      newOwner.house_number,
      newOwner.barangay,
      newOwner.municipality,
      newOwner.province
    ].filter(Boolean);
    
    return addressParts.join(', ');
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setNewOwner((prev) => ({ ...prev, [name]: value }));
    
    // Real-time validation
    let error = '';
    
    switch (name) {
      case 'full_legal_name':
        if (!value.trim()) {
          error = 'Full legal name is required';
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s.,'-]+$/.test(value.trim())) {
          error = 'Name can only contain letters, spaces, and basic punctuation';
        }
        break;
      case 'contact_number':
        if (!value.trim()) {
          error = 'Contact number is required';
        } else if (!/^[0-9]+$/.test(value)) {
          error = 'Contact number can only contain numbers';
        } else if (value.length < 10) {
          error = 'Contact number must be at least 10 digits';
        }
        break;
      case 'age':
        if (!value) {
          error = 'Age is required';
        } else if (isNaN(value) || parseInt(value) < 18) {
          error = 'Age must be at least 18';
        } else if (parseInt(value) > 120) {
          error = 'Age must be 120 or less';
        }
        break;
      case 'residential_address':
        if (!value.trim()) {
          error = 'Residential address is required';
        } else if (value.trim().length < 10) {
          error = 'Address must be at least 10 characters';
        }
        break;
    }
    
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors((prev) => ({
          ...prev,
          image: 'Only JPG, PNG, and WEBP images are allowed'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }

      // Create preview and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        // Store as base64 string for easy JSON transmission
        setFirearm((prev) => ({ 
          ...prev, 
          image: base64String
        }));
        // Clear any validation errors after successful upload
        setValidationErrors((prev) => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFirearm((prev) => ({ 
      ...prev, 
      image: null
    }));
    setImagePreview(null);
    setValidationErrors((prev) => ({ ...prev, image: 'Firearm image is required' }));
    
    // Reset file input
    const fileInput = document.getElementById('firearm_image');
    if (fileInput) fileInput.value = '';
  };

  const handleFirearmChange = async (e) => {
    const { name, value } = e.target;

    // Real-time validation for basic fields
    let error = '';
    
    switch (name) {
      case 'serial_number':
        if (!value.trim()) {
          error = 'Serial number is required';
        } else if (!/^[0-9-]+$/.test(value.trim())) {
          error = 'Serial number can only contain numbers and dashes';
        }
        break;
      case 'ammunition_type':
        if (!value.trim()) {
          error = 'Ammunition type is required';
        } else if (value.trim().length < 2) {
          error = 'Ammunition type must be at least 2 characters';
        }
        break;
      case 'firearm_status':
        if (!value) {
          error = 'Firearm status is required';
        }
        break;
      case 'date_of_collection':
        if (!value) {
          error = 'Collection date is required';
        } else if (new Date(value) > new Date()) {
          error = 'Collection date cannot be in the future';
        }
        break;
      case 'registration_location':
        if (!value.trim()) {
          error = 'Registration location is required';
        }
        break;
      case 'status_comment':
        if (firearm.firearm_status !== 'deposited' && !value.trim()) {
          error = 'Status comment is required for this status';
        } else if (value.trim() && value.trim().length < 5) {
          error = 'Status comment must be at least 5 characters';
        }
        break;
    }

    // Update validation errors
    setValidationErrors((prev) => ({ ...prev, [name]: error }));

    // Special handling for registration_location (admin users can't change it)
    if (name === 'registration_location' && user?.role === 'administrator') {
      return;
    }

    // Handle gun type selection
    if (name === 'gun_type') {
      const selectedType = gunTypes.find((type) => type.id === parseInt(value));
      setFirearm((prev) => ({
        ...prev,
        gun_type: selectedType,
        gun_subtype: null,
        gun_model: null,
      }));
      
      // Clear related validation errors
      setValidationErrors((prev) => ({
        ...prev,
        gun_type: '',
        gun_subtype: '',
        gun_model: '',
      }));
      return;
    }

    // Handle gun subtype selection
    if (name === 'gun_subtype') {
      const selectedSubtype = gunSubtypes.find(
        (subtype) => subtype.id === parseInt(value)
      );
      setFirearm((prev) => ({
        ...prev,
        gun_subtype: selectedSubtype,
        gun_model: null,
      }));
      
      // Clear related validation errors
      setValidationErrors((prev) => ({
        ...prev,
        gun_subtype: '',
        gun_model: '',
      }));
      return;
    }

    // Handle gun model selection
    if (name === 'gun_model') {
      const selectedModel = gunModels.find(
        (model) => model.id === parseInt(value)
      );
      setFirearm((prev) => ({ ...prev, gun_model: selectedModel }));
      
      // Clear validation error
      setValidationErrors((prev) => ({ ...prev, gun_model: '' }));
      return;
    }

    // Handle serial number changes with API validation
    if (name === 'serial_number') {
      setFirearm((prev) => ({ ...prev, [name]: value }));

      // Only validate with API if the value contains only numbers and dashes
      if (value.trim() && /^[0-9-]+$/.test(value.trim())) {
        console.log('Checking serial number:', value.trim());
        try {
          const token = localStorage.getItem('access_token');
          const response = await axios.get(
            `${API_BASE_URL}firearms/${value.trim()}/`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          );
          console.log('Serial number exists:', response.data);
          // If we get here, the firearm exists (serial number is duplicate)
          setValidationErrors((prev) => ({
            ...prev,
            serial_number: 'This serial number is already registered',
          }));
        } catch (error) {
          console.log('Serial number check error:', error.response?.status, error.response?.data);
          if (error.response?.status === 404) {
            console.log('Serial number is available');
            // 404 means serial number is available - clear any existing error
            setValidationErrors((prev) => ({
              ...prev,
              serial_number: '',
            }));
          } else {
            // Other error occurred
            console.error('Error checking serial number:', error);
            setValidationErrors((prev) => ({
              ...prev,
              serial_number: 'Error checking serial number availability',
            }));
          }
        }
      }
      return;
    }

    // Default case for all other fields
    setFirearm((prev) => ({ ...prev, [name]: value }));
  };

const validateForm = () => {
  const errors = {};
  let isValid = true;

  // Owner validation with enhanced checks
  if (!newOwner.full_legal_name?.trim()) {
    errors.full_legal_name = 'Full legal name is required';
    isValid = false;
  } else if (newOwner.full_legal_name.trim().length < 3) {
    errors.full_legal_name = 'Name must be at least 3 characters';
    isValid = false;
  }

  if (!newOwner.contact_number?.trim()) {
    errors.contact_number = 'Contact number is required';
    isValid = false;
  } else if (!/^\d+$/.test(newOwner.contact_number)) {
    errors.contact_number = 'Only digits are allowed';
    isValid = false;
  } else if (newOwner.contact_number.length < 10) {
    errors.contact_number = 'Must be at least 10 digits';
    isValid = false;
  }

  if (!newOwner.age) {
    errors.age = 'Age is required';
    isValid = false;
  } else if (isNaN(newOwner.age) || parseInt(newOwner.age) < 18) {
    errors.age = 'Must be at least 18 years old';
    isValid = false;
  } else if (parseInt(newOwner.age) > 120) {
    errors.age = 'Please enter a valid age';
    isValid = false;
  }

  // Location validation removed - location data comes from selected user

  // Firearm validation with enhanced checks
  if (!firearm.serial_number?.trim()) {
    errors.serial_number = 'Serial number is required';
    isValid = false;
  } else if (!/^[0-9-]+$/.test(firearm.serial_number.trim())) {
    errors.serial_number = 'Serial number can only contain numbers and dashes';
    isValid = false;
  } else if (validationErrors.serial_number) {
    // This will be set if the API check found a duplicate
    isValid = false;
  }

  if (!firearm.gun_type) {
    errors.gun_type = 'Please select a gun type';
    isValid = false;
  }

  if (!firearm.gun_subtype) {
    errors.gun_subtype = 'Please select a gun subtype';
    isValid = false;
  }

  if (!firearm.gun_model) {
    errors.gun_model = 'Please select a gun model';
    isValid = false;
  }

  if (!firearm.ammunition_type?.trim()) {
    errors.ammunition_type = 'Ammunition type is required';
    isValid = false;
  } else if (firearm.ammunition_type.trim().length < 2) {
    errors.ammunition_type = 'Ammunition type is too short';
    isValid = false;
  }

  if (!firearm.date_of_collection) {
    errors.date_of_collection = 'Collection date is required';
    isValid = false;
  } else if (new Date(firearm.date_of_collection) > new Date()) {
    errors.date_of_collection = 'Date cannot be in the future';
    isValid = false;
  }

  // UPDATED: Check currentUserMunicipality instead of firearm.registration_location
  if (!currentUserMunicipality?.trim()) {
    errors.registration_location = 'Municipality not detected. Please ensure you are logged in.';
    isValid = false;
  }

  if (
    firearm.firearm_status !== 'deposited' &&
    !firearm.status_comment?.trim()
  ) {
    errors.status_comment = 'Status comment is required for this status';
    isValid = false;
  }

  if (!firearm.image) {
    errors.image = 'Firearm image is required';
    isValid = false;
  }

  setValidationErrors(errors);
  return isValid;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Submit button clicked'); // Debug log
  
  // Validate the form first
  if (!validateForm()) {
    console.log('Form validation failed'); // Debug log
    return;
  }
  
  // Show confirmation dialog
  const confirmed = await Swal.fire({
    title: 'Confirm Registration',
    html: `
      <div style="text-align: left;">
        <h4>Owner Information:</h4>
        <p><strong>Name:</strong> ${newOwner.full_legal_name}</p>
        <p><strong>Contact:</strong> ${newOwner.contact_number}</p>
        <p><strong>Age:</strong> ${newOwner.age}</p>
        <p><strong>Address:</strong> ${getFullAddress()}</p>
        
        <h4 style="margin-top: 20px;">Firearm Information:</h4>
        <p><strong>Serial Number:</strong> ${firearm.serial_number}</p>
        <p><strong>Type:</strong> ${firearm.gun_type?.name || 'N/A'}</p>
        <p><strong>Subtype:</strong> ${firearm.gun_subtype?.name || 'N/A'}</p>
        <p><strong>Model:</strong> ${firearm.gun_model?.name || 'N/A'}</p>
        <p><strong>Status:</strong> ${firearm.firearm_status}</p>
        <p><strong>Collection Date:</strong> ${firearm.date_of_collection}</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4285f4',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, Register Firearm',
    cancelButtonText: 'Cancel',
    width: '600px'
  });
  
  if (!confirmed.isConfirmed) {
    return;
  }
  
  setIsSubmitting(true);
  setSubmitError('');
  
  try {
    console.log('Form is valid, submitting data...'); // Debug log
    
    // Prepare the data for submission
    const ownerData = {
      full_legal_name: newOwner.full_legal_name,
      contact_number: newOwner.contact_number,
      gender: 'prefer_not_to_say', // Add required gender field with default value
      age: parseInt(newOwner.age), // Ensure age is an integer
      residential_address: getFullAddress(),
      firearms: [{
        serial_number: firearm.serial_number,
        gun_type: firearm.gun_type?.id || null,
        gun_subtype: firearm.gun_subtype?.id || null,
        gun_model: firearm.gun_model?.id || null,
        ammunition_type: firearm.ammunition_type,
        firearm_status: firearm.firearm_status,
        date_of_collection: firearm.date_of_collection,
        registration_location: firearm.registration_location,
        status_comment: firearm.status_comment || null,
        image: firearm.image || null, // Include image if uploaded
      }]
    };
    
    console.log('Submitting owner data:', ownerData); // Debug log
    
    // Submit the data
    const result = await createOwnerWithFirearms(ownerData);
    console.log('Owner created successfully:', result); // Debug log
    
    // Show success dialog with options
    const successResult = await Swal.fire({
      title: 'Registration Successful!',
      html: `
        <div style="text-align: center;">
          <p><strong>${newOwner.full_legal_name}</strong> has been registered with firearm serial number <strong>${firearm.serial_number}</strong></p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#4285f4',
      cancelButtonColor: '#5f6368',
      confirmButtonText: 'Add Another Firearm',
      cancelButtonText: 'Add Another Owner',
      showDenyButton: true,
      denyButtonText: 'Close',
      denyButtonColor: '#d33',
      width: '500px'
    });
    
    if (successResult.isConfirmed) {
      // Add another firearm to the same owner
      setSubmitSuccess(false);
      setCurrentStep(1); // Go to firearm information step (Step 1)
      // Keep the owner data but reset firearm data
      setFirearm({
        serial_number: '',
        gun_model: null,
        gun_type: null,
        gun_subtype: null,
        ammunition_type: '',
        firearm_status: 'captured',
        date_of_collection: '',
        registration_location: firearm.registration_location,
        status_comment: '',
        image: null,
      });
      setImagePreview(null);
    } else if (successResult.isDenied) {
      // Close the form
      onClose();
    } else {
      // Add another owner (default action)
      setSubmitSuccess(false);
      resetWizard();
    }
    
  } catch (error) {
    console.error('Submission failed:', error);
    
    // Handle specific error types
    if (error.message.startsWith('SERIAL_DUPLICATE:')) {
      const errorMessage = error.message.split(':')[1];
      setValidationErrors((prev) => ({
        ...prev,
        serial_number: errorMessage || 'This serial number is already registered'
      }));
      
      // Go back to step 1 (Firearm Info) to show the error
      setCurrentStep(1);
      
      await Swal.fire({
        title: 'Serial Number Already Exists',
        text: 'Please use a different serial number.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (error.message.startsWith('VALIDATION_ERROR:')) {
      const errorJson = error.message.substring('VALIDATION_ERROR:'.length);
      const fieldErrors = JSON.parse(errorJson);
      setValidationErrors(fieldErrors);
      
      // Go back to step 1 (Firearm Info) if there are firearm-related errors
      if (fieldErrors.serial_number || fieldErrors.gun_type || fieldErrors.gun_subtype || fieldErrors.gun_model) {
        setCurrentStep(1);
      }
      
      await Swal.fire({
        title: 'Validation Error',
        text: 'Please correct the highlighted fields.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Handle other errors
    await Swal.fire({
      title: 'Registration Failed',
      text: error.response?.data?.detail || 'Failed to create owner. Please try again.',
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Combined owner and firearm creation
  const createOwnerWithFirearms = async (ownerData) => {
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('Sending data to API:', {
        full_legal_name: ownerData.full_legal_name,
        contact_number: ownerData.contact_number,
        gender: ownerData.gender,
        age: ownerData.age,
        residential_address: ownerData.residential_address,
        firearms: ownerData.firearms || [],
      });
      
      // Send as JSON (image is already base64 encoded)
      const response = await axios.post(`${API_BASE_URL}owners/`, {
        full_legal_name: ownerData.full_legal_name,
        contact_number: ownerData.contact_number,
        gender: ownerData.gender,
        age: ownerData.age,
        residential_address: ownerData.residential_address,
        firearms: ownerData.firearms || [], // Image is included as base64 in firearms array
      }, {
        headers: token ? { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Creation failed:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      // Handle specific validation errors
      if (error.response?.status === 400 && error.response?.data) {
        const errorData = error.response.data;
        
        // Check for serial number duplicate error
        if (errorData.serial_number) {
          throw new Error(`SERIAL_DUPLICATE:${errorData.serial_number}`);
        }
        
        // Check for other field errors
        const fieldErrors = {};
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            fieldErrors[field] = messages[0]; // Take first error message
          } else if (typeof messages === 'string') {
            fieldErrors[field] = messages;
          }
        }
        
        if (Object.keys(fieldErrors).length > 0) {
          throw new Error(`VALIDATION_ERROR:${JSON.stringify(fieldErrors)}`);
        }
      }
      
      throw error;
    }
  };

  // Updated handleConfirm function
const handleConfirm = async () => {
  // Show confirmation dialog before final submission
  const result = await Swal.fire({
    title: 'Confirm Registration?',
    text: 'Are you sure you want to submit this firearm registration? This action cannot be undone.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, submit registration',
    cancelButtonText: 'Cancel'
  });

  if (!result.isConfirmed) {
    return;
  }

  setIsSubmitting(true);
  setSubmitError('');
  setNetworkErrorDetails('');

  try {
    // Validate form again before submission (defensive programming)
    if (!validateForm()) {
      throw new Error('Form validation failed. Please check all required fields.');
    }

    // Use the current user's municipality as registration location
    const finalRegistrationLocation = currentUserMunicipality || firearm.registration_location;
    
    console.log('=== Registration Location Debug ===');
    console.log('currentUserMunicipality:', currentUserMunicipality);
    console.log('firearm.registration_location:', firearm.registration_location);
    console.log('finalRegistrationLocation:', finalRegistrationLocation);
    
    if (!finalRegistrationLocation) {
      throw new Error('Municipality information not found. Please log in again.');
    }

    // Prepare firearm data
    const firearmData = {
      serial_number: firearm.serial_number.trim(),
      gun_type: firearm.gun_type?.id || null,
      gun_subtype: firearm.gun_subtype?.id || null,
      gun_model: firearm.gun_model?.id || null,
      ammunition_type: firearm.ammunition_type.trim(),
      firearm_status: firearm.firearm_status,
      date_of_collection: firearm.date_of_collection,
      registration_location: finalRegistrationLocation, // This will be "Agoo" etc.
      status_comment: firearm.status_comment?.trim() || '',
      image: firearm.image || null, // Include image if uploaded
    };
    
    console.log('Prepared firearmData:', firearmData);

    // Prepare owner data with trimming and validation
    const ownerData = {
      full_legal_name: newOwner.full_legal_name.trim(),
      contact_number: newOwner.contact_number.trim(),
      age: parseInt(newOwner.age),
      residential_address: getFullAddress(),
      province: newOwner.province || 'La Union',
      municipality: newOwner.municipality || '',
      barangay: newOwner.barangay || '',
      house_number: newOwner.house_number || '',
    };

    console.log('Submitting data:', { ownerData, firearmData }); // Debug log

    // Make API call
    const response = await createOwnerWithFirearms({
      ...ownerData,
      firearms: [firearmData],
    });

    // Navigate to Owner Profile after success
    try {
      localStorage.setItem('admin_active_menu', 'Profile');
    } catch (_) {}
    navigate('/admin');

    // Check if firearm is surrendered and add to blotter
    if (firearmData.firearm_status === 'surrendered') {
      // Check if the blotter function is available (from BlotterList component)
      if (window.addBlotterEntry) {
        // Create a complete firearm object for the blotter
        const blotterFirearmData = {
          ...firearmData,
          gun_type: firearm.gun_type, // Include the full object, not just ID
          gun_subtype: firearm.gun_subtype,
          gun_model: firearm.gun_model,
          owner: response.id || response.owner?.id, // Use the created owner ID from response
          created_at: new Date().toISOString()
        };
        
        window.addBlotterEntry(blotterFirearmData, ownerData);
        
        // Show special success message for surrendered firearms
        showSuccessToast('Owner and surrendered firearm registered successfully! Added to surrender blotter.');
      } else {
        // Fallback: just show regular success message
        showSuccessToast('Owner and firearm registered successfully!');
      }
    } else {
      // Regular success message for non-surrendered firearms
      showSuccessToast('Owner and firearm registered successfully!');
    }

    // Reset form state
    resetForm();

    // Store last registered owner for reference
    setLastRegisteredOwner(ownerData);
    setSubmitSuccess(true);

  } catch (error) {
    console.error('Submission error:', error);
    handleSubmissionError(error);
  } finally {
    setIsSubmitting(false);
  }
};

useEffect(() => {
  const municipality = getCurrentUserMunicipality();
  if (municipality) {
    setCurrentUserMunicipality(municipality);
    setFirearm(prev => ({
      ...prev,
      registration_location: municipality
    }));
  }
}, []);

useEffect(() => {
  const municipality = getCurrentUserMunicipality();
  if (!municipality) {
    console.warn('No municipality found in user token');
    // You could show a warning or redirect to login
  } else {
    setCurrentUserMunicipality(municipality);
  }
}, []);

  // Helper functions extracted for better readability
  const showSuccessToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    toast.innerHTML = `
    <span class="toast-icon">✓</span>
    <span class="toast-message">${message}</span>
  `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const resetForm = () => {
    setFirearm({
      serial_number: '',
      gun_model: null,
      gun_type: null,
      gun_subtype: null,
      ammunition_type: '',
      firearm_status: 'deposited',
      date_of_collection: '',
      registration_location: '',
      status_comment: '',
      image: null,
    });
    setImagePreview(null);
    setPreviewMode(false);
    setSearchTerm('');
  };

  const handleSubmissionError = (error) => {
    console.error('Registration error:', error);

    let errorMessage = 'Registration failed';
    let errorDetails = '';
    let fieldErrors = {};

    // Handle different error types
    if (error.response) {
      // Backend validation errors
      if (error.response.data && typeof error.response.data === 'object') {
        // Process field-level errors
        for (const [field, errors] of Object.entries(error.response.data)) {
          if (Array.isArray(errors)) {
            fieldErrors[field] = errors.join(', ');
          } else if (typeof errors === 'object') {
            // Handle nested firearm errors
            if (field === 'firearms') {
              errors.forEach((firearmError, index) => {
                if (typeof firearmError === 'object') {
                  for (const [fField, fErrors] of Object.entries(
                    firearmError
                  )) {
                    fieldErrors[`firearm_${index}_${fField}`] = Array.isArray(
                      fErrors
                    )
                      ? fErrors.join(', ')
                      : fErrors;
                  }
                } else {
                  fieldErrors[`firearm_${index}`] = firearmError;
                }
              });
            } else {
              fieldErrors[field] = Object.values(errors).join(', ');
            }
          } else {
            fieldErrors[field] = errors;
          }
        }
        errorMessage = 'Please correct the highlighted fields';
        errorDetails = 'The server rejected some of the provided information.';
      } else {
        errorMessage = error.response.data?.message || 'Server error occurred';
      }
    } else if (error.request) {
      // Network errors
      errorMessage = 'Network error';
      errorDetails =
        'Could not connect to the server. Please check your internet connection.';
    } else {
      // Frontend errors
      errorMessage = error.message || 'An unexpected error occurred';
    }

    // Update state with errors
    setSubmitError(errorMessage);
    setNetworkErrorDetails(errorDetails);
    setValidationErrors(fieldErrors);

    // Scroll to first error if there are field errors
    if (Object.keys(fieldErrors).length > 0) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleEdit = () => {
    setPreviewMode(false);
  };

  const onClose = () => {
    // Reset wizard to step 0 (owner table) instead of navigating away
    setCurrentStep(0);
    setSelectedOwner(null);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    
    // Clear all error states
    setValidationErrors({});
    setSubmitError('');
    setNetworkErrorDetails('');
    setSearchError('');
    setIsSubmitting(false);
    setSubmitSuccess(false);
  };

  const handleGunTypeChange = (e) => {
    const value = e.target.value;
    const selectedType = gunTypes.find((type) => type.id === parseInt(value));
    
    setFirearm((prev) => ({
      ...prev,
      gun_type: selectedType,
      gun_subtype: null,
      gun_model: null,
    }));
    
    // Clear validation errors for gun type and related fields
    setValidationErrors((prev) => ({
      ...prev,
      gun_type: '',
      gun_subtype: '',
      gun_model: '',
    }));
  };

  const handleGunSubtypeChange = (e) => {
    const value = e.target.value;
    const selectedSubtype = gunSubtypes.find(
      (subtype) => subtype.id === parseInt(value)
    );
    
    setFirearm((prev) => ({
      ...prev,
      gun_subtype: selectedSubtype,
      gun_model: null,
    }));
    
    // Clear validation errors for gun subtype and model
    setValidationErrors((prev) => ({
      ...prev,
      gun_subtype: '',
      gun_model: '',
    }));
  };

  const handleGunModelChange = (e) => {
    const value = e.target.value;
    const selectedModel = gunModels.find(
      (model) => model.id === parseInt(value)
    );
    
    setFirearm((prev) => ({ ...prev, gun_model: selectedModel }));
    
    // Clear validation error for gun model
    setValidationErrors((prev) => ({
      ...prev,
      gun_model: '',
    }));
  };

  return (
    <div className="google-forms-container">
      {/* Header */}
      <div className="forms-header">
        <div className="forms-title">
          <h1>Firearm Owner Registration</h1>
          {currentStep > 0 && <p>Step {currentStep} of 2</p>}
        </div>
      </div>

      {submitSuccess ? (
        <div className="success-screen">
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>Registration Complete!</h2>
            <p>The owner and firearm have been successfully registered.</p>
            <div className="success-actions">
              <button className="btn-primary" onClick={resetWizard}>
          <UserPlus size={16} />
                Add Another Owner
              </button>
              <button className="btn-secondary" onClick={onClose}>
                <X size={16} />
                Close
        </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="forms-content">
          {/* Select Existing Owner Table (No Step Number) */}
          {currentStep === 0 && (
            <div className="step-screen">
              <div className="step-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                <div className="step-info" style={{ width: '100%' }}>
                  <h2><User size={24} className="step-icon" /> Select Existing Owner</h2>
                  <p>
                    {currentUserRole === 'police_officer' 
                      ? 'Choose a registered client from any municipality to register a firearm'
                      : `Choose a registered client from ${currentUserMunicipality || 'your municipality'} to register a firearm`
                    }
                  </p>
                </div>
              </div>

              {/* Existing Owners Table */}
              <div className="role-table-container admin">
                <div className="role-table-header">
                  <div className="role-info">
                    <div className="role-icon-container">
                      <User size={20} />
                    </div>
                    <div className="role-details">
                      <div className="title-with-count">
                        <h3 className="role-title">Registered Owners</h3>
                        <span className="inline-count">({existingOwners.length} {existingOwners.length === 1 ? 'owner' : 'owners'})</span>
                      </div>
                      <p className="role-description">
                        {currentUserRole === 'police_officer'
                          ? 'Showing owners from all municipalities'
                          : currentUserMunicipality && `Showing owners from ${currentUserMunicipality}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Search Bar - Moved to right side */}
                  <div className="header-search-container">
                    <div className="search-input-wrapper">
                      <Search size={18} className="search-icon" />
                      <input
                        type="text"
                        value={tableSearchTerm}
                        onChange={(e) => setTableSearchTerm(e.target.value)}
                        placeholder={
                          currentUserRole === 'police_officer'
                            ? 'Search owners from all municipalities...'
                            : `Search owners from ${currentUserMunicipality || 'your municipality'}...`
                        }
                        className="header-search-input"
                      />
                      {tableSearchTerm && (
                        <button
                          type="button"
                          className="clear-search-btn"
                          onClick={() => setTableSearchTerm('')}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {tableSearchTerm && (
                      <div className="search-results-count">
                        {filteredOwners.length} {filteredOwners.length === 1 ? 'result' : 'results'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Table Content */}
                {isLoadingOwners ? (
                  <div className="table-loading-state">
                    <Loader2 size={40} className="animate-spin" />
                    <p>Loading owners...</p>
                  </div>
                ) : filteredOwners.length === 0 ? (
                  <div className="table-empty-state">
                    <UserX size={48} />
                    <h3>{tableSearchTerm ? 'No matching owners found' : 'No Owners Registered'}</h3>
                    <p>
                      {tableSearchTerm 
                        ? `No owners found matching "${tableSearchTerm}"`
                        : currentUserRole === 'police_officer'
                          ? 'No registered owners in any municipality yet'
                          : `No registered owners in ${currentUserMunicipality || 'your municipality'} yet`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="role-table-wrapper">
                    <table className="role-table">
                      <thead>
                        <tr>
                          <th>Owner</th>
                          <th>Contact</th>
                          <th>Age</th>
                          {currentUserRole === 'police_officer' && <th>Municipality</th>}
                          <th>Location</th>
                          <th>Registered</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOwners.map((owner) => (
                          <tr 
                            key={owner.id} 
                            className={`table-row ${selectedOwner?.id === owner.id ? 'selected-row' : ''}`}
                          >
                            <td>
                              <div className="user-cell">
                                <div className="user-avatar-container">
                                  <div className="avatar-circle">
                                    {getUserAvatar(owner.first_name, owner.last_name)}
                                  </div>
                                </div>
                                <div className="user-info-cell">
                                  <span className="user-name">
                                    {owner.first_name} {owner.last_name}
                                  </span>
                                  <span className="user-email">{owner.email || 'No email'}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="contact-cell">
                                <Phone size={14} />
                                <span>{owner.phone_number || 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              <span className="age-badge">
                                {getAge(owner.date_of_birth) || 'N/A'}
                              </span>
                            </td>
                            {currentUserRole === 'police_officer' && (
                              <td>
                                <div className="municipality-cell">
                                  <MapPin size={14} />
                                  <span>{owner.municipality || 'N/A'}</span>
                                </div>
                              </td>
                            )}
                            <td>
                              <div className="location-cell">
                                <MapPin size={14} />
                                <span>
                                  {(() => {
                                    const parts = [];
                                    if (owner.house_number) parts.push(owner.house_number);
                                    if (owner.barangay) parts.push(owner.barangay);
                                    return parts.length > 0 ? parts.join(', ') : 'N/A';
                                  })()}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="date-cell">
                                <Calendar size={14} />
                                <span>{formatDateJoined(owner.date_joined)}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                type="button"
                                className={`action-button ${selectedOwner?.id === owner.id ? 'selected-button' : 'select-button'}`}
                                onClick={() => selectUser(owner)}
                              >
                                {selectedOwner?.id === owner.id ? (
                                  <>
                                    <Check size={14} />
                                    Selected
                                  </>
                                ) : (
                                  <>
                                    <UserPlus size={14} />
                                    Select
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Validation error */}
              {validationErrors.search && (
                <div className="error-message" style={{ marginTop: '16px', textAlign: 'center' }}>
                  <AlertCircle size={16} />
                  <span>{validationErrors.search}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Firearm Information */}
          {currentStep === 1 && (
            <div className="step-screen">
              <div className="step-header">
                <div className="step-number">1</div>
                <div className="step-info">
                  <h2><Shield size={24} className="step-icon" /> Firearm Information</h2>
                  <p>Enter details about the firearm to be registered</p>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">
                    Serial Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={firearm.serial_number}
                    onChange={handleFirearmChange}
                    name="serial_number"
                    placeholder="Enter serial number"
                    className={`form-input ${validationErrors.serial_number ? 'error' : ''}`}
                  />
                  {validationErrors.serial_number && (
                    <div className="error-message">{validationErrors.serial_number}</div>
                  )}
                  {firearm.serial_number && /^[0-9-]+$/.test(firearm.serial_number.trim()) && !validationErrors.serial_number && (
                    <div className="success-message">Serial number is available</div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Gun Type <span className="required">*</span>
                    </label>
                    <select
                      value={firearm.gun_type?.id || ''}
                      onChange={handleGunTypeChange}
                      className={`form-select ${validationErrors.gun_type ? 'error' : ''}`}
                    >
                      <option value="">Select gun type</option>
                      {gunTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.gun_type && (
                      <div className="error-message">{validationErrors.gun_type}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Gun Subtype <span className="required">*</span>
                    </label>
                    <select
                      value={firearm.gun_subtype?.id || ''}
                      onChange={handleGunSubtypeChange}
                      disabled={!firearm.gun_type}
                      className={`form-select ${validationErrors.gun_subtype ? 'error' : ''}`}
                    >
                      <option value="">Select gun subtype</option>
                      {filteredSubtypes.map((subtype) => (
                        <option key={subtype.id} value={subtype.id}>
                          {subtype.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.gun_subtype && (
                      <div className="error-message">{validationErrors.gun_subtype}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Gun Model <span className="required">*</span>
                  </label>
                  <select
                    value={firearm.gun_model?.id || ''}
                    onChange={handleGunModelChange}
                    disabled={!firearm.gun_subtype}
                    className={`form-select ${validationErrors.gun_model ? 'error' : ''}`}
                  >
                    <option value="">Select gun model</option>
                    {filteredModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.gun_model && (
                    <div className="error-message">{validationErrors.gun_model}</div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Ammunition Type <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={firearm.ammunition_type}
                      onChange={handleFirearmChange}
                      name="ammunition_type"
                      placeholder="Enter ammunition type"
                      className={`form-input ${validationErrors.ammunition_type ? 'error' : ''}`}
                    />
                    {validationErrors.ammunition_type && (
                      <div className="error-message">{validationErrors.ammunition_type}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Firearm Status <span className="required">*</span>
                    </label>
                    <select
                      value={firearm.firearm_status}
                      onChange={handleFirearmChange}
                      name="firearm_status"
                      className={`form-select ${validationErrors.firearm_status ? 'error' : ''}`}
                    >
                      <option value="captured">Captured</option>
                      <option value="confiscated">Confiscated</option>
                      <option value="surrendered">Surrendered</option>
                      <option value="deposited">Deposited</option>
                      <option value="abandoned">Abandoned</option>
                      <option value="forfeited">Forfeited</option>
                    </select>
                    {validationErrors.firearm_status && (
                      <div className="error-message">{validationErrors.firearm_status}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Collection Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={firearm.date_of_collection}
                      onChange={handleFirearmChange}
                      name="date_of_collection"
                      max={new Date().toISOString().split('T')[0]}
                      className={`form-input ${validationErrors.date_of_collection ? 'error' : ''}`}
                    />
                    {validationErrors.date_of_collection && (
                      <div className="error-message">{validationErrors.date_of_collection}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Registration Location <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={firearm.registration_location}
                      onChange={handleFirearmChange}
                      name="registration_location"
                      disabled
                      placeholder="Registration location"
                      className={`form-input ${validationErrors.registration_location ? 'error' : ''}`}
                    />
                    {validationErrors.registration_location && (
                      <div className="error-message">{validationErrors.registration_location}</div>
                    )}
                  </div>
                </div>

                {firearm.firearm_status !== 'deposited' && (
                  <div className="form-group">
                    <label className="form-label">
                      Status Comment <span className="required">*</span>
                    </label>
                    <textarea
                      value={firearm.status_comment}
                      onChange={handleFirearmChange}
                      name="status_comment"
                      rows="3"
                      placeholder="Enter status comment"
                      className={`form-textarea ${validationErrors.status_comment ? 'error' : ''}`}
                    />
                    {validationErrors.status_comment && (
                      <div className="error-message">{validationErrors.status_comment}</div>
                    )}
                  </div>
                )}

                <div className="form-group full-width">
                  <label className="form-label">
                    Firearm Image <span className="required">*</span>
                  </label>
                  <div className={`image-upload-container ${validationErrors.image ? 'error' : ''}`}>
                    {!imagePreview ? (
                      <div className={`image-upload-area ${validationErrors.image ? 'error-border' : ''}`}>
                        <input
                          type="file"
                          id="firearm_image"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          className="image-input-hidden"
                        />
                        <label htmlFor="firearm_image" className="image-upload-label">
                          <div className="upload-icon">
                            <ImagePlus size={48} />
                          </div>
                          <div className="upload-text">
                            <p className="upload-title">Click to upload firearm image</p>
                            <p className="upload-subtitle">JPG, PNG, or WEBP (Max 5MB) - Required</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Firearm preview" className="image-preview" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="image-remove-btn"
                        >
                          <X size={16} />
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                  {validationErrors.image && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      <span>{validationErrors.image}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && (
            <div className="step-screen">
              <div className="step-header">
                <div className="step-number">2</div>
                <div className="step-info">
                  <h2><CheckCircle size={24} className="step-icon" /> Review & Confirmation</h2>
                  <p>Please review all information before submitting</p>
                </div>
              </div>

              <div className="review-section">
                <div className="review-card">
                  <div className="review-header">
                    <User size={24} />
                    <h3>Owner Information</h3>
                  </div>
                  <div className="review-content">
                    <div className="review-item">
                      <span className="label">Full Name:</span>
                      <span className="value">{newOwner.full_legal_name}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Contact Number:</span>
                      <span className="value">{newOwner.contact_number}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Age:</span>
                      <span className="value">{newOwner.age}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Address:</span>
                      <span className="value">{newOwner.residential_address}</span>
                    </div>
                  </div>
                </div>

                <div className="review-card">
                  <div className="review-header">
                    <Bomb size={24} />
                    <h3>Firearm Information</h3>
                  </div>
                  <div className="review-content">
                    <div className="review-item">
                      <span className="label">Serial Number:</span>
                      <span className="value">{firearm.serial_number}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Gun Type:</span>
                      <span className="value">{firearm.gun_type?.name}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Gun Subtype:</span>
                      <span className="value">{firearm.gun_subtype?.name}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Gun Model:</span>
                      <span className="value">{firearm.gun_model?.name}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Ammunition Type:</span>
                      <span className="value">{firearm.ammunition_type}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Status:</span>
                      <span className="value">{firearm.firearm_status}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Collection Date:</span>
                      <span className="value">{firearm.date_of_collection}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Registration Location:</span>
                      <span className="value">{firearm.registration_location}</span>
                    </div>
                    {firearm.status_comment && (
                      <div className="review-item">
                        <span className="label">Status Comment:</span>
                        <span className="value">{firearm.status_comment}</span>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="review-item full-width">
                        <span className="label">Firearm Image:</span>
                        <div className="review-image-container">
                          <img src={imagePreview} alt="Firearm" className="review-image" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="forms-navigation">
            <div className="nav-left">
              {currentStep > 0 && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
              )}
            </div>

            <div className="nav-right">
              {currentStep < 2 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={isSubmitting || (currentStep === 0 && !selectedOwner)}
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Registering Firearm...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Register Firearm
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {submitError && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <div className="error-content">
                <h4>Submission Failed</h4>
                <p>{submitError}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

      {submitSuccess ? (
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">
              <Check size={36} />
            </div>
            <h3>Registration Submitted Successfully!</h3>
            <p>
              The owner and firearm information has been saved to the database.
            </p>

            <div className="success-details">
              <h4>Registered Owner:</h4>
              <p>
                <strong>Name:</strong> {lastRegisteredOwner?.full_legal_name}
              </p>
              <p>
                <strong>Contact:</strong> {lastRegisteredOwner?.contact_number}
              </p>
            </div>

            <div className="success-actions">
              <button
                className="success-btn primary"
                onClick={() => {
                  setSubmitSuccess(false);
                  resetWizard(); // Reset to Step 0 (Select Owner)
                }}
              >
                Register New Owner
              </button>
              <button
                className="success-btn secondary"
                onClick={() => {
                  setSubmitSuccess(false);
                  setCurrentStep(1); // Go to firearm information step (Step 1)
                  // Keep the owner data from last registration
                  if (lastRegisteredOwner) {
                    setNewOwner(lastRegisteredOwner);
                  }
                  // Keep selectedOwner so the owner remains selected if user navigates back
                  // Reset only firearm fields
                  setFirearm({
                    serial_number: '',
                    gun_model: null,
                    gun_type: null,
                    gun_subtype: null,
                    ammunition_type: '',
                    firearm_status: 'deposited',
                    date_of_collection: '',
                    registration_location: '',
                    status_comment: '',
                    image: null,
                  });
                  setImagePreview(null);
                }}
              >
                Add Another Firearm to This Owner
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="add-user-form">
          {!previewMode ? (
            <form onSubmit={handleSubmit}>
              <div className="form-section owner-section">
                <div className="section-header">
                  <div className="section-icon-container">
                    <User size={22} className="section-icon" />
                  </div>
                  <h3>Personal Information</h3>
                  <span className="section-badge">Required</span>
                </div>

                <div className="user-search-container" ref={searchContainerRef}>
                  <div className="form-group">
                    <label htmlFor="user-search" className="search-label">
                      <div className="input-icon-container">
                        <Search size={18} className="input-icon" />
                      </div>
                      Search Existing Clients
                      <span className="search-subtitle">Type name or phone number to find existing clients</span>
                    </label>
                    <div className="search-input-container">
                      <input
                        type="text"
                        id="user-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by name, phone number..."
                        className="search-input"
                        autoComplete="off"
                      />
                      <div className="search-input-actions">
                      {isSearching && (
                        <Loader2
                          size={18}
                          className="animate-spin search-loading"
                        />
                      )}
                        {searchTerm && !isSearching && (
                          <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => {
                              setSearchTerm('');
                              setSearchResults([]);
                              setSearchError('');
                              setShowSearchDropdown(false);
                            }}
                          >
                            <X size={16} />
                          </button>
                        )}
                  </div>

                      {/* Search Results Dropdown */}
                      {searchResults.length > 0 && showSearchDropdown && (
                    <div className="search-results">
                      <div className="results-header">
                            <div className="results-title">
                              <UserCheck2 size={16} />
                        <span>Matching Clients</span>
                            </div>
                            <div className="results-count">
                              <span className="count-badge">{searchResults.length}</span>
                              <span>found</span>
                            </div>
                      </div>
                      <div className="results-list">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="result-item"
                            onClick={() => selectUser(user)}
                          >
                                <div className="result-item-content">
                                  <div className="user-avatar">
                                    <User size={18} />
                                  </div>
                            <div className="user-info">
                                    <div className="user-name">
                                {user.first_name} {user.last_name}
                            </div>
                            <div className="user-details">
                                      <div className="detail-item">
                                        <Phone size={14} />
                                        <span>{user.phone_number || 'No phone'}</span>
                                      </div>
                                      <div className="detail-item">
                                        <Calendar size={14} />
                                        <span>Age: {getAge(user.date_of_birth) || 'N/A'}</span>
                                      </div>
                                      {user.municipality && (
                                        <div className="detail-item">
                                          <MapPin size={14} />
                                          <span>{user.municipality}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="select-indicator">
                                    <ArrowRight size={16} />
                                  </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                      )}

                      {/* Empty Results */}
                      {searchTerm.trim() && !isSearching && searchResults.length === 0 && showSearchDropdown && (
                    <div className="search-results empty-results">
                      <div className="empty-state">
                            <div className="empty-icon">
                              <FileSearch size={32} />
                      </div>
                            <div className="empty-content">
                              <h4>No matching clients found</h4>
                              <p>
                                {currentUserRole === 'police_officer'
                                  ? `No clients found in any municipality matching "${searchTerm}"`
                                  : `No clients found in ${currentUserMunicipality} matching "${searchTerm}"`
                                }
                              </p>
                              <div className="search-suggestions">
                                <span>Suggestions:</span>
                                <ul>
                                  <li>Check spelling</li>
                                  <li>Try partial names</li>
                                  <li>Search by phone number</li>
                                </ul>
                    </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Search Tips */}
                      {searchTerm.trim() && searchResults.length === 0 && !isSearching && showSearchDropdown && (
                        <div className="search-tips">
                          <div className="tips-header">
                            <AlertCircle size={16} />
                            <span>Search Tips</span>
                          </div>
                          <div className="tips-content">
                            <p>Try searching with:</p>
                            <ul>
                              <li>First name only</li>
                              <li>Last name only</li>
                              <li>Phone number</li>
                              <li>Partial matches</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    {searchError && (
                      <div className="search-error">
                        <AlertCircle size={14} />
                        {searchError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="full_legal_name" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                        <User size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Full Legal Name</span>
                          <span className="label-description">As shown on government ID</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <input
                      type="text"
                      id="full_legal_name"
                      name="full_legal_name"
                      value={newOwner.full_legal_name}
                      onChange={handleOwnerChange}
                      disabled
                        placeholder="Enter full legal name"
                        className={`form-input ${validationErrors.full_legal_name ? 'error' : ''} ${newOwner.full_legal_name ? 'filled' : ''}`}
                      />
                      {newOwner.full_legal_name && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                    </div>
                    {validationErrors.full_legal_name && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{validationErrors.full_legal_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_number" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                        <Phone size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Contact Number</span>
                          <span className="label-description">Primary phone number</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <input
                      type="tel"
                      id="contact_number"
                      name="contact_number"
                      value={newOwner.contact_number}
                      disabled
                      onChange={handleOwnerChange}
                        placeholder="Enter phone number"
                        className={`form-input ${validationErrors.contact_number ? 'error' : ''} ${newOwner.contact_number ? 'filled' : ''}`}
                      />
                      {newOwner.contact_number && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                    </div>
                    {validationErrors.contact_number && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{validationErrors.contact_number}</span>
                      </div>
                    )}
                  </div>

                  {/* <div className="form-group">
                    <label htmlFor="gender" className="icon-label">
                      <User size={18} className="input-icon" />
                      Gender
                      <span className="required-indicator">*</span>
                    </label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={newOwner.gender === 'male'}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, gender: e.target.value })
                          }
                        />
                        <span className="radio-label">Male</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={newOwner.gender === 'female'}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, gender: e.target.value })
                          }
                        />
                        <span className="radio-label">Female</span>
                      </label>
                      
                    </div>
                    {validationErrors.gender && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.gender}
                      </div>
                    )}
                  </div> */}

                  <div className="form-group">
                    <label htmlFor="age" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                          <Calendar size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Age</span>
                          <span className="label-description">Must be 18 or older</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={newOwner.age}
                      onChange={handleOwnerChange}
                        placeholder="Enter age"
                      min="18"
                      max="120"
                      disabled
                        className={`form-input ${validationErrors.age ? 'error' : ''} ${newOwner.age ? 'filled' : ''}`}
                      />
                      {newOwner.age && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                    </div>
                    {validationErrors.age && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{validationErrors.age}</span>
                      </div>
                    )}
                  </div>

                  {/* Location input field displaying complete address from user profile */}
                  <div className="form-group full-width">
                    <label htmlFor="location" className="form-label">
                      <div className="label-content">
                        <div className="input-icon-container">
                          <Home size={18} className="input-icon" />
                        </div>
                        <div className="label-text">
                          <span className="label-title">Location</span>
                          <span className="label-description">Complete address from user profile</span>
                        </div>
                      </div>
                    </label>
                    <div className="input-container">
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={getFullAddress() || 'No location data available'}
                        readOnly
                        className="form-input filled"
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          border: '1px solid #e9ecef',
                          cursor: 'default',
                          minHeight: '40px' // Ensure it's visible
                        }}
                      />
                      {getFullAddress() && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section firearm-section">
                <div className="section-header">
                  <div className="section-icon-container">
                    <Bomb size={22} className="section-icon" />
                  </div>
                  <h3>Firearm Information</h3>
                  <span className="section-badge">Required</span>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="serial_number" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                        <Barcode size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Serial Number</span>
                          <span className="label-description">Unique firearm identifier</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <input
                      type="text"
                      id="serial_number"
                      name="serial_number"
                      value={firearm.serial_number}
                      onChange={handleFirearmChange}
                        placeholder="Enter serial number"
                        className={`form-input ${validationErrors.serial_number ? 'error' : ''} ${firearm.serial_number ? 'filled' : ''}`}
                      />
                      {firearm.serial_number && /^[0-9-]+$/.test(firearm.serial_number.trim()) && !validationErrors.serial_number && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                      {validationErrors.serial_number && (
                        <div className="input-status">
                          <AlertCircle size={16} className="status-icon error" />
                        </div>
                      )}
                    </div>
                    {validationErrors.serial_number && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{validationErrors.serial_number}</span>
                      </div>
                    )}
                  </div>
                  {/* Type of Gun Dropdown */}
                  <div className="form-group">
                    <label htmlFor="gun_type" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                        <Bomb size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Type of Gun</span>
                          <span className="label-description">Select firearm category</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <select
                      id="gun_type"
                      name="gun_type"
                      value={firearm.gun_type?.id || ''}
                      onChange={handleFirearmChange}
                        className={`form-input form-select ${firearm.gun_type ? 'filled' : ''}`}
                    >
                      <option value="">Select Type of Gun</option>
                      {gunTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                      {firearm.gun_type && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtype Dropdown */}
                  <div className="form-group">
                    <label htmlFor="gun_subtype" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                        <Bomb size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Sub Type</span>
                          <span className="label-description">Select firearm subtype</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <select
                      id="gun_subtype"
                      name="gun_subtype"
                      value={firearm.gun_subtype?.id || ''}
                      onChange={handleFirearmChange}
                      disabled={!firearm.gun_type}
                        className={`form-input form-select ${firearm.gun_subtype ? 'filled' : ''} ${!firearm.gun_type ? 'disabled' : ''}`}
                    >
                      <option value="">Select Sub Type</option>
                      {filteredSubtypes.map((subtype) => (
                        <option key={subtype.id} value={subtype.id}>
                          {subtype.name}
                        </option>
                      ))}
                    </select>
                      {firearm.gun_subtype && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                    </div>
                    {filteredSubtypes.length === 0 && firearm.gun_type && (
                      <div className="field-info">
                        <AlertCircle size={14} />
                        <span>No subtypes available for this gun type</span>
                      </div>
                    )}
                  </div>

                  {/* Model Dropdown */}
                  <div className="form-group">
                    <label htmlFor="gun_model" className="form-label">
                      <div className="label-content">
                      <div className="input-icon-container">
                        <Bomb size={18} className="input-icon" />
                      </div>
                        <div className="label-text">
                          <span className="label-title">Gun Name/Model</span>
                          <span className="label-description">Select specific model</span>
                        </div>
                      <span className="required-indicator">*</span>
                      </div>
                    </label>
                    <div className="input-container">
                    <select
                      id="gun_model"
                      name="gun_model"
                      value={firearm.gun_model?.id || ''}
                      onChange={handleFirearmChange}
                      disabled={!firearm.gun_subtype}
                        className={`form-input form-select ${validationErrors.gun_model ? 'error' : ''} ${firearm.gun_model ? 'filled' : ''} ${!firearm.gun_subtype ? 'disabled' : ''}`}
                    >
                      <option value="">Select a Gun Name/Model</option>
                      {filteredModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                      {firearm.gun_model && !validationErrors.gun_model && (
                        <div className="input-status">
                          <Check size={16} className="status-icon success" />
                        </div>
                      )}
                      {validationErrors.gun_model && (
                        <div className="input-status">
                          <AlertCircle size={16} className="status-icon error" />
                        </div>
                      )}
                    </div>
                    {validationErrors.gun_model && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        <span>{validationErrors.gun_model}</span>
                      </div>
                    )}
                    {filteredModels.length === 0 && firearm.gun_subtype && (
                      <div className="field-info">
                        <AlertCircle size={14} />
                        <span>No models available for this subtype</span>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="ammunition_type">
                      <div className="input-icon-container">
                        <CircleDot size={18} className="input-icon" />
                      </div>
                      Ammunition Type
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="text"
                      id="ammunition_type"
                      name="ammunition_type"
                      value={firearm.ammunition_type}
                      onChange={handleFirearmChange}
                      placeholder="e.g. 9mm, .45 ACP"
                      className={
                        validationErrors.ammunition_type ? 'error' : ''
                      }
                    />
                    {validationErrors.ammunition_type && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.ammunition_type}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label
                      htmlFor="firearm_status"
                      className="flex items-center"
                    >
                      <span className="flex items-center">
                        Firearm Status
                        <span className="required-indicator text-red-500 ml-1">
                          *
                        </span>
                      </span>
                    </label>

                    <div className="select-with-icon flex items-center mt-2">
                      <select
                        id="firearm_status"
                        name="firearm_status"
                        value={firearm.firearm_status}
                        onChange={handleFirearmChange}
                        className="ml-2 border rounded p-1"
                      >
                        <option value="captured">Captured</option>
                        <option value="confiscated">Confiscated</option>
                        <option value="surrendered">Surrendered</option>
                        <option value="deposited">Deposited</option>
                        <option value="abandoned">Abandoned</option>
                        <option value="forfeited">Forfeited</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="date_of_collection">
                      <div className="input-icon-container">
                        <Clock size={18} className="input-icon" />
                      </div>
                      Date of Collection
                      <span className="required-indicator">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_of_collection"
                      name="date_of_collection"
                      value={firearm.date_of_collection}
                      onChange={handleFirearmChange}
                      className={
                        validationErrors.date_of_collection ? 'error' : ''
                      }
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {validationErrors.date_of_collection && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.date_of_collection}
                      </div>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="status_comment">
                      <div className="input-icon-container">
                        <FileText size={18} className="input-icon" />
                      </div>
                      Status Comment
                      {firearm.firearm_status !== 'deposited' && (
                        <span className="required-indicator">*</span>
                      )}
                    </label>
                    <textarea
                      id="status_comment"
                      name="status_comment"
                      value={firearm.status_comment}
                      onChange={handleFirearmChange}
                      placeholder={
                        firearm.firearm_status === 'captured'
                          ? 'Details about the capture...'
                          : firearm.firearm_status === 'confiscated'
                          ? 'Reason for confiscation...'
                          : firearm.firearm_status === 'surrendered'
                            ? 'Reason for surrender...'
                            : firearm.firearm_status === 'abandoned'
                            ? 'Details about where/how it was abandoned...'
                            : firearm.firearm_status === 'forfeited'
                            ? 'Reason for forfeiture...'
                            : 'Additional notes about the status...'
                      }
                      rows="3"
                      required={firearm.firearm_status !== 'deposited'}
                    />
                    {validationErrors.status_comment && (
                      <div className="error-message">
                        <X size={14} /> {validationErrors.status_comment}
                      </div>
                    )}
                  </div>
<div className="form-group full-width">
  <label htmlFor="registration_location">
    <div className="input-icon-container">
      <MapPin size={18} className="input-icon" />
    </div>
    Registration Location
    <span className="required-indicator">*</span>
  </label>
  <div className="auto-set-field">
    <input
      type="text"
      id="registration_location"
      name="registration_location"
      value={currentUserMunicipality}
      readOnly
      className={`readonly-field ${validationErrors.registration_location ? 'error' : ''}`}
      placeholder="Loading your municipality..."
    />
    <div className="auto-set-badge">
      <BadgeCheck size={14} />
      {currentUserMunicipality 
        ? `Automatically set to ${currentUserMunicipality}`
        : 'Setting your municipality...'
      }
    </div>
  </div>
  {validationErrors.registration_location && (
    <div className="error-message">
      <X size={14} /> {validationErrors.registration_location}
    </div>
  )}
  {!currentUserMunicipality && !validationErrors.registration_location && (
    <div className="warning-message">
      <AlertCircle size={14} />
      Could not detect your municipality. Please ensure you are logged in.
    </div>
  )}
</div>
                </div>

                <div className="section-footer">
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    Review Registration
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="preview-section">
              <div className="preview-header">
                <div className="section-icon-container">
                  <BadgeCheck size={22} className="section-icon" />
                </div>
                <h3>Review Registration Information</h3>
                <span className="section-badge">Preview</span>
              </div>

              <div className="preview-content">
                <div className="preview-subsection">
                  <h4>
                    <User size={18} />
                    Owner Information
                  </h4>
                  <div className="preview-grid">
                    <div className="preview-item">
                      <span className="preview-label">
                        <User size={16} />
                        Full Name:
                      </span>
                      <span className="preview-value">
                        {newOwner.full_legal_name}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Phone size={16} />
                        Contact Number:
                      </span>
                      <span className="preview-value">
                        {newOwner.contact_number}
                      </span>
                    </div>

                    {/* <div className="preview-item">
                      <span className="preview-label">
                        <Shield size={16} />
                        License Status:
                      </span>
                      <span className="preview-value">
                        {getLicenseStatusIcon(newOwner.license_status)}
                        {newOwner.license_status.charAt(0).toUpperCase() +
                          newOwner.license_status.slice(1)}
                      </span>
                    </div> */}

                    {/* <div className="preview-item">
                      <span className="preview-label">
                        <Calendar size={16} />
                        Registration Date:
                      </span>
                      <span className="preview-value">
                        {formatDate(newOwner.registration_date)}
                      </span>
                    </div> */}

                    <div className="preview-item">
                      <span className="preview-label">
                        <User size={16} />
                        Age:
                      </span>
                      <span className="preview-value">{newOwner.age}</span>
                    </div>

                    <div className="preview-item full-width">
                      <span className="preview-label">
                        <Home size={16} />
                        Address:
                      </span>
                      <span className="preview-value">
                        {newOwner.residential_address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="preview-subsection">
                  <h4>
                    <Bomb size={18} />
                    Firearm Information
                  </h4>
                  <div className="preview-grid">
                    <div className="preview-item">
                      <span className="preview-label">
                        <Barcode size={16} />
                        Serial Number:
                      </span>
                      <span className="preview-value">
                        {firearm.serial_number}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Bomb size={16} />
                        Gun Name/Model:
                      </span>
                      <span className="preview-value">
                        {firearm.gun_model_details?.name || 'Not selected'}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Bomb size={16} />
                        Type of Gun:
                      </span>
                      <span className="preview-value">
                        {firearm.gun_type?.name || 'Not selected'}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Bomb size={16} />
                        Sub Type:
                      </span>
                      <span className="preview-value">
                        {firearm.gun_subtype?.name || 'Not selected'}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <CircleDot size={16} />
                        Ammunition Type:
                      </span>
                      <span className="preview-value">
                        {firearm.ammunition_type}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Shield size={16} />
                        Firearm Status:
                      </span>
                      <span className="preview-value">
                        {getFirearmStatusIcon(firearm.firearm_status)}
                        {firearm.firearm_status &&
                        typeof firearm.firearm_status === 'string'
                          ? firearm.firearm_status.charAt(0).toUpperCase() +
                            firearm.firearm_status.slice(1)
                          : 'Not selected'}
                      </span>
                    </div>

                    <div className="preview-item">
                      <span className="preview-label">
                        <Clock size={16} />
                        Date of Collection:
                      </span>
                      <span className="preview-value">
                        {formatDate(firearm.date_of_collection)}
                      </span>
                    </div>

                    <div className="preview-item full-width">
                      <span className="preview-label">
                        <MapPin size={16} />
                        Status Comment:
                      </span>
                      <span className="preview-value">
                        {firearm.status_comment}
                      </span>
                    </div>
<div className="preview-item full-width">
  <span className="preview-label">
    <MapPin size={16} />
    Registration Location:
  </span>
  <span className="preview-value">
    {currentUserMunicipality}
    <span className="auto-set-indicator">(Automatically set to your municipality)</span>
  </span>
</div>
                  </div>
                </div>

                <div className="preview-note">
                  <Target size={20} />
                  <p>
                    This registration will be submitted to the firearms registry
                    database
                  </p>
                </div>
              </div>

              {(submitError || networkErrorDetails) && (
                <div className="error-message detailed-error">
                  <AlertCircle size={18} />
                  <div>
                    <strong>{submitError || 'Registration Error'}</strong>
                    {networkErrorDetails && (
                      <div className="error-details">
                        <pre>{networkErrorDetails}</pre>
                        <div className="troubleshooting-tips">
                          <p>Troubleshooting tips:</p>
                          <ul>
                            <li>
                              Ensure backend server is running (check terminal)
                            </li>
                            <li>Verify API URL is correct: {API_BASE_URL}</li>
                            <li>Check browser console for CORS errors</li>
                            <li>Try refreshing the page</li>
                            <li>
                              Check all required fields are properly filled
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="preview-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleEdit}
                  disabled={isSubmitting}
                >
                  <Edit size={18} />
                  Edit Information
                </button>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirm Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          {/* add user modal */}
      {isAddUserModalOpen && (
        <div className="add-user-modal-overlay" onClick={closeAddUserModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-user-modal-header">
              <div className="add-user-modal-title">
                <UserPlus size={20} className="add-user-modal-icon" />
                <h3>Add New User</h3>
              </div>
              <button className="add-user-modal-close" onClick={closeAddUserModal}>
                <X size={20} />
              </button>
            </div>

            <div className="add-user-modal-body">
              {/* Left Column - Account Information */}
              <div className="add-user-form-column">
                <div className="add-user-form-section">
                  <div className="add-user-section-header">
                    <User size={16} />
                    <h4>Account Information</h4>
                  </div>

                  <div className="add-user-form-group">
                    <label className="add-user-input-label">
                      <User size={14} />
                      <span>Username</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={newUserForm.username}
                      onChange={handleNewUserChange}
                      className={`add-user-input ${userFormErrors.username ? 'add-user-input-error' : ''}`}
                      placeholder="Enter username"
                      disabled={newUserForm.role === 'administrator'}
                    />
                    {userFormErrors.username && (
                      <span className="add-user-error-message">
                        {userFormErrors.username}
                      </span>
                    )}
                  </div>

                  <div className="add-user-form-group">
                    <label className="add-user-input-label">
                      <Mail size={14} />
                      <span>Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={newUserForm.email}
                      onChange={handleNewUserChange}
                      className={`add-user-input ${userFormErrors.email ? 'add-user-input-error' : ''}`}
                      placeholder="Enter email"
                    />
                    {userFormErrors.email && (
                      <span className="add-user-error-message">
                        {userFormErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="add-user-form-group">
                    <label className="add-user-input-label">
                      <UserCog size={14} />
                      <span>Role</span>
                    </label>
                    <div className="add-user-role-selector">
                      <label className={`add-user-role-option ${newUserForm.role === 'administrator' ? 'add-user-role-active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="administrator"
                          checked={newUserForm.role === 'administrator'}
                          onChange={(e) => {
                            handleNewUserChange(e);
                            setNewUserForm((prev) => ({
                              ...prev,
                              username: prev.municipality
                                ? prev.municipality.toLowerCase().replace(/\s+/g, '_')
                                : '',
                            }));
                          }}
                        />
                        <div className="add-user-role-content">
                          <ShieldCheck size={16} />
                          <span>Municipality</span>
                        </div>
                      </label>

                      <label className={`add-user-role-option ${newUserForm.role === 'police_officer' ? 'add-user-role-active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="police_officer"
                          checked={newUserForm.role === 'police_officer'}
                          onChange={handleNewUserChange}
                        />
                        <div className="add-user-role-content">
                          <ShieldHalf size={16} />
                          <span>Police Officer</span>
                        </div>
                      </label>

                      <label className={`add-user-role-option ${newUserForm.role === 'client' ? 'add-user-role-active' : ''}`}>
                        <input
                          type="radio"
                          name="role"
                          value="client"
                          checked={newUserForm.role === 'client'}
                          onChange={handleNewUserChange}
                        />
                        <div className="add-user-role-content">
                          <User size={16} />
                          <span>Owner</span>
                        </div>
                      </label>
                    </div>
                    {userFormErrors.role && (
                      <span className="add-user-error-message">
                        {userFormErrors.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Personal Information */}
              <div className="add-user-form-column">
                <div className="add-user-form-section">
                  <div className="add-user-section-header">
                    <UserCheck2 size={16} />
                    <h4>Personal Information</h4>
                  </div>

                  <div className="add-user-form-row">
                    <div className="add-user-form-group">
                      <label className="add-user-input-label">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={newUserForm.first_name}
                        onChange={handleNewUserChange}
                        className="add-user-input"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="add-user-form-group">
                      <label className="add-user-input-label">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={newUserForm.last_name}
                        onChange={handleNewUserChange}
                        className="add-user-input"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  {newUserForm.role === 'client' && (
                    <div className="add-user-form-row">
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <Calendar size={14} />
                          <span>Date of Birth</span>
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={newUserForm.date_of_birth}
                          onChange={handleNewUserChange}
                          className="add-user-input"
                        />
                      </div>

                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <Phone size={14} />
                          <span>Phone Number</span>
                        </label>
                        <input
                          type="text"
                          name="phone_number"
                          value={newUserForm.phone_number}
                          onChange={handleNewUserChange}
                          className="add-user-input"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  )}

                  <div className="add-user-form-group">
                    <label className="add-user-input-label">
                      <MapPin size={14} />
                      <span>Municipality</span>
                    </label>

                    {newUserForm.role === 'administrator' ? (
                      <>
                        <CustomDropdown
                          name="municipality"
                          value={newUserForm.municipality}
                          onChange={handleNewUserChange}
                          options={Object.keys(MUNICIPALITIES_WITH_BARANGAYS)}
                          className={`add-user-input ${userFormErrors.municipality ? 'add-user-input-error' : ''}`}
                        />
                        {userFormErrors.municipality && (
                          <span className="add-user-error-message">
                            {userFormErrors.municipality}
                          </span>
                        )}
                      </>
                    ) : (
                      <select
                        name="municipality"
                        value={newUserForm.municipality}
                        onChange={handleNewUserChange}
                        className={`add-user-input ${userFormErrors.municipality ? 'add-user-input-error' : ''}`}
                      >
                        <option value="">Select Municipality</option>
                        {Object.keys(MUNICIPALITIES_WITH_BARANGAYS).map((municipality) => (
                          <option key={municipality} value={municipality}>
                            {municipality}
                          </option>
                        ))}
                      </select>
                    )}
                    {userFormErrors.municipality && (
                      <span className="add-user-error-message">
                        {userFormErrors.municipality}
                      </span>
                    )}
                  </div>

                  {newUserForm.role === 'client' && (
                    <>
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <MapPin size={14} />
                          <span>Barangay</span>
                        </label>
                        {newUserForm.municipality ? (
                          <select
                            name="barangay"
                            value={newUserForm.barangay}
                            onChange={handleNewUserChange}
                            className="add-user-input"
                          >
                            <option value="">Select Barangay</option>
                            {availableBarangays.map((barangay) => (
                              <option key={barangay} value={barangay}>
                                {barangay}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="add-user-input-disabled">
                            Please select a municipality first
                          </div>
                        )}
                      </div>
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <MapPin size={14} />
                          <span>House Number</span>
                        </label>
                        <input
                          type="text"
                          name="houseNumber"
                          value={newUserForm.houseNumber}
                          onChange={handleNewUserChange}
                          className="add-user-input"
                          placeholder="Enter house number"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="add-user-modal-footer">
              <button className="add-user-btn add-user-btn-secondary" onClick={closeAddUserModal}>
                Cancel
              </button>
              <button className="add-user-btn add-user-btn-primary" onClick={handleAddUser}>
                <Save size={16} className="add-user-btn-icon" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}};

export default AddOwner;
