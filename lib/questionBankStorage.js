// Simple in-memory storage for question banks
// In a real application, this would be replaced with a database

class QuestionBankStorage {
  constructor() {
    this.questionBanks = [];
  }

  // Get all question banks for a user
  getUserQuestionBanks(userEmail) {
    return this.questionBanks.filter(bank => bank.createdBy === userEmail);
  }

  // Add a new question bank
  addQuestionBank(questionBank) {
    this.questionBanks.push(questionBank);
    return questionBank;
  }

  // Get a specific question bank
  getQuestionBank(bankId, userEmail) {
    return this.questionBanks.find(
      bank => bank.id === bankId && bank.createdBy === userEmail
    );
  }

  // Delete a question bank
  deleteQuestionBank(bankId, userEmail) {
    const index = this.questionBanks.findIndex(
      bank => bank.id === bankId && bank.createdBy === userEmail
    );
    
    if (index !== -1) {
      const deletedBank = this.questionBanks.splice(index, 1)[0];
      return deletedBank;
    }
    
    return null;
  }

  // Get all question banks (for admin purposes)
  getAllQuestionBanks() {
    return this.questionBanks;
  }
}

// Create a singleton instance
const questionBankStorage = new QuestionBankStorage();

module.exports = questionBankStorage;