import StatusBadge from "./StatusBadge";

function TransactionCard({ txn }) {
  return (
    <div className="card">
      <div className="top">
        <h3>{txn.name}</h3>
        <span className="amount">₹{txn.amount}</span>
      </div>

      <div className="middle">
        <span className="tag">{txn.tag}</span>
        <StatusBadge status={txn.status} />
      </div>

      <p className="note">{txn.note}</p>
    </div>
  );
}

export default TransactionCard;