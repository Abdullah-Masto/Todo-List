import { format } from "date-fns";

const today = format(new Date(), "yyyy-MM-dd");

function getTodayTasks(todos) {
  let list = {};
  for (let project in todos) {
    list[project] = project.filter((todo) => {
      return todo.date == today;
    });
  }
  return list;
}

function loadStorage() {
  let todos = localStorage.getItem("todos");
  if (todos) {
    return JSON.parse(todos);
  } else {
    todos = { inbox: [] };
    setStorage(todos);
    return todos;
  }
}
function setStorage(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}
function createTodo(title, description, date, priority) {
  return {
    title,
    description,
    date: format(date, "yyyy-MM-dd"),
    priority,
    checked: false,
  };
}
function toggleChecked(todo) {
  todo.checked = !todo.checked;
}
function edit(todo, title, description, date, priority) {
  Object.assign(todo, {
    title,
    description,
    date: format(date, "yyyy-MM-dd"),
    priority,
  });
}
function addTodo(todos, project, todo) {
  todos[project].push(todo);
}
function remove(todos, project, todo) {
  const index = todos[project].indexOf(todo);
  if (index > -1) todos[project].splice(index, 1);
}
function addProject(title) {
  todos[title] = [];
}
function deleteProject(todos, project) {
  if (todos[project] && project != "inbox") {
    delete todos[project];
  }
}

export {
  getTodayTasks,
  loadStorage,
  setStorage,
  createTodo,
  toggleChecked,
  edit,
  addTodo,
  remove,
  addProject,
  deleteProject,
};
