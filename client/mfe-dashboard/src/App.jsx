function Stat({ label, value }) {
  return (
    <div className="col-md-4">
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="text-muted small">{label}</div>
          <div className="h3 mb-0 fw-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="container py-5">
      <h2 className="h4 mb-4">Dashboard</h2>
      <div className="row">
        <Stat label="Bookings (today)" value="42" />
        <Stat label="Revenue (VND)" value="88,500,000" />
        <Stat label="Active users" value="1,284" />
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h6">Overview</h3>
          <p className="mb-0">This is a sample dashboard micro‑frontend.</p>
        </div>
      </div>
    </div>
  );
}
