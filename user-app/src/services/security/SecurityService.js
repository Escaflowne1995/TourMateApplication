// Single Responsibility: Only handles security-related operations
class SecurityService {
  constructor(maxAttempts = 5) {
    this.maxAttempts = maxAttempts;
    this.attempts = 0;
  }

  canAttemptLogin() {
    return this.attempts < this.maxAttempts;
  }

  incrementAttempts() {
    this.attempts++;
  }

  resetAttempts() {
    this.attempts = 0;
  }

  getAttempts() {
    return this.attempts;
  }

  getRemainingAttempts() {
    return Math.max(0, this.maxAttempts - this.attempts);
  }
}

export default SecurityService; 