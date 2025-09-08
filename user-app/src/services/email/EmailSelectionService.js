// EmailSelectionService.js - Handles email selection logic with local storage (SRP)
import EmailHistoryService from '../storage/EmailHistoryService';

class EmailSelectionService {
  constructor(onEmailSelect, onBlur) {
    this.onEmailSelect = onEmailSelect;
    this.onBlur = onBlur;
    this.isSelecting = false;
  }

  async selectEmail(email, inputRef) {
    console.log('Selecting email:', email);
    
    this.isSelecting = true;
    
    // Save to local storage
    try {
      await EmailHistoryService.saveEmail(email);
      console.log('Email saved to local storage');
    } catch (error) {
      console.error('Failed to save email to local storage:', error);
    }
    
    this.onEmailSelect(email);
    
    if (inputRef?.current) {
      inputRef.current.blur();
    }
    
    // Reset flag after selection
    setTimeout(() => {
      this.isSelecting = false;
    }, 100);
  }

  handleBlur(value) {
    setTimeout(() => {
      if (!this.isSelecting && this.onBlur) {
        const syntheticEvent = {
          target: { name: 'email', value },
          currentTarget: { name: 'email', value }
        };
        this.onBlur(syntheticEvent);
      }
    }, 200);
  }

  canProcessBlur() {
    return !this.isSelecting;
  }
}

export default EmailSelectionService; 