import React, { useState } from "react";

export default function Vault() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    nationality: "",
    gender: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Data Saved Successfully 🔐");
  };

  return (
    <>
      <h2>Vault 🔐</h2>
      <hr style={{ margin: "15px 0", opacity: "0.3" }} />

      <form className="vault-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input name="name" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Age:</label>
          <input type="number" name="age" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Nationality:</label>
          <input name="nationality" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select name="gender" onChange={handleChange} required>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <button type="submit" className="add-btn">Save</button>
      </form>
    </>
  );
}