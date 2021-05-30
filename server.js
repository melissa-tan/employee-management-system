const SQL = require('./models/SQL');
const connection = require('../config/connection');
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
    connection.query('SELECT name FROM department', (error, response) => {
        if (error) throw error;
        console.table(response);
        init();
    })
}

//Start connection and initiate inquirer
connection.connect((error) => {
    if (error) throw error;
    init();
});



