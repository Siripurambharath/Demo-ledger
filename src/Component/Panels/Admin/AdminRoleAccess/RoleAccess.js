import React, { useState } from "react";
import AdminSidebar from "../../../Shared/AdminSidebar/AdminSidebar";
import AdminHeader from "../../../Shared/AdminSidebar/AdminHeader";
import "./RoleAccess.css";

function RoleAccess() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [permissions, setPermissions] = useState({
    retailers: { view: true, add: false, edit: false, delete: false },
    sales: { view: true, add: true, edit: false, delete: false },
    expenses: { view: true, add: true, edit: false, delete: false },
    offers: { view: false, add: false, edit: false, delete: false }
  });
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const handlePermissionChange = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleSavePermissions = () => {
    console.log("Permissions saved:", permissions);
    alert("Permissions saved successfully!");
  };

  const handleAddRoleClick = () => {
    setShowAddRoleInput(true);
  };

  const handleSaveNewRole = () => {
    if (newRoleName.trim() === "") {
      alert("Please enter a role name");
      return;
    }
    
    console.log("New role saved:", newRoleName);
    // Add your save role logic here
    alert(`Role "${newRoleName}" added successfully!`);
    
    // Reset form
    setNewRoleName("");
    setShowAddRoleInput(false);
  };

  const handleCancelAddRole = () => {
    setNewRoleName("");
    setShowAddRoleInput(false);
  };

  return (
    <div>
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <AdminHeader isCollapsed={isCollapsed} />
      <div className={`main-content ${isCollapsed ? "collapsed" : ""}`}>
        <div className="role-access-container">
          <div className="page-header">
            <h1 className="page-title">Role Access Management</h1>
            <div className="header-actions">
              {showAddRoleInput ? (
                <div className="add-role-input-container">
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Enter role name"
                    className="role-name-input"
                    autoFocus
                  />
                  <button 
                    className="save-role-btn"
                    onClick={handleSaveNewRole}
                  >
                    Save
                  </button>
                  <button 
                    className="cancel-role-btn"
                    onClick={handleCancelAddRole}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="add-role-top-btn"
                  onClick={handleAddRoleClick}
                >
                  + Add Role
                </button>
              )}
            </div>
          </div>
          
          <div className="permissions-section">
            <h2 className="section-title">Field Staff Permissions</h2>
            
            <div className="permissions-table-container">
              <table className="permissions-table">
                <thead>
                  <tr>
                    <th className="module-column">Module</th>
                    <th className="action-column">View</th>
                    <th className="action-column">Add</th>
                    <th className="action-column">Edit</th>
                    <th className="action-column">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(permissions).map(([module, actions]) => (
                    <tr key={module}>
                      <td className="module-name">
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </td>
                      <td className="action-cell">
                        <div className="checkbox-container">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={actions.view}
                              onChange={() => handlePermissionChange(module, 'view')}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                      </td>
                      <td className="action-cell">
                        <div className="checkbox-container">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={actions.add}
                              onChange={() => handlePermissionChange(module, 'add')}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                      </td>
                      <td className="action-cell">
                        <div className="checkbox-container">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={actions.edit}
                              onChange={() => handlePermissionChange(module, 'edit')}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                      </td>
                      <td className="action-cell">
                        <div className="checkbox-container">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={actions.delete}
                              onChange={() => handlePermissionChange(module, 'delete')}
                            />
                            <span className="checkmark"></span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="actions-container">
              <button 
                className="save-permissions-btn"
                onClick={handleSavePermissions}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleAccess;