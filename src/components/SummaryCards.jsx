import "../styles/AdminDashboard.css";

function SummaryCards({ transactions }) {
  const total = transactions.length;
  const totalAmount = transactions.reduce((acc, txn) => acc + Number(txn.amount), 0);
  const successCount = transactions.filter((txn) => txn.status === "Approved").length;
  const failCount = transactions.filter((txn) => txn.status === "Failed").length;

  const successPercentage = ((successCount / total) * 100).toFixed(2);
  const failPercentage = ((failCount / total) * 100).toFixed(2);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="summary-cards">
      <div className="card">
        <h3>Total Transactions</h3>
        <p>{total} Transactions</p>
      </div>
      <div className="card">
        <h3>Total Amount Processed</h3>
        <p>{formatCurrency(totalAmount)}</p>
      </div>
      <div className="card success">
        <h3>Successful Transactions</h3>
        <p>{successCount} ({successPercentage}%)</p>
      </div>
      <div className="card fail">
        <h3>Failed Transactions</h3>
        <p>{failCount} ({failPercentage}%)</p>
      </div>
    </div>
  );
}

export default SummaryCards;