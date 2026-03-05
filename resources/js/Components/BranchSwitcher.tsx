import { usePage, router } from '@inertiajs/react';
import { PageProps, Branch } from '@/types';

export default function BranchSwitcher() {
    const { auth, branches, active_branch_id } = usePage<PageProps>().props;
    const user = auth.user;

    if (user.role !== 'admin' || user.branch_id !== null) {
        return null;
    }

    const handleBranchChange = (branchId: number | null) => {
        router.post(route('admin.branches.switch'), {
            branch_id: branchId,
        });
    };

    const allBranches = branches || [];

    return (
        <div className="ms-4">
            <select
                value={active_branch_id || ''}
                onChange={(e) => handleBranchChange(e.target.value ? parseInt(e.target.value) : null)}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
                <option value="">All Branches</option>
                {allBranches.map((branch: Branch) => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
