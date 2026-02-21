import { useAuth } from '../context/AuthContext';

/**
 * Central permission hook for FleetFlow RBAC.
 *
 * Role matrix:
 *   manager          → full access to everything
 *   dispatcher       → manage trips (create, dispatch, complete, cancel, delete)
 *   safety_officer   → edit driver profiles + change driver status
 *   financial_analyst→ add/edit/delete fuel logs
 *
 * All roles can VIEW everything.
 */
export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role;

    return {
        role,
        isManager: role === 'manager',
        isDispatcher: role === 'dispatcher',
        isSafetyOfficer: role === 'safety_officer',
        isFinancialAnalyst: role === 'financial_analyst',

        // Vehicles — manager only
        canEditVehicles: role === 'manager',

        // Drivers — manager full CRUD; safety_officer can edit profile + status
        canAddDrivers: role === 'manager',
        canEditDrivers: role === 'manager' || role === 'safety_officer',
        canDeleteDrivers: role === 'manager',
        canChangeDriverStatus: role === 'manager' || role === 'safety_officer',

        // Trips — manager + dispatcher
        canManageTrips: role === 'manager' || role === 'dispatcher',

        // Fuel — manager + financial_analyst
        canEditFuel: role === 'manager' || role === 'financial_analyst',

        // Maintenance — manager only
        canEditMaintenance: role === 'manager',
    };
}
