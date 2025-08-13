import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  supervisorId?: mongoose.Schema.Types.ObjectId;
  employeeId?: mongoose.Schema.Types.ObjectId;
  date: Date;
  status: "Present" | "Absent";
}

const AttendanceSchema: Schema = new Schema(
  {
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supervisor",
      required: false,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure that each supervisor or employee has only one attendance record per day
AttendanceSchema.index({ supervisorId: 1, date: 1 }, { unique: true, partialFilterExpression: { supervisorId: { $exists: true } } });
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true, partialFilterExpression: { employeeId: { $exists: true } } });

const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
