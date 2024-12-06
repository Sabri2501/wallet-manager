import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import './App.css';

function App() {
  const [budgets, setBudgets] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const categories = ['Food', 'Transport', 'Leisure', 'Bills', 'Others'];

  const handleAddBudget = () => {
    if (monthYear && !budgets[monthYear]) {
      setBudgets((prevBudgets) => ({
        ...prevBudgets,
        [monthYear]: {
          budget: 0,
          totalSpent: 0,
        },
      }));
    }
  };

  const handleSetBudget = (month) => {
    const budgetAmount = prompt(`Set budget for ${month}:`, 0);
    if (budgetAmount !== null && !isNaN(budgetAmount)) {
      setBudgets((prevBudgets) => ({
        ...prevBudgets,
        [month]: {
          ...prevBudgets[month],
          budget: parseFloat(budgetAmount),
        },
      }));
    }
  };

  const addTransaction = () => {
    if (!selectedMonth || amount <= 0 || !category) {
      alert('Please fill out all fields.');
      return;
    }

    const currentBudget = budgets[selectedMonth];
    if (currentBudget) {
      const remainingBudget = currentBudget.budget - currentBudget.totalSpent;

      if (remainingBudget < amount) {
        alert('You do not have enough budget to add this transaction.');
        return;
      }

      const newTransaction = {
        monthYear: selectedMonth,
        date: new Date().toLocaleDateString(),
        amount: parseFloat(amount),
        category: category,
      };

      setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
      currentBudget.totalSpent += parseFloat(amount);
      setBudgets({ ...budgets, [selectedMonth]: currentBudget });

      setAmount('');
      setCategory('');
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      const total = transactions
        .filter((transaction) => transaction.monthYear === selectedMonth)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      setBudgets((prevBudgets) => ({
        ...prevBudgets,
        [selectedMonth]: {
          ...prevBudgets[selectedMonth],
          totalSpent: total,
        },
      }));
    }
  }, [transactions, selectedMonth]);

  const getChartData = () => {
    if (!selectedMonth) return { options: {}, series: [] };

    const monthlyTransactions = transactions.filter(
      (transaction) => transaction.monthYear === selectedMonth
    );

    const categoryTotals = {};
    monthlyTransactions.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });

    const categories = Object.keys(categoryTotals);
    const data = categories.map((category) => categoryTotals[category]);

    return {
      options: {
        chart: {
          type: 'pie',
          width: '100%',
        },
        labels: categories,
        theme: {
          monochrome: {
            enabled: true,
            color: '#008FFB',
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '60%',
            },
          },
        },
        title: {
          text: 'Spending Breakdown',
          align: 'center',
        },
      },
      series: data,
    };
  };

  const chartData = getChartData();

  // Calculate the remaining budget for the selected month
  const getRemainingBudget = (month) => {
    if (budgets[month]) {
      return (budgets[month].budget - budgets[month].totalSpent).toFixed(2);
    }
    return null;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Wallet Manager</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Set Budget for a Month</h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            style={{ marginRight: '10px', flex: 1 }}
          />
          <button onClick={handleAddBudget}>Add Budget</button>
        </div>
        <p>Budgets:</p>
        <ul>
          {Object.keys(budgets).map((month) => (
            <li key={month} style={{ display: 'flex', alignItems: 'center' }}>
              {month} - Budget: ${budgets[month].budget.toFixed(2)} | Spent: ${budgets[month].totalSpent.toFixed(2)}
              <span style={{ marginLeft: '10px' }}>
                Remaining: ${getRemainingBudget(month) !== null ? getRemainingBudget(month) : 'N/A'}
              </span>
              {budgets[month].totalSpent > budgets[month].budget && (
                <span style={{ color: 'red', marginLeft: '10px' }}>ALERT: Budget exceeded!</span>
              )}
              {budgets[month].totalSpent === budgets[month].budget && (
                <span style={{ color: 'orange', marginLeft: '10px' }}>You have spent all of your budget!</span>
              )}
              <button onClick={() => handleSetBudget(month)} style={{ marginLeft: '10px' }}>
                Set Budget
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Add Transaction</h2>
        <div style={{ marginBottom: '10px' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ marginRight: '10px' }}
          >
            <option value="">Select Month</option>
            {Object.keys(budgets).map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginRight: '10px' }}
          >
            <option value="">Select Category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            onClick={addTransaction}
            className="button"
            disabled={
              !selectedMonth ||
              amount <= 0 ||
              !category ||
              (budgets[selectedMonth] && budgets[selectedMonth].totalSpent >= budgets[selectedMonth].budget)
            }
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <h2>Transactions for {selectedMonth}</h2>
        {transactions.filter((transaction) => transaction.monthYear === selectedMonth).length === 0 ? (
          <p>No transactions for this month yet.</p>
        ) : (
          <ul>
            {transactions.filter((transaction) => transaction.monthYear === selectedMonth).map((transaction, index) => (
              <li key={index}>
                {transaction.date} - {transaction.category}: ${transaction.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Budget Summary for {selectedMonth}</h2>
        {selectedMonth && (
          <p>
            Budget: ${budgets[selectedMonth].budget.toFixed(2)} | Spent: ${budgets[selectedMonth].totalSpent.toFixed(2)}
            | Remaining: ${getRemainingBudget(selectedMonth)}
            {budgets[selectedMonth].totalSpent > budgets[selectedMonth].budget && (
              <span style={{ color: 'red', marginLeft: '10px' }}>ALERT: Budget exceeded!</span>
            )}
            {budgets[selectedMonth].totalSpent === budgets[selectedMonth].budget && (
              <span style={{ color: 'orange', marginLeft: '10px' }}>You have spent all of your budget!</span>
            )}
          </p>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>Spending Chart</h2>
        {selectedMonth && chartData.series.length > 0 ? (
          <Chart options={chartData.options} series={chartData.series} type="pie" width="100%" />
        ) : (
          <p>No data available for the selected month.</p>
        )}
      </div>
    </div>
  );
}

export default App;
