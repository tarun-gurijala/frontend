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
        `http://64.126.41.240:5010/api/patientFeedback/byLegacyPatientId/${patientId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setPatientData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load patient data"
      );
      console.error("Error fetching patient data:", err);
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

    // Get all unique keys from all feedback rows
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
            <div className="measure-info"></div>
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
                <span className="label">Patient ID:</span>
                <span className="value">{patientData.patientId}</span>
              </div>
              <div className="info-item">
                <span className="label">Legacy ID:</span>
                <span className="value">{patientData.legacyPatientId}</span>
              </div>
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">
                  {patientData.patientName.firstName}{" "}
                  {patientData.patientName.lastName}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{patientData.emailId}</span>
              </div>
            </div>
          </div>
        )}

        {patientData?.measuresWithFeedback && (
          <div className="measures-container">
            <h3>Measures and Feedback</h3>
            {patientData.measuresWithFeedback.map((measure, index) => (
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
