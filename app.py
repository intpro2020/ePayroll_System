@app.route('/api/employees', methods=['POST'])
def add_employee():
    data = request.json
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO employees (employee_id, lastname, firstname, middlename, dob, contact, gov_id, job_info, doe, status, rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['employee_id'], data['lastname'], data['firstname'], data.get('middlename'),
            data.get('dob'), data.get('contact'), data.get('gov_id'), data['job_info'],
            data.get('doe'), data['status'], data['rate']
        ))
        conn.commit()
        return jsonify({'success': True, 'id': cursor.lastrowid})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/employees/<int:db_id>', methods=['PUT'])
def update_employee(db_id):
    data = request.json
    cursor = conn.cursor()
    
    # Check if ID is taken by a different record
    cursor.execute("SELECT id FROM employees WHERE employee_id = ? AND id != ?", (data['employee_id'], db_id))
    if cursor.fetchone():
        return jsonify({'error': 'Employee ID already exists'}), 400

    cursor.execute("""
        UPDATE employees 
        SET employee_id=?, lastname=?, firstname=?, middlename=?, dob=?, contact=?, gov_id=?, job_info=?, doe=?, status=?, rate=?
        WHERE id=?
    """, (
        data['employee_id'], data['lastname'], data['firstname'], data.get('middlename'),
        data.get('dob'), data.get('contact'), data.get('gov_id'), data['job_info'],
        data.get('doe'), data['status'], data['rate'], db_id
    ))
    conn.commit()
    return jsonify({'success': True})