import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@chakra-ui/icons";
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

const PatientDetails = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/patientFeedback/byLegacyPatientId/${patientId}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch patient details: ${response.statusText}`
          );
        }
        const data = await response.json();
        if (!data) {
          throw new Error("No data received from the server");
        }
        setPatientData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientDetails();
    } else {
      setError("No patient ID provided");
    }
  }, [patientId, toast]);

  const handleBack = () => {
    navigate("/services", { state: { preserveSearch: true } });
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
      <Card mb={4}>
        <CardHeader>
          <Heading size="md">{measure.measureName}</Heading>
          <HStack mt={2}>
            <Badge colorScheme="blue">ID: {measure.measureId}</Badge>
            <Badge colorScheme="green">{measure.measuringCadence}</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
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
                            ? formatDate(feedback[header])
                            : feedback[header]?.toString() || ""}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text color="gray.500">
              No feedback records available for this measure
            </Text>
          )}
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={handleBack}
          mt={4}
          variant="outline"
        >
          Back to Services
        </Button>
      </Container>
    );
  }

  if (!patientData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No Patient Found</AlertTitle>
          <AlertDescription>
            The requested patient could not be found.
          </AlertDescription>
        </Alert>
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={handleBack}
          mt={4}
          variant="outline"
        >
          Back to Services
        </Button>
      </Container>
    );
  }

  return (
    <div className="patient-lookup">
      <Button
        leftIcon={<ChevronLeftIcon />}
        onClick={handleBack}
        mb={6}
        variant="outline"
      >
        Back to Services
      </Button>

      <div className="lookup-form">
        <Card mb={6}>
          <CardHeader>
            <Heading size="md">Patient Information</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Patient ID
                </Text>
                <Text fontSize="lg">{patientData.patientId}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Legacy ID
                </Text>
                <Text fontSize="lg">{patientData.legacyPatientId}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Full Name
                </Text>
                <Text fontSize="lg">
                  {patientData.patientName.firstName}{" "}
                  {patientData.patientName.lastName}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.500">
                  Email
                </Text>
                <Text fontSize="lg">{patientData.emailId}</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Measures and Feedback</Heading>
          </CardHeader>
          <CardBody>
            {patientData.measuresWithFeedback &&
            patientData.measuresWithFeedback.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {patientData.measuresWithFeedback.map((measure) => (
                  <div key={measure.measureId}>
                    {renderFeedbackTable(measure)}
                  </div>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500">No measures assigned to this patient</Text>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetails;
