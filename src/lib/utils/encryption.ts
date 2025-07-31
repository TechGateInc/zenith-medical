import CryptoJS from 'crypto-js'

// AES-256 Encryption for PHI Data (HIPAA/PIPEDA Compliance)

/**
 * Generate a random encryption key (256-bit)
 * Use this only once to generate your ENCRYPTION_KEY for .env
 */
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}

/**
 * Generate a random initialization vector (128-bit)
 * Use this only once to generate your ENCRYPTION_IV for .env
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString()
}

/**
 * Encrypt sensitive PHI data using AES-256-CBC
 */
export function encryptPHI(data: string): string {
  const key = process.env.ENCRYPTION_KEY
  const iv = process.env.ENCRYPTION_IV

  if (!key || !iv) {
    throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV must be set in environment variables')
  }

  if (key.length !== 64) { // 32 bytes = 64 hex characters
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters) long')
  }

  if (iv.length !== 32) { // 16 bytes = 32 hex characters
    throw new Error('ENCRYPTION_IV must be 16 bytes (32 hex characters) long')
  }

  try {
    const keyWordArray = CryptoJS.enc.Hex.parse(key)
    const ivWordArray = CryptoJS.enc.Hex.parse(iv)
    
    const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    return encrypted.toString()
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt PHI data')
  }
}

/**
 * Decrypt sensitive PHI data using AES-256-CBC
 */
export function decryptPHI(encryptedData: string): string {
  const key = process.env.ENCRYPTION_KEY
  const iv = process.env.ENCRYPTION_IV

  if (!key || !iv) {
    throw new Error('ENCRYPTION_KEY and ENCRYPTION_IV must be set in environment variables')
  }

  try {
    const keyWordArray = CryptoJS.enc.Hex.parse(key)
    const ivWordArray = CryptoJS.enc.Hex.parse(iv)
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWordArray, {
      iv: ivWordArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty string')
    }

    return decryptedString
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt PHI data')
  }
}

/**
 * Hash sensitive data for searching (one-way)
 * Use for email lookup while maintaining privacy
 */
export function hashForSearch(data: string): string {
  return CryptoJS.SHA256(data.toLowerCase().trim()).toString()
}

/**
 * Validate encryption configuration
 */
export function validateEncryptionConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!process.env.ENCRYPTION_KEY) {
    errors.push('ENCRYPTION_KEY environment variable is not set')
  } else if (process.env.ENCRYPTION_KEY.length !== 64) {
    errors.push('ENCRYPTION_KEY must be 32 bytes (64 hex characters) long')
  }
  
  if (!process.env.ENCRYPTION_IV) {
    errors.push('ENCRYPTION_IV environment variable is not set')
  } else if (process.env.ENCRYPTION_IV.length !== 32) {
    errors.push('ENCRYPTION_IV must be 16 bytes (32 hex characters) long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Test encryption/decryption functionality
 */
export function testEncryption(): { isWorking: boolean; error?: string } {
  try {
    const testData = 'Test encryption data'
    const encrypted = encryptPHI(testData)
    const decrypted = decryptPHI(encrypted)
    
    if (decrypted !== testData) {
      return { isWorking: false, error: 'Decrypted data does not match original' }
    }
    
    return { isWorking: true }
  } catch (error) {
    return { 
      isWorking: false, 
      error: error instanceof Error ? error.message : 'Unknown encryption error' 
    }
  }
}

/**
 * Encrypt an entire patient intake object
 */
export interface EncryptedPatientData {
  legalFirstName: string
  legalLastName: string
  middleName?: string
  preferredName?: string
  title?: string
  dateOfBirth: string
  gender?: string
  phoneNumber: string
  cellPhone?: string
  workPhone?: string
  emailAddress: string
  streetAddress: string
  city: string
  provinceState: string
  postalZipCode: string
  nextOfKinName: string
  nextOfKinPhone: string
  relationshipToPatient: string
  primaryLanguage?: string
  preferredLanguage?: string
  healthInformationNumber: string
}

export interface PlainPatientData {
  legalFirstName: string
  legalLastName: string
  middleName?: string
  preferredName?: string
  title?: string
  dateOfBirth: string
  gender?: string
  phoneNumber: string
  cellPhone?: string
  workPhone?: string
  emailAddress: string
  streetAddress: string
  city: string
  provinceState: string
  postalZipCode: string
  nextOfKinName: string
  nextOfKinPhone: string
  relationshipToPatient: string
  primaryLanguage?: string
  preferredLanguage?: string
  healthInformationNumber: string
}

export function encryptPatientData(data: PlainPatientData): EncryptedPatientData {
  return {
    legalFirstName: encryptPHI(data.legalFirstName),
    legalLastName: encryptPHI(data.legalLastName),
    middleName: data.middleName ? encryptPHI(data.middleName) : undefined,
    preferredName: data.preferredName ? encryptPHI(data.preferredName) : undefined,
    title: data.title ? encryptPHI(data.title) : undefined,
    dateOfBirth: encryptPHI(data.dateOfBirth),
    gender: data.gender ? encryptPHI(data.gender) : undefined,
    phoneNumber: encryptPHI(data.phoneNumber),
    cellPhone: data.cellPhone ? encryptPHI(data.cellPhone) : undefined,
    workPhone: data.workPhone ? encryptPHI(data.workPhone) : undefined,
    emailAddress: encryptPHI(data.emailAddress),
    streetAddress: encryptPHI(data.streetAddress),
    city: encryptPHI(data.city),
    provinceState: encryptPHI(data.provinceState),
    postalZipCode: encryptPHI(data.postalZipCode),
    nextOfKinName: encryptPHI(data.nextOfKinName),
    nextOfKinPhone: encryptPHI(data.nextOfKinPhone),
    relationshipToPatient: encryptPHI(data.relationshipToPatient),
    primaryLanguage: data.primaryLanguage ? encryptPHI(data.primaryLanguage) : undefined,
    preferredLanguage: data.preferredLanguage ? encryptPHI(data.preferredLanguage) : undefined,
    healthInformationNumber: encryptPHI(data.healthInformationNumber),
  }
}

export function decryptPatientData(data: EncryptedPatientData): PlainPatientData {
  try {
    return {
      legalFirstName: data.legalFirstName ? decryptPHI(data.legalFirstName) : '',
      legalLastName: data.legalLastName ? decryptPHI(data.legalLastName) : '',
      middleName: data.middleName ? decryptPHI(data.middleName) : undefined,
      preferredName: data.preferredName ? decryptPHI(data.preferredName) : undefined,
      title: data.title ? decryptPHI(data.title) : undefined,
      dateOfBirth: data.dateOfBirth ? decryptPHI(data.dateOfBirth) : '',
      gender: data.gender ? decryptPHI(data.gender) : undefined,
      phoneNumber: data.phoneNumber ? decryptPHI(data.phoneNumber) : '',
      cellPhone: data.cellPhone ? decryptPHI(data.cellPhone) : undefined,
      workPhone: data.workPhone ? decryptPHI(data.workPhone) : undefined,
      emailAddress: data.emailAddress ? decryptPHI(data.emailAddress) : '',
      streetAddress: data.streetAddress ? decryptPHI(data.streetAddress) : '',
      city: data.city ? decryptPHI(data.city) : '',
      provinceState: data.provinceState ? decryptPHI(data.provinceState) : '',
      postalZipCode: data.postalZipCode ? decryptPHI(data.postalZipCode) : '',
      nextOfKinName: data.nextOfKinName ? decryptPHI(data.nextOfKinName) : '',
      nextOfKinPhone: data.nextOfKinPhone ? decryptPHI(data.nextOfKinPhone) : '',
      relationshipToPatient: data.relationshipToPatient ? decryptPHI(data.relationshipToPatient) : '',
      primaryLanguage: data.primaryLanguage ? decryptPHI(data.primaryLanguage) : undefined,
      preferredLanguage: data.preferredLanguage ? decryptPHI(data.preferredLanguage) : undefined,
      healthInformationNumber: data.healthInformationNumber ? decryptPHI(data.healthInformationNumber) : '',
    }
  } catch (error) {
    console.error('Error in decryptPatientData:', error)
    console.error('Data received:', JSON.stringify(data, null, 2))
    throw new Error(`Failed to decrypt patient data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 