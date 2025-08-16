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
  Menu as ChakraMenu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox as ChakraCheckbox,
  Button as ChakraButton,
  ButtonGroup,
  Select,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import "./PatientLookup.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState as useLocalState } from "react";

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
  const [viewMode, setViewMode] = useLocalState<{
    [measureId: number]: "table" | "lineChart" | "barChart";
  }>({});
  const [graphFilters, setGraphFilters] = useLocalState<{
    [measureId: number]: string[];
  }>({});
  const [dateFilters, setDateFilters] = useLocalState<{
    [measureId: number]: { startDate: string; endDate: string };
  }>({});
  const [selectedMeasureId, setSelectedMeasureId] = useState<number | null>(
    null
  );

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
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const getColumnHeaders = (feedbackRows: FeedbackRow[]): string[] => {
    if (feedbackRows.length === 0) return [];

    const allKeys = new Set<string>();
    feedbackRows.forEach((row) => {
      Object.keys(row).forEach((key) => allKeys.add(key));
    });

    return Array.from(allKeys);
  };

  const renderFeedbackLineChart = (measure: Measure) => {
    if (!measure.feedbackRows.length) return null;
    const columnHeaders = getColumnHeaders(measure.feedbackRows);
    const dateKey =
      columnHeaders.find((h) => h.toLowerCase().includes("date")) ||
      columnHeaders[0];
    const valueKeys = columnHeaders.filter(
      (h) => h !== dateKey && !h.toLowerCase().includes("comment")
    );
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#A28FD0",
      "#FF6699",
    ];

    const selectedKeys = graphFilters[measure.measureId] ?? valueKeys;

    const handleCheckboxChange = (key: string) => {
      setGraphFilters((prev) => {
        const current = prev[measure.measureId] ?? valueKeys;
        if (current.includes(key)) {
          return {
            ...prev,
            [measure.measureId]: current.filter((k) => k !== key),
          };
        } else {
          return { ...prev, [measure.measureId]: [...current, key] };
        }
      });
    };

    const filteredData = measure.feedbackRows.filter((row) => {
      const rowDate = new Date(row[dateKey]);
      const { startDate, endDate } = dateFilters[measure.measureId] || {};
      if (startDate && rowDate < new Date(startDate)) return false;
      if (endDate && rowDate > new Date(endDate)) return false;
      return true;
    });

    return (
      <Box w="100%" minW="100%" h="auto" mb={6}>
        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>
            Filter Dates:
          </Text>
          <HStack spacing={4} mb={2}>
            <Box>
              <Text fontSize="sm" color="black.500" mb={1}>
                Start Date
              </Text>
              <input
                type="date"
                value={dateFilters[measure.measureId]?.startDate || ""}
                onChange={(e) =>
                  setDateFilters((prev) => ({
                    ...prev,
                    [measure.measureId]: {
                      ...prev[measure.measureId],
                      startDate: e.target.value,
                    },
                  }))
                }
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="black.500" mb={1}>
                End Date
              </Text>
              <input
                type="date"
                value={dateFilters[measure.measureId]?.endDate || ""}
                onChange={(e) =>
                  setDateFilters((prev) => ({
                    ...prev,
                    [measure.measureId]: {
                      ...prev[measure.measureId],
                      endDate: e.target.value,
                    },
                  }))
                }
              />
            </Box>
          </HStack>

          <Text fontWeight="bold" mb={1}>
            Filter Columns:
          </Text>
          <ChakraMenu closeOnSelect={false}>
            <MenuButton
              as={ChakraButton}
              size="sm"
              colorScheme="blue"
              variant="solid"
              color="white"
            >
              {selectedKeys.length} column
              {selectedKeys.length !== 1 ? "s" : ""} selected
            </MenuButton>
            <MenuList minW="200px">
              {valueKeys.map((key, idx) => (
                <MenuItem key={key} bg="blue.200">
                  <ChakraCheckbox
                    isChecked={selectedKeys.includes(key)}
                    onChange={() => handleCheckboxChange(key)}
                    colorScheme="teal"
                    variant="solid"
                    color="white"
                    mr={2}
                  >
                    <span style={{ color: "white" }}>{key}</span>
                  </ChakraCheckbox>
                </MenuItem>
              ))}
            </MenuList>
          </ChakraMenu>
        </Box>

        {filteredData.length === 0 ? (
          <Text color="gray.500">No data in the selected date range.</Text>
        ) : selectedKeys.length === 0 ? (
          <Text color="gray.500">
            Please select at least one column to display.
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={filteredData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={dateKey}
                tickFormatter={(v) =>
                  typeof v === "string" ? v.split("T")[0] : v
                }
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedKeys.map((key, idx) => (
                <Line
                  key={`${measure.measureId}-${key}`}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={3}
                  dot={false}
                  connectNulls
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>
    );
  };

  const renderFeedbackBarChart = (measure: Measure) => {
    if (!measure.feedbackRows.length) return null;
    const columnHeaders = getColumnHeaders(measure.feedbackRows);
    const dateKey =
      columnHeaders.find((h) => h.toLowerCase().includes("date")) ||
      columnHeaders[0];
    const valueKeys = columnHeaders.filter(
      (h) => h !== dateKey && !h.toLowerCase().includes("comment")
    );
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7300",
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#A28FD0",
      "#FF6699",
    ];

    const selectedKeys = graphFilters[measure.measureId] ?? valueKeys;

    const handleCheckboxChange = (key: string) => {
      setGraphFilters((prev) => {
        const current = prev[measure.measureId] ?? valueKeys;
        if (current.includes(key)) {
          return {
            ...prev,
            [measure.measureId]: current.filter((k) => k !== key),
          };
        } else {
          return { ...prev, [measure.measureId]: [...current, key] };
        }
      });
    };

    const filteredData = measure.feedbackRows.filter((row) => {
      const rowDate = new Date(row[dateKey]);
      const { startDate, endDate } = dateFilters[measure.measureId] || {};
      if (startDate && rowDate < new Date(startDate)) return false;
      if (endDate && rowDate > new Date(endDate)) return false;
      return true;
    });

    return (
      <Box w="100%" minW="100%" h="auto" mb={6}>
        <Box mb={4}>
          <Text fontWeight="bold" mb={1}>
            Filter Dates:
          </Text>
          <HStack spacing={4} mb={2}>
            <Box>
              <Text fontSize="sm" color="black.500" mb={1}>
                Start Date
              </Text>
              <input
                type="date"
                value={dateFilters[measure.measureId]?.startDate || ""}
                onChange={(e) =>
                  setDateFilters((prev) => ({
                    ...prev,
                    [measure.measureId]: {
                      ...prev[measure.measureId],
                      startDate: e.target.value,
                    },
                  }))
                }
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="black.500" mb={1}>
                End Date
              </Text>
              <input
                type="date"
                value={dateFilters[measure.measureId]?.endDate || ""}
                onChange={(e) =>
                  setDateFilters((prev) => ({
                    ...prev,
                    [measure.measureId]: {
                      ...prev[measure.measureId],
                      endDate: e.target.value,
                    },
                  }))
                }
              />
            </Box>
          </HStack>

          <Text fontWeight="bold" mb={1}>
            Filter Columns:
          </Text>
          <ChakraMenu closeOnSelect={false}>
            <MenuButton
              as={ChakraButton}
              size="sm"
              colorScheme="blue"
              variant="solid"
              color="white"
            >
              {selectedKeys.length} column
              {selectedKeys.length !== 1 ? "s" : ""} selected
            </MenuButton>
            <MenuList minW="200px">
              {valueKeys.map((key, idx) => (
                <MenuItem key={key} bg="blue.200">
                  <ChakraCheckbox
                    isChecked={selectedKeys.includes(key)}
                    onChange={() => handleCheckboxChange(key)}
                    colorScheme="blue"
                    variant="solid"
                    color="white"
                    mr={2}
                  >
                    <span style={{ color: "white" }}>{key}</span>
                  </ChakraCheckbox>
                </MenuItem>
              ))}
            </MenuList>
          </ChakraMenu>
        </Box>

        {filteredData.length === 0 ? (
          <Text color="gray.500">No data in the selected date range.</Text>
        ) : selectedKeys.length === 0 ? (
          <Text color="gray.500">
            Please select at least one column to display.
          </Text>
        ) : (
          <Box>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="10%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={dateKey}
                  tickFormatter={(v) =>
                    typeof v === "string" ? v.split("T")[0] : v
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(2) : value,
                    name,
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                {selectedKeys.map((key, idx) => {
                  console.log(`Rendering bar for key: ${key}, index: ${idx}`);
                  return (
                    <Bar
                      key={`bar-${measure.measureId}-${key}`}
                      dataKey={key}
                      fill={colors[idx % colors.length]}
                      name={key}
                      minPointSize={1}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>

            {/* Data sample for debugging */}
            <Text fontSize="xs" color="gray.400" mt={2}>
              Sample data:{" "}
              {JSON.stringify(filteredData.slice(0, 1), null, 2).substring(
                0,
                200
              )}
              ...
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  const renderFeedbackTable = (measure: Measure) => {
    const columnHeaders = getColumnHeaders(measure.feedbackRows);
    const mode = viewMode[measure.measureId] || "table";

    return (
      <Card mb={4}>
        <CardHeader>
          <Heading size="md">{measure.measureName}</Heading>
          <HStack mt={2} justify="space-between" wrap="wrap">
            <HStack>
              <Badge colorScheme="green">
                MEASURING CADENCE: {measure.measuringCadence}
              </Badge>
            </HStack>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                colorScheme={mode === "table" ? "teal" : "gray"}
                onClick={() =>
                  setViewMode((prev) => ({
                    ...prev,
                    [measure.measureId]: "table",
                  }))
                }
              >
                Table
              </Button>
              <Button
                colorScheme={mode === "lineChart" ? "teal" : "gray"}
                onClick={() =>
                  setViewMode((prev) => ({
                    ...prev,
                    [measure.measureId]: "lineChart",
                  }))
                }
              >
                Line Chart
              </Button>
              <Button
                colorScheme={mode === "barChart" ? "teal" : "gray"}
                onClick={() =>
                  setViewMode((prev) => ({
                    ...prev,
                    [measure.measureId]: "barChart",
                  }))
                }
              >
                Bar Chart
              </Button>
            </ButtonGroup>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box minW="100%" w="100%">
            {measure.feedbackRows.length > 0 ? (
              mode === "table" ? (
                <Box w="100%" minW="100%" maxW="100%">
                  {/* Date Filter for Table */}
                  <Box mb={4}>
                    <Text fontWeight="bold" mb={1}>
                      Filter Dates:
                    </Text>
                    <HStack spacing={4} mb={2}>
                      <Box>
                        <Text fontSize="sm" color="black.500" mb={1}>
                          Start Date
                        </Text>
                        <input
                          type="date"
                          value={
                            dateFilters[measure.measureId]?.startDate || ""
                          }
                          onChange={(e) =>
                            setDateFilters((prev) => ({
                              ...prev,
                              [measure.measureId]: {
                                ...prev[measure.measureId],
                                startDate: e.target.value,
                              },
                            }))
                          }
                        />
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="black.500" mb={1}>
                          End Date
                        </Text>
                        <input
                          type="date"
                          value={dateFilters[measure.measureId]?.endDate || ""}
                          onChange={(e) =>
                            setDateFilters((prev) => ({
                              ...prev,
                              [measure.measureId]: {
                                ...prev[measure.measureId],
                                endDate: e.target.value,
                              },
                            }))
                          }
                        />
                      </Box>
                    </HStack>
                  </Box>

                  {/* Filtered Table Data */}
                  <Box overflowX="auto" w="100%" minW="100%" maxW="100%">
                    <Table
                      variant="simple"
                      w="100%"
                      minW="100%"
                      border="1px"
                      borderColor="gray.300"
                    >
                      <Thead>
                        <Tr>
                          {columnHeaders.map((header, idx) => {
                            const colors = [
                              "#8884d8",
                              "#82ca9d",
                              "#ffc658",
                              "#ff7300",
                              "#0088FE",
                              "#00C49F",
                              "#FFBB28",
                              "#FF8042",
                              "#A28FD0",
                              "#FF6699",
                            ];
                            const isDateColumn = header
                              .toLowerCase()
                              .includes("date");
                            const color = isDateColumn
                              ? "#666666"
                              : colors[idx % colors.length];

                            return (
                              <Th
                                key={header}
                                border="1px solid"
                                borderColor="gray.300"
                                bg={isDateColumn ? "gray.200" : `${color}40`}
                                color="black"
                                fontWeight="bold"
                                textAlign="center"
                                py={3}
                                px={2}
                                maxW="200px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                whiteSpace="nowrap"
                              >
                                {header}
                              </Th>
                            );
                          })}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {(() => {
                          const filteredData = measure.feedbackRows.filter(
                            (row) => {
                              const dateKey =
                                columnHeaders.find((h) =>
                                  h.toLowerCase().includes("date")
                                ) || columnHeaders[0];
                              const rowDate = new Date(row[dateKey]);
                              const { startDate, endDate } =
                                dateFilters[measure.measureId] || {};
                              if (startDate && rowDate < new Date(startDate))
                                return false;
                              if (endDate && rowDate > new Date(endDate))
                                return false;
                              return true;
                            }
                          );

                          if (filteredData.length === 0) {
                            return (
                              <Tr>
                                <Td
                                  colSpan={columnHeaders.length}
                                  textAlign="center"
                                  border="1px solid"
                                  borderColor="gray.300"
                                  py={4}
                                >
                                  No data in the selected date range.
                                </Td>
                              </Tr>
                            );
                          }

                          return filteredData.map((feedback, index) => (
                            <Tr key={index} _hover={{ bg: "gray.50" }}>
                              {columnHeaders.map((header, idx) => {
                                const colors = [
                                  "#8884d8",
                                  "#82ca9d",
                                  "#ffc658",
                                  "#ff7300",
                                  "#0088FE",
                                  "#00C49F",
                                  "#FFBB28",
                                  "#FF8042",
                                  "#A28FD0",
                                  "#FF6699",
                                ];
                                const isDateColumn = header
                                  .toLowerCase()
                                  .includes("date");
                                const color = isDateColumn
                                  ? "#666666"
                                  : colors[idx % colors.length];

                                return (
                                  <Td
                                    key={header}
                                    border="1px solid"
                                    borderColor="gray.300"
                                    bg="white"
                                    color="gray.700"
                                    py={2}
                                    px={2}
                                    textAlign={isDateColumn ? "center" : "left"}
                                    maxW="200px"
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                  >
                                    {header.toLowerCase().includes("date")
                                      ? formatDate(feedback[header])
                                      : feedback[header]?.toString() || ""}
                                  </Td>
                                );
                              })}
                            </Tr>
                          ));
                        })()}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              ) : mode === "lineChart" ? (
                renderFeedbackLineChart(measure)
              ) : (
                renderFeedbackBarChart(measure)
              )
            ) : (
              <Text color="gray.500">
                No feedback records available for this measure
              </Text>
            )}
          </Box>
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
                {/* Measure Selection Dropdown */}
                <Box mb={4}>
                  <HStack spacing={4} align="center">
                    <Text fontWeight="bold" color="gray.600">
                      Select Measure to Prioritize:
                    </Text>
                    <Select
                      placeholder="Choose a measure"
                      value={selectedMeasureId || ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSelectedMeasureId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      maxW="300px"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "blue.400" }}
                      _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                    >
                      {patientData.measuresWithFeedback.map((measure) => (
                        <option
                          key={measure.measureId}
                          value={measure.measureId}
                        >
                          {measure.measureName} (ID: {measure.measureId})
                        </option>
                      ))}
                    </Select>
                    {selectedMeasureId && (
                      <Button
                        size="sm"
                        colorScheme="gray"
                        variant="outline"
                        onClick={() => setSelectedMeasureId(null)}
                      >
                        Clear Selection
                      </Button>
                    )}
                  </HStack>
                </Box>

                {/* Reordered Measures List */}
                {(() => {
                  if (!selectedMeasureId) {
                    // Show measures in original order
                    return patientData.measuresWithFeedback.map((measure) => (
                      <div key={measure.measureId}>
                        {renderFeedbackTable(measure)}
                      </div>
                    ));
                  } else {
                    // Reorder: selected measure first, then the rest
                    const selectedMeasure =
                      patientData.measuresWithFeedback.find(
                        (m) => m.measureId === selectedMeasureId
                      );
                    const otherMeasures =
                      patientData.measuresWithFeedback.filter(
                        (m) => m.measureId !== selectedMeasureId
                      );

                    return (
                      <>
                        {/* Selected measure at the top */}
                        {selectedMeasure && (
                          <Box
                            key={selectedMeasure.measureId}
                            border="2px solid"
                            borderColor="blue.300"
                            borderRadius="lg"
                            p={2}
                            mb={4}
                          >
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="blue.600"
                              mb={2}
                              textAlign="center"
                            >
                              ⭐ PRIORITY MEASURE
                            </Text>
                            {renderFeedbackTable(selectedMeasure)}
                          </Box>
                        )}

                        {/* Other measures below */}
                        {otherMeasures.map((measure) => (
                          <div key={measure.measureId}>
                            {renderFeedbackTable(measure)}
                          </div>
                        ))}
                      </>
                    );
                  }
                })()}
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
