'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import * as childrenService from '../../../lib/api/children';
import * as usersService from '../../../lib/api/users';
import { Child, User, CreateChildRequest, UpdateChildRequest } from '../../../lib/types';
import { useAuth } from '../../../lib/auth/AuthContext';

export default function ChildrenPage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [parents, setParents] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreateChildRequest>({
        schoolId: user?.schoolId || 0,
        parentId: 0,
        fullName: '',
        age: 5,
        grade: '',
    });
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadChildren();
        loadParents();
    }, []);

    const loadChildren = async () => {
        try {
            setLoading(true);
            const response = await childrenService.getChildren();
            setChildren(response);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Error loading children',
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const loadParents = async () => {
        try {
            const response = await usersService.getParents();
            setParents(response);
        } catch (error: any) {
            console.error('Error loading parents:', error);
        }
    };

    const openNew = () => {
        setFormData({
            schoolId: user?.schoolId || 0,
            parentId: 0,
            fullName: '',
            age: 5,
            grade: '',
        });
        setIsEditMode(false);
        setSelectedChild(null);
        setDialogVisible(true);
    };

    const openEdit = (child: Child) => {
        setFormData({
            schoolId: child.schoolId,
            parentId: child.parentId,
            fullName: child.fullName,
            age: child.age,
            grade: child.grade || '',
        });
        setIsEditMode(true);
        setSelectedChild(child);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
    };

    const saveChild = async () => {
        try {
            if (isEditMode && selectedChild) {
                const updateData: UpdateChildRequest = {
                    fullName: formData.fullName,
                    age: formData.age,
                    grade: formData.grade,
                    parentId: formData.parentId,
                };
                await childrenService.updateChild(selectedChild.id, updateData);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Child updated successfully',
                    life: 3000,
                });
            } else {
                await childrenService.createChild(formData);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Child created successfully',
                    life: 3000,
                });
            }
            hideDialog();
            loadChildren();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error saving child',
                life: 3000,
            });
        }
    };

    const confirmDelete = (child: Child) => {
        confirmDialog({
            message: `Are you sure you want to delete ${child.fullName}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteChild(child.id),
        });
    };

    const deleteChild = async (id: number) => {
        try {
            await childrenService.deleteChild(id);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Child deleted successfully',
                life: 3000,
            });
            loadChildren();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error deleting child',
                life: 3000,
            });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="New" icon="pi pi-plus" severity="success" onClick={openNew} />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Refresh" icon="pi pi-refresh" severity="info" onClick={loadChildren} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData: Child) => {
        return (
            <React.Fragment>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    className="mr-2"
                    onClick={() => openEdit(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="warning"
                    onClick={() => confirmDelete(rowData)}
                />
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (rowData: Child) => {
        return (
            <Tag
                value={rowData.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                severity={rowData.status === 'ACTIVE' ? 'success' : 'danger'}
            />
        );
    };

    const parentBodyTemplate = (rowData: Child) => {
        return rowData.parent?.fullName || 'N/A';
    };

    const dateBodyTemplate = (rowData: Child) => {
        return new Date(rowData.createdAt).toLocaleDateString();
    };

    const dialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveChild} />
        </React.Fragment>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Children</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" placeholder="Search..." className="w-full md:w-20rem" />
            </span>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <ConfirmDialog />

                        <Toolbar
                            className="mb-4"
                            left={leftToolbarTemplate}
                            right={rightToolbarTemplate}
                        />

                        <DataTable
                            value={children}
                            loading={loading}
                            dataKey="id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} children"
                            emptyMessage="No children found."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="fullName" header="Name" sortable style={{ minWidth: '12rem' }} />
                            <Column field="age" header="Age" sortable style={{ minWidth: '8rem' }} />
                            <Column field="grade" header="Grade" sortable style={{ minWidth: '12rem' }} />
                            <Column
                                field="parent"
                                header="Parent"
                                body={parentBodyTemplate}
                                sortable
                                style={{ minWidth: '12rem' }}
                            />
                            <Column
                                field="status"
                                header="Status"
                                body={statusBodyTemplate}
                                sortable
                                style={{ minWidth: '8rem' }}
                            />
                            <Column
                                field="createdAt"
                                header="Created"
                                sortable
                                body={dateBodyTemplate}
                                style={{ minWidth: '10rem' }}
                            />
                            <Column
                                body={actionBodyTemplate}
                                exportable={false}
                                style={{ minWidth: '8rem' }}
                            />
                        </DataTable>

                        <Dialog
                            visible={dialogVisible}
                            style={{ width: '450px' }}
                            header={isEditMode ? 'Edit Child' : 'New Child'}
                            modal
                            className="p-fluid"
                            footer={dialogFooter}
                            onHide={hideDialog}
                        >
                            <div className="field">
                                <label htmlFor="fullName">Full Name</label>
                                <InputText
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="age">Age</label>
                                <InputNumber
                                    id="age"
                                    value={formData.age}
                                    onValueChange={(e) =>
                                        setFormData({ ...formData, age: e.value || 0 })
                                    }
                                    min={1}
                                    max={18}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="grade">Grade</label>
                                <InputText
                                    id="grade"
                                    value={formData.grade || ''}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="parent">Parent</label>
                                <Dropdown
                                    id="parent"
                                    value={formData.parentId}
                                    options={parents}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.value })}
                                    optionLabel="fullName"
                                    optionValue="id"
                                    placeholder="Select a Parent"
                                    required
                                />
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
