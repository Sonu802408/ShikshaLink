export const ROLES = {
  PARENT: 'parent',
  TUTOR: 'tutor',
  ADMIN: 'admin'
};

export const TEACHING_MODES = {
  ONLINE: 'online',
  STUDENT_HOME: 'student_home',
  TUTOR_CENTRE: 'tutor_centre'
};

export const BOARDS = [
  'CBSE',
  'ICSE',
  'State Board',
  'NIOS',
  'IB',
  'Cambridge (IGCSE)',
  'Other'
];

export const CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
  'Competitive: JEE', 'Competitive: NEET', 'Competitive: CUET', 'Competitive: Foundation'
];

export const SUBJECTS = [
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Studies',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Computer Science / Coding',
  'Sanskrit',
  'French'
];

export const DEFAULT_LOCALITIES = [
  'Mayur Vihar Phase 1',
  'Mayur Vihar Phase 2',
  'Mayur Vihar Phase 3',
  'Patparganj (IP Extension)',
  'Preet Vihar',
  'Laxmi Nagar',
  'Vasundhara Enclave',
  'Pandav Nagar',
  'Nirman Vihar',
  'Anand Vihar',
  'East Delhi - Other'
];

export const BOOKING_STATUSES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  AWAITING_PAYMENT: 'awaiting_payment',
  ALTERNATIVE_PROPOSED: 'alternative_proposed',
  CONFIRMED: 'confirmed',
  DEMO_COMPLETED: 'demo_completed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLATION_REQUESTED: 'cancellation_requested',
  CANCELLED: 'cancelled',
  REFUND_PENDING: 'refund_pending',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed'
};

export const PAYMENT_STATUSES = {
  CREATED: 'created',
  PAYMENT_PENDING: 'payment_pending',
  PENDING_VERIFICATION: 'pending_verification',
  PAID: 'paid',
  FAILED: 'failed',
  REJECTED: 'rejected',
  REFUND_PENDING: 'refund_pending',
  REFUNDED: 'refunded'
};

export const PAYOUT_STATUSES = {
  ACCRUED: 'accrued',
  PROCESSING: 'processing',
  TRANSFERRED: 'transferred',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled'
};

export const REQUIREMENT_STATUSES = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  MATCHED: 'matched',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};
