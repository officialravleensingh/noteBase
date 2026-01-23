// Application constants
const OTP_TYPES = {
  SIGNUP: 'signup',
  PASSWORD_RESET: 'password-reset',
  PROFILE_UPDATE: 'profile-update',
  PASSWORD_CHANGE: 'password-change',
  PIN_SETUP: 'pin-setup',
  SECTION_PIN_RESET: 'section-pin-reset',
  NOTE_UNLOCK: 'note-unlock',
  MEMORY_DELETE: 'memory-delete',
  JOURNAL_DELETE: 'journal-delete',
  PERMANENT_DELETE: 'permanent-delete',
  EMPTY_RECYCLE_BIN: 'empty-recycle-bin',
  REMINDER_DELETE: 'reminder-delete'
};

const NOTE_TYPES = {
  NORMAL: 'normal',
  JOURNAL: 'journal',
  MEMORY: 'memory'
};

const ITEM_TYPES = {
  NOTE: 'note',
  FOLDER: 'folder',
  MEMORY: 'memory',
  JOURNAL: 'journal',
  REMINDER: 'reminder'
};

const SECTIONS = {
  NOTES: 'notes',
  MEMORIES: 'memories',
  REMINDERS: 'reminders'
};

const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 50000,
  PASSWORD_MIN_LENGTH: 6,
  OTP_LENGTH: 6,
  PIN_LENGTH: 4,
  MAX_NOTES_PER_PAGE: 100,
  DEFAULT_PAGE_SIZE: 10,
  OTP_EXPIRY_MINUTES: 10,
  SESSION_EXPIRY_HOURS: 1
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',
  NOTE_NOT_FOUND: 'Note not found',
  FOLDER_NOT_FOUND: 'Folder not found',
  INVALID_OTP: 'Invalid or expired OTP',
  INVALID_PIN: 'Invalid PIN',
  SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  DUPLICATE_TITLE: 'A note with this title already exists',
  NOTE_LOCKED: 'Note is locked. Please unlock it first.',
  VALIDATION_FAILED: 'Validation failed',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit'
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET: 'Password reset successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  NOTE_CREATED: 'Note created successfully',
  NOTE_UPDATED: 'Note updated successfully',
  NOTE_DELETED: 'Note deleted successfully',
  NOTE_LOCKED: 'Note locked successfully',
  NOTE_UNLOCKED: 'Note unlocked successfully',
  OTP_SENT: 'OTP sent to your email',
  PIN_SET: 'PIN set successfully',
  PIN_RESET: 'PIN reset successfully'
};

const EMAIL_TEMPLATES = {
  SIGNUP: 'signup',
  PASSWORD_RESET: 'password-reset',
  PROFILE_UPDATE: 'profile-update',
  PASSWORD_CHANGE: 'password-change',
  NOTE_UNLOCK: 'note-unlock',
  PIN_SETUP: 'pin-setup',
  SECTION_PIN_RESET: 'section-pin-reset',
  MEMORY_DELETE: 'memory-delete',
  JOURNAL_DELETE: 'journal-delete',
  PERMANENT_DELETE: 'permanent-delete',
  EMPTY_RECYCLE_BIN: 'empty-recycle-bin',
  REMINDER_DELETE: 'reminder-delete',
  REMINDER_NOTIFICATION: 'reminder-notification'
};

const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PIN: /^\d{4}$/,
  OTP: /^\d{6}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/
};

module.exports = {
  OTP_TYPES,
  NOTE_TYPES,
  ITEM_TYPES,
  SECTIONS,
  VALIDATION_LIMITS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EMAIL_TEMPLATES,
  REGEX_PATTERNS
};