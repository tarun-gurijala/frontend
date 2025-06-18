import React, { useState } from "react";
import "./PatientLookup.css";

interface PatientName {
  firstName: string;
  lastName: string;
}

interface FeedbackRow {
  [key: string]: any;
}

interface Measure {
  measureId: number;
  measureName: string;
  measuringCadence: string;
  feedbackRows: FeedbackRow[];
}

interface PatientData {
  patientId: number;
  legacyPatientId: string;
  patientName: PatientName;
  emailId: string;
  measuresWithFeedback: Measure[];
}

const PatientLookup: React.FC = () => {
  const [patientId, setPatientId] = useState("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setError("Please enter a patient ID");
      return;
    }

    setIsLoading(true);
    setError("");
    setPatientData(null);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/patientFeedback/byLegacyPatientId/${patientId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.statusText}`);
      }

      const data = await response.json();
      setPatientData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load patient data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getColumnHeaders = (feedbackRows: FeedbackRow[]): string[] => {
    if (feedbackRows.length === 0) return [];

    const allKeys = new Set<string>();
    feedbackRows.forEach((row) => {
      Object.keys(row).forEach((key) => allKeys.add(key));
    });

    return Array.from(allKeys);
  };

  const renderFeedbackTable = (measure: Measure) => {
    const columnHeaders = getColumnHeaders(measure.feedbackRows);

    return (
      <div className="measure-section">
        <div className="measure-header">
          <h3>{measure.measureName}</h3>
          <div className="measure-details">
            <span className="measure-id">ID: {measure.measureId}</span>
            <span className="measure-cadence">{measure.measuringCadence}</span>
          </div>
        </div>

        {measure.feedbackRows.length > 0 ? (
          <div className="feedback-table-container">
            <table className="feedback-table">
              <thead>
                <tr>
                  {columnHeaders.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {measure.feedbackRows.map((feedback, index) => (
                  <tr key={index}>
                    {columnHeaders.map((header) => (
                      <td key={header}>
                        {header.toLowerCase().includes("date")
                          ? formatDate(feedback[header])
                          : feedback[header]?.toString() || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p className="no-records">
              No feedback records available for this measure
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="patient-lookup">
      <h2>Patient Feedback Lookup</h2>
      <div className="lookup-form">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <h3>Patient ID:</h3>
            <input
              type="text"
              placeholder="Enter Patient ID"
              className="patient-id-input"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Search"}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        {patientData && (
          <div className="patient-info">
            <h3>Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">
                  <strong>Patient ID:</strong> {patientData.patientId} ||{" "}
                  <strong>Legacy ID:</strong> {patientData.legacyPatientId} ||{" "}
                  <strong>Name:</strong> {patientData.patientName.firstName}{" "}
                  {patientData.patientName.lastName} || <strong>Email:</strong>{" "}
                  {patientData.emailId}
                </span>
              </div>
            </div>
          </div>
        )}

        {patientData?.measuresWithFeedback && (
          <div className="measures-container">
            <h3>Measures and Feedback</h3>
            {patientData.measuresWithFeedback.map((measure) => (
              <div key={measure.measureId} className="measure-wrapper">
                {renderFeedbackTable(measure)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientLookup;
