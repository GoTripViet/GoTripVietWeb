import { useState } from "react";

export default function App() {
  const [from, setFrom] = useState("HAN");
  const [to, setTo] = useState("SGN");
  const [date, setDate] = useState("");

  function search(e) {
    e.preventDefault();
    alert(`Searching flights: ${from} → ${to} on ${date}`);
  }

  return (
    <div className="container py-5">
      <h2 className="h4 mb-4">Booking</h2>
      <form className="row g-3" onSubmit={search}>
        <div className="col-md-3">
          <label className="form-label">From</label>
          <select
            className="form-select"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            <option value="HAN">Hà Nội (HAN)</option>
            <option value="DAD">Đà Nẵng (DAD)</option>
            <option value="SGN">TP.HCM (SGN)</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">To</label>
          <select
            className="form-select"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          >
            <option value="SGN">TP.HCM (SGN)</option>
            <option value="DAD">Đà Nẵng (DAD)</option>
            <option value="HAN">Hà Nội (HAN)</option>
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Date</label>
          <input
            className="form-control"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="submit">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
