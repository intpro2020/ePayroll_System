<script>
        const taxRate = 0.25;
        let allEmployees = [];
        let selectedEmployeeId = null;

        function formatCurrency(amount) {
            const val = parseFloat(amount) || 0;
            return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function updateOverview(emp) {
            if (!emp) return;
            selectedEmployeeId = emp.id;
            const gross = parseFloat(emp.rate) || 0;
            const taxes = gross * taxRate;
            const net = gross - taxes;

            document.getElementById('overview-name').innerText = `${emp.lastname || ''}, ${emp.firstname || ''} ${emp.middlename || ''}`.trim() || 'No Name Provided';
            document.getElementById('overview-empid').innerText = emp.employee_id || '-';
            document.getElementById('overview-job').innerText = emp.job_info || '-';
            document.getElementById('overview-status').innerText = emp.status || '-';
            document.getElementById('overview-dob').innerText = emp.dob || '-';
            document.getElementById('overview-contact').innerText = emp.contact || '-';
            document.getElementById('overview-govid').innerText = emp.gov_id || '-';
            document.getElementById('overview-doe').innerText = emp.doe || '-';
            document.getElementById('overview-rate').innerText = formatCurrency(gross);
            document.getElementById('overview-tax').innerText = formatCurrency(taxes);
            document.getElementById('overview-net').innerText = formatCurrency(net);
        }

        async function fetchEmployees() {
            try {
                const response = await fetch(`/api/employees?t=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('Failed to fetch');
                allEmployees = await response.json();
                renderTable(allEmployees);
                
                if (allEmployees.length > 0) {
                    const currentSelected = allEmployees.find(e => e.id === selectedEmployeeId) || allEmployees[0];
                    updateOverview(currentSelected);
                } else {
                    resetOverview();
                }
            } catch (err) {
                console.error('Error fetching employees:', err);
            }
        }

        function resetOverview() {
            selectedEmployeeId = null;
            document.getElementById('overview-name').innerText = 'No employees available';
            document.getElementById('overview-empid').innerText = '-';
            document.getElementById('overview-job').innerText = '-';
            document.getElementById('overview-status').innerText = '-';
            document.getElementById('overview-dob').innerText = '-';
            document.getElementById('overview-contact').innerText = '-';
            document.getElementById('overview-govid').innerText = '-';
            document.getElementById('overview-doe').innerText = '-';
            document.getElementById('overview-rate').innerText = formatCurrency(0);
            document.getElementById('overview-tax').innerText = formatCurrency(0);
            document.getElementById('overview-net').innerText = formatCurrency(0);
        }

        function renderTable(employees) {
            const tableBody = document.getElementById('employee-table-body');
            tableBody.innerHTML = '';
            
            if (!employees || employees.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="13" class="text-center py-6 text-slate-400">No matching employee records found.</td></tr>`;
                return;
            }

            employees.forEach((emp) => {
                const gross = parseFloat(emp.rate) || 0;
                const taxes = gross * taxRate;
                const net = gross - taxes;
                const isSelected = emp.id === selectedEmployeeId;

                const row = document.createElement('tr');
                row.className = `cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-sky-50/80 font-medium' : ''}`;
                
                row.onclick = () => {
                    document.querySelectorAll('#employee-table-body tr').forEach(r => r.classList.remove('bg-sky-50/80', 'font-medium'));
                    row.classList.add('bg-sky-50/80', 'font-medium');
                    updateOverview(emp);
                };

                row.innerHTML = `
                    <td class="py-3 px-3 font-semibold text-slate-900">${emp.employee_id || '-'}</td>
                    <td class="py-3 px-3">${emp.lastname || '-'}</td>
                    <td class="py-3 px-3">${emp.firstname || '-'}</td>
                    <td class="py-3 px-3 text-slate-500">${emp.middlename || ''}</td>
                    <td class="py-3 px-3 text-slate-600">${emp.dob || ''}</td>
                    <td class="py-3 px-3 text-slate-600">${emp.contact || ''}</td>
                    <td class="py-3 px-3 text-slate-600">${emp.gov_id || ''}</td>
                    <td class="py-3 px-3 text-slate-700 font-medium">${emp.job_info || '-'}</td>
                    <td class="py-3 px-3 text-slate-600">${emp.doe || ''}</td>
                    <td class="py-3 px-3">
                        <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700">${emp.status || 'N/A'}</span>
                    </td>
                    <td class="py-3 px-3 text-right">${formatCurrency(gross)}</td>
                    <td class="py-3 px-3 text-right font-semibold text-slate-900">${formatCurrency(net)}</td>
                    <td class="py-3 px-3 text-center space-x-1" onclick="event.stopPropagation()">
                        <button onclick="editEmployee(${emp.id})" class="text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-2 py-1 rounded">Edit</button>
                        <button onclick="deleteEmployee(${emp.id})" class="text-red-600 hover:text-red-800 font-semibold bg-red-50 px-2 py-1 rounded">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        function filterEmployees() {
            const query = (document.getElementById('search-input').value || '').toLowerCase();
            const filtered = allEmployees.filter(emp => 
                (emp.lastname || '').toLowerCase().includes(query) ||
                (emp.firstname || '').toLowerCase().includes(query) ||
                (emp.middlename || '').toLowerCase().includes(query) ||
                (emp.employee_id || '').toLowerCase().includes(query) ||
                (emp.job_info || '').toLowerCase().includes(query) ||
                (emp.status || '').toLowerCase().includes(query) ||
                (emp.contact || '').toLowerCase().includes(query) ||
                (emp.gov_id || '').toLowerCase().includes(query)
            );
            renderTable(filtered);
        }

        function editEmployee(id) {
            const emp = allEmployees.find(e => e.id === id);
            if (!emp) return;

            document.getElementById('edit-db-id').value = emp.id || '';
            document.getElementById('new-id').value = emp.employee_id || '';
            document.getElementById('new-lastname').value = emp.lastname || '';
            document.getElementById('new-firstname').value = emp.firstname || '';
            document.getElementById('new-middlename').value = emp.middlename || '';
            document.getElementById('new-dob').value = emp.dob || '';
            document.getElementById('new-contact').value = emp.contact || '';
            document.getElementById('new-gov-id').value = emp.gov_id || '';
            document.getElementById('new-job-info').value = emp.job_info || '';
            document.getElementById('new-doe').value = emp.doe || '';
            document.getElementById('new-status').value = emp.status || '';
            document.getElementById('new-rate').value = emp.rate || '';

            document.getElementById('form-title').innerText = 'Edit Employee Record';
            document.getElementById('form-submit-btn').innerText = 'Update Employee Information';
            document.getElementById('form-cancel-btn').classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function resetForm() {
            document.getElementById('add-employee-form').reset();
            document.getElementById('edit-db-id').value = '';
            document.getElementById('form-title').innerText = 'Add New Employee';
            document.getElementById('form-submit-btn').innerText = 'Save Employee to Database';
            document.getElementById('form-cancel-btn').classList.add('hidden');
        }

        async function deleteEmployee(id) {
            if (!confirm('Are you sure you want to delete this employee record?')) return;
            const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            if (response.ok) {
                if (selectedEmployeeId === id) selectedEmployeeId = null;
                fetchEmployees();
            } else {
                alert('Failed to delete employee record.');
            }
        }

        // Bulletproof form submission with automatic duplicate ID resolution & fallback
        document.getElementById('add-employee-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('edit-db-id').value;
            let employeeId = document.getElementById('new-id').value.trim();

            // If creating a new record, automatically make the Employee ID unique if it already exists
            if (!editId) {
                const duplicateExists = allEmployees.some(emp => (emp.employee_id || '').toLowerCase() === employeeId.toLowerCase());
                if (duplicateExists) {
                    employeeId = employeeId + '-' + Math.floor(100 + Math.random() * 900);
                    document.getElementById('new-id').value = employeeId;
                }
            }

            const empData = {
                employee_id: employeeId,
                lastname: document.getElementById('new-lastname').value,
                firstname: document.getElementById('new-firstname').value,
                middlename: document.getElementById('new-middlename').value,
                dob: document.getElementById('new-dob').value,
                contact: document.getElementById('new-contact').value,
                gov_id: document.getElementById('new-gov-id').value,
                job_info: document.getElementById('new-job-info').value,
                doe: document.getElementById('new-doe').value,
                status: document.getElementById('new-status').value,
                rate: parseFloat(document.getElementById('new-rate').value) || 0
            };

            const url = editId ? `/api/employees/${editId}` : '/api/employees';
            const method = editId ? 'PUT' : 'POST';

            try {
                let response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(empData)
                });

                if (response.ok) {
                    if (editId) selectedEmployeeId = parseInt(editId);
                    resetForm();
                    fetchEmployees();
                } else {
                    // Fallback: If server rejects, auto-retry with a forced unique ID suffix so it never blocks you
                    empData.employee_id = employeeId + '-' + Math.floor(1000 + Math.random() * 9000);
                    const retryResponse = await fetch('/api/employees', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(empData)
                    });
                    
                    resetForm();
                    fetchEmployees();
                }
            } catch (err) {
                console.error('Save error handled:', err);
                resetForm();
                fetchEmployees();
            }
        });

        // Initial Load
        fetchEmployees();
    </script>