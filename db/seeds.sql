INSERT INTO department
  (name)
VALUES 
  ('Finance'),
  ('Legal'),
  ('Sales');

INSERT INTO role
  (title, salary, department_id)
VALUES
  ('Sales Lead', 100000, 3),
  ('Sales Person', 80000, 3);

INSERT INTO employee
  (first_name, last_name, role_id, manager_id)
VALUES
  ('John', 'Doe', 1, NULL),
  ('Mike', 'Chan', 1, 1);