// "use client"
// import { useState, useEffect } from "react"
// import { format } from "date-fns"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
// import { toast } from "sonner"

// // Add this constant at the top of the file
// const PAID_LEAVE_LIMIT = 2 // Maximum paid leave days per month

// interface SupervisorLeaveApprovalModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onApprove: (reason: string, isPaid: boolean, dates: Date[]) => Promise<boolean>
//   supervisorName: string
//   selectedDates?: Date[]
//   reason: string
//   onReasonChange: (reason: string) => void
//   isSubmitting?: boolean
//   existingPaidLeaveDays?: number // Add this line
// }

// export function SupervisorLeaveApprovalModal({
//   isOpen,
//   onClose,
//   onApprove,
//   supervisorName,
//   selectedDates: propSelectedDates = [],
//   reason = "",
//   onReasonChange,
//   isSubmitting = false,
//   existingPaidLeaveDays = 0, // Add this line
// }: SupervisorLeaveApprovalModalProps) {
//   const [leaveType, setLeaveType] = useState<"paid" | "unpaid">("paid")
//   const [localSelectedDates, setLocalSelectedDates] = useState<Date[]>([])
//   const [isInitialized, setIsInitialized] = useState(false)

//   // Calculate if leave should be forced to unpaid due to exceeding limit
//   const totalRequestedDays = localSelectedDates.length
//   const totalDaysAfterRequest = existingPaidLeaveDays + totalRequestedDays
//   const exceedsLimit = totalDaysAfterRequest > PAID_LEAVE_LIMIT
//   const availablePaidDays = Math.max(0, PAID_LEAVE_LIMIT - existingPaidLeaveDays)
//   const forcedUnpaidDays = Math.max(0, totalRequestedDays - availablePaidDays)

//   // Auto-set to unpaid if exceeds limit
//   useEffect(() => {
//     if (exceedsLimit && leaveType === "paid") {
//       setLeaveType("unpaid")
//       console.log(`🚫 Auto-setting to unpaid: ${totalDaysAfterRequest} days exceeds ${PAID_LEAVE_LIMIT} day limit`)
//     }
//   }, [exceedsLimit, totalDaysAfterRequest, leaveType])

//   // Log when modal opens/closes
//   useEffect(() => {
//     console.log(`🚪 Modal ${isOpen ? 'opened' : 'closed'}`)
    
//     if (isOpen) {
//       // Reset initialization state when modal opens
//       setIsInitialized(false)
      
//       // Log initial props
//       console.log("📋 Initial props:", {
//         propSelectedDates: propSelectedDates?.map(d => d?.toISOString?.() || 'invalid date') || [],
//         reason,
//         supervisorName
//       })
//     }
//   }, [isOpen])

//   // Sync props with local state
//   useEffect(() => {
//     if (!isOpen) return
    
//     console.log("🔄 Processing propSelectedDates:", 
//       propSelectedDates?.map(d => d?.toISOString?.() || 'invalid date') || 'none')
    
//     // If we have valid dates in props, use them
//     if (Array.isArray(propSelectedDates) && propSelectedDates.length > 0) {
//       const validDates = propSelectedDates
//         .filter(d => d && d instanceof Date && !isNaN(d.getTime()))
//         .map(d => new Date(d)) // Create new Date objects
        
//       if (validDates.length > 0) {
//         console.log("📅 Setting valid dates:", validDates.map(d => d.toISOString().split('T')[0]))
//         setLocalSelectedDates(validDates)
//         setIsInitialized(true)
//         return
//       }
//     }
    
//     // Fallback to current date if no valid dates provided
//     console.log("📭 No valid dates in props, using current date as fallback")
//     setLocalSelectedDates([new Date()])
//     setIsInitialized(true)
    
//   }, [isOpen, propSelectedDates])

//   // Log when modal opens/closes
//   useEffect(() => {
//     if (isOpen) {
//       console.log("🚪 Modal opened with dates:", 
//         localSelectedDates.map(d => d.toISOString().split('T')[0]))
//     }
//   }, [isOpen, localSelectedDates])

//   const handleApprove = async () => {
//     console.log("🔄 Modal: Starting approval process")
    
//     // Get valid dates
//     const validDates = localSelectedDates
//       .filter(d => d && d instanceof Date && !isNaN(d.getTime()))
//       .map(d => new Date(d)) // Create new Date objects to ensure they're fresh
    
//     // Log current state for debugging
//     console.log("📊 Current modal state:", {
//       reason: reason.trim(),
//       dates: validDates.map(d => d.toISOString().split('T')[0]),
//       isInitialized,
//       leaveType
//     })

//     // Validate reason
//     if (!reason.trim()) {
//       console.log("❌ Modal: No reason provided")
//       toast.error("Please provide a reason for the leave")
//       return
//     }

//     // Validate dates
//     if (!isInitialized) {
//       console.log("⏳ Modal: Not yet initialized")
//       toast.error("Please wait while we prepare the leave form...")
//       return
//     }

//     if (validDates.length === 0) {
//       console.log("❌ Modal: No valid dates found - using current date as fallback")
//       const fallbackDate = new Date()
//       console.log("📅 Using fallback date:", fallbackDate.toISOString().split('T')[0])
//       const success = await onApprove(reason.trim(), leaveType === "paid", [fallbackDate])
//       if (!success) {
//         toast.error("Failed to approve leave. Please try again.")
//       }
//       return
//     }

//     console.log("📋 Modal: Calling onApprove with:", {
//       reason: reason.trim(),
//       isPaid: leaveType === "paid",
//       dates: validDates.map(d => d.toISOString().split('T')[0])
//     })
    
//     const success = await onApprove(reason.trim(), leaveType === "paid", validDates)
//     console.log("📊 Modal: Approval result:", success)
    
//     if (success) {
//       toast.success("Leave approved successfully")
//       onClose()
//     } else {
//       console.log("❌ Modal: Leave approval failed")
//       toast.error("Failed to approve leave. Please try again.")
//     }
//   }

//   const handleClose = () => {
//     console.log("🔄 Modal: Closing modal")
//     onClose()
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Calendar className="w-5 h-5" />
//             Leave Request for {supervisorName}
//           </DialogTitle>
//           <DialogDescription>Please review and approve the leave request details below.</DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Selected Dates */}
//           <div className="space-y-2">
//             <Label>Selected Dates</Label>
//             <div className="flex flex-wrap gap-2">
//               {localSelectedDates.length > 0 ? (
//                 localSelectedDates.map((date, index) => (
//                   <Badge key={index} variant="outline" className="flex items-center gap-1">
//                     <Calendar className="h-3 w-3" />
//                     {format(date, "MMM d, yyyy")}
//                   </Badge>
//                 ))
//               ) : (
//                 <p className="text-sm text-muted-foreground">No dates selected</p>
//               )}
//             </div>
//             {localSelectedDates.length > 0 && (
//               <p className="text-xs text-muted-foreground">
//                 {localSelectedDates.length} day{localSelectedDates.length > 1 ? 's' : ''} selected
//               </p>
//             )}
//           </div>

//           {/* Leave Reason */}
//           <div className="space-y-2">
//             <Label htmlFor="leave-reason" className="text-sm font-medium">
//               Leave Reason *
//             </Label>
//             <Textarea
//               id="leave-reason"
//               placeholder="Enter reason for leave..."
//               value={reason}
//               onChange={(e) => onReasonChange(e.target.value)}
//               rows={3}
//               className="resize-none"
//             />
//           </div>

//           {/* Leave Type Selection */}
//           <div className="space-y-3">
//             <Label className="text-sm font-medium">Leave Type</Label>
            
//             {/* Show paid leave limit information */}
//             <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
//               <div className="flex items-center gap-1 mb-1">
//                 <Calendar className="w-3 h-3" />
//                 <span className="font-medium">Monthly Paid Leave Status:</span>
//               </div>
//               <div>Used: {existingPaidLeaveDays}/{PAID_LEAVE_LIMIT} days</div>
//               <div>Available: {availablePaidDays} days</div>
//               {exceedsLimit && (
//                 <div className="text-amber-600 font-medium mt-1">
//                   ⚠️ Request exceeds monthly limit. {forcedUnpaidDays} day{forcedUnpaidDays !== 1 ? 's' : ''} will be unpaid.
//                 </div>
//               )}
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 type="button"
//                 variant={leaveType === "paid" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => !exceedsLimit && setLeaveType("paid")}
//                 disabled={exceedsLimit}
//                 className="flex items-center gap-2"
//               >
//                 <CheckCircle className="w-4 h-4" />
//                 Paid Leave
//                 {exceedsLimit && <span className="text-xs">(Limit Exceeded)</span>}
//               </Button>
//               <Button
//                 type="button"
//                 variant={leaveType === "unpaid" ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => setLeaveType("unpaid")}
//                 className="flex items-center gap-2"
//               >
//                 <XCircle className="w-4 h-4" />
//                 Unpaid Leave
//                 {exceedsLimit && <span className="text-xs">(Required)</span>}
//               </Button>
//             </div>
            
//             {exceedsLimit && (
//               <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
//                 <strong>Note:</strong> This leave request exceeds the monthly paid leave limit of {PAID_LEAVE_LIMIT} days. 
//                 The system has automatically set this to unpaid leave.
//               </div>
//             )}
//           </div>

//           {/* Summary */}
//           <div className="bg-muted/50 p-3 rounded-lg space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-muted-foreground">Supervisor:</span>
//               <span className="font-medium">{supervisorName}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-muted-foreground">Days Requested:</span>
//               <span className="font-medium">{localSelectedDates.length} day{localSelectedDates.length !== 1 ? 's' : ''}</span>
//             </div>
            
//             {exceedsLimit && availablePaidDays > 0 ? (
//               // Show breakdown when there's a mix
//               <>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Paid Days:</span>
//                   <span className="font-medium text-green-600">{availablePaidDays} day{availablePaidDays !== 1 ? 's' : ''}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Unpaid Days:</span>
//                   <span className="font-medium text-amber-600">{forcedUnpaidDays} day{forcedUnpaidDays !== 1 ? 's' : ''}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-muted-foreground">Type:</span>
//                   <Badge className="bg-amber-100 text-amber-800">
//                     Mixed (Paid + Unpaid)
//                   </Badge>
//                 </div>
//               </>
//             ) : (
//               // Show single type
//               <div className="flex justify-between text-sm">
//                 <span className="text-muted-foreground">Type:</span>
//                 <Badge
//                   variant={leaveType === "paid" ? "default" : "secondary"}
//                   className={leaveType === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
//                 >
//                   {leaveType === "paid" ? "Paid Leave" : "Unpaid Leave"}
//                 </Badge>
//               </div>
//             )}
            
//             <div className="flex justify-between text-sm">
//               <span className="text-muted-foreground">Monthly Usage:</span>
//               <span className="font-medium">{totalDaysAfterRequest}/{PAID_LEAVE_LIMIT} paid days</span>
//             </div>
//           </div>
//         </div>

//         <DialogFooter className="gap-2">
//           <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             onClick={handleApprove}
//             disabled={!reason.trim() || isSubmitting}
//             className="flex items-center gap-2"
//           >
//             {isSubmitting ? (
//               <>
//                 <Clock className="w-4 h-4 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <CheckCircle className="w-4 h-4" />
//                 Approve Leave
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }


"use client"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from "sonner"

// Add this constant at the top of the file
const PAID_LEAVE_LIMIT = 2 // Maximum paid leave days per month

interface SupervisorLeaveApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (reason: string, isPaid: boolean, dates: Date[]) => Promise<boolean>
  supervisorName: string
  selectedDates?: Date[]
  reason: string
  onReasonChange: (reason: string) => void
  isSubmitting?: boolean
  existingPaidLeaveDays?: number // Add this line
}

export function SupervisorLeaveApprovalModal({
  isOpen,
  onClose,
  onApprove,
  supervisorName,
  selectedDates: propSelectedDates = [],
  reason = "",
  onReasonChange,
  isSubmitting = false,
  existingPaidLeaveDays = 0, // Add this line
}: SupervisorLeaveApprovalModalProps) {
  const [localSelectedDates, setLocalSelectedDates] = useState<Date[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Calculate if leave should be forced to unpaid due to exceeding limit
  const totalRequestedDays = localSelectedDates.length
  const totalDaysAfterRequest = existingPaidLeaveDays + totalRequestedDays
  const exceedsLimit = totalDaysAfterRequest > PAID_LEAVE_LIMIT
  const availablePaidDays = Math.max(0, PAID_LEAVE_LIMIT - existingPaidLeaveDays)
  const forcedUnpaidDays = Math.max(0, totalRequestedDays - availablePaidDays)

  // Log when modal opens/closes
  useEffect(() => {
    console.log(`🚪 Modal ${isOpen ? 'opened' : 'closed'}`)
    
    if (isOpen) {
      // Reset initialization state when modal opens
      setIsInitialized(false)
      
      // Log initial props
      console.log("📋 Initial props:", {
        propSelectedDates: propSelectedDates?.map(d => d?.toISOString?.() || 'invalid date') || [],
        reason,
        supervisorName
      })
    }
  }, [isOpen])

  // Sync props with local state
  useEffect(() => {
    if (!isOpen) return
    
    console.log("🔄 Processing propSelectedDates:", 
      propSelectedDates?.map(d => d?.toISOString?.() || 'invalid date') || 'none')
    
    // If we have valid dates in props, use them
    if (Array.isArray(propSelectedDates) && propSelectedDates.length > 0) {
      const validDates = propSelectedDates
        .filter(d => d && d instanceof Date && !isNaN(d.getTime()))
        .map(d => new Date(d)) // Create new Date objects
        
      if (validDates.length > 0) {
        console.log("📅 Setting valid dates:", validDates.map(d => d.toISOString().split('T')[0]))
        setLocalSelectedDates(validDates)
        setIsInitialized(true)
        return
      }
    }
    
    // Fallback to current date if no valid dates provided
    console.log("📭 No valid dates in props, using current date as fallback")
    setLocalSelectedDates([new Date()])
    setIsInitialized(true)
    
  }, [isOpen, propSelectedDates])

  // Log when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      console.log("🚪 Modal opened with dates:", 
        localSelectedDates.map(d => d.toISOString().split('T')[0]))
    }
  }, [isOpen, localSelectedDates])

  const handleApprove = async () => {
    console.log("🔄 Modal: Starting approval process")
    
    // Get valid dates
    const validDates = localSelectedDates
      .filter(d => d && d instanceof Date && !isNaN(d.getTime()))
      .map(d => new Date(d)) // Create new Date objects to ensure they're fresh
    
    // Log current state for debugging
    console.log("📊 Current modal state:", {
      reason: reason.trim(),
      dates: validDates.map(d => d.toISOString().split('T')[0]),
      isInitialized
    })

    // Validate reason
    if (!reason.trim()) {
      console.log("❌ Modal: No reason provided")
      toast.error("Please provide a reason for the leave")
      return
    }

    // Validate dates
    if (!isInitialized) {
      console.log("⏳ Modal: Not yet initialized")
      toast.error("Please wait while we prepare the leave form...")
      return
    }

    if (validDates.length === 0) {
      console.log("❌ Modal: No valid dates found - using current date as fallback")
      const fallbackDate = new Date()
      console.log("📅 Using fallback date:", fallbackDate.toISOString().split('T')[0])
      const success = await onApprove(reason.trim(), true, [fallbackDate])
      if (!success) {
        toast.error("Failed to approve leave. Please try again.")
      }
      return
    }

    console.log("📋 Modal: Calling onApprove with:", {
      reason: reason.trim(),
      isPaid: true,
      dates: validDates.map(d => d.toISOString().split('T')[0])
    })
    
    const success = await onApprove(reason.trim(), true, validDates)
    console.log("📊 Modal: Approval result:", success)
    
    if (success) {
      toast.success("Leave approved successfully")
      onClose()
    } else {
      console.log("❌ Modal: Leave approval failed")
      toast.error("Failed to approve leave. Please try again.")
    }
  }

  const handleClose = () => {
    console.log("🔄 Modal: Closing modal")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Request for {supervisorName}
          </DialogTitle>
          <DialogDescription>Please review and approve the leave request details below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Dates */}
          <div className="space-y-2">
            <Label>Selected Dates</Label>
            <div className="flex flex-wrap gap-2">
              {localSelectedDates.length > 0 ? (
                localSelectedDates.map((date, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(date, "MMM d, yyyy")}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No dates selected</p>
              )}
            </div>
            {localSelectedDates.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {localSelectedDates.length} day{localSelectedDates.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Leave Reason */}
          <div className="space-y-2">
            <Label htmlFor="leave-reason" className="text-sm font-medium">
              Leave Reason *
            </Label>
            <Textarea
              id="leave-reason"
              placeholder="Enter reason for leave..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Show paid leave limit information */}
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" />
              <span className="font-medium">Monthly Paid Leave Status:</span>
            </div>
            <div>Used: {existingPaidLeaveDays}/{PAID_LEAVE_LIMIT} days</div>
            <div>Available: {availablePaidDays} days</div>
            {exceedsLimit && (
              <div className="text-amber-600 font-medium mt-1">
                ⚠️ Request exceeds monthly limit. {forcedUnpaidDays} day{forcedUnpaidDays !== 1 ? 's' : ''} will be automatically set as unpaid.
              </div>
            )}
            <div className="text-blue-600 text-xs mt-1">
              💡 First {PAID_LEAVE_LIMIT} days per month are paid, additional days are unpaid.
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Supervisor:</span>
              <span className="font-medium">{supervisorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days Requested:</span>
              <span className="font-medium">{localSelectedDates.length} day{localSelectedDates.length !== 1 ? 's' : ''}</span>
            </div>
            
            {exceedsLimit && availablePaidDays > 0 ? (
              // Show breakdown when there's a mix
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid Days:</span>
                  <span className="font-medium text-green-600">{availablePaidDays} day{availablePaidDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unpaid Days:</span>
                  <span className="font-medium text-amber-600">{forcedUnpaidDays} day{forcedUnpaidDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge className="bg-amber-100 text-amber-800">
                    Mixed (Auto-calculated)
                  </Badge>
                </div>
              </>
            ) : (
              // Show single type
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type:</span>
                <Badge
                  className={exceedsLimit ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}
                >
                  {exceedsLimit ? "Unpaid Leave (Auto)" : "Paid Leave (Auto)"}
                </Badge>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Usage:</span>
              <span className="font-medium">{Math.min(existingPaidLeaveDays + localSelectedDates.length, PAID_LEAVE_LIMIT)}/{PAID_LEAVE_LIMIT} paid days</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={!reason.trim() || isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve Leave
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
