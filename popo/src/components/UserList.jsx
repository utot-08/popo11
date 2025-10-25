import { useState, useEffect, useRef } from 'react';
import {
  User,
  UserCheck,
  UserCog,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  Save,
  X,
  Mail,
  Shield,
  ShieldCheck,
  UserPlus,
  Filter,
  MoreVertical,
  RefreshCw,
  Check,
  Circle,
  Plus,
  Home,
  Calendar,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  UserX,
  UserCheck2,
  Smartphone,
  Info,
  Key,
  ChevronsUpDown,
  ShieldHalf,
  Archive,
  RotateCcw
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import eventBus from '../utils/eventBus';
import '../styles/UserList.css';

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

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [existingMunicipalities, setExistingMunicipalities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [error, setError] = useState(null);
  
  // Regional address state for client users and administrators
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);
  const [availableBarangaysForRegion, setAvailableBarangaysForRegion] = useState([]);
  
  // Regional address state for administrators
  const [selectedAdminProvince, setSelectedAdminProvince] = useState('');
  const [selectedAdminMunicipality, setSelectedAdminMunicipality] = useState('');
  const [availableAdminMunicipalities, setAvailableAdminMunicipalities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('administrator');
  const [showArchived, setShowArchived] = useState(false);
  const { user, updateUser } = useAuth();
  const CustomDropdown = ({ options, value, onChange, name, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
        <div className="dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
          {value || 'Select Municipality'}
          <ChevronDown
            size={16}
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          />
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

  const [editFormData, setEditFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    is_active: true,
  });

  const [newUserForm, setNewUserForm] = useState({
    email: '',
    role: user?.role === 'administrator' ? 'client' : user?.role === 'superuser' ? 'administrator' : 'client', // Default role based on user permissions
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    houseNumber: '',
    barangay: '',
    municipality: user?.role === 'administrator' && user?.username 
      ? user.username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : '', // Auto-fill municipality for administrators using username
    province: '', // Regional address fields
    gender: 'prefer_not_to_say',
  });

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

  useEffect(() => {
    if (
      newUserForm.municipality &&
      MUNICIPALITIES_WITH_BARANGAYS[newUserForm.municipality]
    ) {
      setAvailableBarangays(
        MUNICIPALITIES_WITH_BARANGAYS[newUserForm.municipality]
      );
      // Reset barangay when municipality changes
      setNewUserForm((prev) => ({ ...prev, barangay: '' }));
    } else {
      setAvailableBarangays([]);
    }
  }, [newUserForm.municipality]);

  const [formErrors, setFormErrors] = useState({});
  const usersPerPage = 8;

  // Philippine phone number validation
  const validatePhilippinePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Philippine mobile numbers: 09XX XXX XXXX (11 digits starting with 09)
    // Philippine landline: 0X XXX XXXX (10 digits starting with 0)
    const mobilePattern = /^09\d{9}$/;
    const landlinePattern = /^0\d{9}$/;
    
    return mobilePattern.test(cleanNumber) || landlinePattern.test(cleanNumber);
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}users/`);
      
      // Sort users by creation date (Last In First Out - newest first)
      const sortedUsers = response.data.sort((a, b) => {
        const dateA = new Date(a.date_joined || a.created_at || 0);
        const dateB = new Date(b.date_joined || b.created_at || 0);
        return dateB - dateA; // Descending order (newest first)
      });
      
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    if (users) {
      let filtered = users;

      // Filter by archived status
      if (showArchived) {
        filtered = filtered.filter((user) => user.is_archived === true);
      } else {
        filtered = filtered.filter((user) => !user.is_archived);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (user) =>
            user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone_number?.includes(searchTerm)
        );
      }

      if (roleFilter !== 'all') {
        filtered = filtered.filter((user) => user.role === roleFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter((user) =>
          statusFilter === 'active' ? user.is_active : !user.is_active
        );
      }

      // Maintain LIFO order after filtering
      filtered = filtered.sort((a, b) => {
        const dateA = new Date(a.date_joined || a.created_at || 0);
        const dateB = new Date(b.date_joined || b.created_at || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, users, roleFilter, statusFilter, showArchived]);

  // Separate users by role
  const getUsersByRole = (role) => {
    let roleUsers = filteredUsers.filter(user => user.role === role);
    
    // Apply status filter to role-specific users
    if (statusFilter !== 'all') {
      roleUsers = roleUsers.filter((user) =>
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }
    
    // Maintain LIFO order for role-specific users
    roleUsers = roleUsers.sort((a, b) => {
      const dateA = new Date(a.date_joined || a.created_at || 0);
      const dateB = new Date(b.date_joined || b.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    return roleUsers;
  };

  const administrators = getUsersByRole('administrator');
  const policeOfficers = getUsersByRole('police_officer');
  const clients = getUsersByRole('client');

  // Open edit modal for existing user
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      date_of_birth: user.date_of_birth || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      is_active: user.is_active,
    });
    setIsEditModalOpen(true);
  };

  // Open add modal for new user
  const openAddModal = () => {
    // Set default role and municipality based on current user's permissions
    const adminMunicipality = user?.role === 'administrator' && user?.username 
      ? user.username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : '';
    
    setNewUserForm(prev => ({
      ...prev,
      role: user?.role === 'administrator' ? 'client' : user?.role === 'superuser' ? 'administrator' : 'client', // Default role based on user permissions
      municipality: adminMunicipality, // Auto-fill municipality for administrators
    }));
    setIsAddModalOpen(true);
  };

  // Close all modals
  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsAddModalOpen(false);
    setEditingUser(null);
    setFormErrors({});
    setShowPassword(false); // Reset here
    setShowConfirmPassword(false); // Reset here
    
    // Reset regional address state
    setSelectedProvince('');
    setSelectedMunicipality('');
    setSelectedBarangay('');
    setAvailableMunicipalities([]);
    setAvailableBarangaysForRegion([]);
    
    // Reset admin regional address state
    setSelectedAdminProvince('');
    setSelectedAdminMunicipality('');
    setAvailableAdminMunicipalities([]);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Regional address handlers for client users
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedMunicipality('');
    setSelectedBarangay('');
    setAvailableMunicipalities(province ? Object.keys(REGION_1_DATA[province]) : []);
    setAvailableBarangaysForRegion([]);
    
    // Update newUserForm state
    setNewUserForm(prev => ({
      ...prev,
      province: province,
      municipality: '',
      barangay: ''
    }));
  };

  const handleMunicipalityChange = (e) => {
    const municipality = e.target.value;
    setSelectedMunicipality(municipality);
    setSelectedBarangay('');
    setAvailableBarangaysForRegion(
      municipality && selectedProvince 
        ? REGION_1_DATA[selectedProvince][municipality] || []
        : []
    );
    
    // Update newUserForm state
    setNewUserForm(prev => ({
      ...prev,
      municipality: municipality,
      barangay: ''
    }));
  };

  const handleBarangayChange = (e) => {
    const barangay = e.target.value;
    setSelectedBarangay(barangay);
    
    // Update newUserForm state
    setNewUserForm(prev => ({
      ...prev,
      barangay: barangay
    }));
  };

  const handleHouseNumberChange = (e) => {
    const houseNumber = e.target.value;
    
    // Update newUserForm state
    setNewUserForm(prev => ({
      ...prev,
      houseNumber: houseNumber
    }));
  };

  // Regional address handlers for administrators
  const handleAdminProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedAdminProvince(province);
    setSelectedAdminMunicipality('');
    setAvailableAdminMunicipalities(province ? Object.keys(REGION_1_DATA[province]) : []);
    
    // Update newUserForm state
    setNewUserForm(prev => ({
      ...prev,
      province: province,
      municipality: ''
    }));
  };

  const handleAdminMunicipalityChange = (e) => {
    const municipality = e.target.value;
    setSelectedAdminMunicipality(municipality);
    
    // Update newUserForm state
    setNewUserForm(prev => ({
      ...prev,
      municipality: municipality
    }));
  };

  // Function to construct full address for display
  const getFullAddress = () => {
    if (!selectedProvince || !selectedMunicipality || !selectedBarangay || !newUserForm.houseNumber) {
      return '';
    }
    return `${newUserForm.houseNumber}, ${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}`;
  };

  // Handle new user form changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;

    setNewUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate new user form
  const validateForm = () => {
    const errors = {};

    // Email validation (required for all roles)
    if (!newUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email)) {
      errors.email = 'Email is invalid';
    }

    // Role validation (required for all roles)
    if (!newUserForm.role) {
      errors.role = 'Role is required';
    }

    // First name validation (required for all roles)
    if (!newUserForm.first_name.trim()) {
      errors.first_name = 'First name is required';
    }

    // Last name validation (required for all roles)
    if (!newUserForm.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    // Phone number validation (required for all roles)
    if (!newUserForm.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    } else if (!validatePhilippinePhoneNumber(newUserForm.phone_number)) {
      errors.phone_number = 'Please enter a valid Philippine phone number (e.g., 09123456789 or 02-123-4567)';
    }

    // Role-specific validations
    if (newUserForm.role === 'administrator') {
      // For administrators, validate regional address
      if (!selectedAdminProvince) {
        errors.adminProvince = 'Province is required for administrators';
      }
      if (!selectedAdminMunicipality) {
        errors.adminMunicipality = 'Municipality is required for administrators';
      }
      if (!newUserForm.municipality) {
        errors.municipality = 'Municipality is required for administrators';
      }
    } else if (newUserForm.role === 'client') {
      // Date of birth validation for clients
      if (!newUserForm.date_of_birth) {
        errors.date_of_birth = 'Date of birth is required for clients';
      }
      
      // Regional address validation for client users
      if (!selectedProvince) {
        errors.province = 'Province is required for clients';
      }
      if (!selectedMunicipality) {
        errors.municipality = 'Municipality is required for clients';
      }
      if (!selectedBarangay) {
        errors.barangay = 'Barangay is required for clients';
      }
      if (!newUserForm.houseNumber?.trim()) {
        errors.houseNumber = 'House number is required for clients';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new user
  const handleAddUser = async () => {
    // First validate the form
    if (!validateForm()) return;

    // Generate username based on role
    let username;
    if (newUserForm.role === 'administrator') {
      // For administrators, use municipality name as username
      username = newUserForm.municipality.toLowerCase().replace(/\s+/g, '_');
    } else {
      // For other roles, use first name + last name
      username = `${newUserForm.first_name.toLowerCase()}_${newUserForm.last_name.toLowerCase()}`.replace(/\s+/g, '_');
    }

    // Prepare user data
    const userData = {
      username: username,
      email: newUserForm.email,
      role: newUserForm.role,
      first_name: newUserForm.first_name,
      last_name: newUserForm.last_name,
      date_of_birth:
        newUserForm.role === 'client' ? newUserForm.date_of_birth : null,
      phone_number: newUserForm.phone_number,
      house_number: newUserForm.houseNumber,
      barangay: newUserForm.barangay,
      municipality: newUserForm.municipality,
      province: newUserForm.role === 'administrator' ? selectedAdminProvince : newUserForm.province,
      // Construct full address for client users, municipality for administrators
      address: newUserForm.role === 'client' ? getFullAddress() : newUserForm.municipality,
    };

    // Enhanced confirmation dialog
    const confirmation = await Swal.fire({
      title: 'Confirm New User',
      html: `
      <div style="text-align: left;">
        <p>Are you sure you want to add this user?</p>
        <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
          <p><strong>Username:</strong> ${userData.username}</p>
          <p><strong>Name:</strong> ${userData.first_name} ${userData.last_name}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Phone:</strong> ${userData.phone_number}</p>
          <p><strong>Role:</strong> ${userData.role === 'administrator' ? 'Municipality Admin' : userData.role === 'police_officer' ? 'Police Officer' : 'Client'}</p>
          ${
            userData.role === 'administrator'
              ? `<p><strong>Municipality:</strong> ${userData.municipality}</p>`
              : userData.role === 'client'
              ? `<p><strong>Address:</strong> ${userData.address}</p>`
              : ''
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
      // Show loading indicator with more specific message
      Swal.fire({
        title: 'Creating User Account...',
        html: `
        <div style="text-align: center;">
          <p>Setting up ${
            userData.role === 'administrator'
              ? 'municipality administrator'
              : userData.role === 'police_officer'
              ? 'police officer'
              : 'client'
          } account</p>
          <p style="font-size: 0.9em; color: #666;">Username: ${userData.username}</p>
          <p style="font-size: 0.9em; color: #666;">Name: ${userData.first_name} ${userData.last_name}</p>
        </div>
      `,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(`${API_BASE_URL}users/`, userData);

      // Success message tailored to role
      Swal.fire({
        icon: 'success',
        title: 'User Added Successfully!',
        html: `
        <div style="text-align: left;">
          <p>${
            userData.role === 'administrator'
              ? 'Municipality administrator account created:'
              : userData.role === 'police_officer'
              ? 'Police officer account created:'
              : 'Client account created:'
          }</p>
          <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <p><strong>Username:</strong> ${userData.username}</p>
            <p><strong>Name:</strong> ${userData.first_name} ${userData.last_name}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Phone:</strong> ${userData.phone_number}</p>
            ${
              userData.role === 'administrator'
                ? `<p><strong>Municipality:</strong> ${userData.municipality}</p>`
                : userData.role === 'client'
                ? `<p><strong>Address:</strong> ${userData.address}</p>`
                : ''
            }
          </div>
        </div>
      `,
        confirmButtonText: 'OK',
      });

      // Reset form with role preservation based on current user's permissions
      const adminMunicipality = user?.role === 'administrator' && user?.username 
        ? user.username.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : '';
      
      setNewUserForm({
        email: '',
        role: user?.role === 'administrator' ? 'client' : user?.role === 'superuser' ? 'administrator' : 'client', // Default role based on user permissions
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        houseNumber: '',
        barangay: '',
        municipality: adminMunicipality, // Auto-fill municipality for administrators
        province: '', // Regional address fields
        gender: 'prefer_not_to_say',
      });
      
      // Reset regional address state
      setSelectedProvince('');
      setSelectedMunicipality('');
      setSelectedBarangay('');
      setAvailableMunicipalities([]);
      setAvailableBarangaysForRegion([]);
      
      // Reset admin regional address state
      setSelectedAdminProvince('');
      setSelectedAdminMunicipality('');
      setAvailableAdminMunicipalities([]);

      closeModal();
      fetchUsers();
    } catch (error) {
      Swal.close(); // Close loading dialog

      // Enhanced error handling
      let errorMessage = 'Failed to create user account';
      let errorDetails = '';

      if (error.response?.data) {
        // Handle backend validation errors
        if (typeof error.response.data === 'object') {
          errorDetails = Object.entries(error.response.data)
            .map(([field, messages]) => {
              // Special handling for municipality conflicts
              if (field === 'municipality' && messages.includes('already exists')) {
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
        html: errorDetails
          ? `<div style="text-align: left;">${errorDetails}</div>`
          : errorMessage,
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Show loading indicator
      const loadingSwal = Swal.fire({
        title: 'Updating User...',
        text: 'Please wait while we update the user information',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.put(
        `${API_BASE_URL}users/${editingUser.id}/`,
        editFormData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      // Close loading indicator
      await loadingSwal.close();

      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'User Updated!',
        text: `${editFormData.first_name} ${editFormData.last_name}'s information has been updated successfully.`,
        confirmButtonText: 'OK',
      });

      // Update the auth context if the edited user is the current user
      if (user?.id === editingUser.id) {
        updateUser({
          email: editFormData.email,
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          phone_number: editFormData.phone_number,
          date_of_birth: editFormData.date_of_birth,
          address: editFormData.address,
        });

        // For sensitive changes, consider refreshing the token
        try {
          const tokenResponse = await axios.post(
            `${API_BASE_URL}token/refresh/`,
            { refresh: localStorage.getItem('refresh_token') }
          );
          localStorage.setItem('access_token', tokenResponse.data.access);
        } catch (tokenError) {
          console.warn('Token refresh failed:', tokenError);
        }
      }

      // Refresh the users list and close modal
      await fetchUsers();
      closeModal();

      // Only reload if absolutely necessary
      if (
        user?.id === editingUser.id &&
        window.location.pathname !== '/admin'
      ) {
        window.location.reload();
      }
    } catch (error) {
      // Close loading indicator if it's still open
      if (Swal.isVisible()) {
        Swal.close();
      }

      // Enhanced error handling
      let errorMessage = 'Failed to update user';
      let errorDetails = '';

      if (error.response) {
        // Handle validation errors from backend
        if (error.response.data) {
          if (typeof error.response.data === 'object') {
            errorDetails = Object.entries(error.response.data)
              .map(
                ([field, messages]) =>
                  `<strong>${field}:</strong> ${Array.isArray(messages) ? messages.join(' ') : messages}`
              )
              .join('<br>');
          } else {
            errorDetails = error.response.data.toString();
          }
        }

        // Handle specific status codes
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        }
      } else if (error.request) {
        errorMessage =
          'No response received from server. Please check your connection.';
      } else {
        errorDetails = error.message;
      }

      await Swal.fire({
        icon: 'error',
        title: errorMessage,
        html: errorDetails
          ? `<div style="text-align: left;">${errorDetails}</div>`
          : errorMessage,
        confirmButtonText: 'OK',
      });

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      }
    }
  };

  // Archive user instead of deleting
  const handleArchiveUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Archive User?',
      text: 'This will archive the user and set their account to inactive. You can restore them later.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, archive!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${API_BASE_URL}users/${userId}/archive/`);
        fetchUsers();
        
        // Emit event to notify other components to refresh their data
        eventBus.emit('userArchived', { userId });
        
        Swal.fire(
          'Archived!',
          'User has been archived and set to inactive.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Error!',
          error.response?.data?.message || 'Archive failed',
          'error'
        );
      }
    }
  };

  // Restore archived user
  const handleRestoreUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Restore User?',
      text: 'This will restore the user and set their account to active.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, restore!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`${API_BASE_URL}users/${userId}/restore/`);
        fetchUsers();
        
        // Emit event to notify other components to refresh their data
        eventBus.emit('userRestored', { userId });
        
        Swal.fire(
          'Restored!',
          'User has been restored and set to active.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Error!',
          error.response?.data?.message || 'Restore failed',
          'error'
        );
      }
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user) => {
    try {
      await axios.put(`${API_BASE_URL}users/${user.id}/`, {
        is_active: !user.is_active,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate user avatar
  const getUserAvatar = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Generate role badge with icon
const getUserRoleBadge = (role) => {
  const roleData = {
    administrator: {
      icon: <ShieldCheck size={14} />,
      text: 'Admin',
      color: 'admin',
    },
    police_officer: { // Add this
      icon: <ShieldHalf size={14} />,
      text: 'Police Officer',
      color: 'police',
    },
    client: { 
      icon: <User size={14} />, 
      text: 'Client', 
      color: 'client' 
    },
  };

  const { icon, text, color } = roleData[role] || roleData.client;

  return (
    <span className={`role-badge ${color}`}>
      {icon}
      {text}
    </span>
  );
};

    // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  // Table sorting functionality
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedUsers = () => {
    if (!sortConfig.key) {
      // If no sorting is applied, maintain LIFO order
      return filteredUsers.sort((a, b) => {
        const dateA = new Date(a.date_joined || a.created_at || 0);
        const dateB = new Date(b.date_joined || b.created_at || 0);
        return dateB - dateA; // Descending order (newest first)
      });
    }
    
    return [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedUsers = getSortedUsers();

  // Tab Navigation Component
  const TabNavigation = () => {
    const tabs = [
      {
        id: 'administrator',
        label: 'Administrators',
        icon: <ShieldCheck size={16} />,
        count: administrators.length,
        color: 'admin'
      },
      {
        id: 'police_officer',
        label: 'Police Officers',
        icon: <ShieldHalf size={16} />,
        count: policeOfficers.length,
        color: 'police'
      },
      {
        id: 'client',
        label: 'Firearm Owners',
        icon: <User size={16} />,
        count: clients.length,
        color: 'client'
      }
    ];

    return (
      <div className="tab-navigation">
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.color}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Component for rendering individual role tables
  const RoleTable = ({ users, role, title, icon, color, emptyMessage }) => {
    return (
      <div className={`role-table-container ${color}`}>
        <div className="role-table-header">
          <div className="role-table-title">
            {icon}
            <h3>{title}</h3>
            <span className="role-count">({users.length})</span>
            {showArchived && (
              <span className="archived-indicator">
                <Archive size={14} />
                Archived
              </span>
            )}
          </div>
        </div>

        <div className="role-table-wrapper">
          <table className="role-table">
            <thead>
              <tr>
                <th className="role-table-header-cell">
                  <div className="role-table-header-content">
                    <span>User</span>
                    <ChevronsUpDown size={14} />
                  </div>
                </th>
                <th className="role-table-header-cell">
                  <div className="role-table-header-content">
                    <span>Email</span>
                    <ChevronsUpDown size={14} />
                  </div>
                </th>
                {role === 'administrator' && (
                  <th className="role-table-header-cell">
                    <div className="role-table-header-content">
                      <span>Municipality</span>
                      <ChevronsUpDown size={14} />
                    </div>
                  </th>
                )}
                {role === 'client' && (
                  <>
                    <th className="role-table-header-cell">
                      <div className="role-table-header-content">
                        <span>Phone</span>
                        <ChevronsUpDown size={14} />
                      </div>
                    </th>
                    <th className="role-table-header-cell">
                      <div className="role-table-header-content">
                        <span>Date of Birth</span>
                        <ChevronsUpDown size={14} />
                      </div>
                    </th>
                  </>
                )}
                <th className="role-table-header-cell">
                  <div className="role-table-header-content">
                    <span>Status</span>
                    <ChevronsUpDown size={14} />
                  </div>
                </th>
                <th className="role-table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="role-table-row">
                    <td>
                      <div className="user-info-cell">
                        <div className={`user-avatar-small ${color}`}>
                          {getUserAvatar(user.first_name, user.last_name)}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.first_name} {user.last_name}</div>
                          <div className="user-fullname">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`} className="user-email">
                        {user.email}
                      </a>
                    </td>
                    {role === 'administrator' && (
                      <td>
                        <span className="municipality-badge">
                          {user.municipality || 'N/A'}
                        </span>
                      </td>
                    )}
                    {role === 'client' && (
                      <>
                        <td>
                          <span className="phone-number">
                            {user.phone_number || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="date-of-birth">
                            {formatDate(user.date_of_birth)}
                          </span>
                        </td>
                      </>
                    )}
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions-cell">
                        <button
                          className="user-action-btn edit"
                          onClick={() => openEditModal(user)}
                          aria-label={`Edit ${user.first_name} ${user.last_name}`}
                        >
                          <Edit size={16} />
                        </button>
                        {showArchived ? (
                          <button
                            className="user-action-btn restore"
                            onClick={() => handleRestoreUser(user.id)}
                            aria-label={`Restore ${user.first_name} ${user.last_name}`}
                          >
                            <RotateCcw size={16} />
                          </button>
                        ) : (
                          <button
                            className="user-action-btn archive"
                            onClick={() => handleArchiveUser(user.id)}
                            aria-label={`Archive ${user.first_name} ${user.last_name}`}
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === 'administrator' ? 6 : role === 'client' ? 7 : 5} className="role-table-empty">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        {icon}
                      </div>
                      <p>{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="user-management-container">
      {/* Loading and Error States */}
      {loading && (
        <div className="user-management-loading">
          <Loader2 className="user-management-spinner" size={18} />
          <span>Loading users...</span>
        </div>
      )}

      {error && (
        <div className="user-management-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="user-management-error-close"
            aria-label="Close error message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <header className="user-management-header">
        <div className="user-management-header-content">
          <h2 className="user-management-title">
            <UserCog size={24} className="user-management-title-icon" />
            User Management
          </h2>
          <div className="user-management-actions">
            <button
              className="user-management-refresh-btn"
              onClick={fetchUsers}
              aria-label="Refresh user list"
            >
              <RefreshCw size={16} />
              <span className="user-management-tooltip">Refresh</span>
            </button>
            <button 
              className={`user-management-archive-btn ${showArchived ? 'active' : ''}`}
              onClick={() => setShowArchived(!showArchived)}
              aria-label={showArchived ? "Show active users" : "Show archived users"}
            >
              <Archive size={16} />
              <span>{showArchived ? 'Show Active' : 'Show Archived'}</span>
            </button>
            <button className="user-management-add-btn" onClick={openAddModal}>
              <UserPlus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        <div className="user-management-controls">
          <div className="user-management-search">
            <Search className="user-management-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search users by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-management-search-input"
            />
          </div>

          <div className="user-management-filter-wrapper">
            <div className="user-management-filter-btn-group">
              <button
                className="user-management-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
              <ChevronDown
                size={16}
                className={`user-management-filter-chevron ${showFilters ? 'open' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              />
            </div>

            {showFilters && (
              <div className="user-management-filter-dropdown">
                <div className="user-management-filter-group">
                  <h4 className="user-management-filter-title">
                    <Filter size={14} /> Role
                  </h4>
                  <div className="user-management-filter-options">
                    {[
                      {
                        value: 'all',
                        label: 'All Roles',
                        icon: <Circle size={12} />,
                      },
                      {
                        value: 'administrator',
                        label: 'Admins',
                        icon: <ShieldCheck size={12} />,
                      },
      {
        value: 'police_officer', // Add this
        label: 'Police Officers',
        icon: <ShieldHalf size={12} />, // Use appropriate icon
      },
                      {
                        value: 'client',
                        label: 'Clients',
                        icon: <User size={12} />,
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="user-management-filter-option"
                      >
                        <input
                          type="radio"
                          id={`role-${option.value}`}
                          name="roleFilter"
                          value={option.value}
                          checked={roleFilter === option.value}
                          onChange={() => setRoleFilter(option.value)}
                          className="user-management-filter-radio"
                        />
                        <label htmlFor={`role-${option.value}`}>
                          {option.icon}
                          <span>{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="user-management-filter-group">
                  <h4 className="user-management-filter-title">
                    <UserCheck size={14} /> Status
                  </h4>
                  <div className="user-management-filter-options">
                    {[
                      {
                        value: 'all',
                        label: 'All Statuses',
                        icon: <Circle size={12} />,
                      },
                      {
                        value: 'active',
                        label: 'Active',
                        icon: <UserCheck2 size={12} />,
                      },
                      {
                        value: 'inactive',
                        label: 'Inactive',
                        icon: <UserX size={12} />,
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="user-management-filter-option"
                      >
                        <input
                          type="radio"
                          id={`status-${option.value}`}
                          name="statusFilter"
                          value={option.value}
                          checked={statusFilter === option.value}
                          onChange={() => setStatusFilter(option.value)}
                          className="user-management-filter-radio"
                        />
                        <label htmlFor={`status-${option.value}`}>
                          {option.icon}
                          <span>{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'administrator' && (
          <RoleTable
            users={administrators}
            role="administrator"
            title="Municipality Administrators"
            icon={<ShieldCheck size={20} />}
            color="admin"
            emptyMessage={showArchived ? "No archived municipality administrators found" : "No municipality administrators found"}
          />
        )}

        {activeTab === 'police_officer' && (
          <RoleTable
            users={policeOfficers}
            role="police_officer"
            title="Police Officers"
            icon={<ShieldHalf size={20} />}
            color="police"
            emptyMessage={showArchived ? "No archived police officers found" : "No police officers found"}
          />
        )}

        {activeTab === 'client' && (
          <RoleTable
            users={clients}
            role="client"
            title="Firearm Owners"
            icon={<User size={20} />}
            color="client"
            emptyMessage={showArchived ? "No archived firearm owners found" : "No firearm owners found"}
          />
        )}
      </div>

      {/* Summary Footer */}
      <footer className="user-management-summary">
        <div className="summary-stats">
          <div className="summary-stat admin">
            <ShieldCheck size={18} />
            <span className="stat-number">{administrators.length}</span>
            <span className="stat-label">Administrators</span>
          </div>
          <div className="summary-stat police">
            <ShieldHalf size={18} />
            <span className="stat-number">{policeOfficers.length}</span>
            <span className="stat-label">Police Officers</span>
          </div>
          <div className="summary-stat client">
            <User size={18} />
            <span className="stat-number">{clients.length}</span>
            <span className="stat-label">Firearm Owners</span>
          </div>
          <div className="summary-stat total">
            <UserCog size={18} />
            <span className="stat-number">{filteredUsers.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
      </footer>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Edit size={20} className="modal-icon" />
                Edit User: {editingUser.first_name} {editingUser.last_name}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-column">
                <div className="form-section">
                  <h4>
                    <User size={16} /> Basic Information
                  </h4>
                  <div className="form-group">
                    <label>
                      <Mail size={14} /> Email
                    </label>
                    <div className="input-with-icon">
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                  </div>


                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={editFormData.first_name}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={editFormData.last_name}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <Calendar size={14} /> Date of Birth
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={editFormData.date_of_birth}
                        onChange={handleEditFormChange}
                        className="modal-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <Phone size={14} /> Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone_number"
                        value={editFormData.phone_number}
                        onChange={handleEditFormChange}
                        className="modal-input"
                        placeholder="Enter Philippine phone number (e.g., 09123456789)"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <MapPin size={14} /> Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditFormChange}
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4>
                    <UserCheck size={16} /> Account Status
                  </h4>
                  <div className="form-group">
                    <label>Status</label>
                    <div className="status-selector">
                      <label
                        className={`status-option ${editFormData.is_active ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="is_active"
                          value={true}
                          checked={editFormData.is_active}
                          onChange={() =>
                            handleEditFormChange({
                              target: { name: 'is_active', value: true },
                            })
                          }
                        />
                        <Check size={16} />
                        <span>Active</span>
                      </label>

                      <label
                        className={`status-option ${!editFormData.is_active ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="is_active"
                          value={false}
                          checked={!editFormData.is_active}
                          onChange={() =>
                            handleEditFormChange({
                              target: { name: 'is_active', value: false },
                            })
                          }
                        />
                        <X size={16} />
                        <span>Inactive</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveChanges}>
                <Save size={16} className="btn-icon" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="add-user-modal-overlay" onClick={closeModal}>
          <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-user-modal-header">
              <div className="add-user-modal-title">
                <UserPlus size={20} className="add-user-modal-icon" />
                <h3>Add New User</h3>
              </div>
              <button className="add-user-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className={`add-user-modal-body ${user?.role === 'administrator' ? 'admin-layout' : ''}`}>
              {/* Single optimized layout for administrators */}
              {user?.role === 'administrator' ? (
                <div className="add-user-form-single-column">
                  <div className="add-user-form-section">
                    <div className="add-user-section-header">
                      <User size={16} />
                      <h4>Add Firearm Owner</h4>
                    </div>

                    {/* Basic Information Row */}
                    <div className="add-user-form-row">
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <Mail size={14} />
                          <span>Email <span className="required">*</span></span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newUserForm.email}
                          onChange={handleNewUserChange}
                          className={`add-user-input ${formErrors.email ? 'add-user-input-error' : ''}`}
                          placeholder="Enter email address"
                        />
                        {formErrors.email && (
                          <span className="add-user-error-message">
                            {formErrors.email}
                          </span>
                        )}
                      </div>

                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <Phone size={14} />
                          <span>Phone Number <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          name="phone_number"
                          value={newUserForm.phone_number}
                          onChange={handleNewUserChange}
                          className={`add-user-input ${formErrors.phone_number ? 'add-user-input-error' : ''}`}
                          placeholder="Enter Philippine phone number (e.g., 09123456789)"
                        />
                        {formErrors.phone_number && (
                          <span className="add-user-error-message">
                            {formErrors.phone_number}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name Information Row */}
                    <div className="add-user-form-row">
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <User size={14} />
                          <span>First Name <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={newUserForm.first_name}
                          onChange={handleNewUserChange}
                          className={`add-user-input ${formErrors.first_name ? 'add-user-input-error' : ''}`}
                          placeholder="Enter first name"
                        />
                        {formErrors.first_name && (
                          <span className="add-user-error-message">
                            {formErrors.first_name}
                          </span>
                        )}
                      </div>

                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <User size={14} />
                          <span>Last Name <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={newUserForm.last_name}
                          onChange={handleNewUserChange}
                          className={`add-user-input ${formErrors.last_name ? 'add-user-input-error' : ''}`}
                          placeholder="Enter last name"
                        />
                        {formErrors.last_name && (
                          <span className="add-user-error-message">
                            {formErrors.last_name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date of Birth Row */}
                    <div className="add-user-form-row">
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <Calendar size={14} />
                          <span>Date of Birth <span className="required">*</span></span>
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={newUserForm.date_of_birth}
                          onChange={handleNewUserChange}
                          className={`add-user-input ${formErrors.date_of_birth ? 'add-user-input-error' : ''}`}
                        />
                        {formErrors.date_of_birth && (
                          <span className="add-user-error-message">
                            {formErrors.date_of_birth}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Address Information Section */}
                    <div className="add-user-section-header" style={{ marginTop: '24px' }}>
                      <MapPin size={16} />
                      <h4>Address Information</h4>
                    </div>

                    {/* Address Row 1: Province and Municipality */}
                    <div className="add-user-form-row">
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <MapPin size={14} />
                          <span>Province <span className="required">*</span></span>
                        </label>
                        <select
                          value={selectedProvince}
                          onChange={handleProvinceChange}
                          className={`add-user-input ${formErrors.province ? 'add-user-input-error' : ''}`}
                        >
                          <option value="">Select Province</option>
                          {Object.keys(REGION_1_DATA).map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        {formErrors.province && (
                          <span className="add-user-error-message">
                            {formErrors.province}
                          </span>
                        )}
                      </div>

                      {selectedProvince && (
                        <div className="add-user-form-group">
                          <label className="add-user-input-label">
                            <MapPin size={14} />
                            <span>Municipality <span className="required">*</span></span>
                          </label>
                          <select
                            value={selectedMunicipality}
                            onChange={handleMunicipalityChange}
                            className={`add-user-input ${formErrors.municipality ? 'add-user-input-error' : ''}`}
                          >
                            <option value="">Select Municipality</option>
                            {availableMunicipalities.map(municipality => (
                              <option key={municipality} value={municipality}>{municipality}</option>
                            ))}
                          </select>
                          {formErrors.municipality && (
                            <span className="add-user-error-message">
                              {formErrors.municipality}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Address Row 2: Barangay and House Number */}
                    <div className="add-user-form-row">
                      {selectedMunicipality && (
                        <div className="add-user-form-group">
                          <label className="add-user-input-label">
                            <MapPin size={14} />
                            <span>Barangay <span className="required">*</span></span>
                          </label>
                          <select
                            value={selectedBarangay}
                            onChange={handleBarangayChange}
                            className={`add-user-input ${formErrors.barangay ? 'add-user-input-error' : ''}`}
                          >
                            <option value="">Select Barangay</option>
                            {availableBarangaysForRegion.map(barangay => (
                              <option key={barangay} value={barangay}>{barangay}</option>
                            ))}
                          </select>
                          {formErrors.barangay && (
                            <span className="add-user-error-message">
                              {formErrors.barangay}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <MapPin size={14} />
                          <span>House Number <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          value={newUserForm.houseNumber}
                          onChange={handleHouseNumberChange}
                          placeholder="Enter house number"
                          className={`add-user-input ${formErrors.houseNumber ? 'add-user-input-error' : ''}`}
                        />
                        {formErrors.houseNumber && (
                          <span className="add-user-error-message">
                            {formErrors.houseNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Real-time address preview */}
                    {getFullAddress() && (
                      <div className="address-preview" style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} style={{ color: '#0369a1' }} />
                          <span style={{ color: '#0369a1', fontWeight: '500' }}>
                            Complete Address: {getFullAddress()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Original two-column layout for police officers and superusers */
                <>
                  {/* Left Column - Account Information */}
                  <div className="add-user-form-column">
                    <div className="add-user-form-section">
                      <div className="add-user-section-header">
                        <User size={16} />
                        <h4>Account Information</h4>
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
                          className={`add-user-input ${formErrors.email ? 'add-user-input-error' : ''}`}
                          placeholder="Enter email"
                        />
                        {formErrors.email && (
                          <span className="add-user-error-message">
                            {formErrors.email}
                          </span>
                        )}
                      </div>

                      {/* Role selector for police officers and superusers */}
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <UserCog size={14} />
                          <span>Role</span>
                        </label>
                        <div className="add-user-role-selector">
                          {/* Only show administrator role option for police officers and superusers */}
                          {(user?.role === 'police_officer' || user?.role === 'superuser') && (
                            <label
                              className={`add-user-role-option ${newUserForm.role === 'administrator' ? 'add-user-role-active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="role"
                                value="administrator"
                                checked={newUserForm.role === 'administrator'}
                                onChange={(e) => {
                                  handleNewUserChange(e);
                                  // Reset admin regional state when switching to administrator
                                  setSelectedAdminProvince('');
                                  setSelectedAdminMunicipality('');
                                  setAvailableAdminMunicipalities([]);
                                }}
                              />
                              <div className="add-user-role-content">
                                <ShieldCheck size={16} />
                                <span>Municipality</span>
                              </div>
                            </label>
                          )}

                          {/* Only show police officer role option for police officers */}
                          {user?.role === 'police_officer' && (
                            <label
                              className={`add-user-role-option ${newUserForm.role === 'police_officer' ? 'add-user-role-active' : ''}`}
                            >
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
                          )}

                          {/* Show superuser role option for superusers only */}
                          {user?.role === 'superuser' && (
                            <label
                              className={`add-user-role-option ${newUserForm.role === 'superuser' ? 'add-user-role-active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="role"
                                value="superuser"
                                checked={newUserForm.role === 'superuser'}
                                onChange={handleNewUserChange}
                              />
                              <div className="add-user-role-content">
                                <ShieldCheck size={16} />
                                <span>Superuser</span>
                              </div>
                            </label>
                          )}

                          {/* Show client role option for police officers and superusers */}
                          {(user?.role === 'police_officer' || user?.role === 'superuser') && (
                            <label
                              className={`add-user-role-option ${newUserForm.role === 'client' ? 'add-user-role-active' : ''}`}
                            >
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
                          )}
                        </div>
                        {formErrors.role && (
                          <span className="add-user-error-message">
                            {formErrors.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Personal Information */}
                  <div className="add-user-form-column">
                    <div className="add-user-form-section">
                      <div className="add-user-section-header">
                        <UserCheck size={16} />
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

                      {/* Phone number field for all roles */}
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <Phone size={14} />
                          <span>Phone Number <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          name="phone_number"
                          value={newUserForm.phone_number}
                          onChange={handleNewUserChange}
                          className={`add-user-input ${formErrors.phone_number ? 'add-user-input-error' : ''}`}
                          placeholder="Enter Philippine phone number (e.g., 09123456789)"
                        />
                        {formErrors.phone_number && (
                          <span className="add-user-error-message">
                            {formErrors.phone_number}
                          </span>
                        )}
                      </div>

                      {/* Only show date of birth for client role */}
                      {newUserForm.role === 'client' && (
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
                      )}

                  {/* Regional Address System for Client Users */}
                  {newUserForm.role === 'client' && (
                    <>
                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <MapPin size={14} />
                          <span>Province <span className="required">*</span></span>
                        </label>
                        <select
                          value={selectedProvince}
                          onChange={handleProvinceChange}
                          className={`add-user-input ${formErrors.province ? 'add-user-input-error' : ''}`}
                        >
                          <option value="">Select Province</option>
                          {Object.keys(REGION_1_DATA).map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        {formErrors.province && (
                          <span className="add-user-error-message">
                            {formErrors.province}
                          </span>
                        )}
                      </div>

                      {selectedProvince && (
                        <div className="add-user-form-group">
                          <label className="add-user-input-label">
                            <MapPin size={14} />
                            <span>Municipality <span className="required">*</span></span>
                          </label>
                          <select
                            value={selectedMunicipality}
                            onChange={handleMunicipalityChange}
                            className={`add-user-input ${formErrors.municipality ? 'add-user-input-error' : ''}`}
                          >
                            <option value="">Select Municipality</option>
                            {availableMunicipalities.map(municipality => (
                              <option key={municipality} value={municipality}>{municipality}</option>
                            ))}
                          </select>
                          {formErrors.municipality && (
                            <span className="add-user-error-message">
                              {formErrors.municipality}
                            </span>
                          )}
                        </div>
                      )}

                      {selectedMunicipality && (
                        <div className="add-user-form-group">
                          <label className="add-user-input-label">
                            <MapPin size={14} />
                            <span>Barangay <span className="required">*</span></span>
                          </label>
                          <select
                            value={selectedBarangay}
                            onChange={handleBarangayChange}
                            className={`add-user-input ${formErrors.barangay ? 'add-user-input-error' : ''}`}
                          >
                            <option value="">Select Barangay</option>
                            {availableBarangaysForRegion.map(barangay => (
                              <option key={barangay} value={barangay}>{barangay}</option>
                            ))}
                          </select>
                          {formErrors.barangay && (
                            <span className="add-user-error-message">
                              {formErrors.barangay}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="add-user-form-group">
                        <label className="add-user-input-label">
                          <MapPin size={14} />
                          <span>House Number <span className="required">*</span></span>
                        </label>
                        <input
                          type="text"
                          value={newUserForm.houseNumber}
                          onChange={handleHouseNumberChange}
                          placeholder="Enter house number"
                          className={`add-user-input ${formErrors.houseNumber ? 'add-user-input-error' : ''}`}
                        />
                        {formErrors.houseNumber && (
                          <span className="add-user-error-message">
                            {formErrors.houseNumber}
                          </span>
                        )}
                      </div>

                      {/* Real-time address preview */}
                      {getFullAddress() && (
                        <div className="address-preview" style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: '6px' }}>
                          <small style={{ color: '#0369a1', fontWeight: '500' }}>
                            Complete Address: {getFullAddress()}
                          </small>
                        </div>
                      )}
                    </>
                  )}

                  {/* Municipality field for police officers and superusers */}
                  {(newUserForm.role === 'police_officer' || newUserForm.role === 'superuser') && (
                    <div className="add-user-form-group">
                      <label className="add-user-input-label">
                        <MapPin size={14} />
                        <span>Municipality</span>
                      </label>

                      <select
                        name="municipality"
                        value={newUserForm.municipality}
                        onChange={handleNewUserChange}
                        className={`add-user-input ${formErrors.municipality ? 'add-user-input-error' : ''}`}
                      >
                        <option value="">Select Municipality</option>
                        {Object.keys(MUNICIPALITIES_WITH_BARANGAYS).map(
                          (municipality) => (
                            <option key={municipality} value={municipality}>
                              {municipality}
                            </option>
                          )
                        )}
                      </select>
                      {formErrors.municipality && (
                        <span className="add-user-error-message">
                          {formErrors.municipality}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="add-user-modal-footer">
          <button
            className="add-user-btn add-user-btn-secondary"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="add-user-btn add-user-btn-primary"
            onClick={handleAddUser}
          >
            <Save size={16} className="add-user-btn-icon" />
            <span>Add User</span>
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default UserList;
