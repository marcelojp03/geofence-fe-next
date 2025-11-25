'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import * as parentsService from '../../../lib/api/parents';
import { Parent, CreateParentRequest, UpdateParentRequest } from '../../../lib/types';

export default function ParentsPage() {
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [formData, setFormData] = useState<CreateParentRequest>({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
    });
    const toast = useRef<Toast>(null);

    useEffect(() => {
        loadParents();
    }, []);

    const loadParents = async () => {
        try {
            setLoading(true);
            const response = await parentsService.getParents();
            setParents(response.data);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error loading parents',
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            password: '',
        });
        setIsEditMode(false);
        setSelectedParent(null);
        setDialogVisible(true);
    };

    const openEdit = (parent: Parent) => {
        setFormData({
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            address: parent.address || '',
            password: '', // Don't show existing password
        });
        setIsEditMode(true);
        setSelectedParent(parent);
        setDialogVisible(true);
    };

    const hideDialog = () => {
        setDialogVisible(false);
    };

    const saveParent = async () => {
        try {
            if (isEditMode && selectedParent) {
                // Update existing parent
                const updateData: UpdateParentRequest = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                };
                await parentsService.updateParent(selectedParent.id, updateData);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Parent updated successfully',
                    life: 3000,
                });
            } else {
                // Create new parent
                await parentsService.createParent(formData);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Parent created successfully',
                    life: 3000,
                });
            }
            hideDialog();
            loadParents();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error saving parent',
                life: 3000,
            });
        }
    };

    const confirmDelete = (parent: Parent) => {
        confirmDialog({
            message: `Are you sure you want to delete ${parent.name}?`,
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteParent(parent.id),
        });
    };

    const deleteParent = async (id: string) => {
        try {
            await parentsService.deleteParent(id);
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Parent deleted successfully',
                life: 3000,
            });
            loadParents();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.message || 'Error deleting parent',
                life: 3000,
            });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button
                    label="New"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button
                    label="Refresh"
                    icon="pi pi-refresh"
                    severity="info"
                    onClick={loadParents}
                />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData: Parent) => {
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

    const dateBodyTemplate = (rowData: Parent) => {
        return new Date(rowData.createdAt).toLocaleDateString();
    };

    const dialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" text onClick={saveParent} />
        </React.Fragment>
    );

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Manage Parents</h5>
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
                            value={parents}
                            loading={loading}
                            dataKey="id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} parents"
                            emptyMessage="No parents found."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column field="name" header="Name" sortable style={{ minWidth: '12rem' }} />
                            <Column field="email" header="Email" sortable style={{ minWidth: '16rem' }} />
                            <Column field="phone" header="Phone" sortable style={{ minWidth: '10rem' }} />
                            <Column field="address" header="Address" sortable style={{ minWidth: '12rem' }} />
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
                            header={isEditMode ? 'Edit Parent' : 'New Parent'}
                            modal
                            className="p-fluid"
                            footer={dialogFooter}
                            onHide={hideDialog}
                        >
                            <div className="field">
                                <label htmlFor="name">Name</label>
                                <InputText
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="email">Email</label>
                                <InputText
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="phone">Phone</label>
                                <InputText
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="address">Address</label>
                                <InputText
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            {!isEditMode && (
                                <div className="field">
                                    <label htmlFor="password">Password</label>
                                    <InputText
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required={!isEditMode}
                                    />
                                </div>
                            )}
                        </Dialog>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
