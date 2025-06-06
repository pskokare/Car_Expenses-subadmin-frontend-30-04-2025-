
"use client"
import { useState, useEffect } from "react"
import Sidebar from "../slidebar/page"
import axios from "axios"
import { motion } from "framer-motion"
import baseURL from "@/utils/api"
import { useRouter } from "next/navigation"

const AccessDeniedModal = () => {
  const router = useRouter()

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p className="mb-6">Your access has been restricted. Please contact the administrator.</p>
        <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Close
        </button>
      </div>
    </div>
  )
}

export default function CabService() {
  const router = useRouter()
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [services, setServices] = useState([])
  const [mergedServices, setMergedServices] = useState([])
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedCab, setSelectedCab] = useState("")
  const [receiptImage, setReceiptImage] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const token = typeof window !== "undefined" && localStorage.getItem("token")
  const assignedBy = typeof window !== "undefined" && localStorage.getItem("id")

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const id = localStorage.getItem("id")
        if (!id) {
          router.push("/")
          return
        }

        const subAdminsRes = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
        const loggedInUser = subAdminsRes.data.subAdmins.find((e) => e._id === id)

        if (loggedInUser?.status === "Inactive") {
          localStorage.clear()
          setShowAccessDenied(true)
          return
        }
      } catch (err) {
        console.error("Error checking user status:", err)
      }
    }

    checkUserStatus()
  }, [router])

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    // Merge services with assignments whenever either changes
    if (services.length > 0 && assignments.length > 0) {
      const merged = services.map((service) => {
        // Find the assignment that matches this service
        const assignment = assignments.find((assign) => assign.cab?._id === service.cab?._id)

        return {
          ...service,
          cab: assignment?.cab || service.cab,
          driver: assignment?.driver || service.driver,
        }
      })
      setMergedServices(merged)
    }
  }, [services, assignments])

  const fetchInitialData = async () => {
    try {
      const [driversRes, assignmentsRes, servicesRes] = await Promise.all([
        axios.get(`${baseURL}api/driver/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseURL}api/assigncab`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseURL}api/servicing`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setDrivers(driversRes.data)
      setAssignments(assignmentsRes.data)
      setServices(servicesRes.data.services || [])
    } catch (error) {
      console.error("Error fetching:", error)
    }
  }

  console.log("Drivers", drivers)
  console.log("AssignCab", assignments)
  console.log("Servicing", services)

  const handleAssignServicing = async () => {
    if (!selectedCab || !selectedDriver) return alert("Select both cab and driver.")

    console.log("Selected cab:", selectedCab)
    console.log("Selected driver:", selectedDriver)
    console.log("Available cabs:", getAvailableCabs())

    try {
      await axios.post(
        `${baseURL}api/servicing/assign`,
        { cabId: selectedCab, driverId: selectedDriver, assignedBy },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      alert("Servicing assigned successfully")
      setShowAssignModal(false)
      setSelectedCab("")
      setSelectedDriver("")
      fetchInitialData() // refresh list
    } catch (err) {
      console.error("Assign error:", err)
      alert("Failed to assign servicing.")
    }
  }

  const calculateKmTravelled = (assignment) => {
    console.log("Calculating KM for assignment:", assignment)

    // Check multiple possible paths for meter readings
    let meterReadings = null

    if (assignment?.tripDetails?.vehicleServicing?.meter) {
      meterReadings = assignment.tripDetails.vehicleServicing.meter
    } else if (assignment?.vehicleServicing?.meter) {
      meterReadings = assignment.vehicleServicing.meter
    } else if (assignment?.meter) {
      meterReadings = assignment.meter
    }

    console.log("Meter readings found:", meterReadings)

    // If no meter readings or empty array, return 0
    if (!meterReadings || (Array.isArray(meterReadings) && meterReadings.length === 0)) {
      console.log("No meter readings or empty array, returning 0")
      return 0
    }

    if (Array.isArray(meterReadings)) {
      const total = meterReadings.reduce((sum, value) => {
        const numValue = Number(value) || 0
        console.log("Adding meter value:", numValue)
        return sum + numValue
      }, 0)
      console.log("Total calculated KM:", total)
      return total
    }

    // If it's a single number
    const singleValue = Number(meterReadings) || 0
    console.log("Single meter value:", singleValue)
    return singleValue
  }

  const getAvailableCabs = () => {
    console.log("All assignments:", assignments)
    const cabMap = new Map()

    // First, collect all unique cabs with their total km
    assignments.forEach((assignment) => {
      if (assignment.cab && assignment.cab._id) {
        const cabId = assignment.cab._id
        const kmTravelled = calculateKmTravelled(assignment)

        console.log(`Cab ${assignment.cab.cabNumber} - KM: ${kmTravelled}`)
        console.log(`Cab ${assignment.cab.cabNumber} - Status: ${assignment.status}`)
        console.log(`Cab ${assignment.cab.cabNumber} - Meter Array:`, assignment?.tripDetails?.vehicleServicing?.meter)

        // Only consider cabs that have actual km readings and are not recently reset
        if (kmTravelled > 0) {
          // If we haven't seen this cab before, or if this assignment has more km, update it
          if (!cabMap.has(cabId) || cabMap.get(cabId).kmTravelled < kmTravelled) {
            cabMap.set(cabId, {
              ...assignment.cab,
              kmTravelled: kmTravelled,
              assignmentStatus: assignment.status,
            })
          }
        }
      }
    })

    // Convert map to array and filter for cabs with > 10000 km
    const cabsWithHighKm = Array.from(cabMap.values()).filter((cab) => {
      console.log(`Filtering cab ${cab.cabNumber}: ${cab.kmTravelled} km`)
      return cab.kmTravelled > 10000
    })

    console.log("Cabs with > 10000 km:", cabsWithHighKm)

    // Filter out cabs that already have active (non-completed) servicing
    const availableCabs = cabsWithHighKm.filter((cab) => {
      const activeServices = services.filter(
        (service) => service.cab?._id === cab._id && service.status?.toLowerCase() !== "completed",
      )

      // Remove the reset meter check since we already calculated km > 10000
      // If a cab has > 10000 km, it means it has valid meter readings
      const isAvailable = activeServices.length === 0
      console.log(`Cab ${cab.cabNumber} available: ${isAvailable} (active services: ${activeServices.length})`)

      return isAvailable
    })

    console.log("Final available cabs:", availableCabs)
    return availableCabs
  }




  const getAvailableDrivers = () => {
    const driverStatusMap = {};

    // Build a map of driverId -> array of their statuses
    services.forEach(service => {
      const driverId = service.driver?._id || service.driverId || service.driver;
      if (driverId) {
        if (!driverStatusMap[driverId]) {
          driverStatusMap[driverId] = [];
        }
        driverStatusMap[driverId].push(service.status);
      }
    });

    // Drivers with at least one pending servicing
    const driversWithPending = Object.entries(driverStatusMap)
      .filter(([_, statuses]) => statuses.includes("pending"))
      .map(([driverId]) => driverId);

    // Filtered list of drivers to be shown
    const availableDrivers = drivers.filter(driver => {
      const statuses = driverStatusMap[driver._id] || [];
      return !statuses.includes("pending");
    });

    console.log("🚫 Drivers with pending servicing:", driversWithPending);
    console.log("✅ Available drivers for assignment:", availableDrivers.map(d => ({ id: d._id, name: d.name })));

    return availableDrivers;
  };






  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
        {showAccessDenied && <AccessDeniedModal />}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Servicing Assignments</h2>
          <button onClick={() => setShowAssignModal(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Assign Servicing
          </button>
        </div>

        {/* ✅ Table */}
        <div className="bg-gray-800 rounded-lg shadow p-4 space-y-4">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-6 gap-4 text-gray-400 font-medium mb-2">
            <div className="text-center">#</div>
            <div className="text-center">Cab Number</div>
            <div className="text-center">Driver</div>
            <div className="text-center">Status</div>
            <div className="text-center">Amount</div>
            <div className="text-center">Receipt</div>
          </div>

          {mergedServices.map((service, i) => (
            <div
              key={service._id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
            >
              {/* Mobile View (2 columns) */}
              <div className="md:hidden grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">#</span>
                    <span>{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Cab No</span>
                    <span>{service.cab?.cabNumber || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Driver</span>
                    <span>{service.driver?.name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status</span>
                    <span className="capitalize">{service.status || "N/A"}</span>
                  </div>
                </div>

                {/* Amount and Receipt - Full width on mobile */}
                <div className="col-span-2 mt-3">
                  <div className="flex justify-between items-center border-t border-gray-600 pt-3">
                    <span className="text-gray-400">Amount</span>
                    <span>{service.servicingAmount ? `₹${service.servicingAmount}` : "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-600 pt-3">
                    <span className="text-gray-400">Receipt</span>
                    <span>
                      {service.receiptImage ? (
                        <button
                          onClick={() => {
                            setReceiptImage(service.receiptImage)
                            setShowReceiptModal(true)
                          }}
                          className="bg-blue-100 text-blue-800 border border-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition duration-150"
                        >
                          View Receipt
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop View (hidden on mobile) */}
              <div className="hidden md:grid grid-cols-6 gap-4">
                <div className="text-center">{i + 1}</div>
                <div className="text-center">{service.cab?.cabNumber || "N/A"}</div>
                <div className="text-center">{service.driver?.name || "N/A"}</div>
                <div className="text-center capitalize">{service.status || "N/A"}</div>
                <div className="text-center">{service.servicingAmount ? `₹${service.servicingAmount}` : "N/A"}</div>
                <div className="text-center">
                  {service.receiptImage ? (
                    <button
                      onClick={() => {
                        setReceiptImage(service.receiptImage)
                        setShowReceiptModal(true)
                      }}
                      className="bg-blue-100 text-blue-800 border border-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition duration-150"
                    >
                      View Receipt
                    </button>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-lg font-bold mb-4">Assign Servicing</h3>

              <label className="block mb-2">Select Driver:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-700"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">-- Select Driver --</option>
                {getAvailableDrivers().map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>


              <label className="block mb-2">Select Cab:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-700"
                value={selectedCab}
                onChange={(e) => setSelectedCab(e.target.value)}
              >
                <option value="">-- Select Cab --</option>
                {getAvailableCabs().map((cab) => (
                  <option key={cab._id} value={cab._id}>
                    {cab.cabNumber}
                  </option>
                ))}
              </select>

              <div className="flex justify-between gap-3">
                <button
                  onClick={handleAssignServicing}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] md:w-[600px] h-[80%] max-h-[90%] overflow-auto relative">
              <h3 className="text-xl font-semibold mb-4">Receipt Image</h3>
              <img src={receiptImage || "/placeholder.svg"} alt="Receipt" className="w-full max-w-xs mx-auto" />
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={() => setShowReceiptModal(false)} className="bg-red-600 px-4 py-2 rounded text-white">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
