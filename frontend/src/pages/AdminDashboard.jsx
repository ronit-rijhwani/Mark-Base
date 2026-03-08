/**
 * Complete Admin Dashboard with all management features
 */
import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { adminAPI } from "../services/api";
import "../styles/dashboard.css";
function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSubTab, setActiveSubTab] = useState("students");
  const [message, setMessage] = useState({ type: "", text: "" });
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  // Data states
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [parents, setParents] = useState([]);

  const hasParentUsername = parents.some((parent) => parent.username);

  // Form states
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showDivisionForm, setShowDivisionForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [classForm, setClassForm] = useState({ name: "", department_id: "" });
  const [divisionForm, setDivisionForm] = useState({ name: "", department_id: "", class_id: "" });
  const [studentForm, setStudentForm] = useState({
    username: "",
    roll_number: "",
    enrollment_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    class_id: "",
    division_id: "",
    date_of_birth: "",
    enrollment_year: new Date().getFullYear(),
  });
  const [batches, setBatches] = useState([]);
  const [selectedStudentForFace, setSelectedStudentForFace] = useState(null);
  const [staffForm, setStaffForm] = useState({
    staff_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    class_id: "",
    division_id: "",
    username: "",
    password: "",
  });
  const [showParentForm, setShowParentForm] = useState(false);

  // Edit states
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingParent, setEditingParent] = useState(null);

  // Attendance management states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceDivision, setAttendanceDivision] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showAttendanceManager, setShowAttendanceManager] = useState(false);

  const [parentForm, setParentForm] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    relation: "father",
    username: "",
    password: ""
  });
  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);
  const loadAllData = async () => {
    try {
      const [depts, cls, divs, studs, stf, subjs, btchs, prnts] =
        await Promise.all([
          adminAPI.getDepartments(),
          adminAPI.getClasses(),
          adminAPI.getDivisions(),
          adminAPI.getStudents(),
          adminAPI.getStaff(),
          adminAPI.getSubjects(),
          adminAPI.getBatches(),
          adminAPI.getParents(),

        ]);
      setDepartments(depts);
      setClasses(cls);
      setDivisions(divs);
      setStudents(studs);
      setStaff(stf);
      setSubjects(subjs);
      setBatches(btchs);
      setParents(prnts);

    } catch (error) {
      showMessage("error", "Failed to load data");
    }
  };

  // Load attendance records when division and date are selected
  const loadAttendanceRecords = async () => {
    if (!attendanceDivision || !attendanceDate) return;
    try {
      const data = await adminAPI.getDivisionAttendance(attendanceDivision, attendanceDate);
      setAttendanceRecords(data.records || []);
    } catch (error) {
      showMessage("error", "Failed to load attendance records");
    }
  };

  // Handle attendance status update
  const handleUpdateAttendance = async (studentId, status) => {
    try {
      await adminAPI.updateAttendance({
        student_id: studentId,
        date: attendanceDate,
        status: status
      });
      showMessage("success", `Attendance marked as ${status}`);
      loadAttendanceRecords();
    } catch (error) {
      showMessage("error", error.response?.data?.detail || "Failed to update attendance");
    }
  };

  // Staff edit handlers
  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffForm({
      staff_id: staffMember.staff_id,
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      department_id: staffMember.department_id?.toString() || "",
      username: "",
      password: "",
    });
    setShowStaffForm(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateStaff(editingStaff.id, {
        staff_id: staffForm.staff_id,
        first_name: staffForm.first_name,
        last_name: staffForm.last_name,
        email: staffForm.email || null,
        phone: staffForm.phone || null,
        department_id: staffForm.department_id ? parseInt(staffForm.department_id) : null,
      });
      showMessage("success", "Staff updated successfully!");
      setShowStaffForm(false);
      setEditingStaff(null);
      setStaffForm({
        staff_id: "",
        first_name: "",
        last_name: "",
        email: "",
        department_id: "",
        username: "",
        password: "",
      });
      loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.detail || "Failed to update staff");
    }
  };

  // Student edit handlers
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      username: "",
      roll_number: student.roll_number,
      enrollment_number: student.enrollment_number || "",
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email || "",
      phone: student.phone || "",
      department_id: student.department_id?.toString() || "",
      class_id: student.class_id?.toString() || "",
      division_id: student.division_id?.toString() || "",
      date_of_birth: student.date_of_birth || "",
      enrollment_year: student.enrollment_year || new Date().getFullYear(),
    });
    setShowStudentForm(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        roll_number: studentForm.roll_number,
        enrollment_number: studentForm.enrollment_number || null,
        first_name: studentForm.first_name,
        last_name: studentForm.last_name,
        email: studentForm.email || null,
        phone: studentForm.phone || null,
        date_of_birth: studentForm.date_of_birth || null,
        enrollment_year: studentForm.enrollment_year ? parseInt(studentForm.enrollment_year) : null,
      };
      if (studentForm.division_id) {
        updateData.division_id = parseInt(studentForm.division_id);
      }
      await adminAPI.updateStudent(editingStudent.id, updateData);
      showMessage("success", "Student updated successfully!");
      setShowStudentForm(false);
      setEditingStudent(null);
      setStudentForm({
        username: "",
        roll_number: "",
        enrollment_number: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: "",
        class_id: "",
        division_id: "",
        date_of_birth: "",
        enrollment_year: new Date().getFullYear(),
      });
      loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.detail || "Failed to update student");
    }
  };

  // Parent edit handlers
  const handleEditParent = (parent) => {
    setEditingParent(parent);
    setParentForm({
      student_id: parent.student_id?.toString() || "",
      first_name: parent.first_name,
      last_name: parent.last_name,
      email: parent.email || "",
      phone: parent.phone || "",
      relation: parent.relation,
      username: "",
      password: ""
    });
    setShowParentForm(true);
  };

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateParent(editingParent.id, {
        first_name: parentForm.first_name,
        last_name: parentForm.last_name,
        email: parentForm.email || null,
        phone: parentForm.phone || null,
        relation: parentForm.relation,
      });
      showMessage("success", "Parent updated successfully!");
      setShowParentForm(false);
      setEditingParent(null);
      setParentForm({
        student_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        relation: "father",
        username: "",
        password: ""
      });
      loadAllData();
    } catch (error) {
      showMessage("error", error.response?.data?.detail || "Failed to update parent");
    }
  };
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };
  // Department handlers
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createDepartment(deptForm);
      showMessage("success", "Department created successfully!");
      setShowDeptForm(false);
      setDeptForm({ name: "", code: "" });
      loadAllData();
    } catch (error) {
      console.error("Department creation error:", error);
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to create department";
      showMessage("error", errorMsg);
    }
  };
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: classForm.name.trim(),
        department_id: parseInt(classForm.department_id),
      };
      await adminAPI.createClass(payload);
      showMessage("success", "Class created successfully!");
      setShowClassForm(false);
      setClassForm({ name: "", department_id: "" });
      loadAllData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to create class";
      showMessage("error", errorMsg);
    }
  };
  const handleCreateDivision = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: divisionForm.name.trim(),
        class_id: parseInt(divisionForm.class_id),
      };
      await adminAPI.createDivision(payload);
      showMessage("success", "Division created successfully!");
      setShowDivisionForm(false);
        setDivisionForm({ name: "", department_id: "", class_id: "" });
      loadAllData();
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to create division";
      showMessage("error", errorMsg);
    }
  };
  // Camera handlers
  const handleCaptureFace = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
  };
  const handleRetakeFace = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };
  // Student handlers
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (
        !studentForm.department_id ||
        !studentForm.class_id ||
        !studentForm.division_id
      ) {
        showMessage("error", "Please select Department, Class, and Division");
        return;
      }
      // Create student first (without face)
      const studentData = {
        username: studentForm.username,
        roll_number: studentForm.roll_number,
        enrollment_number: studentForm.enrollment_number,
        first_name: studentForm.first_name,
        last_name: studentForm.last_name,
        email: studentForm.email,
        phone: studentForm.phone,
        department_id: parseInt(studentForm.department_id),
        class_id: parseInt(studentForm.class_id),
        division_id: parseInt(studentForm.division_id),
        date_of_birth: studentForm.date_of_birth,
        enrollment_year: parseInt(studentForm.enrollment_year),
      };
      const newStudent = await adminAPI.createStudent(studentData);
      // If face is captured, register it
      if (capturedImage) {
        const blob = await fetch(capturedImage).then((r) => r.blob());
        const file = new File([blob], "face.jpg", { type: "image/jpeg" });
        await adminAPI.registerStudentFace(newStudent.id, file);
        showMessage("success", "Student created with face registration!");
      } else {
        showMessage("success", "Student created! Register face later.");
      }
      setShowStudentForm(false);
      setCapturedImage(null);
      setShowCamera(false);
      setStudentForm({
        username: "",
        roll_number: "",
        enrollment_number: "",
        first_name: "",
        last_name: "",
        email: "",
        department_id: "",
        class_id: "",
        division_id: "",
        date_of_birth: "",
        enrollment_year: new Date().getFullYear(),
      });
      loadAllData();
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.detail || "Failed to create student",
      );
    }
  };

  const handleRegisterFace = async (studentId) => {
    if (!capturedImage) {
      showMessage("error", "Please capture a face first");
      return;
    }
    try {
      const blob = await fetch(capturedImage).then((r) => r.blob());
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });
      await adminAPI.registerStudentFace(studentId, file);
      showMessage("success", "Face registered successfully!");
      setSelectedStudentForFace(null);
      setCapturedImage(null);
      setShowCamera(false);
      loadAllData();
    } catch (error) {
      showMessage("error", "Failed to register face");
    }
  };
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>System Management Portal - {user.username}</p>
        </div>
        <button className="btn btn-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
      <div className="container">
        {message.text && (
          <div
            className={`alert alert-${message.type === "error" ? "danger" : "success"}`}
          >
            {message.text}
          </div>
        )}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            ðŸ“Š Overview
          </button>
          <button
            className={`tab ${activeTab === "structure" ? "active" : ""}`}
            onClick={() => setActiveTab("structure")}
          >
            ðŸ›ï¸ Academic Structure
          </button>
          <button
            className={`tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            ðŸ‘¥ Users
          </button>
          <button
            className={`tab ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>

        </div>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{departments.length}</h3>
              <p>Departments</p>
            </div>
            <div className="stat-card">
              <h3>{students.length}</h3>
              <p>Students</p>
            </div>
            <div className="stat-card">
              <h3>{staff.length}</h3>
              <p>Staff</p>
            </div>
            <div className="stat-card">
              <h3>{divisions.length}</h3>
              <p>Divisions</p>
            </div>
          </div>
        )}
        {/* STRUCTURE TAB */}
        {activeTab === "structure" && (
          <div>
            <div className="subtabs">
              <button
                className={activeSubTab === "departments" ? "active" : ""}
                onClick={() => setActiveSubTab("departments")}
              >
                Departments
              </button>
              <button
                className={activeSubTab === "classes" ? "active" : ""}
                onClick={() => setActiveSubTab("classes")}
              >
                Classes
              </button>
              <button
                className={activeSubTab === "divisions" ? "active" : ""}
                onClick={() => setActiveSubTab("divisions")}
              >
                Divisions
              </button>
            </div>
            {activeSubTab === "departments" && (
              <div className="card">
                <div className="card-header">
                  <h3>Departments</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowDeptForm(!showDeptForm)}
                  >
                    + Add Department
                  </button>
                </div>
                {showDeptForm && (
                  <form onSubmit={handleCreateDepartment} className="form-box">
                    <div className="form-group">
                      <label>Department Name</label>
                      <input
                        type="text"
                        required
                        value={deptForm.name}
                        onChange={(e) =>
                          setDeptForm({ ...deptForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Department Code</label>
                      <input
                        type="text"
                        required
                        value={deptForm.code}
                        onChange={(e) =>
                          setDeptForm({ ...deptForm, code: e.target.value })
                        }
                      />
                    </div>
                    <button type="submit" className="btn btn-success">
                      Create
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeptForm(false)}
                    >
                      Cancel
                    </button>
                  </form>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => (
                      <tr key={dept.id}>
                        <td>{dept.id}</td>
                        <td>{dept.name}</td>
                        <td>{dept.code}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `Delete department "${dept.name}"? This cannot be undone.`,
                                )
                              ) {
                                try {
                                  await adminAPI.deleteDepartment(dept.id);
                                  showMessage(
                                    "success",
                                    "Department deleted successfully!",
                                  );
                                  loadAllData();
                                } catch (error) {
                                  const errorMsg =
                                    error.response?.data?.detail ||
                                    "Failed to delete department";
                                  showMessage("error", errorMsg);
                                }
                              }
                            }}
                          >
                            ðŸ—‘ï¸ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeSubTab === "classes" && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3>Classes</h3>
                    <p className="text-muted">
                      Total classes: {classes.length}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowClassForm(!showClassForm)}
                  >
                    + Add Class
                  </button>
                </div>
                {showClassForm && (
                  <form onSubmit={handleCreateClass} className="form-box">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Class Name *</label>
                        <input
                          type="text"
                          required
                          value={classForm.name}
                          onChange={(e) =>
                            setClassForm({ ...classForm, name: e.target.value })
                          }
                          placeholder="1K"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={staffForm.phone}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Department *</label>
                        <select
                          required
                          value={classForm.department_id}
                          onChange={(e) =>
                            setClassForm({
                              ...classForm,
                              department_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        âœ… Create Class
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowClassForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Class</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-muted">
                          No classes yet. Add one above.
                        </td>
                      </tr>
                    ) : (
                      classes.map((cls) => {
                        const dept = departments.find(
                          (item) => item.id === cls.department_id,
                        );
                        return (
                          <tr key={cls.id}>
                            <td>{cls.id}</td>
                            <td>{cls.name}</td>
                            <td>
                              {dept
                                ? `${dept.name} (${dept.code})`
                                : `Department ${cls.department_id}`}
                            </td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Delete class "${cls.name}"? This will also remove linked divisions and subjects.`,
                                    )
                                  ) {
                                    try {
                                      await adminAPI.deleteClass(cls.id);
                                      showMessage(
                                        "success",
                                        "Class deleted successfully!",
                                      );
                                      loadAllData();
                                    } catch (error) {
                                      const errorMsg =
                                        error.response?.data?.detail ||
                                        "Failed to delete class";
                                      showMessage("error", errorMsg);
                                    }
                                  }
                                }}
                              >
                                ðŸ—‘ï¸ Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeSubTab === "divisions" && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h3>Divisions</h3>
                    <p className="text-muted">
                      Total divisions: {divisions.length}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowDivisionForm(!showDivisionForm)}
                  >
                    + Add Division
                  </button>
                </div>
                {showDivisionForm && (
                  <form onSubmit={handleCreateDivision} className="form-box">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Division Name *</label>
                        <input
                          type="text"
                          required
                          value={divisionForm.name}
                          onChange={(e) =>
                            setDivisionForm({
                              ...divisionForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="A"
                        />
                      </div>
                      <div className="form-group">
                        <label>Department *</label>
                        <select
                          required
                          value={divisionForm.department_id}
                          onChange={(e) =>
                            setDivisionForm({
                              ...divisionForm,
                              department_id: e.target.value,
                              class_id: "", // Reset class when department changes
                            })
                          }
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Class *</label>
                        <select
                          required
                          value={divisionForm.class_id}
                          onChange={(e) =>
                            setDivisionForm({
                              ...divisionForm,
                              class_id: e.target.value,
                            })
                          }
                          disabled={!divisionForm.department_id}
                        >
                          <option value="">Select Class</option>
                          {classes
                            .filter((cls) => cls.department_id === parseInt(divisionForm.department_id))
                            .map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        âœ… Create Division
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowDivisionForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Division</th>
                      <th>Class</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-muted">
                          No divisions yet. Add one above.
                        </td>
                      </tr>
                    ) : (
                      divisions.map((division) => {
                        const cls = classes.find(
                          (item) => item.id === division.class_id,
                        );
                        const dept = cls
                          ? departments.find(
                              (item) => item.id === cls.department_id,
                            )
                          : null;
                        const departmentLabel = dept
                          ? `${dept.name} (${dept.code})`
                          : cls
                            ? `Department ${cls.department_id}`
                            : "â€”";
                        return (
                          <tr key={division.id}>
                            <td>{division.id}</td>
                            <td>{division.name}</td>
                            <td>
                              {cls ? cls.name : `Class ${division.class_id}`}
                            </td>
                            <td>{departmentLabel}</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Delete division "${division.name}"? This will remove linked batches and students.`,
                                    )
                                  ) {
                                    try {
                                      await adminAPI.deleteDivision(
                                        division.id,
                                      );
                                      showMessage(
                                        "success",
                                        "Division deleted successfully!",
                                      );
                                      loadAllData();
                                    } catch (error) {
                                      const errorMsg =
                                        error.response?.data?.detail ||
                                        "Failed to delete division";
                                      showMessage("error", errorMsg);
                                    }
                                  }
                                }}
                              >
                                ðŸ—‘ï¸ Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <div className="subtabs">
              <button
                className={activeSubTab === "students" ? "active" : ""}
                onClick={() => setActiveSubTab("students")}
              >
                Students
              </button>
              <button
                className={activeSubTab === "staff" ? "active" : ""}
                onClick={() => setActiveSubTab("staff")}
              >
                Staff
              </button>
              <button
                className={activeSubTab === "parents" ? "active" : ""}
                onClick={() => setActiveSubTab("parents")}
              >
                Parents
              </button>
            </div>
            {/* STUDENTS */}
            {activeSubTab === "students" && (
              <div className="card">
                <div className="card-header">
                  <h3>Students Management</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowStudentForm(!showStudentForm)}
                  >
                    + Add Student
                  </button>
                </div>
                {showStudentForm && (
                  <form onSubmit={handleCreateStudent} className="form-box">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Roll Number *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.roll_number}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              roll_number: e.target.value,
                            })
                          }
                          placeholder="2026001"
                        />
                      </div>
                      <div className="form-group">
                        <label>Enrollment Number *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.enrollment_number}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              enrollment_number: e.target.value,
                            })
                          }
                          placeholder="EN2026001"
                        />
                      </div>
                      <div className="form-group">
                        <label>Username *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.username}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              username: e.target.value,
                            })
                          }
                          placeholder="john.doe"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.first_name}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.last_name}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          required
                          value={studentForm.email}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Date of Birth *</label>
                        <input
                          type="date"
                          required
                          value={studentForm.date_of_birth}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              date_of_birth: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Department *</label>
                        <select
                          required
                          value={studentForm.department_id}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              department_id: e.target.value,
                              class_id: "",
                              division_id: "",
                            })
                          }
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Class *</label>
                        <select
                          required
                          value={studentForm.class_id}
                          disabled={!studentForm.department_id}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              class_id: e.target.value,
                              division_id: "",
                            })
                          }
                        >
                          <option value="">Select Class</option>
                          {classes
                            .filter(
                              (c) =>
                                c.department_id ===
                                parseInt(studentForm.department_id),
                            )
                            .map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name}
                              </option>
                            ))}
                        </select>
                        <small className="text-muted">
                          Options: 1K, 2K, 3K, 4K, 5K, 6K
                        </small>
                      </div>
                      <div className="form-group">
                        <label>Division *</label>
                        <select
                          required
                          value={studentForm.division_id}
                          disabled={!studentForm.class_id}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              division_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Division</option>
                          {divisions
                            .filter(
                              (d) =>
                                d.class_id === parseInt(studentForm.class_id),
                            )
                            .map((div) => (
                              <option key={div.id} value={div.id}>
                                Division {div.name}
                              </option>
                            ))}
                        </select>
                        <small className="text-muted">Options: A, B</small>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Enrollment Year *</label>
                        <input
                          type="number"
                          required
                          value={studentForm.enrollment_year}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              enrollment_year: e.target.value,
                            })
                          }
                          placeholder="2026"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>ðŸ“¸ Face Photo (for AI Recognition)</label>
                      {!showCamera && !capturedImage && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowCamera(true)}
                        >
                          ðŸ“· Open Camera to Capture Face
                        </button>
                      )}
                      {showCamera && (
                        <div className="camera-capture">
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                              width: 640,
                              height: 480,
                              facingMode: "user",
                            }}
                            className="webcam-preview"
                          />
                          <div className="camera-actions">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={handleCaptureFace}
                            >
                              âœ“ Capture Face
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setShowCamera(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {capturedImage && (
                        <div className="captured-image">
                          <img
                            src={capturedImage}
                            alt="Captured face"
                            style={{ maxWidth: "300px", borderRadius: "8px" }}
                          />
                          <div className="camera-actions">
                            <button
                              type="button"
                              className="btn btn-warning"
                              onClick={handleRetakeFace}
                            >
                              ðŸ”„ Retake Photo
                            </button>
                            <span className="text-success">
                              âœ“ Face captured successfully
                            </span>
                          </div>
                        </div>
                      )}
                      <small className="text-muted">
                        Capture a clear photo of the student's face for AI
                        attendance recognition
                      </small>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        âœ… Create Student
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowStudentForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Division</th>
                      <th>Face Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const division = divisions.find(
                        (d) => d.id === student.division_id,
                      );
                      const cls = classes.find(
                        (c) => c.id === division?.class_id,
                      );
                      return (
                        <tr key={student.id}>
                          <td>{student.roll_number}</td>
                          <td>
                            {student.first_name} {student.last_name}
                          </td>
                          <td>{student.email}</td>
                          <td>
                            {division
                              ? `${cls?.name || ""} ${division.name}`
                              : student.division_id}
                          </td>
                          <td>{student.face_registered ? "Yes" : "No"}</td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEditStudent(student)}
                              style={{ marginRight: '8px' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `Delete student "${student.first_name} ${student.last_name}"? This will also remove their user account and all attendance records.`,
                                  )
                                ) {
                                  try {
                                    await adminAPI.deleteStudent(student.id);
                                    showMessage(
                                      "success",
                                      "Student deleted successfully!",
                                    );
                                    loadAllData();
                                  } catch (error) {
                                    const errorMsg =
                                      error.response?.data?.detail ||
                                      "Failed to delete student";
                                    showMessage("error", errorMsg);
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* STAFF */}
            {activeSubTab === "staff" && (
              <div className="card">
                <div className="card-header">
                  <h3>Staff Management</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowStaffForm(!showStaffForm)}
                  >
                    + Add Staff
                  </button>
                </div>
                {showStaffForm && (
                  <form
                    onSubmit={editingStaff ? handleUpdateStaff : async (e) => {
                      e.preventDefault();
                      try {
                        await adminAPI.createStaff({
                          ...staffForm,
                          department_id: parseInt(staffForm.department_id),
                          phone: staffForm.phone || null,
                        });
                        showMessage("success", "Staff created successfully!");
                        setShowStaffForm(false);
                        setStaffForm({
                          staff_id: "",
                          first_name: "",
                          last_name: "",
                          email: "",
                          department_id: "",
                          username: "",
                          password: "",
                        });
                        loadAllData();
                      } catch (error) {
                        console.error("Staff creation error:", error);
                        showMessage(
                          "error",
                          error.response?.data?.detail ||
                            "Failed to create staff",
                        );
                      }
                    }}
                    className="form-box"
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label>Staff ID *</label>
                        <input
                          type="text"
                          required
                          value={staffForm.staff_id}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              staff_id: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          required
                          value={staffForm.first_name}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          required
                          value={staffForm.last_name}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          required
                          value={staffForm.email}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={staffForm.phone}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Department *</label>
                        <select
                          required
                          value={staffForm.department_id}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              department_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Username *</label>
                        <input
                          type="text"
                          required
                          value={staffForm.username}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              username: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          required
                          value={staffForm.password}
                          onChange={(e) =>
                            setStaffForm({
                              ...staffForm,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        {editingStaff ? "Update Staff" : "Create Staff"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowStaffForm(false);
                          setEditingStaff(null);
                          setStaffForm({
                            staff_id: "",
                            first_name: "",
                            last_name: "",
                            email: "",
                            department_id: "",
                            username: "",
                            password: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => {
                      const dept = departments.find(
                        (d) => d.id === s.department_id,
                      );
                      return (
                        <tr key={s.id}>
                          <td>{s.staff_id}</td>
                          <td>
                            {s.first_name} {s.last_name}
                          </td>
                          <td>{s.email}</td>
                          <td>
                            {dept
                              ? `${dept.name} (${dept.code})`
                              : s.department_id}
                          </td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEditStaff(s)}
                              style={{ marginRight: '8px' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    `Delete staff "${s.first_name} ${s.last_name}"? This will also remove their user account.`,
                                  )
                                ) {
                                  try {
                                    await adminAPI.deleteStaff(s.id);
                                    showMessage(
                                      "success",
                                      "Staff deleted successfully!",
                                    );
                                    loadAllData();
                                  } catch (error) {
                                    const errorMsg =
                                      error.response?.data?.detail ||
                                      "Failed to delete staff";
                                    showMessage("error", errorMsg);
                                  }
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* PARENTS */}
            {activeSubTab === "parents" && (
              <div className="card">
                <div className="card-header">
                  <h3>Parents Management</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowParentForm(!showParentForm)}
                  >
                    + Add Parent
                  </button>
                </div>
                {showParentForm && (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await adminAPI.createParent(parentForm);
                        showMessage("success", "Parent account created!");
                        setShowParentForm(false);
                        setParentForm({
                          student_id: "",
                          first_name: "",
                          last_name: "",
                          email: "",
                          phone: "",
                          relation: "father",
                          username: "",
                          password: "",
                        });
                        loadAllData();
                      } catch (error) {
                        showMessage(
                          "error",
                          error.response?.data?.detail ||
                            "Failed to create parent",
                        );
                      }
                    }}
                    className="form-box"
                  >
                    <div className="alert alert-info">
                      â„¹ï¸ Parent accounts are linked to a specific student.
                      Parents can view their child's attendance.
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Select Student (Child) *</label>
                        <select
                          required
                          value={parentForm.student_id}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              student_id: e.target.value,
                            })
                          }
                        >
                          <option value="">Select Student</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id}>
                              {student.roll_number} - {student.first_name}{" "}
                              {student.last_name}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted">
                          This is the student (ward) for this parent account
                        </small>
                      </div>
                      <div className="form-group">
                        <label>Relation *</label>
                        <select
                          required
                          value={parentForm.relation}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              relation: e.target.value,
                            })
                          }
                        >
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="guardian">Guardian</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          required
                          value={parentForm.first_name}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              first_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          required
                          value={parentForm.last_name}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              last_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={parentForm.email}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          required
                          value={parentForm.phone}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Username *</label>
                        <input
                          type="text"
                          required
                          value={parentForm.username}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              username: e.target.value,
                            })
                          }
                          placeholder="parent.name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          required
                          value={parentForm.password}
                          onChange={(e) =>
                            setParentForm({
                              ...parentForm,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        âœ… Create Parent Account
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowParentForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Parent Name</th>
                      <th>Relation</th>
                      <th>Phone</th>
                      <th>Student (Ward)</th>
                      {hasParentUsername && <th>Username</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={hasParentUsername ? 6 : 5}
                          className="text-muted"
                        >
                          No parent accounts yet. Create one above.
                        </td>
                      </tr>
                    ) : (
                      parents.map((parent) => {
                        const student = students.find(
                          (item) => item.id === parent.student_id,
                        );
                        return (
                          <tr key={parent.id}>
                            <td>
                              {parent.first_name} {parent.last_name}
                            </td>
                            <td>{parent.relation}</td>
                            <td>{parent.phone}</td>
                            <td>
                              {student
                                ? `${student.roll_number} - ${student.first_name} ${student.last_name}`
                                : `Student ID ${parent.student_id}`}
                            </td>
                            {hasParentUsername && (
                              <td>{parent.username || "-"}</td>
                            )}
                            <td>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleEditParent(parent)}
                                style={{ marginRight: '8px' }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `Delete parent account for "${parent.first_name} ${parent.last_name}"?`,
                                    )
                                  ) {
                                    try {
                                      await adminAPI.deleteParent(parent.id);
                                      showMessage(
                                        "success",
                                        "Parent account deleted successfully!",
                                      );
                                      loadAllData();
                                    } catch (error) {
                                      showMessage(
                                        "error",
                                        "Failed to delete parent",
                                      );
                                    }
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="card">
            <div className="card-header">
              <h3>Attendance Management</h3>
              <p className="text-muted">
                Manage student attendance by division and date. Mark students as present even if they didn't mark their attendance.
              </p>
            </div>
            <div className="form-box">
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Division *</label>
                  <select
                    value={attendanceDivision}
                    onChange={(e) => setAttendanceDivision(e.target.value)}
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => {
                      const cls = classes.find((c) => c.id === div.class_id);
                      return (
                        <option key={div.id} value={div.id}>
                          {cls?.name || ""} {div.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={loadAttendanceRecords}
                    disabled={!attendanceDivision || !attendanceDate}
                  >
                    Load Attendance
                  </button>
                </div>
              </div>
            </div>
            {attendanceRecords.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Marked Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.student_id}>
                      <td>{record.roll_number}</td>
                      <td>{record.student_name}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            record.status === "present"
                              ? "success"
                              : record.status === "late"
                              ? "warning"
                              : record.status === "absent"
                              ? "danger"
                              : "secondary"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td>{record.marked_method || "-"}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleUpdateAttendance(record.student_id, "present")}
                          style={{ marginRight: '4px' }}
                          disabled={record.status === "present"}
                        >
                          Mark Present
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleUpdateAttendance(record.student_id, "late")}
                          style={{ marginRight: '4px' }}
                          disabled={record.status === "late"}
                        >
                          Mark Late
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUpdateAttendance(record.student_id, "absent")}
                          disabled={record.status === "absent"}
                        >
                          Mark Absent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {attendanceDivision && attendanceDate && attendanceRecords.length === 0 && (
              <div className="alert alert-info">
                No students found in this division or no attendance records. Click "Load Attendance" to fetch records.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;

