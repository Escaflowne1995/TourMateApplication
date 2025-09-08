// useEmailHistory.js - Custom hook for email history (SRP + DIP)
import { useState, useEffect } from 'react';
import EmailHistoryService from '../services/storage/EmailHistoryService';

const useEmailHistory = (currentValue) => {
  const [emailHistory, setEmailHistory] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);

  useEffect(() => {
    loadEmailHistory();
  }, []);

  useEffect(() => {
    filterEmails(currentValue);
  }, [currentValue, emailHistory]);

  const loadEmailHistory = async () => {
    try {
      const history = await EmailHistoryService.getEmailHistory();
      console.log('Email history loaded from AsyncStorage:', history.length, 'emails');
      setEmailHistory(history || []);
    } catch (error) {
      console.error('Error loading email history:', error);
      setEmailHistory([]);
    }
  };

  const filterEmails = (value) => {
    if (value && value.length > 0) {
      const filtered = emailHistory.filter(email =>
        email.toLowerCase().includes(value.toLowerCase()) && 
        email.toLowerCase() !== value.toLowerCase()
      );
      setFilteredEmails(filtered);
    } else {
      setFilteredEmails(emailHistory);
    }
  };

  const removeEmail = async (email) => {
    try {
      await EmailHistoryService.removeEmail(email);
      console.log('Email removed from AsyncStorage');
      await loadEmailHistory();
    } catch (error) {
      console.error('Error removing email:', error);
    }
  };

  return {
    filteredEmails,
    removeEmail,
    refreshHistory: loadEmailHistory
  };
};

export default useEmailHistory; 