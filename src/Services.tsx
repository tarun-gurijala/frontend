import { useState, useEffect, useRef } from "react";
import "./Services.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Menu,
  MenuItem,
  Spinner,
  Stack,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Grid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  SimpleGrid,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  GridItem,
  MenuButton,
  MenuList,
  useToast,
  background,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  HamburgerIcon,
  AddIcon,
  ViewIcon,
  EditIcon,
} from "@chakra-ui/icons";

interface Prescription {
  measureId: string;
  frequency: string;
  timeUnit: string;
}

interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientInfo: PatientInfo | undefined;
  onSave: (prescription: Prescription) => void;
  onDelete: (measureId: string) => void;
  onUpdatePatientInfo: (patientInfo: PatientInfo) => void;
  onUpdatePrescription: (index: number, newPrescription: Prescription) => void;
  existingPrescriptions: Prescription[];
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (patientInfo: PatientInfo) => void;
  existingPatients: string[];
}

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientInfo: PatientInfo | undefined;
}

interface PatientName {
  firstName: string;
  lastName: string;
}

interface MeasuringCadence {
  frequencyTimes: number;
  frequencyUnit: string;
}

interface AssignedMeasure {
  measureId: number;
  measureName: string;
  measuringCadence: MeasuringCadence;
  _id?: string;
}

interface Patient {
  patientName: PatientName;
  _id: string;
  patientId: number;
  legacyPatientId: string;
  emailId: string;
  assignedMeasures: AssignedMeasure[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  inviteSent?: boolean;
}

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (patient: Patient) => Promise<void>;
  toast: ReturnType<typeof useToast>;
}

interface Measure {
  _id: string;
  measureId: number;
  measureName: string;
  measureItems: Array<{
    scale: {
      lowValue: number;
      lowValueText: string;
      highValue: number;
      highValueText: string;
      interval: number;
    };
    measureItemId: number;
    measureItemName: string;
    measureItemStatus: string;
    _id: string;
  }>;
  measureStatus: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MeatballMenuProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onView: (patient: Patient) => void;
  onInvite: (patient: Patient) => void;
}

interface FeedbackRow {
  [key: string]: string | number;
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

const hardcodedPatients: Patient[] = [];

const EditModal = ({
  isOpen,
  onClose,
  patientId,
  patientInfo,
  onSave,
  onDelete,
  onUpdatePatientInfo,
  onUpdatePrescription,
  existingPrescriptions,
}: EditModalProps) => {
  const [measureId, setMeasureId] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timeUnit, setTimeUnit] = useState("");
  const [error, setError] = useState<string>("");
  const [firstName, setFirstName] = useState(patientInfo?.firstName || "");
  const [lastName, setLastName] = useState(patientInfo?.lastName || "");
  const [email, setEmail] = useState(patientInfo?.email || "");
  const [editingPrescription, setEditingPrescription] = useState<{
    prescription: Prescription;
    index: number;
  } | null>(null);

  const bgColor = "white";
  const borderColor = "#e2e8f0";

  // Update form fields when patientInfo changes
  useEffect(() => {
    if (patientInfo) {
      setFirstName(patientInfo.firstName);
      setLastName(patientInfo.lastName);
      setEmail(patientInfo.email);
    }
  }, [patientInfo]);

  if (!isOpen) return null;

  const handleEditPrescription = (
    prescription: Prescription,
    index: number
  ) => {
    setEditingPrescription({ prescription, index });
    setMeasureId(prescription.measureId);
    setFrequency(prescription.frequency);
    setTimeUnit(prescription.timeUnit);
  };

  const handleCancelEdit = () => {
    setEditingPrescription(null);
    setMeasureId("");
    setFrequency("");
    setTimeUnit("");
  };

  const handleSave = () => {
    // Validate patient information
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Update patient information
    onUpdatePatientInfo({
      id: patientId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });

    // Handle prescription changes
    if (measureId && frequency && timeUnit) {
      const newPrescription = {
        measureId,
        frequency,
        timeUnit,
      };

      if (editingPrescription) {
        // Check if the new measure ID already exists in other prescriptions
        const hasDuplicate = existingPrescriptions.some(
          (p, i) => p.measureId === measureId && i !== editingPrescription.index
        );

        if (hasDuplicate) {
          setError(
            `A prescription with Measure ID ${measureId} already exists for this patient.`
          );
          return;
        }

        // Update specific prescription at its index
        onUpdatePrescription(editingPrescription.index, newPrescription);
        setEditingPrescription(null);
      } else {
        // Check if prescription with this measure ID already exists
        if (existingPrescriptions.some((p) => p.measureId === measureId)) {
          setError(
            `A prescription with Measure ID ${measureId} already exists for this patient.`
          );
          return;
        }
        // Add new prescription
        onSave(newPrescription);
      }

      // Reset prescription form fields
      setMeasureId("");
      setFrequency("");
      setTimeUnit("");
    }

    setError("");
  };

  return isOpen ? (
    <Box
      bg="white"
      border="1px solid #e2e8f0"
      p={6}
      borderRadius="md"
      minW="400px"
    >
      <Heading>Edit Patient Information</Heading>
      {error && (
        <Box bg="red.100" color="red.800" p={2} borderRadius="md" mb={4}>
          {error}
        </Box>
      )}
      <div>
        <Input value={patientId} disabled />
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Flex justify="flex-end" mt={6} gap={3}>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button colorScheme="blue" onClick={handleSave}>
          Save Changes
        </Button>
      </Flex>
    </Box>
  ) : null;
};

const AddPatientModal = ({
  isOpen,
  onClose,
  onAdd,
  existingPatients,
}: AddPatientModalProps) => {
  const [patientId, setPatientId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!patientId.trim()) {
      setError("Patient ID is required");
      return;
    }
    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    // Check for duplicate patient ID
    if (existingPatients.includes(patientId.trim())) {
      setError("A patient with this ID already exists");
      return;
    }

    onAdd({
      id: patientId.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });

    // Reset form fields
    setPatientId("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content black-text">
        <h3>Add New Patient</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <label htmlFor="newPatientId">Patient ID:</label>
          <input
            type="text"
            id="newPatientId"
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setError("");
            }}
            placeholder="Enter patient ID"
            className="black-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError("");
            }}
            placeholder="Enter first name"
            className="black-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
            placeholder="Enter last name"
            className="black-input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter email address"
            className="black-input"
          />
        </div>
        <div className="modal-actions">
          <button onClick={handleAdd} className="save-button">
            Add Patient
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewDetailsModal = ({
  isOpen,
  onClose,
  patientId,
  patientInfo,
}: ViewDetailsModalProps) => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;

      setIsLoading(true);
      setError("");
      setPatientData(null);

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/patientFeedback/byLegacyPatientId/${
            patientData?.legacyPatientId
          }`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch patient data: ${response.statusText}`
          );
        }

        const data = await response.json();
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

    if (isOpen) {
      fetchPatientData();
    }
  }, [isOpen, patientId]);

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
      <Box
        mb={6}
        p={4}
        borderWidth={1}
        borderRadius="lg"
        borderColor="gray.200"
      >
        <VStack align="stretch" spacing={4}>
          <Box>
            <Heading size="md" color="blue.600">
              {measure.measureName}
            </Heading>
            <HStack spacing={4} mt={2}>
              <Badge colorScheme="blue">ID: {measure.measureId}</Badge>
              <Badge colorScheme="green">{measure.measuringCadence}</Badge>
            </HStack>
          </Box>

          {measure.feedbackRows.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {columnHeaders.map((header) => (
                      <Th key={header}>{header}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {measure.feedbackRows.map((feedback, index) => (
                    <Tr key={index}>
                      {columnHeaders.map((header) => (
                        <Td key={header}>
                          {header.toLowerCase().includes("date")
                            ? formatDate(feedback[header] as string)
                            : feedback[header]?.toString() || ""}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Text color="gray.500">
                No feedback records available for this measure
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent maxW="800px" mx={4}>
        <ModalHeader color="blue.600">Patient Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="xl" />
            </Flex>
          ) : patientData ? (
            <VStack spacing={6} align="stretch">
              <Box p={4} bg="gray.50" borderRadius="lg">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Patient ID:</Text>
                    <Text>{patientData.patientId}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Legacy ID:</Text>
                    <Text>{patientData.legacyPatientId}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Name:</Text>
                    <Text>
                      {patientData.patientName.firstName}{" "}
                      {patientData.patientName.lastName}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Email:</Text>
                    <Text>{patientData.emailId}</Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {patientData.measuresWithFeedback && (
                <Box>
                  <Heading size="md" mb={4} color="gray.700">
                    Measures and Feedback
                  </Heading>
                  {patientData.measuresWithFeedback.map((measure) => (
                    <Box key={measure.measureId}>
                      {renderFeedbackTable(measure)}
                    </Box>
                  ))}
                </Box>
              )}
            </VStack>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const EditPatientModal = ({
  isOpen,
  onClose,
  patient,
  onSave,
  toast,
}: EditPatientModalProps) => {
  const navigate = useNavigate();
  const [editedPatient, setEditedPatient] = useState<Patient>(patient);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMeasureIndex, setEditingMeasureIndex] = useState<number | null>(
    null
  );
  const [newMeasure, setNewMeasure] = useState<{
    measureId: number;
    measuringCadence: MeasuringCadence;
  }>({
    measureId: 0,
    measuringCadence: { frequencyTimes: 1, frequencyUnit: "day" },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedPatient(patient);
    fetchMeasures();
  }, [patient]);

  const fetchMeasures = async () => {
    try {
      console.log("Fetching measures...");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/measures/All`
      );
      if (!response.ok) throw new Error("Failed to fetch measures");
      const data = await response.json();
      console.log("Fetched measures data:", data);
      setMeasures(data);
    } catch (error) {
      console.error("Error fetching measures:", error);
    }
  };

  const handleInputChange = (
    field: keyof PatientName | "emailId" | "legacyPatientId",
    value: string
  ) => {
    setEditedPatient((prev) => ({
      ...prev,
      ...(field === "firstName" || field === "lastName"
        ? {
            patientName: {
              ...prev.patientName,
              [field]: value,
            },
          }
        : { [field]: value }),
    }));
  };

  const isMeasureNameDuplicate = (
    measureId: number,
    currentIndex: number | null = null
  ): boolean => {
    const selectedMeasure = measures.find((m) => m.measureId === measureId);
    if (!selectedMeasure) return false;

    return editedPatient.assignedMeasures.some((measure, index) => {
      // Skip the current measure being edited
      if (currentIndex !== null && index === currentIndex) return false;

      const existingMeasure = measures.find(
        (m) => m.measureId === measure.measureId
      );
      return existingMeasure?.measureName === selectedMeasure.measureName;
    });
  };

  const handleMeasureChange = (
    index: number,
    field: keyof AssignedMeasure,
    value: any
  ) => {
    setError(null);
    const updatedMeasures = [...editedPatient.assignedMeasures];

    if (field === "measureId") {
      if (isMeasureNameDuplicate(value, index)) {
        setError("This measure is already assigned to the patient");
        return;
      }
      const selectedMeasure = measures.find((m) => m.measureId === value);
      if (selectedMeasure) {
        updatedMeasures[index] = {
          ...updatedMeasures[index],
          measureId: value,
          measureName: selectedMeasure.measureName,
        };
      }
    } else if (field === "measuringCadence") {
      updatedMeasures[index] = {
        ...updatedMeasures[index],
        measuringCadence: {
          ...updatedMeasures[index].measuringCadence,
          ...value,
        },
      };
    } else {
      updatedMeasures[index] = {
        ...updatedMeasures[index],
        [field]: value,
      };
    }

    setEditedPatient({
      ...editedPatient,
      assignedMeasures: updatedMeasures,
    });
  };

  const handleNewMeasureChange = (
    field: keyof typeof newMeasure,
    value: any
  ) => {
    setError(null);
    if (field === "measureId") {
      if (isMeasureNameDuplicate(value)) {
        setError("This measure is already assigned to the patient");
        return;
      }
    }

    if (field === "measuringCadence") {
      setNewMeasure({
        ...newMeasure,
        measuringCadence: {
          ...newMeasure.measuringCadence,
          ...value,
        },
      });
    } else {
      setNewMeasure({
        ...newMeasure,
        [field]: value,
      });
    }
  };

  const handleAddMeasure = () => {
    if (!newMeasure.measureId) return;

    if (isMeasureNameDuplicate(newMeasure.measureId)) {
      setError("This measure is already assigned to the patient");
      return;
    }

    const selectedMeasure = measures.find(
      (m) => m.measureId === newMeasure.measureId
    );
    if (!selectedMeasure) return;

    setEditedPatient({
      ...editedPatient,
      assignedMeasures: [
        ...editedPatient.assignedMeasures,
        {
          measureId: newMeasure.measureId,
          measureName: selectedMeasure.measureName,
          measuringCadence: newMeasure.measuringCadence,
        },
      ],
    });

    setNewMeasure({
      measureId: 0,
      measuringCadence: { frequencyTimes: 1, frequencyUnit: "day" },
    });
  };

  const handleRemoveMeasure = (index: number) => {
    setEditedPatient((prev) => ({
      ...prev,
      assignedMeasures: prev.assignedMeasures.filter((_, i) => i !== index),
    }));
    if (editingMeasureIndex === index) {
      setEditingMeasureIndex(null);
    }
  };

  const handleEditMeasure = (index: number) => {
    setEditingMeasureIndex(index);
  };

  const handleSaveMeasure = (index: number) => {
    setEditingMeasureIndex(null);
  };

  const handleSave = async () => {
    if (error) return;

    setLoading(true);
    try {
      await onSave(editedPatient);
      onClose();
    } catch (error) {
      console.error("Error saving patient:", error);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const handleInvite = async (patient: Patient) => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/userProfiles/invite/${
  //         patient.patientId
  //       }`,
  //       {
  //         method: "POST",
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to send invitation");
  //     }
  //     toast({
  //       title: "Success",
  //       description: "Invitation sent successfully",
  //       status: "success",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "An error occurred");
  //     toast({
  //       title: "Error",
  //       description:
  //         err instanceof Error ? err.message : "Failed to send invitation",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent maxW="800px" mx={4}>
        <ModalHeader color="blue.600">Edit Patient Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box
              p={6}
              borderWidth={1}
              borderRadius="lg"
              borderColor="gray.200"
              bg="gray.50"
            >
              <Heading size="md" mb={4} color="gray.700">
                Basic Information
              </Heading>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={editedPatient.patientName.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={editedPatient.patientName.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={editedPatient.emailId}
                    onChange={(e) =>
                      handleInputChange("emailId", e.target.value)
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Legacy Patient ID</FormLabel>
                  <Input
                    value={editedPatient.legacyPatientId}
                    onChange={(e) =>
                      handleInputChange("legacyPatientId", e.target.value)
                    }
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Assigned Measures */}
            <Box
              p={6}
              borderWidth={1}
              borderRadius="lg"
              borderColor="gray.200"
              bg="gray.50"
            >
              <Heading size="md" mb={4} color="gray.700">
                Assigned Measures
              </Heading>

              {error && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* List of existing measures */}
              <VStack spacing={4} align="stretch" mb={6}>
                {editedPatient.assignedMeasures.map((measure, index) => (
                  <Box
                    key={index}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor="gray.200"
                    bg="white"
                  >
                    {editingMeasureIndex === index ? (
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <FormControl>
                          <FormLabel>Measure</FormLabel>
                          <Select
                            value={measure.measureId}
                            onChange={(e) =>
                              handleMeasureChange(
                                index,
                                "measureId",
                                Number(e.target.value)
                              )
                            }
                          >
                            <option value="">Select a measure</option>
                            {measures && measures.length > 0 ? (
                              measures.map((m) => (
                                <option key={m._id} value={m.measureId}>
                                  {m.measureName}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                No measures available
                              </option>
                            )}
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Frequency</FormLabel>
                          <Flex gap={2}>
                            <NumberInput
                              min={1}
                              value={measure.measuringCadence.frequencyTimes}
                              onChange={(_, value) =>
                                handleMeasureChange(index, "measuringCadence", {
                                  frequencyTimes: value,
                                })
                              }
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <Select
                              value={measure.measuringCadence.frequencyUnit}
                              onChange={(e) =>
                                handleMeasureChange(index, "measuringCadence", {
                                  frequencyUnit: e.target.value,
                                })
                              }
                            >
                              <option value="day">per day</option>
                              <option value="week">per week</option>
                              <option value="month">per month</option>
                            </Select>
                          </Flex>
                        </FormControl>
                        <GridItem colSpan={2}>
                          <Flex justify="flex-end" gap={2}>
                            <Button
                              size="sm"
                              onClick={() => handleSaveMeasure(index)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMeasureIndex(null)}
                            >
                              Cancel
                            </Button>
                          </Flex>
                        </GridItem>
                      </Grid>
                    ) : (
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="blue.600"
                          >
                            {measures.find(
                              (m) => m.measureId === measure.measureId
                            )?.measureName || `Measure ${measure.measureId}`}
                          </Text>
                          <Text color="gray.600" fontSize="sm">
                            {measure.measuringCadence.frequencyTimes} times per{" "}
                            {measure.measuringCadence.frequencyUnit}
                          </Text>
                        </Box>
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMeasure(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleRemoveMeasure(index)}
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Flex>
                    )}
                  </Box>
                ))}
              </VStack>

              {/* Add new measure section */}
              <Box
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor="gray.200"
                borderStyle="dashed"
                bg="white"
              >
                <Heading size="sm" mb={4} color="gray.700">
                  Add New Measure
                </Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl>
                    <FormLabel>Measure</FormLabel>
                    <Select
                      value={newMeasure.measureId}
                      onChange={(e) =>
                        handleNewMeasureChange(
                          "measureId",
                          Number(e.target.value)
                        )
                      }
                    >
                      <option value="">Select a measure</option>
                      {measures && measures.length > 0 ? (
                        measures.map((m) => (
                          <option key={m._id} value={m.measureId}>
                            {m.measureName}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No measures available
                        </option>
                      )}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Frequency</FormLabel>
                    <Flex gap={2}>
                      <NumberInput
                        min={1}
                        value={newMeasure.measuringCadence.frequencyTimes}
                        onChange={(_, value) =>
                          handleNewMeasureChange("measuringCadence", {
                            frequencyTimes: value,
                          })
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Select
                        value={newMeasure.measuringCadence.frequencyUnit}
                        onChange={(e) =>
                          handleNewMeasureChange("measuringCadence", {
                            frequencyUnit: e.target.value,
                          })
                        }
                      >
                        <option value="day">per day</option>
                        <option value="week">per week</option>
                        <option value="month">per month</option>
                      </Select>
                    </Flex>
                  </FormControl>
                  <GridItem colSpan={2}>
                    <Flex justify="flex-end">
                      <Button
                        leftIcon={<AddIcon />}
                        colorScheme="blue"
                        onClick={handleAddMeasure}
                        isDisabled={!newMeasure.measureId}
                      >
                        Add Measure
                      </Button>
                    </Flex>
                  </GridItem>
                </Grid>
              </Box>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={loading}
            loadingText="Saving..."
            isDisabled={!!error}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>(() => {
    // Initialize from localStorage if available
    const savedPatients = localStorage.getItem("searchResults");
    return savedPatients ? JSON.parse(savedPatients) : hardcodedPatients;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem("searchTerm") || "";
  });
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteSent, setIsInviteSent] = useState(false);

  // Clear search results when navigating directly to services
  useEffect(() => {
    if (!location.state?.preserveSearch) {
      setPatients(hardcodedPatients);
      setSearchTerm("");
      localStorage.removeItem("searchResults");
      localStorage.removeItem("searchTerm");
    }
  }, [location]);

  // Update localStorage when patients or searchTerm changes
  useEffect(() => {
    localStorage.setItem("searchResults", JSON.stringify(patients));
    localStorage.setItem("searchTerm", searchTerm);
  }, [patients, searchTerm]);

  const fetchPatients = async (patientId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/patients/byLegacyPatientId/${patientId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchPatients(searchTerm.trim());
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
  };

  const handleView = (patient: Patient) => {
    navigate(`/patient/${patient.legacyPatientId}`);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingPatient(null);
  };

  const handleSave = async (updatedPatient: Patient) => {
    try {
      setLoading(true);
      setError(null);

      // Format the patient data according to the required structure
      const formattedPatient = {
        legacyPatientId: updatedPatient.legacyPatientId,
        patientName: {
          firstName: updatedPatient.patientName.firstName,
          lastName: updatedPatient.patientName.lastName,
        },
        emailId: updatedPatient.emailId,
        status: "Active",
        assignedMeasures: updatedPatient.assignedMeasures.map((measure) => ({
          measureId: measure.measureId,
          measureName: measure.measureName,
          measuringCadence: {
            frequencyTimes: measure.measuringCadence.frequencyTimes,
            frequencyUnit: measure.measuringCadence.frequencyUnit,
          },
        })),
        createdBy: "RY",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/patients/${
          updatedPatient.patientId
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedPatient),
        }
      );
      console.log(updatedPatient.legacyPatientId);
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to update patient");
      }

      const updatedPatientData = await response.json();
      console.log("API response for updated patient:", updatedPatientData);

      if (
        !updatedPatientData ||
        (Array.isArray(updatedPatientData) && updatedPatientData.length === 0)
      ) {
        setError("No patient data returned from server.");
        setLoading(false);
        return;
      }

      setPatients(
        patients.map((p) =>
          p._id === updatedPatient._id
            ? Array.isArray(updatedPatientData) &&
              updatedPatientData[0] &&
              updatedPatientData[0].patientName
              ? updatedPatientData[0]
              : !Array.isArray(updatedPatientData) &&
                updatedPatientData &&
                updatedPatientData.patientName
              ? updatedPatientData
              : p // fallback to previous patient if invalid
            : p
        )
      );
      setEditingPatient(null);
      toast({
        title: "Success",
        description: "Patient updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update patient",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (newPatient: Patient) => {
    try {
      setLoading(true);
      setError(null);

      // Format the patient data according to the required structure
      const formattedPatient = {
        legacyPatientId: newPatient.legacyPatientId,
        patientName: {
          firstName: newPatient.patientName.firstName,
          lastName: newPatient.patientName.lastName,
        },
        emailId: newPatient.emailId,
        status: "Active",
        assignedMeasures: newPatient.assignedMeasures.map((measure) => ({
          measureId: measure.measureId,
          measureName: measure.measureName,
          measuringCadence: {
            frequencyTimes: measure.measuringCadence.frequencyTimes,
            frequencyUnit: measure.measuringCadence.frequencyUnit,
          },
        })),
        createdBy: "RY",
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/patients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedPatient),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add patient");
      }

      const addedPatient = await response.json();
      setPatients([...patients, addedPatient]);
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "Patient added successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add patient",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (patient: Patient) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/userProfiles/invite/${
          patient.patientId
        }`,
        {
          method: "POST",
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to send invitation");
      }
      patient.inviteSent = true;
      toast({
        title: "Success",
        description: "Invitation sent successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to send invitation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-lookup">
      <Container className="container-test" maxW="container.xl" py={8}>
        <div className="lookup-form">
          <Box minWidth={"900px"} mb={6}>
            <Heading size="lg" mb={4}>
              Patient Management
            </Heading>
            <HStack spacing={4}>
              <Input
                placeholder="Search by Patient ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                colorScheme="blue"
                onClick={handleSearch}
                isLoading={loading}
              >
                Search
              </Button>
              <Button
                paddingX={"25px"}
                colorScheme="green"
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Patient
              </Button>
            </HStack>
          </Box>

          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {loading && (
            <Flex justify="center" py={8}>
              <Spinner size="xl" />
            </Flex>
          )}

          {patients.length > 0 && (
            <Box borderWidth={1} borderRadius="lg" p={4} borderColor="gray.200">
              <Table variant="simple">
                <Thead>
                  <Tr backgroundColor={"#57cfff"}>
                    <Th>Legacy Patient ID</Th>
                    <Th>Patient Name</Th>
                    <Th>Email</Th>
                    <Th>Assigned Measures</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {patients.map((patient) =>
                    patient && patient.patientName ? (
                      <Tr key={patient._id}>
                        <Td>
                          <div>{patient.legacyPatientId}</div>
                        </Td>
                        <Td>
                          {patient.patientName.firstName}{" "}
                          {patient.patientName.lastName}
                        </Td>
                        <Td>{patient.emailId}</Td>
                        <Td>
                          <div>
                            {patient.assignedMeasures.map((measure) => (
                              <Badge
                                key={measure._id}
                                colorScheme="white"
                                variant="subtle"
                              >
                                {measure.measureName} (
                                {measure.measuringCadence.frequencyTimes} times
                                per {measure.measuringCadence.frequencyUnit})
                              </Badge>
                            ))}
                          </div>
                        </Td>
                        <Td>
                          <div>
                            <Menu colorScheme="">
                              <MenuButton
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                                size="sm"
                                variant="ghost"
                                textColor={"fff"}
                              >
                                Actions
                              </MenuButton>
                              <MenuList>
                                <MenuItem
                                  icon={<ViewIcon />}
                                  onClick={() => handleView(patient)}
                                  textColor={"#fff"}
                                  borderRadius={"0px"}
                                >
                                  Feedback Details
                                </MenuItem>
                                <MenuItem
                                  icon={<EditIcon />}
                                  onClick={() => handleEdit(patient)}
                                  textColor={"#fff"}
                                  borderRadius={"0px"}
                                >
                                  Edit Patient Details
                                </MenuItem>
                                <MenuItem
                                  icon={<AddIcon />}
                                  onClick={() => handleInvite(patient)}
                                  textColor="#fff"
                                  borderRadius={"0px"}
                                >
                                  Invite Patient
                                </MenuItem>
                              </MenuList>
                            </Menu>
                            <br />
                          </div>
                          {patient.inviteSent && (
                            <div className="invite-sent">Invite Sent</div>
                          )}
                        </Td>
                      </Tr>
                    ) : null
                  )}
                </Tbody>
              </Table>
            </Box>
          )}

          {editingPatient && (
            <EditPatientModal
              isOpen={!!editingPatient}
              onClose={() => setEditingPatient(null)}
              patient={editingPatient}
              onSave={handleSave}
              toast={toast}
            />
          )}

          {isAddModalOpen && (
            <EditPatientModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              patient={{
                _id: "",
                patientId: 0,
                patientName: { firstName: "", lastName: "" },
                emailId: "",
                legacyPatientId: "",
                assignedMeasures: [],
                createdBy: "",
                createdAt: "",
                updatedAt: "",
                __v: 0,
              }}
              onSave={handleAddPatient}
              toast={toast}
            />
          )}

          {viewingPatient && (
            <ViewDetailsModal
              isOpen={isViewModalOpen}
              onClose={handleCloseViewModal}
              patientId={viewingPatient._id}
              patientInfo={{
                id: viewingPatient._id,
                firstName: viewingPatient.patientName.firstName,
                lastName: viewingPatient.patientName.lastName,
                email: viewingPatient.emailId,
              }}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export default Services;
