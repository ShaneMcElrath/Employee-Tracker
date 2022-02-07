
const inquirer = require('inquirer');
const db = require('../config/connection');
const QueryHelper = require('./QueryHelper');




class Questions {
  constructor() {
    this.QueryHelper = new QueryHelper;
  }

  promtQuestions() {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'empAttributes',
        message: 'What would you like to do?',
        choices: [
          'View All Departments', 
          'View All Roles', 
          'View All Employees', 
          'Add Department', 
          'Add Role', 
          'Add Employee', 
          'Update Employee Role',
          'quit'
        ]
      }
    ])
      .then(userAnswer => {
        if (userAnswer.empAttributes == 'Add Department') {
          this.promtAddDepartmentQuestions();
        }
        else if (userAnswer.empAttributes == 'Add Role') {
          this.promtAddRoleQuestions();
        }
        else if (userAnswer.empAttributes == 'Add Employee') {
          this.promtAddEmployeeQuestions();
        }
        else if (userAnswer.empAttributes == 'View All Departments') {
          console.log('Viewing all Departments');
          this.QueryHelper.DisplayData(`SELECT * FROM department`)
            .then(() => {
              this.promtQuestions();
            });
        }
        else if (userAnswer.empAttributes == 'View All Roles') {
          console.log('Viewing all Roles');
          this.QueryHelper.DisplayData(`
            SELECT 
            role.id,
            title, 
            department.name AS department,
            salary
            FROM role
            LEFT JOIN department
            ON role.department_id = department.id
          `)
            .then(() => {
              this.promtQuestions();
            });
        }
        else if (userAnswer.empAttributes == 'View All Employees') {
          console.log('Viewing all Employees');
          this.QueryHelper.DisplayData(`
            SELECT
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title AS title,
            role.salary AS salary,
            CONCAT (manager.first_name, " ", manager.last_name) AS manager
            FROM employee
            LEFT JOIN role ON employee.role_id = role.id
            LEFT JOIN department ON role.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
          `)
            .then(() => {
              this.promtQuestions();
            });
        }
        else if (userAnswer.empAttributes == 'Update Employee Role') {
          console.log('update');
          this.promtUpdateEmployeesRoleQuestions();
        }
        else {
          db.end();
        }
      });
  };

  promtAddDepartmentQuestions() {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What would you like this department to be called? (Required)',
        validate: nameInput => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter department name!');
            return false;
          }
        }
      }
    ])
      .then(userAnswer => {
        this.QueryHelper.CreateData(`INSERT INTO department 
                                      (name) 
                                      VALUES (?)`,
                                      Object.values(userAnswer));
      })
      .then(() => {
        this.promtQuestions();
      });
  };

  async promtAddRoleQuestions() {

    let departmentChoices = await this.QueryHelper.DisplayData(`SELECT * FROM department`, 1);
    let departmentNames = departmentChoices.map((obj) => obj.name);
    
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What would you like this role to be called? (Required)',
        validate: nameInput => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter role name!');
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'salary',
        message: 'How much would this roles salary be? (Required)',
        validate: salaryInput => {
          if (salaryInput) {
            return true;
          } else {
            console.log('Please enter role salary!');
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'department',
        message: 'Which department does this role belong to?',
        choices: departmentNames
      }
    ])
      .then(userAnswer => {
        console.log(userAnswer.department); 
        userAnswer.department = departmentChoices.find((obj) => {
          return obj.name == userAnswer.department;
        });

        let params = [userAnswer.name, userAnswer.salary, userAnswer.department.id];
        let sql = `
          INSERT INTO role
          (title, salary, department_id)
          VALUES (?,?,?)`;

      
        this.QueryHelper.CreateData(sql, params);
      })
      .then(() => {
        this.promtQuestions();
      });
  };

  async promtAddEmployeeQuestions() {

    //Gets all role.id, and role.title form database.
    let roleChoices = await this.QueryHelper.DisplayData(`
      SELECT
      role.id,
      role.title
      FROM role
      `,
      1
    );
    //Gets all employee.id, employee.first_name, and employee.last_name
    let employeeChoices = await this.QueryHelper.DisplayData(`
      SELECT
      employee.id,
      CONCAT (employee.first_name, " ", employee.last_name) AS name
      FROM employee
      `, 
      1
    );

    //Gets All role.title from role choices
    let roletitles = roleChoices.map((obj) => obj.title);
    //Gets All employee.name from employee choices
    let employeeNames = employeeChoices.map((obj) => obj.name);

    //Adds node option to eployeeNames.
    employeeNames.push('none');


    //Promps questions
    return inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'What is this employees first name? (Required)',
        validate: nameInput => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter this employees first name!');
            return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'What is this employees last name? (Required)',
        validate: salaryInput => {
          if (salaryInput) {
            return true;
          } else {
            console.log('Please enter this employees last name!');
            return false;
          }
        }
      },
      {
        type: 'list',
        name: 'role',
        message: 'What is this employees role? (Required)',
        choices: roletitles
      },
      {
        type: 'list',
        name: 'manager',
        message: 'Who is this employees manager? (Required)',
        choices: employeeNames
      }
    ])
      .then(userAnswer => {
        //Gets all data from Chosen role
        userAnswer.role = roleChoices.find((obj) => {
          return obj.title == userAnswer.role;
        });

        //If anwser is not none
        //Gets all data for chosen employee
        if (userAnswer.manager != 'none') {
          userAnswer.manager = employeeChoices.find((obj) => {
            return obj.name == userAnswer.manager;
          });

          let params = [
            userAnswer.firstName,
            userAnswer.lastName,
            userAnswer.role.id,
            userAnswer.manager.id
          ];
          let sql = `
            INSERT INTO employee
            (first_name, last_name, role_id, manager_id)
             VALUES (?,?,?,?)
          `;
          
          //Creates new employee
          this.QueryHelper.CreateData(sql, params);
        } 
        else {
          let params = [
            userAnswer.firstName,
            userAnswer.lastName,
            userAnswer.role.id
          ];
          let sql = `
            INSERT INTO employee
            (first_name, last_name, role_id)
             VALUES (?,?,?)
          `;

          this.QueryHelper.CreateData(sql, params);
        }
      })
      .then(() => {
        this.promtQuestions();
      });
  };

  async promtUpdateEmployeesRoleQuestions() {

    
    let roleChoices = await this.QueryHelper.DisplayData(`
      SELECT
      role.id,
      role.title
      FROM role
      `,
      1
    );
    let employeeChoices = await this.QueryHelper.DisplayData(`
      SELECT
      employee.id,
      CONCAT (employee.first_name, " ", employee.last_name) AS name
      FROM employee
      `, 
      1
    );

    let roletitles = roleChoices.map((obj) => obj.title);
    let employeeNames = employeeChoices.map((obj) => obj.name);

    return inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: 'Which employees role do you want to update?',
        choices: employeeNames
      },
      {
        type: 'list',
        name: 'role',
        message: 'What is this employees new role? (Required)',
        choices: roletitles
      }
    ])
      .then(userAnswer => {
        userAnswer.role = roleChoices.find((obj) => {
          return obj.title == userAnswer.role;
        });
        userAnswer.employee = employeeChoices.find((obj) => {
          return obj.name == userAnswer.employee;
        });
        

        let params = [
          userAnswer.role.id,
          userAnswer.employee.id
        ];
        let sql = `
          UPDATE employee
          SET role_id = ?
          WHERE id = ?
        `;

        this.QueryHelper.UpdateData(sql, params);
      })
      .then(() => {
        this.promtQuestions();
      });
  };

}


module.exports = Questions;