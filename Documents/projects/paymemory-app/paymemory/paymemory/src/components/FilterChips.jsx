function FilterChips() {
  const filters = ["All", "Rent", "Food", "Loan"];

  return (
    <div className="filters">
      {filters.map((f) => (
        <button key={f}>{f}</button>
      ))}
    </div>
  );
}

export default FilterChips;