import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import {
  Lock, Mail, User, Shield, KeyRound, Sparkles, BookOpen, AlertCircle,
  Camera, Upload, CheckCircle2, Image as ImageIcon, Award, CreditCard,
  Phone, MapPin, Compass, Globe, Save, RefreshCw, Eye, EyeOff, Hash,
  GraduationCap, Check, BookMarked, Sparkle, ExternalLink
} from 'lucide-react';

export const ALL_DEPARTMENTS = [
  { value: "Software Systems (M.Sc SS / Integrated)", en: "Software Systems (M.Sc SS / Integrated)", ta: "மென்பொருள் அமைப்புகள் (M.Sc SS)" },
  { value: "Computer Science and Engineering", en: "Computer Science and Engineering (CSE)", ta: "கணினி அறிவியல் மற்றும் பொறியியல் (CSE)" },
  { value: "Information Technology", en: "Information Technology (IT)", ta: "தகவல் தொழில்நுட்பம் (IT)" },
  { value: "Artificial Intelligence and Data Science", en: "Artificial Intelligence and Data Science (AI & DS)", ta: "செயற்கை நுண்ணறிவு மற்றும் தரவு அறிவியல் (AI & DS)" },
  { value: "Artificial Intelligence and Machine Learning", en: "Artificial Intelligence and Machine Learning (AI & ML)", ta: "செயற்கை நுண்ணறிவு மற்றும் இயந்திர கற்றல் (AI & ML)" },
  { value: "Computer Science and Design", en: "Computer Science and Design (CSD)", ta: "கணினி அறிவியல் மற்றும் வடிவமைப்பு (CSD)" },
  { value: "Computer Science and Business Systems", en: "Computer Science and Business Systems (CSBS)", ta: "கணினி அறிவியல் மற்றும் வணிக அமைப்புகள் (CSBS)" },
  { value: "Electronics and Communication Engineering", en: "Electronics and Communication Engineering (ECE)", ta: "மின்னணு மற்றும் தகவல் தொடர்பு பொறியியல் (ECE)" },
  { value: "Electrical and Electronics Engineering", en: "Electrical and Electronics Engineering (EEE)", ta: "மின் மற்றும் மின்னணு பொறியியல் (EEE)" },
  { value: "Electronics and Instrumentation Engineering", en: "Electronics and Instrumentation Engineering (EIE)", ta: "மின்னணு மற்றும் கருவிசார் பொறியியல் (EIE)" },
  { value: "Mechanical Engineering", en: "Mechanical Engineering (MECH)", ta: "இயந்திரவியல் பொறியியல் (MECH)" },
  { value: "Mechatronics Engineering", en: "Mechatronics Engineering (MTS)", ta: "மெக்கட்ரானிக்ஸ் பொறியியல் (MTS)" },
  { value: "Civil Engineering", en: "Civil Engineering (CIVIL)", ta: "சிவில் பொறியியல் (CIVIL)" },
  { value: "Chemical Engineering", en: "Chemical Engineering (CHEM)", ta: "வேதியியல் பொறியியல் (CHEM)" },
  { value: "Food Technology", en: "Food Technology (FT)", ta: "உணவு தொழில்நுட்பம் (FT)" },
  { value: "Biotechnology", en: "Biotechnology (BT)", ta: "உயிரி தொழில்நுட்பவியல் (Biotechnology)" },
  { value: "Automobile Engineering", en: "Automobile Engineering (AUTO)", ta: "தானியங்கி பொறியியல் (Automobile)" },
  { value: "Master of Computer Applications", en: "Master of Computer Applications (MCA)", ta: "முதுகலை கணினி பயன்பாடுகள் (MCA)" },
  { value: "Master of Business Administration", en: "Master of Business Administration (MBA)", ta: "முதுகலை வணிக நிர்வாகம் (MBA)" },
  { value: "Science and Humanities", en: "Science & Humanities / Mathematics", ta: "அறிவியல் மற்றும் மனிதவியல் (S&H)" },
  { value: "Faculty & Research Staff", en: "Faculty / Research Scholars & Staff", ta: "ஆசிரியர்கள் மற்றும் ஆராய்ச்சி பணியாளர்கள்" }
];

export function Login({ setActiveTab }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(isTamil ? `நல்வரவு, ${user.name}!` : `Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN' || user.role === 'LIBRARIAN') setActiveTab('admin-dashboard');
      else setActiveTab('student-dashboard');
    } catch (err) {
      setError(err.message || (isTamil ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.' : 'Invalid email or password.'));
      toast.error(err.message || (isTamil ? 'உள்நுழைவு தோல்வியடைந்தது.' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@smartlib.edu');
      setPassword('Admin@12345');
    } else if (role === 'librarian') {
      setEmail('librarian@smartlib.edu');
      setPassword('Librarian@12345');
    } else {
      setEmail('student@smartlib.edu');
      setPassword('Student@12345');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {t('welcomeBack', 'Welcome Back')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isTamil ? 'உங்கள் ஸ்மார்ட் நூலக பணியிடத்தை அணுக உள்நுழைக' : 'Sign in to access your smart library workspace'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('email', 'Academic Email Address')}</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="name@smartlib.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>{t('password', 'Password')}</label>
              <button
                type="button"
                onClick={() => setActiveTab('forgot-password')}
                style={{ fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                {isTamil ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?'}
              </button>
            </div>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (isTamil ? 'சரிபார்க்கிறது...' : 'Authenticating...') : (isTamil ? 'பணியிடத்தில் உள்நுழைக' : 'Sign In to Workspace')}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            {t('quickDemoAccounts', 'One-Click Demo Accounts')}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillDemo('admin')}>
              {t('ADMIN', 'Admin')}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillDemo('librarian')}>
              {t('LIBRARIAN', 'Librarian')}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fillDemo('student')}>
              {t('STUDENT', 'Student')}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isTamil ? 'கணக்கு இல்லையா?' : "Don't have an account?"}{' '}
          <button onClick={() => setActiveTab('register')} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {isTamil ? 'இப்போதே பதிவு செய்' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Register({ setActiveTab }) {
  const { register } = useAuth();
  const { toast } = useToast();
  const { t, isTamil } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    department: 'Software Systems (M.Sc SS / Integrated)',
    year: '1st Year',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(isTamil ? 'கடவுச்சொற்கள் பொருந்தவில்லை.' : 'Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError(isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      toast.success(isTamil ? `கணக்கு உருவாக்கப்பட்டது! நல்வரவு, ${user.name}!` : `Account created! Welcome, ${user.name}!`);
      setActiveTab('student-dashboard');
    } catch (err) {
      setError(err.message || (isTamil ? 'பதிவு தோல்வியடைந்தது.' : 'Registration failed.'));
      toast.error(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {t('registerTitle', 'Student & Faculty Library Registration')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {isTamil ? 'மத்திய நூலக சேவைகளை அணுக கணக்கை உருவாக்கவும்' : 'Create your Central Library account to access borrowing & AI recommendations'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('fullName', 'Full Name')} *</label>
              <input type="text" name="name" required className="form-input" value={formData.name} onChange={handleChange} placeholder="e.g. Alex Chen" />
            </div>

            <div className="form-group">
              <label className="form-label">{t('studentId', 'Student ID / Roll No')} *</label>
              <input type="text" name="studentId" required className="form-input" value={formData.studentId} onChange={handleChange} placeholder="e.g. 24ISR001" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('email', 'Academic / Personal Email')} *</label>
              <input type="email" name="email" required className="form-input" value={formData.email} onChange={handleChange} placeholder="user@smartlib.edu" />
            </div>

            <div className="form-group">
              <label className="form-label">{isTamil ? 'தொலைபேசி' : 'Phone'}</label>
              <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('department', 'Department')}</label>
              <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                {ALL_DEPARTMENTS.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {isTamil ? dept.ta : dept.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('academicYear', 'Academic Year')}</label>
              <select name="year" className="form-select" value={formData.year} onChange={handleChange}>
                <option value="1st Year">{isTamil ? '1-ஆம் ஆண்டு' : '1st Year'}</option>
                <option value="2nd Year">{isTamil ? '2-ஆம் ஆண்டு' : '2nd Year'}</option>
                <option value="3rd Year">{isTamil ? '3-ஆம் ஆண்டு' : '3rd Year'}</option>
                <option value="4th Year">{isTamil ? '4-ஆம் ஆண்டு' : '4th Year'}</option>
                <option value="5th Year">{isTamil ? '5-ஆம் ஆண்டு' : '5th Year'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">{t('password', 'Password')} *</label>
              <input type="password" name="password" required className="form-input" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            </div>

            <div className="form-group">
              <label className="form-label">{t('confirmPassword', 'Confirm Password')} *</label>
              <input type="password" name="confirmPassword" required className="form-input" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (isTamil ? 'கணக்கு உருவாக்கப்படுகிறது...' : 'Creating Account...') : (isTamil ? 'நூலக உறுப்பினராக பதிவு செய்' : 'Complete Registration')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already registered?'}{' '}
          <button onClick={() => setActiveTab('login')} style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {isTamil ? 'இங்கே உள்நுழைக' : 'Sign In here'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const { t, isTamil, lang, setLanguage } = useLanguage();
  const fileInputRef = useRef(null);

  const [activeSubTab, setActiveSubTab] = useState('personal'); // personal, avatar, card, security
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    department: user?.department || 'Software Systems (M.Sc SS / Integrated)',
    year: user?.year || '1st Year',
    bio: user?.bio || '',
    interests: user?.interests || 'Cloud Computing, Distributed Systems, Machine Learning',
    address: user?.address || 'Campus Hostel / Residential Block',
    preferredLanguage: user?.preferredLanguage || lang
  });

  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Curated Preset Avatars
  const presetAvatars = [
    { id: 'av-1', label: 'Male Scholar', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&crop=faces' },
    { id: 'av-2', label: 'Female Scholar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&crop=faces' },
    { id: 'av-3', label: 'Researcher', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&crop=faces' },
    { id: 'av-4', label: 'Tech Specialist', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&crop=faces' },
    { id: 'av-5', label: 'AI Engineer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&crop=faces' },
    { id: 'av-6', label: 'Systems Analyst', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&crop=faces' },
    { id: 'av-7', label: 'Bot Scholar', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SmartScholar' },
    { id: 'av-8', label: 'Adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AcademicHero' },
    { id: 'av-9', label: 'Micah Art', url: 'https://api.dicebear.com/7.x/micah/svg?seed=SoftwareSystems' },
    { id: 'av-10', label: 'Modern Avataaar', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LibraryPro' }
  ];

  if (!user) return null;

  const currentDisplayAvatar = selectedAvatar || user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;

  // Handle Form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save all personal & academic details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        ...formData,
        avatar: selectedAvatar || user.avatar
      };
      const res = await authAPI.updateProfile(payload);
      if (res.success) {
        updateUserProfile(res.data);
        if (formData.preferredLanguage && formData.preferredLanguage !== lang) {
          setLanguage(formData.preferredLanguage);
        }
        toast.success(isTamil ? 'சுயவிவர விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!' : 'Academic profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'சுயவிவரத்தை சேமிக்க முடியவில்லை.' : 'Failed to update profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  // Upload Photo File
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isTamil ? 'தயவுசெய்து ஒரு செல்லுபடியாகும் படக் கோப்பைத் தேர்ந்தெடுக்கவும்.' : 'Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isTamil ? 'படத்தின் அளவு 5MB க்கும் குறைவாக இருக்க வேண்டும்.' : 'Image size must be under 5MB.');
      return;
    }

    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('avatar', file);

    try {
      const res = await authAPI.uploadAvatar(fd);
      if (res.success && res.avatarUrl) {
        setSelectedAvatar(res.avatarUrl);
        updateUserProfile(res.data);
        toast.success(isTamil ? 'சுயவிவரப் படம் வெற்றிகரமாக பதிவேற்றப்பட்டது!' : 'Profile picture updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'படம் பதிவேற்றம் தோல்வியடைந்தது.' : 'Failed to upload image.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Select Preset Avatar
  const handleSelectPreset = async (url) => {
    setSelectedAvatar(url);
    try {
      const res = await authAPI.updateProfile({ avatar: url });
      if (res.success) {
        updateUserProfile(res.data);
        toast.success(isTamil ? 'அவதாரம் மாற்றப்பட்டது!' : 'Avatar applied successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to apply avatar');
    }
  };

  // Apply Custom URL
  const handleApplyCustomUrl = async (e) => {
    e.preventDefault();
    if (!customAvatarUrl.trim()) return;
    setSelectedAvatar(customAvatarUrl.trim());
    try {
      const res = await authAPI.updateProfile({ avatar: customAvatarUrl.trim() });
      if (res.success) {
        updateUserProfile(res.data);
        toast.success(isTamil ? 'சுயவிவரப் படம் URL மூலம் புதுப்பிக்கப்பட்டது!' : 'Profile picture updated from URL!');
        setCustomAvatarUrl('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update avatar from URL');
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast.error(isTamil ? 'புதிய கடவுச்சொற்கள் பொருந்தவில்லை.' : 'New passwords do not match.');
      return;
    }
    if (pwdData.newPassword.length < 6) {
      toast.error(isTamil ? 'புதிய கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'New password must be at least 6 characters long.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await authAPI.changePassword({
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      });
      if (res.success) {
        toast.success(isTamil ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.' : 'Password updated successfully.');
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.message || (isTamil ? 'கடவுச்சொல்லை மாற்ற முடியவில்லை.' : 'Failed to change password.'));
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
      />

      {/* Hero Profile Header Card */}
      <div
        className="card"
        style={{
          padding: '2rem 2.25rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar with Upload badge */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #ec4899 100%)',
                  boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
                  cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current?.click()}
                title={isTamil ? "படத்தை மாற்ற கிளிக் செய்க" : "Click to upload new photo"}
              >
                <img
                  src={currentDisplayAvatar}
                  alt={user.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 'var(--radius-full)',
                    objectFit: 'cover',
                    background: 'var(--bg-primary)'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  transition: 'transform 0.15s ease'
                }}
                title={isTamil ? "சாதனத்திலிருந்து படம் பதிவேற்று" : "Upload photo from device"}
              >
                {uploadingAvatar ? <RefreshCw size={15} className="spin" /> : <Camera size={15} />}
              </button>
            </div>

            {/* User Title & Badges */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {user.name}
                </h1>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : user.role === 'LIBRARIAN' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(79, 70, 229, 0.15)',
                    color: user.role === 'ADMIN' ? 'var(--danger)' : user.role === 'LIBRARIAN' ? '#a855f7' : 'var(--primary)',
                    border: '1px solid currentColor'
                  }}
                >
                  {t(user.role, user.role)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> {isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified Member'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <GraduationCap size={16} style={{ color: 'var(--primary)' }} />
                  {formData.department} • {formData.year}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Hash size={16} style={{ color: 'var(--text-muted)' }} />
                  {user.studentId || formData.studentId || 'ID: NOT-SET'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.85rem 1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {user.booksBorrowedCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isTamil ? 'மொத்த கடன்கள்' : 'Total Loans'}
              </div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
                {user.role === 'STUDENT' ? '5 Books' : '15 Books'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isTamil ? 'அனுமதிக்கப்பட்ட வரம்பு' : 'Quota Limit'}
              </div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                $0.00
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isTamil ? 'நிலுவை அபராதம்' : 'Active Fines'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', overflowX: 'auto' }}>
          {[
            { id: 'personal', label: isTamil ? 'தனிப்பட்ட & கல்வி விவரங்கள்' : 'Personal & Academic Info', icon: User },
            { id: 'avatar', label: isTamil ? 'சுயவிவரப் படம் & அவதாரம்' : 'Profile Picture & Avatar', icon: Camera },
            { id: 'card', label: isTamil ? 'டிஜிட்டல் நூலக அட்டை' : 'Digital Library Pass', icon: CreditCard },
            { id: 'security', label: isTamil ? 'பாதுகாப்பு & கடவுச்சொல்' : 'Security & Password', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.875rem',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  background: active ? 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' : 'transparent',
                  border: active ? '1px solid transparent' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Personal & Academic Information */}
      {activeSubTab === 'personal' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {isTamil ? 'கல்வி மற்றும் தனிப்பட்ட தகவல்கள்' : 'Personal & Academic Profile Information'}
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {isTamil ? 'உங்கள் பெயர், துறை, தொடர்பு விவரங்கள் மற்றும் ஆராய்ச்சி ஆர்வங்களை புதுப்பிக்கவும்' : 'Update your official academic records, contact numbers, and syllabus interests'}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              style={{ gap: '6px' }}
            >
              <Camera size={15} />
              <span>{isTamil ? 'புகைப்படத்தை மாற்று' : 'Change Photo'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">{t('fullName', 'Full Name')} *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Chen"
                />
              </div>

              {/* Student / Employee ID */}
              <div className="form-group">
                <label className="form-label">{t('studentId', 'Student ID / Roll Number')} *</label>
                <input
                  type="text"
                  name="studentId"
                  required
                  className="form-input"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 24ISR001"
                />
              </div>

              {/* Academic Email (Read Only) */}
              <div className="form-group">
                <label className="form-label">
                  {t('email', 'Academic Email')} ({isTamil ? 'மாற்ற முடியாது' : 'Verified Read-Only'})
                </label>
                <input
                  type="email"
                  disabled
                  className="form-input"
                  value={user.email}
                  style={{ opacity: 0.75, cursor: 'not-allowed', background: 'var(--bg-secondary)' }}
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">{isTamil ? 'தொடர்பு தொலைபேசி எண்' : 'Contact Phone Number'}</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="form-label">{t('department', 'Academic Department / Program')}</label>
                <select
                  name="department"
                  className="form-select"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {ALL_DEPARTMENTS.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {isTamil ? dept.ta : dept.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div className="form-group">
                <label className="form-label">{t('academicYear', 'Academic Year / Class Standing')}</label>
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="1st Year">{isTamil ? '1-ஆம் ஆண்டு' : '1st Year'}</option>
                  <option value="2nd Year">{isTamil ? '2-ஆம் ஆண்டு' : '2nd Year'}</option>
                  <option value="3rd Year">{isTamil ? '3-ஆம் ஆண்டு' : '3rd Year'}</option>
                  <option value="4th Year">{isTamil ? '4-ஆம் ஆண்டு' : '4th Year'}</option>
                  <option value="5th Year">{isTamil ? '5-ஆம் ஆண்டு' : '5th Year (Final Year)'}</option>
                  <option value="Postgraduate">{isTamil ? 'முதுகலை / பி.எச்.டி' : 'Postgraduate / Ph.D Scholar'}</option>
                  <option value="Faculty">{isTamil ? 'ஆசிரியர் / பணியாளர்' : 'Faculty / Library Staff'}</option>
                </select>
              </div>
            </div>

            {/* Campus Address */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">{isTamil ? 'வளாக விடுதி / குடியிருப்பு முகவரி' : 'Campus Hostel / Residential Address'}</label>
              <input
                type="text"
                name="address"
                className="form-input"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. Kaveri Hostel, Room 304, Campus South Avenue"
              />
            </div>

            {/* Academic Bio */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">{isTamil ? 'சுயவிவரக் குறிப்பு & ஆராய்ச்சி நோக்கம்' : 'Academic Bio & Research Focus'}</label>
              <textarea
                name="bio"
                rows={3}
                className="form-input"
                style={{ resize: 'vertical' }}
                value={formData.bio}
                onChange={handleChange}
                placeholder={isTamil ? "உங்கள் படிப்பு, ஆராய்ச்சி தலைப்பு மற்றும் ஆர்வமுள்ள பகுதிகளைப் பற்றி எழுதுங்கள்..." : "Brief overview of your academic focus, projects, and learning objectives..."}
              />
            </div>

            {/* Specialization Interests */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">{isTamil ? 'விருப்பப் பாடங்கள் & சிறப்புப் புலங்கள் (AI பரிந்துரைகளுக்கு உதவும்)' : 'Course Interests & Specializations (Powers AI Book Recommendations)'}</label>
              <input
                type="text"
                name="interests"
                className="form-input"
                value={formData.interests}
                onChange={handleChange}
                placeholder="e.g. Distributed Systems, Neural Networks, React, Operating Systems"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                {isTamil ? 'கமாவால் பிரிக்கப்பட்ட முக்கிய வார்த்தைகள் உங்கள் தனிப்பயனாக்கப்பட்ட நூலக பரிந்துரைகளை மேம்படுத்துகிறது.' : 'Comma-separated keywords help the SmartLib TF-IDF recommendation engine tailor textbooks to your syllabus.'}
              </span>
            </div>

            {/* Preferred Language */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">{isTamil ? 'விருப்பமான கணினி மொழி' : 'Preferred System Language'}</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="preferredLanguage"
                    value="en"
                    checked={formData.preferredLanguage === 'en'}
                    onChange={handleChange}
                  />
                  <span>English (Global)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="preferredLanguage"
                    value="ta"
                    checked={formData.preferredLanguage === 'ta'}
                    onChange={handleChange}
                  />
                  <span>தமிழ் (Tamil Localization)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ padding: '0.75rem 2rem', fontWeight: 700 }}
              >
                {savingProfile ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>{isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving Changes...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{isTamil ? 'சுயவிவர மாற்றங்களைச் சேமி' : 'Save Profile Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Profile Picture & Avatar Studio */}
      {activeSubTab === 'avatar' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Current Avatar Preview & Direct File Upload */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {isTamil ? 'தற்போதைய சுயவிவரப் படம்' : 'Current Profile Picture'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {isTamil ? 'உங்கள் கணினி அல்லது கைபேசியிலிருந்து புதிய புகைப்படத்தை பதிவேற்றவும்' : 'Upload a high-resolution photo from your local computer or phone'}
            </p>

            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: 'var(--radius-full)',
                padding: '5px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #ec4899 100%)',
                boxShadow: '0 12px 32px rgba(79, 70, 229, 0.4)',
                marginBottom: '1.5rem',
                position: 'relative'
              }}
            >
              <img
                src={currentDisplayAvatar}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  background: 'var(--bg-primary)'
                }}
              />
              {uploadingAvatar && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '5px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={24} className="spin" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{isTamil ? 'பதிவேற்றுகிறது...' : 'Uploading...'}</span>
                </div>
              )}
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <Upload size={18} />
                <span>{uploadingAvatar ? (isTamil ? 'பதிவேற்றப்படுகிறது...' : 'Uploading Picture...') : (isTamil ? 'சாதனத்திலிருந்து பதிவேற்று' : 'Upload from Local Device')}</span>
              </button>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isTamil ? 'ஆதரிக்கப்படும் வடிவங்கள்: JPG, PNG, WEBP (அதிகபட்சம் 5MB)' : 'Supported file formats: JPG, PNG, WEBP (Max 5MB)'}
              </div>
            </div>

            {/* Custom URL Input */}
            <div style={{ width: '100%', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', textAlign: 'left' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {isTamil ? 'அல்லது இணையப் பட URL ஐ உள்ளிடுக' : 'Or Paste Web Image Link (URL)'}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  className="form-input"
                  style={{ fontSize: '0.85rem' }}
                  placeholder="https://images.unsplash.com/..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleApplyCustomUrl}
                  disabled={!customAvatarUrl.trim()}
                >
                  {isTamil ? 'பயன்படுத்து' : 'Apply'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Curated Academic Avatar Presets */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {isTamil ? 'முன்அமைக்கப்பட்ட கல்வி அவதாரங்கள்' : 'Curated Academic Avatar Presets'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {isTamil ? 'உங்களுக்குப் பிடித்த அவதாரத்தை ஒரே கிளிக்கில் தேர்ந்தெடுங்கள்' : 'Instantly pick an academic portrait or tech character for your library profile'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
              {presetAvatars.map((av) => {
                const isSelected = selectedAvatar === av.url || (!selectedAvatar && user.avatar === av.url);
                return (
                  <div
                    key={av.id}
                    onClick={() => handleSelectPreset(av.url)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      background: isSelected ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-secondary)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-full)',
                        objectFit: 'cover',
                        border: '2px solid rgba(255,255,255,0.1)'
                      }}
                    />
                    <span style={{ fontSize: '0.725rem', fontWeight: 600, marginTop: '8px', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', textAlign: 'center' }}>
                      {av.label}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '18px',
                          height: '18px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Digital Academic Library Pass */}
      {activeSubTab === 'card' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '2rem 2.25rem',
              boxShadow: '0 20px 40px rgba(30, 27, 75, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Watermark Logo */}
            <div
              style={{
                position: 'absolute',
                right: '-30px',
                bottom: '-30px',
                opacity: 0.08,
                transform: 'rotate(-15deg)',
                pointerEvents: 'none'
              }}
            >
              <BookOpen size={240} />
            </div>

            {/* Top Row: Institution Name & Hologram */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#cbd5e1', fontWeight: 700 }}>
                  Library Management System • Central Library
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '2px' }}>
                  Digital Library Smart Membership Pass
                </div>
              </div>

              {/* Holographic Chip */}
              <div
                style={{
                  width: '42px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #fcd34d 0%, #b45309 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                  border: '1px solid #d97706',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '2px' }} />
              </div>
            </div>

            {/* Center Row: Photo + Information */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <img
                src={currentDisplayAvatar}
                alt={user.name}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  flexShrink: 0
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginTop: '2px' }}>
                  {formData.department} ({formData.year})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block' }}>ID / Roll No</span>
                    <strong style={{ fontSize: '0.85rem', letterSpacing: '0.04em' }}>{user.studentId || formData.studentId || '24ISR001'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block' }}>Membership Role</span>
                    <strong style={{ fontSize: '0.85rem' }}>{user.role}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Barcode Simulation & Verification Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1rem' }}>
              <div>
                {/* Simulated Barcode */}
                <div style={{ display: 'flex', gap: '2px', height: '28px', alignItems: 'stretch' }}>
                  {[3,1,2,1,4,2,1,3,1,2,3,1,2,1,4,1,3,2,1,2,4,1,2,3,1,2,1,3,2].map((w, idx) => (
                    <div key={idx} style={{ width: `${w * 1.5}px`, background: '#ffffff', opacity: 0.9 }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.15em', marginTop: '4px' }}>
                  * {user.studentId || formData.studentId || '24ISR001'} *
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <CheckCircle2 size={13} /> {isTamil ? 'செயலில் உள்ள அட்டை' : 'ACTIVE DIGITAL PASS'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                  Valid Thru: June 2027
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.print()}
              style={{ gap: '6px' }}
            >
              <CreditCard size={15} />
              <span>{isTamil ? 'நூலக அட்டையை அச்சிடு / சேமி' : 'Print / Export Smart Digital Pass'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Password */}
      {activeSubTab === 'security' && (
        <div style={{ maxWidth: '580px', margin: '0 auto', width: '100%' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {isTamil ? 'கடவுச்சொல் மேலாண்மை' : 'Change Account Password'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {isTamil ? 'உங்கள் கணக்கின் பாதுகாப்பைப் பராமரிக்க வலுவான கடவுச்சொல்லைப் பயன்படுத்தவும்' : 'Ensure your academic account stays protected with a strong, secure passphrase'}
            </p>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">{isTamil ? 'தற்போதைய கடவுச்சொல்' : 'Current Password'} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    required
                    className="form-input"
                    value={pwdData.currentPassword}
                    onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">{isTamil ? 'புதிய கடவுச்சொல்' : 'New Password'} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    required
                    className="form-input"
                    value={pwdData.newPassword}
                    onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                    placeholder={isTamil ? 'குறைந்தது 6 எழுத்துகள்' : 'Minimum 6 characters'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">{isTamil ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்து' : 'Confirm New Password'} *</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={pwdData.confirmPassword}
                  onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwdLoading}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}
              >
                {pwdLoading ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>{isTamil ? 'மாற்றப்படுகிறது...' : 'Updating Password...'}</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>{isTamil ? 'கடவுச்சொல்லை மாற்று' : 'Update Password'}</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.825rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                {isTamil ? 'பாதுகாப்பு குறிப்பு' : 'Security Best Practices'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>{isTamil ? 'குறைந்தது 8 எழுத்துகள், எண்கள் மற்றும் குறியீடுகளைப் பயன்படுத்தவும்.' : 'Use at least 8 characters including numbers and symbols.'}</li>
                <li>{isTamil ? 'பொது கணினிகளில் நூலகத்தைப் பயன்படுத்திய பிறகு வெளியேற மறக்காதீர்கள்.' : 'Always sign out after accessing library workstations.'}</li>
                <li>{isTamil ? 'உங்கள் மாணவர் பாஸ் மற்றும் பார்கோடை யாருடனும் பகிர வேண்டாம்.' : 'Never share your barcode or digital credentials with others.'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ForgotPassword({ setActiveTab }) {
  const { toast } = useToast();
  const { isTamil } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success(isTamil ? 'கடவுச்சொல் மீட்பு வழிமுறைகள் அனுப்பப்பட்டன.' : 'Password reset instructions dispatched.');
    } catch (err) {
      toast.error(err.message || 'Request failed.');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>
          {isTamil ? 'கடவுச்சொல் மீட்டமைப்பு' : 'Reset Password'}
        </h2>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: 'var(--success)', fontWeight: 600 }}>
              {isTamil ? 'மீட்பு இணைப்பு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டுள்ளது.' : 'A reset link has been dispatched to your email address.'}
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveTab('login')}>
              {isTamil ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{isTamil ? 'பதிவு செய்யப்பட்ட மின்னஞ்சல்' : 'Registered Academic Email'}</label>
              <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@smartlib.edu" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              {isTamil ? 'மீட்பு இணைப்பு அனுப்பு' : 'Send Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button type="button" onClick={() => setActiveTab('login')} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isTamil ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
