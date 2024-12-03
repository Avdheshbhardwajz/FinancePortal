import React, { useState, useCallback, useEffect } from 'react';

import { PlusCircle, Trash2, Edit2, Eye, EyeOff, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
//import Definedata from '@/components/Definedata';
import DropdownColumnsManager from '@/components/DropdownManager';

const INITIAL_USER_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'maker'
};

const Admin = () => {
 const Navigate = useNavigate() ;
  
  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      Navigate('/login');
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    Navigate('/login');
  }, []);

  // Existing state management
  const [users, setUsers] = useState([
    { 
      id: 1, 
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: '********',
      role: 'maker' 
    },
    { 
      id: 2, 
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: '********',
      role: 'checker' 
    },
  ]);

  const [newUser, setNewUser] = useState(INITIAL_USER_STATE);
  const [editingUser, setEditingUser] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [dialogState, setDialogState] = useState({
    delete: { open: false, user: null },
    edit: { open: false }
  });

  // Validation
  const validateForm = useCallback((user, isEdit = false) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!user.firstName?.trim()) errors.firstName = 'First name is required';
    if (!user.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!user.email?.trim()) errors.email = 'Email is required';
    if (!emailRegex.test(user.email)) errors.email = 'Invalid email format';
    if (!isEdit && !user.password) errors.password = 'Password is required';
    if (!isEdit && user.password?.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return errors;
  }, []);

  // Alert handlers
  const showAlertMessage = useCallback((message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000);
  }, []);

  // Form handlers
  const handleCreateUser = useCallback((e) => {
    e.preventDefault();
    const validationErrors = validateForm(newUser);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlertMessage('Please fix the errors in the form', 'error');
      return;
    }
    
    const newId = Math.max(...users.map(u => u.id), 0) + 1;
    setUsers(prev => [...prev, { ...newUser, id: newId }]);
    setNewUser(INITIAL_USER_STATE);
    setErrors({});
    showAlertMessage('User created successfully', 'success');
  }, [newUser, users, validateForm, showAlertMessage]);

  const handleUpdateUser = useCallback(() => {
    const validationErrors = validateForm(editingUser, true);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlertMessage('Please fix the errors in the form', 'error');
      return;
    }

    setUsers(prev => prev.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setDialogState(prev => ({ ...prev, edit: { open: false } }));
    setEditingUser(null);
    setErrors({});
    showAlertMessage('User updated successfully', 'success');
  }, [editingUser, validateForm, showAlertMessage]);

  // Dialog handlers
  const handleDeleteClick = useCallback((user) => {
    setDialogState(prev => ({
      ...prev,
      delete: { open: true, user }
    }));
  }, []);

  const handleConfirmDelete = useCallback(() => {
    const userToDelete = dialogState.delete.user;
    setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    setDialogState(prev => ({
      ...prev,
      delete: { open: false, user: null }
    }));
    showAlertMessage('User deleted successfully', 'success');
  }, [dialogState.delete.user, showAlertMessage]);

  const handleEditClick = useCallback((user) => {
    setEditingUser({ ...user });
    setDialogState(prev => ({
      ...prev,
      edit: { open: true }
    }));
    setErrors({});
  }, []);

  // Render helpers
  const renderFormInput = useCallback((field, label, type = 'text', value, onChange) => (
    <div className="grid gap-2">
      <Input
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        className={errors[field] ? 'border-red-500' : ''}
        aria-label={label}
        aria-invalid={!!errors[field]}
      />
      {errors[field] && (
        <p className="text-red-500 text-sm" role="alert">{errors[field]}</p>
      )}
    </div>
  ), [errors]);

  const { 
    isLoading, 
    error, 
    rowData, 
    pagination, 
    handlePageChange, 
    handlePageSizeChange 
  } = useGridData({ 
    tableName: activeTable,
    initialPageSize: 20
  })

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header with Logout Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {alert.show && (
        <Alert className={`mb-4 ${alert.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Rest of the component remains the same */}
      {/* Create User Form */}
      <Card className='font-poppins'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Create New User
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Existing form content */}
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormInput(
                'firstName',
                'First Name',
                'text',
                newUser.firstName,
                (e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))
              )}
              {renderFormInput(
                'lastName',
                'Last Name',
                'text',
                newUser.lastName,
                (e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderFormInput(
                'email',
                'Email',
                'email',
                newUser.email,
                (e) => setNewUser(prev => ({ ...prev, email: e.target.value }))
              )}
　　 　 　 　 <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  aria-label="Password"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1" role="alert">{errors.password}</p>
                )}
              </div>

              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger aria-label="Select role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maker">Maker</SelectItem>
                  <SelectItem value="checker">Checker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Create User
            </Button>
            </form>
        </CardContent>
      </Card>

      {/* User Management Table */}
      <Card>
        {/* Existing table content */}
        <CardHeader>
          <CardTitle className='font-poppins'>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto font-poppins">
            <GridTable
              columnDefs={getColumnDefs(table)}
              rowData={rowData}
              onCellValueChanged={handleCellValueChanged}
              pendingChanges={pendingChanges}
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={isLoading}
            />
          </div>
        </CardContent>
      </Card>
                {/* <Definedata/> */}
      {/* Edit User Dialog */}
      <Dialog 
        open={dialogState.edit.open} 
        onOpenChange={(open) => setDialogState(prev => ({
          ...prev,
          edit: { open }
        }))}
      >
        <DialogContent className="sm:max-w-[425px] font-poppins text-black bg-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user information below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {renderFormInput(
              'firstName',
              'First Name',
              'text',
              editingUser?.firstName || '',
              (e) => setEditingUser(prev => ({
                ...prev,
                firstName: e.target.value
              }))
            )}
            {renderFormInput(
              'lastName',
              'Last Name',
              'text',
              editingUser?.lastName || '',
              (e) => setEditingUser(prev => ({
                ...prev,
                lastName: e.target.value
              }))
            )}
            {renderFormInput(
              'email',
              'Email',
              'email',
              editingUser?.email || '',
              (e) => setEditingUser(prev => ({
                ...prev,
                email: e.target.value
              }))
            )}
            <Select
              value={editingUser?.role}
              onValueChange={(value) => setEditingUser(prev => ({
                ...prev,
                role: value
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maker">Maker</SelectItem>
                <SelectItem value="checker">Checker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setDialogState(prev => ({
                  ...prev,
                  edit: { open: false }
                }));
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser}
              className="bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={dialogState.delete.open}
        onOpenChange={(open) => setDialogState(prev => ({
          ...prev,
          delete: { ...prev.delete, open }
        }))}
      >
        <DialogContent className="sm:max-w-[425px] bg-white text-black font-poppins">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user {dialogState.delete.user?.firstName} {dialogState.delete.user?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDialogState(prev => ({
                ...prev,
                delete: { open: false, user: null }
              }))}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownColumnsManager/>
     
    </div>
  );
};

export default Admin;