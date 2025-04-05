import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import './App.css';

function App() {
  // State management
  const [budgets, setBudgets] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [categories, setCategories] = useState(['Food', 'Transport', 'Leisure', 'Bills', 'Others']);

  // Load data from localStorage
  useEffect(() => {
    const savedBudgets = localStorage.getItem('budgets');
    const savedTransactions = localStorage.getItem('transactions');
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [budgets, transactions]);

  // Add new budget month
  const handleAddBudget = () => {
    if (monthYear && !budgets[monthYear]) {
      setBudgets(prev => ({
        ...prev,
        [monthYear]: { budget: 0, totalSpent: 0 }
      }));
    }
  };

  // Edit budget with validation
  const handleSetBudget = (month) => {
    const currentBudget = budgets[month]?.budget || 0;
    const totalSpent = budgets[month]?.totalSpent || 0;
    
    const budgetAmount = prompt(
      `Set budget for ${month}\nCurrent: $${currentBudget}\nSpent: $${totalSpent}`,
      currentBudget
    );
    
    if (budgetAmount === null) return;
    if (isNaN(budgetAmount)) return alert("Please enter a valid number");
    
    const newBudget = parseFloat(budgetAmount);
    if (newBudget < totalSpent) {
      return alert(`Budget ($${newBudget}) cannot be less than spent ($${totalSpent})`);
    }
    
    setBudgets(prev => ({
      ...prev,
      [month]: { ...prev[month], budget: newBudget }
    }));
  };

  // Handle amount input (numbers only)
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAmount(value);
  };

  // Handle category selection
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setShowCustomCategory(value === 'Others');
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory)) {
      setCategories([...categories.slice(0, -1), customCategory, 'Others']);
      setCategory(customCategory);
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  // Add new transaction
  const addTransaction = () => {
    if (!selectedMonth || !amount || !category) {
      return alert('Please fill all fields');
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return alert('Amount must be positive');

    const currentBudget = budgets[selectedMonth];
    if (!currentBudget) return;

    if (currentBudget.totalSpent + amountNum > currentBudget.budget) {
      return alert('This would exceed your budget');
    }

    const newTransaction = {
      id: Date.now(),
      monthYear: selectedMonth,
      date: new Date().toLocaleDateString(),
      amount: amountNum,
      category
    };

    setTransactions(prev => [...prev, newTransaction]);
    setBudgets(prev => ({
      ...prev,
      [selectedMonth]: {
        ...prev[selectedMonth],
        totalSpent: prev[selectedMonth].totalSpent + amountNum
      }
    }));

    setAmount('');
    setCategory('');
  };

  // Calculate remaining budget
  const getRemainingBudget = (month) => {
    if (!budgets[month]) return 0;
    return (budgets[month].budget - budgets[month].totalSpent).toFixed(2);
  };

  // Generate chart data
  const getChartData = () => {
    if (!selectedMonth || !budgets[selectedMonth]) {
      return { options: {}, series: [] };
    }

    const categoryTotals = {};
    transactions
      .filter(t => t.monthYear === selectedMonth)
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return {
      options: {
        chart: { type: 'donut' },
        labels: Object.keys(categoryTotals),
        colors: ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0']
      },
      series: Object.values(categoryTotals)
    };
  };

  return (
    <div className="app-container">
      <header>
        <h1>💰 Wallet Manager</h1>
      </header>

      <main>
        {/* Budget Section */}
        <section className="card">
          <h2>Monthly Budgets</h2>
          <div className="budget-controls">
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
            />
            <button onClick={handleAddBudget}>Add Month</button>
          </div>

          {Object.keys(budgets).map(month => (
            <div key={month} className="budget-item">
              <h3>{month}</h3>
              <div>
                <span>Budget: ${budgets[month].budget.toFixed(2)}</span>
                <span>Spent: ${budgets[month].totalSpent.toFixed(2)}</span>
                <span className={
                  getRemainingBudget(month) < 0 ? 'negative' : 
                  getRemainingBudget(month) == 0 ? 'zero' : 'positive'
                }>
                  Remaining: ${getRemainingBudget(month)}
                </span>
              </div>
              <button onClick={() => handleSetBudget(month)}>Edit</button>
            </div>
          ))}
        </section>

        {/* Transaction Form */}
        <section className="card">
          <h2>Add Transaction</h2>
          <form onSubmit={(e) => { e.preventDefault(); addTransaction(); }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
            >
              <option value="">Select Month</option>
              {Object.keys(budgets).map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount"
              inputMode="decimal"
              required
            />

            <select
              value={category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {showCustomCategory && (
              <div className="custom-category">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="New category name"
                />
                <button 
                  type="button" 
                  onClick={handleAddCustomCategory}
                >
                  Add Category
                </button>
              </div>
            )}

            <button type="submit">Add Transaction</button>
          </form>
        </section>

        {/* Transactions List */}
        {selectedMonth && (
          <section className="card">
            <h2>Transactions for {selectedMonth}</h2>
            <div className="transactions">
              {transactions
                .filter(t => t.monthYear === selectedMonth)
                .map(t => (
                  <div key={t.id} className="transaction">
                    <span>{t.date}</span>
                    <span>{t.category}</span>
                    <span>${t.amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Spending Chart */}
        {selectedMonth && (
          <section className="card">
            <h2>Spending Breakdown</h2>
            <Chart 
              options={getChartData().options} 
              series={getChartData().series} 
              type="donut" 
              width="100%"
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;