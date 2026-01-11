import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import locationApi from "../../api/locationApi"; // You need to add requestLocation here

export default function LocationRequestModal({ show, onHide, onSuccess }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        setError("");

        try {
            const res = await locationApi.requestNew({ name });
            const newLoc = res.data || res;

            onSuccess(newLoc);
            setName("");
            onHide();
        } catch (err) {
            console.error("Lỗi chi tiết:", err);
            setError(err.response?.data?.message || "Failed to request location");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Request New Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p className="text-muted small">
                    Please check the list carefully before requesting.
                    Your location will be usable immediately but marked as "Pending" until Admin approves.
                </p>
                <Form.Group>
                    <Form.Label className="fw-bold">Location Name</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Quy Nhon, Pu Luong..."
                        autoFocus
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading || !name}>
                    {loading ? "Sending..." : "Submit Request"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}