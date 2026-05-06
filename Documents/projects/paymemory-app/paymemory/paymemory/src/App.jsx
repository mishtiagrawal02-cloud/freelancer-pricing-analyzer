import DashboardHeader from "./components/DashboardHeader";
import SearchBar from "./components/SearchBar";
import TransactionList from "./components/TransactionList";
import SummaryCard from "./components/SummaryCard";
import "./index.css";

function App() {
  return (
    <div className="app">
      <DashboardHeader />
      <SummaryCard />
      <SearchBar />
      <TransactionList />
    </div>
  );
}

export default App;