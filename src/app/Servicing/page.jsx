
// "use client"
// import { useState, useEffect } from "react"
// import Sidebar from "../slidebar/page"
// import axios from "axios"
// import { motion } from "framer-motion"
// import baseURL from "@/utils/api"
// import { useRouter } from "next/navigation"

// const AccessDeniedModal = () => {
//   const router = useRouter()

//   const handleClose = () => {
//     router.push("/")
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
//       <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-sm w-full">
//         <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
//         <p className="mb-6">Your access has been restricted. Please contact the administrator.</p>
//         <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
//           Close
//         </button>
//       </div>
//     </div>
//   )
// }

// export default function CabService() {
//   const router = useRouter()
//   const [showAccessDenied, setShowAccessDenied] = useState(false)
//   const [drivers, setDrivers] = useState([])
//   const [assignments, setAssignments] = useState([])
//   const [services, setServices] = useState([])
//   const [mergedServices, setMergedServices] = useState([])
//   const [selectedDriver, setSelectedDriver] = useState("")
//   const [selectedCab, setSelectedCab] = useState("")
//   const [receiptImage, setReceiptImage] = useState("")
//   const [showAssignModal, setShowAssignModal] = useState(false)
//   const [showReceiptModal, setShowReceiptModal] = useState(false)

//   const token = typeof window !== "undefined" && localStorage.getItem("token")
//   const assignedBy = typeof window !== "undefined" && localStorage.getItem("id")

//   useEffect(() => {
//     const checkUserStatus = async () => {
//       try {
//         const id = localStorage.getItem("id")
//         if (!id) {
//           router.push("/")
//           return
//         }

//         const subAdminsRes = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
//         const loggedInUser = subAdminsRes.data.subAdmins.find((e) => e._id === id)

//         if (loggedInUser?.status === "Inactive") {
//           localStorage.clear()
//           setShowAccessDenied(true)
//           return
//         }
//       } catch (err) {
//         console.error("Error checking user status:", err)
//       }
//     }

//     checkUserStatus()
//   }, [router])

//   useEffect(() => {
//     fetchInitialData()
//   }, [])

//  useEffect(() => {
//   // Merge services with correct driver information
//   if (services.length > 0 && drivers.length > 0) {
//     const merged = services.map((service) => {
//       // Find the correct driver for this service
//       let serviceDriver = null
      
//       // First, try to get driver from service.driver or service.driverId
//       if (service.driver && typeof service.driver === 'object') {
//         serviceDriver = service.driver
//       } else if (service.driverId || service.driver) {
//         // If driver is just an ID, find the full driver object
//         const driverId = service.driverId || service.driver
//         serviceDriver = drivers.find(driver => driver._id === driverId)
//       }

//       // Find the assignment that matches this service's cab
//       const assignment = assignments.find((assign) => assign.cab?._id === service.cab?._id)

//       return {
//         ...service,
//         cab: assignment?.cab || service.cab,
//         driver: serviceDriver || assignment?.driver || service.driver,
//       }
//     })
//     setMergedServices(merged)
//   }
// }, [services, assignments, drivers])


//   const fetchInitialData = async () => {
//     try {
//       const [driversRes, assignmentsRes, servicesRes] = await Promise.all([
//         axios.get(`${baseURL}api/driver/profile`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${baseURL}api/assigncab`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${baseURL}api/servicing`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ])

//       setDrivers(driversRes.data)
//       setAssignments(assignmentsRes.data)
//       setServices(servicesRes.data.services || [])
//     } catch (error) {
//       console.error("Error fetching:", error)
//     }
//   }



//   const handleAssignServicing = async () => {
//     if (!selectedCab || !selectedDriver) return alert("Select both cab and driver.")



//     try {
//       await axios.post(
//         `${baseURL}api/servicing/assign`,
//         { cabId: selectedCab, driverId: selectedDriver, assignedBy },
//         { headers: { Authorization: `Bearer ${token}` } },
//       )
//       alert("Servicing assigned successfully")
//       setShowAssignModal(false)
//       setSelectedCab("")
//       setSelectedDriver("")
//       fetchInitialData() // refresh list
//     } catch (err) {
//       console.error("Assign error:", err)
//       alert("Failed to assign servicing.")
//     }
//   }

//   const calculateKmTravelled = (assignment) => {

//     // Check multiple possible paths for meter readings
//     let meterReadings = null

//     if (assignment?.tripDetails?.vehicleServicing?.meter) {
//       meterReadings = assignment.tripDetails.vehicleServicing.meter
//     } else if (assignment?.vehicleServicing?.meter) {
//       meterReadings = assignment.vehicleServicing.meter
//     } else if (assignment?.meter) {
//       meterReadings = assignment.meter
//     }


//     // If no meter readings or empty array, return 0
//     if (!meterReadings || (Array.isArray(meterReadings) && meterReadings.length === 0)) {
//       console.log("No meter readings or empty array, returning 0")
//       return 0
//     }

//     if (Array.isArray(meterReadings)) {
//       const total = meterReadings.reduce((sum, value) => {
//         const numValue = Number(value) || 0
//         console.log("Adding meter value:", numValue)
//         return sum + numValue
//       }, 0)
//       console.log("Total calculated KM:", total)
//       return total
//     }

//     // If it's a single number
//     const singleValue = Number(meterReadings) || 0
//     console.log("Single meter value:", singleValue)
//     return singleValue
//   }

//   const getAvailableCabs = () => {
//     console.log("All assignments:", assignments)
//     const cabMap = new Map()

//     // First, collect all unique cabs with their total km
//     assignments.forEach((assignment) => {
//       if (assignment.cab && assignment.cab._id) {
//         const cabId = assignment.cab._id
//         const kmTravelled = calculateKmTravelled(assignment)

       
//         // Only consider cabs that have actual km readings and are not recently reset
//         if (kmTravelled > 0) {
//           // If we haven't seen this cab before, or if this assignment has more km, update it
//           if (!cabMap.has(cabId) || cabMap.get(cabId).kmTravelled < kmTravelled) {
//             cabMap.set(cabId, {
//               ...assignment.cab,
//               kmTravelled: kmTravelled,
//               assignmentStatus: assignment.status,
//             })
//           }
//         }
//       }
//     })

//     // Convert map to array and filter for cabs with > 10000 km
//     const cabsWithHighKm = Array.from(cabMap.values()).filter((cab) => {
//       console.log(`Filtering cab ${cab.cabNumber}: ${cab.kmTravelled} km`)
//       return cab.kmTravelled > 10000
//     })


//     // Filter out cabs that already have active (non-completed) servicing
//     const availableCabs = cabsWithHighKm.filter((cab) => {
//       const activeServices = services.filter(
//         (service) => service.cab?._id === cab._id && service.status?.toLowerCase() !== "completed",
//       )

//       // Remove the reset meter check since we already calculated km > 10000
//       // If a cab has > 10000 km, it means it has valid meter readings
//       const isAvailable = activeServices.length === 0
//       console.log(`Cab ${cab.cabNumber} available: ${isAvailable} (active services: ${activeServices.length})`)

//       return isAvailable
//     })

//     console.log("Final available cabs:", availableCabs)
//     return availableCabs
//   }




//   const getAvailableDrivers = () => {
//     const driverStatusMap = {};

//     // Build a map of driverId -> array of their statuses
//     services.forEach(service => {
//       const driverId = service.driver?._id || service.driverId || service.driver;
//       if (driverId) {
//         if (!driverStatusMap[driverId]) {
//           driverStatusMap[driverId] = [];
//         }
//         driverStatusMap[driverId].push(service.status);
//       }
//     });

//     // Drivers with at least one pending servicing
//     const driversWithPending = Object.entries(driverStatusMap)
//       .filter(([_, statuses]) => statuses.includes("pending"))
//       .map(([driverId]) => driverId);

//     // Filtered list of drivers to be shown
//     const availableDrivers = drivers.filter(driver => {
//       const statuses = driverStatusMap[driver._id] || [];
//       return !statuses.includes("pending");
//     });

  
//     return availableDrivers;
//   };






//   return (
//     <div className="flex bg-gray-900 min-h-screen text-white">
//       <Sidebar />
//       <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
//         {showAccessDenied && <AccessDeniedModal />}

//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">Servicing Assignments</h2>
//           <button onClick={() => setShowAssignModal(true)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
//             Assign Servicing
//           </button>
//         </div>

//         {/* ✅ Table */}
//         <div className="bg-gray-800 rounded-lg shadow p-4 space-y-4">
//           {/* Desktop Table Header */}
//           <div className="hidden md:grid grid-cols-6 gap-4 text-gray-400 font-medium mb-2">
//             <div className="text-center">#</div>
//             <div className="text-center">Cab Number</div>
//             <div className="text-center">Driver</div>
//             <div className="text-center">Status</div>
//             <div className="text-center">Amount</div>
//             <div className="text-center">Receipt</div>
//           </div>

//           {mergedServices.map((service, i) => (
//             <div
//               key={service._id}
//               className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
//             >
//               {/* Mobile View (2 columns) */}
//               <div className="md:hidden grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <span className="text-gray-400">#</span>
//                     <span>{i + 1}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-gray-400">Cab No</span>
//                     <span>{service.cab?.cabNumber || "N/A"}</span>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <span className="text-gray-400">Driver</span>
//                     <span>{service.driver?.name || "N/A"}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-gray-400">Status</span>
//                     <span className="capitalize">{service.status || "N/A"}</span>
//                   </div>
//                 </div>

//                 {/* Amount and Receipt - Full width on mobile */}
//                 <div className="col-span-2 mt-3">
//                   <div className="flex justify-between items-center border-t border-gray-600 pt-3">
//                     <span className="text-gray-400">Amount</span>
//                     <span>{service.servicingAmount ? `₹${service.servicingAmount}` : "N/A"}</span>
//                   </div>

//                   <div className="flex justify-between items-center border-t border-gray-600 pt-3">
//                     <span className="text-gray-400">Receipt</span>
//                     <span>
//                       {service.receiptImage ? (
//                         <button
//                           onClick={() => {
//                             setReceiptImage(service.receiptImage)
//                             setShowReceiptModal(true)
//                           }}
//                           className="bg-blue-100 text-blue-800 border border-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition duration-150"
//                         >
//                           View Receipt
//                         </button>
//                       ) : (
//                         "N/A"
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Desktop View (hidden on mobile) */}
//               <div className="hidden md:grid grid-cols-6 gap-4">
//                 <div className="text-center">{i + 1}</div>
//                 <div className="text-center">{service.cab?.cabNumber || "N/A"}</div>
//                 <div className="text-center">{service.driver?.name || "N/A"}</div>
//                 <div className="text-center capitalize">{service.status || "N/A"}</div>
//                 <div className="text-center">{service.servicingAmount ? `₹${service.servicingAmount}` : "N/A"}</div>
//                 <div className="text-center">
//                   {service.receiptImage ? (
//                     <button
//                       onClick={() => {
//                         setReceiptImage(service.receiptImage)
//                         setShowReceiptModal(true)
//                       }}
//                       className="bg-blue-100 text-blue-800 border border-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 transition duration-150"
//                     >
//                       View Receipt
//                     </button>
//                   ) : (
//                     "N/A"
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Assign Modal */}
//         {showAssignModal && (
//           <div className="fixed inset-0 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md flex justify-center items-center z-50 p-4">
//             <motion.div
//               className="bg-gray-800 p-6 rounded-lg w-full max-w-md"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//             >
//               <h3 className="text-lg font-bold mb-4">Assign Servicing</h3>

//               <label className="block mb-2">Select Driver:</label>
//               <select
//                 className="w-full p-2 mb-4 rounded bg-gray-700"
//                 value={selectedDriver}
//                 onChange={(e) => setSelectedDriver(e.target.value)}
//               >
//                 <option value="">-- Select Driver --</option>
//                 {getAvailableDrivers().map((driver) => (
//                   <option key={driver._id} value={driver._id}>
//                     {driver.name}
//                   </option>
//                 ))}
//               </select>


//               <label className="block mb-2">Select Cab:</label>
//               <select
//                 className="w-full p-2 mb-4 rounded bg-gray-700"
//                 value={selectedCab}
//                 onChange={(e) => setSelectedCab(e.target.value)}
//               >
//                 <option value="">-- Select Cab --</option>
//                 {getAvailableCabs().map((cab) => (
//                   <option key={cab._id} value={cab._id}>
//                     {cab.cabNumber}
//                   </option>
//                 ))}
//               </select>

//               <div className="flex justify-between gap-3">
//                 <button
//                   onClick={handleAssignServicing}
//                   className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full"
//                 >
//                   Assign
//                 </button>
//                 <button
//                   onClick={() => setShowAssignModal(false)}
//                   className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}

//         {/* Receipt Modal */}
//         {showReceiptModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
//             <div className="bg-white rounded-lg shadow-lg p-4 w-[90%] md:w-[600px] h-[80%] max-h-[90%] overflow-auto relative">
//               <h3 className="text-xl font-semibold mb-4">Receipt Image</h3>
//               <img src={receiptImage || "/placeholder.svg"} alt="Receipt" className="w-full max-w-xs mx-auto" />
//               <div className="flex justify-center gap-4 mt-4">
//                 <button onClick={() => setShowReceiptModal(false)} className="bg-red-600 px-4 py-2 rounded text-white">
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }











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
  const [loading, setLoading] = useState(false)

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
    // Merge services with correct driver information
    if (services.length > 0) {
      const merged = services.map((service) => {
        // Find the assignment that matches this service's cab
        const assignment = assignments.find((assign) => assign.cab?._id === service.cab?._id)

        // Get driver info - prioritize populated driver from service
        let serviceDriver = service.driver
        if (!serviceDriver || typeof serviceDriver === "string") {
          // If driver is just an ID, find the full driver object
          const driverId = service.driver || service.driverId
          serviceDriver = drivers.find((driver) => driver._id === driverId) || assignment?.driver
        }

        return {
          ...service,
          cab: service.cab || assignment?.cab,
          driver: serviceDriver,
        }
      })
      setMergedServices(merged)
    }
  }, [services, assignments, drivers])

  const fetchInitialData = async () => {
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const handleAssignServicing = async () => {
    if (!selectedCab || !selectedDriver) {
      alert("Please select both cab and driver.")
      return
    }

    setLoading(true)
    try {
      await axios.post(
        `${baseURL}api/servicing/assign`,
        {
          cabId: selectedCab,
          driverId: selectedDriver,
          assignedBy,
          serviceDate: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      alert("Servicing assigned successfully")
      setShowAssignModal(false)
      setSelectedCab("")
      setSelectedDriver("")
      await fetchInitialData() // refresh list
    } catch (err) {
      console.error("Assign error:", err)
      alert(err.response?.data?.error || "Failed to assign servicing.")
    } finally {
      setLoading(false)
    }
  }

  const calculateKmTravelled = (assignment) => {
    // Check multiple possible paths for meter readings
    let meterReadings = null

    if (assignment?.tripDetails?.vehicleServicing?.meter) {
      meterReadings = assignment.tripDetails.vehicleServicing.meter
    } else if (assignment?.vehicleServicing?.meter) {
      meterReadings = assignment.vehicleServicing.meter
    } else if (assignment?.meter) {
      meterReadings = assignment.meter
    }

    // If no meter readings or empty array, return 0
    if (!meterReadings || (Array.isArray(meterReadings) && meterReadings.length === 0)) {
      return 0
    }

    if (Array.isArray(meterReadings)) {
      const total = meterReadings.reduce((sum, value) => {
        const numValue = Number(value) || 0
        return sum + numValue
      }, 0)
      return total
    }

    // If it's a single number
    return Number(meterReadings) || 0
  }

  const getAvailableCabs = () => {
    const cabMap = new Map()

    // Collect all unique cabs with their total km
    assignments.forEach((assignment) => {
      if (assignment.cab && assignment.cab._id) {
        const cabId = assignment.cab._id
        const kmTravelled = calculateKmTravelled(assignment)

        // Only consider cabs that have actual km readings
        if (kmTravelled > 0) {
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

    // Filter for cabs with > 10000 km and no active servicing
    const availableCabs = Array.from(cabMap.values()).filter((cab) => {
      const hasHighKm = cab.kmTravelled > 10000
      const hasActiveService = services.some(
        (service) => service.cab?._id === cab._id && service.status !== "completed",
      )

      return hasHighKm && !hasActiveService
    })

    return availableCabs
  }

  const getAvailableDrivers = () => {
    // Get drivers who don't have any pending servicing assignments
    const driversWithPendingService = services
      .filter((service) => service.status !== "completed")
      .map((service) => service.driver?._id || service.driver)
      .filter(Boolean)

    return drivers.filter((driver) => !driversWithPendingService.includes(driver._id))
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      assigned: "bg-blue-100 text-blue-800 border-blue-300",
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.pending}`}
      >
        {status || "pending"}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex bg-gray-900 min-h-screen text-white">
        <Sidebar />
        <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
        {showAccessDenied && <AccessDeniedModal />}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Servicing Assignments</h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            disabled={loading}
          >
            Assign Servicing
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300">Total Servicings</h3>
            <p className="text-2xl font-bold text-white">{services.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300">Pending</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {services.filter((s) => s.status !== "completed").length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300">Completed</h3>
            <p className="text-2xl font-bold text-green-400">
              {services.filter((s) => s.status === "completed").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg shadow p-4 space-y-4">
          {mergedServices.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No servicing assignments found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-7 gap-4 text-gray-400 font-medium mb-2 pb-2 border-b border-gray-600">
                <div className="text-center">#</div>
                <div className="text-center">Cab Number</div>
                <div className="text-center">Driver</div>
                <div className="text-center">Status</div>
                <div className="text-center">Amount</div>
                <div className="text-center">Receipt</div>
                <div className="text-center">Date</div>
              </div>

              {mergedServices.map((service, i) => (
                <div
                  key={service._id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
                >
                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          #{i + 1} - {service.cab?.cabNumber || "N/A"}
                        </p>
                        <p className="text-sm text-gray-400">{service.driver?.name || "N/A"}</p>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Amount: </span>
                        <span>{service.servicingAmount ? `₹${service.servicingAmount}` : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date: </span>
                        <span>{service.serviceDate ? new Date(service.serviceDate).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>

                    {service.receiptImage && (
                      <button
                        onClick={() => {
                          setReceiptImage(service.receiptImage)
                          setShowReceiptModal(true)
                        }}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition duration-150"
                      >
                        View Receipt
                      </button>
                    )}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-7 gap-4 items-center">
                    <div className="text-center">{i + 1}</div>
                    <div className="text-center font-medium">{service.cab?.cabNumber || "N/A"}</div>
                    <div className="text-center">{service.driver?.name || "N/A"}</div>
                    <div className="text-center">{getStatusBadge(service.status)}</div>
                    <div className="text-center">{service.servicingAmount ? `₹${service.servicingAmount}` : "N/A"}</div>
                    <div className="text-center">
                      {service.receiptImage ? (
                        <button
                          onClick={() => {
                            setReceiptImage(service.receiptImage)
                            setShowReceiptModal(true)
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition duration-150"
                        >
                          View Receipt
                        </button>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    <div className="text-center text-sm">
                      {service.serviceDate ? new Date(service.serviceDate).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-lg font-bold mb-4">Assign Servicing</h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Select Driver:</label>
                  <select
                    className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Select Cab:</label>
                  <select
                    className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={selectedCab}
                    onChange={(e) => setSelectedCab(e.target.value)}
                  >
                    <option value="">-- Select Cab --</option>
                    {getAvailableCabs().map((cab) => (
                      <option key={cab._id} value={cab._id}>
                        {cab.cabNumber} ({cab.kmTravelled.toLocaleString()} KM)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={handleAssignServicing}
                  disabled={loading || !selectedCab || !selectedDriver}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed w-full transition-colors"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedCab("")
                    setSelectedDriver("")
                  }}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Receipt Image</h3>
              <div className="flex justify-center mb-4">
                <img
                  src={receiptImage || "/placeholder.svg"}
                  alt="Receipt"
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white transition-colors"
                >
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
