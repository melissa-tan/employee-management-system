const connection = require('./config/connection');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

const init = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "option",
                message: "What would you like to do?",
                choices: [
                    'View departments',
                    'View roles',
                    'View employees',
                    'View employees by manager',
                    'Add departments',
                    'Add roles',
                    'Add employees',
                    'Update roles',
                    'Update employee managers',
                    'Delete departments',
                    'Delete roles',
                    'Delete employees',
                    'Quit'
                ],
                loop: false

            }])
        .then((response) => {
            switch (response.option) {
                case 'View departments':
                    return viewDepartments(); 
                case 'View roles':
                    return viewRoles(); 
                case 'View employees':
                    return viewEmployees(); 
                case 'View employees by manager':
                    return viewEmployeesByManager();
                case 'Add departments':
                    return addDepartments(); 
                case 'Add roles':
                    return addRoles(); 
                case 'Add employees':
                    return addEmployees(); 
                case 'Update roles':
                    return updateRoles();
                case 'Update employee managers':
                    return updateEmployeeManagers(); 
                case 'Delete departments':
                    return deleteDepartments(); 
                case 'Delete roles':
                    return deleteRoles();
                case 'Delete employees':
                    return deleteEmployees();
                case 'Quit':
                    connection.end(console.log('Thank you for using the Employee Tracker program! Goodbye!'));
                    break
            }
        })
}

const viewDepartments = () => {
    connection.query('select * FROM department', (error, response) => {
        if (error) throw error;
        console.table(response);
        init();
    })
}

const viewRoles = () => {
    connection.query('select * FROM role', (error, response) => {
        if (error) throw error;
        console.table(response);
        init();
    })
}

const viewEmployees = () => {
    connection.query('select * FROM employee', (error, response) => {
        if (error) throw error;
        console.table(response);
        init();
    })
}

const viewEmployeesByManager = () => {
    connection.query('select manager.id as manager_id, concat(manager.first_name, \' \', manager.last_name) as manager, department.name as department, employee.id, employee.first_name, employee.last_name, role.title from employee left join employee manager on manager.id = employee.manager_id inner join role on (role.id = employee.role_id && employee.manager_id != \'NULL\') inner join department on (department.id = role.department_id)', (error, response) => {
        if (error) throw error;
        console.table(response);
        init();
    })
}

const addDepartments = () => {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'What is the new department\'s name?'
        }
    ]).then(response => {
        connection.query('insert into department(name) value( ? )', response.name, (error, response) => {
            if (error) throw error;
            console.log(`New department added!`);
            init();
        });
    })
}

const addRoles = () => {
    connection.query('select name from department', (error, response) => {
        if (error) throw error;
        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the new job title?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary for the new job? (Please only input numbers)'
            },
            {
                name: 'department',
                type: 'rawlist',
                message: 'Which department is the role in?',
                loop: false,
                choices: () => {
                    let choices = response.map(choice => choice.name);
                    return choices;
                }
            }
        ]).then(response => {
            const query = 'insert into role(title, salary, department_id) values (?, ?, (select id from department where name = ?))';
            connection.query(query, [response.title, response.salary, response.department], (error, response) => {
                if (error) throw error;
                console.log(`Added role!`);
                init();
            })
        });
    })
}


const addEmployees = () => {
    connection.query('select * from role', (error, response) => {
        if (error) throw error;

        inquirer.prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'What is the employee\'s first name?'
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'What is the employee\'s last name?'
            },
            {
                name: 'role',
                type: 'list',
                message: 'What is the employee\'s role?',
                choices: function () {
                    let choiceArray = response.map(({ id, title }) => ({ name: title, value: id }));
                    return choiceArray;
                },
                loop: false
            }
        ]).then(response => {
            const newEmployee = [response.first_name, response.last_name, response.role]

            connection.query('select id, concat(first_name, " " ,last_name) as manager from employee where manager_id is null', (error, response) => {
                if (error) throw error;

                inquirer.prompt([
                    {
                        name: 'manager',
                        type: 'rawlist',
                        message: 'Who is the employee\'s manager?',
                        loop: false,
                        choices: () => {
                            let choices = response.map(({ id, manager }) => ({ name: manager, value: id }));
                            return choices;
                        }
                    }
                ]).then(secondResponse => {
                    newEmployee.push(secondResponse.manager);
                    const query = 'insert into employee (first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)'
                    connection.query(query, newEmployee, (error, response) => {
                        if (error) throw error;
                        console.log(`Added role!`);
                        init();
                    })

                })
            })
        })
    })
}

const updateRoles = () => {
    const query = 'select employee.id, first_name, last_name from employee left join role on role.id = employee.role_id;';
    connection.query(query, (error, response) => {
        if (error) throw error;

        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Which employee is changing roles?',
                loop: false,
                choices: () => {
                    let choices = response.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));;
                    return choices;
                }
            }
        ]).then(response => {
            const updateEmployee = [response.employee];
            connection.query('select * FROM role', (error, response) => {
                if (error) throw error;

                inquirer.prompt([
                    {
                        name: 'newRole',
                        type: 'rawlist',
                        message: 'What is the employee\'s new role?',
                        loop: false,
                        choices: () => {
                            let choices = response.map(({ id, title }) => ({ name: title, value: id }));
                            return choices;
                        }
                    }
                ]).then(secondResponse => {
                    const query = 'update employee set employee.role_id = ? WHERE employee.id = ?'
                    connection.query(query, [secondResponse.newRole, updateEmployee], (error, response) => {
                        if (error) throw error;
                        console.log(`Moved employee to new role!`);
                        init();
                    })
                })

            })
        })
    })
}

const updateEmployeeManagers = () => {
    connection.query('select * from employee', (error, response) => {
        if (error) throw error;

        inquirer.prompt([
            {
                name: 'employee',
                type: 'list',
                message: 'Which employee is has a new manager?',
                loop: false,
                choices: () => {
                    let choices = response.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));;
                    return choices;
                }
            }
        ]).then(response => {
            const newEmployeeManager = [response.employee]

            connection.query('select id, concat(first_name, " " ,last_name) as manager from employee where manager_id is null', (error, response) => {
                if (error) throw error;

                inquirer.prompt([
                    {
                        name: 'manager',
                        type: 'rawlist',
                        message: 'Who is the employee\'s new manager?',
                        loop: false,
                        choices: () => {
                            let choices = response.map(({ id, manager }) => ({ name: manager, value: id }));
                            return choices;
                        }
                    }
                ]).then(secondResponse => {
                    const query = 'UPDATE employee SET manager_id = ? WHERE employee.id = ?'
                    connection.query(query, [secondResponse.manager, newEmployeeManager], (error, response) => {
                        if (error) throw error;
                        console.log(`New manager assigned to employee`);
                        init();
                    })
                })

            })
        })
    })
}

const deleteDepartments = () => {
    connection.query('select * FROM department', (error, response) => {
        if (error) throw error;
        inquirer.prompt([
            {
                name: 'removeDept',
                type: 'list',
                message: 'Which department is being closed?',
                loop: false,
                choices: () => {
                    let choices = response.map(({ id, name }) => ({ name: name, value: id }));;
                    return choices;
                }
            }
        ]).then (response => {
            connection.query('delete from department where id = ?', [response.removeDept], (error, response) => {
                if (error) throw error;
                console.log(`Department removed!`);
                init();
            })
        })
    })
}

const deleteRoles = () => {
    connection.query('select * FROM role', (error, response) => {
        if (error) throw error;
        inquirer.prompt([
            {
                name: 'removeRole',
                type: 'list',
                message: 'Which role is being removed?',
                loop: false,
                choices: () => {
                    let choices = response.map(({ id, title }) => ({ name: title, value: id }));;
                    return choices;
                }
            }
        ]).then (response => {
            connection.query('delete from role where id = ?', [response.removeRole], (error, response) => {
                if (error) throw error;
                console.log(`Role removed!`);
                init();
            })
        })
    })
}

const deleteEmployees = () => {
    connection.query('select * FROM employee', (error, response) => {
        if (error) throw error;
        inquirer.prompt([
            {
                name: 'removeEmployee',
                type: 'list',
                message: 'Which employee is being removed?',
                loop: false,
                choices: () => {
                    let choices = response.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                    return choices;
                }
            }
        ]).then (response => {
            connection.query('delete from employee where id = ?', [response.removeEmployee], (error, response) => {
                if (error) throw error;
                console.log(`Employee removed!`);
                init();
            })
        })
    })
}



init();




