import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function OpenShift() {
    const { data, setData, post, processing, errors } = useForm({
        opening_cash: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('pos.shifts.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Start Shift</h2>}
        >
            <Head title="Start Shift" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-8 shadow-sm sm:rounded-lg">
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Start a New Shift</h3>
                            <p className="mt-1 text-sm text-gray-500">Please enter the starting cash amount in your drawer.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label htmlFor="opening_cash" className="block text-sm font-medium text-gray-700">
                                    Opening Cash (Rp)
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        id="opening_cash"
                                        min="0"
                                        step="0.01"
                                        value={data.opening_cash}
                                        onChange={(e) => setData('opening_cash', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.opening_cash && (
                                    <p className="mt-2 text-sm text-red-600">{errors.opening_cash}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                            >
                                {processing ? 'Starting Shift...' : 'Start Shift'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
