import React from "react";
import "../styles/TransactionTable.css";

function TransactionTable({ transactions }) {
  return (
    <div className="transaction-table-container">
      <h2>Transaction History</h2>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>User Name</th> 
            <th>Status</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.length > 0 ? (
            transactions.map((txn, index) => (
              <tr key={index}>
                <td>{txn.userName || "No user found"}</td>
                <td className={txn.status === "Approved" ? "approved" : "failed"}>
                  {txn.status}
                </td>
                <td>{txn.amount}</td>
                <td>{new Date(txn.timestamp).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No transactions available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;