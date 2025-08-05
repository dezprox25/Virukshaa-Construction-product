
"use client"

import { useState } from "react"
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
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

interface SupervisorLeaveApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: (reason: string, isPaid: boolean) => Promise<boolean>
  supervisorName: string
  selectedDates: Date[]
  onDatesChange: (dates: Date[]) => void
  reason: string
  onReasonChange: (reason: string) => void
  isSubmitting: boolean
}

export function SupervisorLeaveApprovalModal({
  isOpen,
  onClose,
  onApprove,
  supervisorName,
  selectedDates,
  reason,
  onReasonChange,
  isSubmitting,
}: SupervisorLeaveApprovalModalProps) {
  const [leaveType, setLeaveType] = useState<"paid" | "unpaid">("paid")

  const handleApprove = async () => {
    if (!reason.trim()) {
      return
    }

    const success = await onApprove(reason, leaveType === "paid")
    if (success) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Label className="text-sm font-medium">Selected Date(s)</Label>
            <div className="flex flex-wrap gap-2">
              {selectedDates.map((date, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {format(date, "MMM dd, yyyy")}
                </Badge>
              ))}
            </div>
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

          {/* Leave Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Leave Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={leaveType === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setLeaveType("paid")}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Paid Leave
              </Button>
              <Button
                type="button"
                variant={leaveType === "unpaid" ? "default" : "outline"}
                size="sm"
                onClick={() => setLeaveType("unpaid")}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Unpaid Leave
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Supervisor:</span>
              <span className="font-medium">{supervisorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days:</span>
              <span className="font-medium">{selectedDates.length} day(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type:</span>
              <Badge
                variant={leaveType === "paid" ? "default" : "secondary"}
                className={leaveType === "paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
              >
                {leaveType === "paid" ? "Paid Leave" : "Unpaid Leave"}
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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
