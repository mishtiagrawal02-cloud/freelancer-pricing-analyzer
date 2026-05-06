import TransactionCard from "./TransactionCard";
import transactions from "../data/transactions";

function TransactionList() {
  return (
    <div className="list">
      {transactions.map((txn) => (
        <TransactionCard key={txn.id} txn={txn} />
      ))}
    </div>
  );
}

export default TransactionList;