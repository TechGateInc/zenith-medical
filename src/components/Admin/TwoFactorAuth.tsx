'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Copy, Check, AlertCircle, Key, Smartphone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface TwoFactorAuthProps {
  userEmail: string;
  onStatusChange?: (enabled: boolean) => void;
}

interface BackupCode {
  code: string;
  used: boolean;
}

export default function TwoFactorAuth({ userEmail, onStatusChange }: TwoFactorAuthProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [password, setPassword] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth/2fa/status');
      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.enabled);
        onStatusChange?.(data.enabled);
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  const startSetup = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setSecret(data.manualEntryKey);
        setBackupCodes(data.backupCodes);
        setIsSetupMode(true);
        toast.success('2FA setup started. Scan the QR code with your authenticator app.');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to start 2FA setup');
      }
    } catch (error) {
      console.error('2FA setup error:', error);
      toast.error('Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/auth/2fa/setup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsEnabled(true);
        setIsSetupMode(false);
        setVerificationCode('');
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        onStatusChange?.(true);
        toast.success('Two-factor authentication enabled successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error('Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/auth/2fa/setup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim()
        }),
      });

      if (response.ok) {
        setIsEnabled(false);
        setShowDisableForm(false);
        setPassword('');
        setShowBackupCodes(false);
        setBackupCodes([]);
        onStatusChange?.(false);
        toast.success('Two-factor authentication disabled successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('2FA disable error:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const cancelSetup = () => {
    setIsSetupMode(false);
    setQrCode(null);
    setSecret(null);
    setVerificationCode('');
    setBackupCodes([]);
  };

  if (isSetupMode) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Setup Two-Factor Authentication</h3>
            <p className="text-gray-600">Scan the QR code with your authenticator app</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          {qrCode && (
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl">
                <Image src={qrCode} alt="2FA QR Code" className="w-48 h-48 mx-auto" />
              </div>
            </div>
          )}

          {/* Manual Entry */}
          {secret && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Manual Entry Key</h4>
              <p className="text-sm text-gray-600 mb-3">
                If you can't scan the QR code, enter this key manually:
              </p>
              <div className="flex items-center space-x-3">
                <code className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono">
                  {secret}
                </code>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  {copiedCode === secret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code from your app"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={completeSetup}
              disabled={loading || !verificationCode.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </button>
            <button
              onClick={cancelSetup}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6 bg-gradient-to-r from-green-50 to-white rounded-t-2xl px-6 pt-6">
        <div className="flex items-center">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-5 ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Shield className={`w-7 h-7 ${isEnabled ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-green-900 mb-1">Two-Factor Authentication</h3>
            <p className="text-gray-600 text-base">
              {isEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-base font-semibold ${isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{isEnabled ? 'Enabled' : 'Disabled'}</div>
      </div>

      {isEnabled ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800 text-sm font-medium">
                Your account is protected with two-factor authentication
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Key className="w-4 h-4 mr-2" />
              {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
            </button>
            <button
              onClick={() => setShowDisableForm(!showDisableForm)}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
            >
              <Lock className="w-4 h-4 mr-2" />
              Disable 2FA
            </button>
          </div>

          {/* Backup Codes */}
          {showBackupCodes && backupCodes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-800">Backup Codes</h4>
              </div>
              <p className="text-yellow-700 text-sm mb-4">
                Save these backup codes in a secure location. Each code can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <code className="flex-1 bg-white border border-yellow-300 rounded px-2 py-1 text-sm font-mono">
                      {code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(code)}
                      className="p-1 text-yellow-600 hover:text-yellow-700"
                    >
                      {copiedCode === code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disable Form */}
          {showDisableForm && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-800">Disable Two-Factor Authentication</h4>
              </div>
              <p className="text-red-700 text-sm mb-4">
                Enter your password to disable two-factor authentication.
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={disableTwoFactor}
                    disabled={loading || !password.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                  >
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDisableForm(false);
                      setPassword('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-gray-700 text-sm">
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need to enter a code from your authenticator app each time you sign in.
            </p>
          </div>
          <button
            onClick={startSetup}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </button>
        </div>
      )}
    </div>
  );
} 