// OSCAR REST API Type Definitions

export interface OscarCredentials {
  baseUrl: string
  consumerKey: string
  consumerSecret: string
  token: string
  tokenSecret: string
}

export interface OscarDemographic {
  demographicNo?: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phoneNumber: string
  email: string
  address: string
  city: string
  province: string
  postalCode: string
  healthNumber: string
  programId?: string
  sexDesc?: string
  title?: string
  alias?: string
  chartNo?: string
  officialLanguage?: string
  spokenLanguage?: string
  rosterStatus?: string
  patientStatus?: string
  countryOfOrigin?: string
  anonymized?: string
  hsAllergyFlag?: string
}

export interface OscarDemographicResponse {
  success: boolean
  demographicNo?: string
  message?: string
  error?: string
}

export interface OscarProvider {
  providerNo: string
  firstName: string
  lastName: string
  practitionerNo?: string
  billRegion?: string
  specialty?: string
  team?: string
  sex?: string
  dob?: string
  address?: string
  workPhone?: string
  ohipNo?: string
  rmaNo?: string
  hsoNo?: string
  status?: string
  comments?: string
  providerType?: string
  lastUpdateUser?: string
  lastUpdateDate?: string
  signedConfidentiality?: string
  practNo?: string
  init?: string
  jobTitle?: string
  emailAddress?: string
  supervisor?: string
}

export interface OscarAppointment {
  appointmentNo?: string
  providerNo: string
  appointmentDate: string
  startTime: string
  endTime?: string
  name?: string
  demographicNo?: string
  programId?: string
  notes?: string
  reason?: string
  location?: string
  resources?: string
  type?: string
  style?: string
  billing?: string
  status?: string
  createdBy?: string
  bookingSource?: string
}

export interface OscarAppointmentResponse {
  success: boolean
  appointmentNo?: string
  message?: string
  error?: string
}

export interface OscarQuickSearchResult {
  demographicNo: string
  firstName: string
  lastName: string
  healthNumber: string
  dateOfBirth: string
  chartNo?: string
  rosterStatus?: string
}

export interface OscarQuickSearchResponse {
  success: boolean
  patients?: OscarQuickSearchResult[]
  totalRecords?: number
  message?: string
  error?: string
}

export interface OscarApiError {
  error: string
  message?: string
  statusCode?: number
  details?: any
}

export interface OscarApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
} 